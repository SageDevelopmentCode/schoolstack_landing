import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { SupabaseClient } from "@supabase/supabase-js";
import { GalleryError } from "./gallery-errors";
import { createGalleryPhotoBatch } from "./photos";

function makeImageFile(name: string, type = "image/jpeg"): File {
  return new File([new Uint8Array(100)], name, { type });
}

type GalleryBatchMockState = {
  uploadCalls: number;
  insertCalls: number;
  deletedIds: string[] | null;
  removedPaths: string[];
};

function createGalleryBatchMockSupabase(options: {
  failUploadOnAttempt?: number;
}): { supabase: SupabaseClient; state: GalleryBatchMockState } {
  const state: GalleryBatchMockState = {
    uploadCalls: 0,
    insertCalls: 0,
    deletedIds: null,
    removedPaths: [],
  };

  const supabase = {
    storage: {
      from: () => ({
        upload: async () => {
          state.uploadCalls += 1;
          if (options.failUploadOnAttempt === state.uploadCalls) {
            return { error: { message: "upload failed" } };
          }
          return { error: null };
        },
        remove: async (paths: string[]) => {
          state.removedPaths.push(...paths);
          return { error: null };
        },
        createSignedUrl: async () => ({
          data: { signedUrl: "https://example.com/signed" },
          error: null,
        }),
      }),
    },
    from: (table: string) => {
      if (table === "school_gallery_photos") {
        return {
          delete: () => ({
            in: (_column: string, ids: string[]) => {
              state.deletedIds = ids;
              return {
                eq: async () => ({ error: null }),
              };
            },
          }),
          insert: () => ({
            select: () => ({
              single: async () => {
                state.insertCalls += 1;
                const n = state.insertCalls;
                return {
                  data: {
                    id: `photo-id-${n}`,
                    organization_id: "org-1",
                    photo_date: "2026-06-01",
                    storage_path: `org-1/gallery/photo-id-${n}/a.jpg`,
                    file_name: "a.jpg",
                    mime_type: "image/jpeg",
                    size_bytes: 100,
                    upload_batch_id: "batch",
                    uploaded_by: "user-1",
                    created_at: "2026-01-01T00:00:00Z",
                    updated_at: "2026-01-01T00:00:00Z",
                  },
                  error: null,
                };
              },
            }),
          }),
        };
      }
      if (table === "staff_members") {
        return {
          select: () => ({
            eq: () => ({
              in: async () => ({ data: [], error: null }),
            }),
          }),
        };
      }
      throw new Error(`unexpected table: ${table}`);
    },
  };

  return { supabase: supabase as unknown as SupabaseClient, state };
}

const batchInputBase = {
  organizationId: "org-1",
  photoDate: "2026-06-01",
  uploadedBy: "user-1",
  actorName: "Admin User",
  actorType: "school_admin" as const,
  surface: "school_admin" as const,
  logActivity: false,
};

describe("createGalleryPhotoBatch", () => {
  it("validates every file before uploading", async () => {
    const { supabase, state } = createGalleryBatchMockSupabase({});

    await assert.rejects(
      () =>
        createGalleryPhotoBatch(supabase, {
          ...batchInputBase,
          files: [
            makeImageFile("a.jpg"),
            makeImageFile("b.pdf", "application/pdf"),
          ],
        }),
      (error: unknown) => {
        assert.ok(error instanceof GalleryError);
        assert.equal(error.code, "invalid_request");
        return true;
      },
    );

    assert.equal(state.uploadCalls, 0);
    assert.equal(state.insertCalls, 0);
  });

  it("rolls back inserted rows and storage when a later upload fails", async () => {
    const { supabase, state } = createGalleryBatchMockSupabase({
      failUploadOnAttempt: 2,
    });

    await assert.rejects(() =>
      createGalleryPhotoBatch(supabase, {
        ...batchInputBase,
        files: [makeImageFile("a.jpg"), makeImageFile("b.jpg")],
      }),
    );

    assert.equal(state.deletedIds?.length, 1);
    assert.ok(state.removedPaths.length >= 1);
    assert.equal(state.insertCalls, 1);
  });
});
