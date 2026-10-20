import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { SupabaseClient } from "@supabase/supabase-js";
import { GalleryError } from "./gallery-errors";
import { deleteGalleryPhoto } from "./photos";

const ORG_ID = "org-1";
const PHOTO_ID = "photo-id-1";
const STORAGE_PATH = `${ORG_ID}/gallery/${PHOTO_ID}/a.jpg`;

type DeleteMockState = {
  removedPaths: string[];
  rowDeleteCalled: boolean;
  callOrder: Array<"remove" | "delete">;
};

function createGalleryDeleteMockSupabase(options: {
  failStorageRemove?: boolean;
}): { supabase: SupabaseClient; state: DeleteMockState } {
  const state: DeleteMockState = {
    removedPaths: [],
    rowDeleteCalled: false,
    callOrder: [],
  };

  const supabase = {
    storage: {
      from: () => ({
        remove: async (paths: string[]) => {
          state.callOrder.push("remove");
          if (options.failStorageRemove) {
            return { error: { message: "storage remove failed" } };
          }
          state.removedPaths.push(...paths);
          return { error: null };
        },
      }),
    },
    from: (table: string) => {
      if (table !== "school_gallery_photos") {
        throw new Error(`unexpected table: ${table}`);
      }

      return {
        select: () => ({
          eq: () => ({
            eq: () => ({
              maybeSingle: async () => ({
                data: { storage_path: STORAGE_PATH },
                error: null,
              }),
            }),
          }),
        }),
        delete: () => ({
          eq: () => ({
            eq: async () => {
              state.callOrder.push("delete");
              state.rowDeleteCalled = true;
              return { error: null };
            },
          }),
        }),
      };
    },
  };

  return { supabase: supabase as unknown as SupabaseClient, state };
}

describe("deleteGalleryPhoto", () => {
  it("removes storage before deleting the row", async () => {
    const { supabase, state } = createGalleryDeleteMockSupabase({});

    await deleteGalleryPhoto(supabase, ORG_ID, PHOTO_ID);

    assert.deepEqual(state.callOrder, ["remove", "delete"]);
    assert.deepEqual(state.removedPaths, [STORAGE_PATH]);
    assert.equal(state.rowDeleteCalled, true);
  });

  it("does not delete the row when storage removal fails", async () => {
    const { supabase, state } = createGalleryDeleteMockSupabase({
      failStorageRemove: true,
    });

    await assert.rejects(() => deleteGalleryPhoto(supabase, ORG_ID, PHOTO_ID));

    assert.deepEqual(state.callOrder, ["remove"]);
    assert.equal(state.removedPaths.length, 0);
    assert.equal(state.rowDeleteCalled, false);
  });

  it("throws GalleryError when the photo row is missing", async () => {
    const supabase = {
      storage: { from: () => ({ remove: async () => ({ error: null }) }) },
      from: () => ({
        select: () => ({
          eq: () => ({
            eq: () => ({
              maybeSingle: async () => ({ data: null, error: null }),
            }),
          }),
        }),
      }),
    } as unknown as SupabaseClient;

    await assert.rejects(
      () => deleteGalleryPhoto(supabase, ORG_ID, PHOTO_ID),
      (error: unknown) => {
        assert.ok(error instanceof GalleryError);
        assert.equal(error.code, "not_found");
        return true;
      },
    );
  });
});
