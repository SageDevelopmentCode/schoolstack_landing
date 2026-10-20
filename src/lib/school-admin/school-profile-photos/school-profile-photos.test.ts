import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { MAX_SCHOOL_PROFILE_PHOTOS } from "./constants";
import { buildSchoolProfilePhotoStoragePath } from "./storage";
import {
  assertCanAddSchoolProfilePhotos,
  createSchoolProfilePhotosBatch,
  deleteSchoolProfilePhoto,
  isSchoolProfilePhotoMaxPhotosError,
  SchoolProfilePhotoError,
} from "./photos";
import type { SupabaseClient } from "@supabase/supabase-js";

function makeImageFile(name: string, type = "image/jpeg"): File {
  return new File([new Uint8Array(100)], name, { type });
}

type ProfileBatchMockState = {
  uploadCalls: number;
  insertCalls: number;
  deletedIds: string[] | null;
  removedPaths: string[];
};

function createProfileBatchMockSupabase(options: {
  failUploadOnAttempt?: number;
  insertError?: { code: string; message: string };
}): { supabase: SupabaseClient; state: ProfileBatchMockState } {
  const state: ProfileBatchMockState = {
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
      if (table === "organization_school_profile_photos") {
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
                if (options.insertError) {
                  return { data: null, error: options.insertError };
                }
                const n = state.insertCalls;
                return {
                  data: {
                    id: `photo-id-${n}`,
                    organization_id: "org-1",
                    storage_path: `org-1/school-profile/photo-id-${n}/a.jpg`,
                    file_name: "a.jpg",
                    mime_type: "image/jpeg",
                    size_bytes: 100,
                    sort_order: n - 1,
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
      throw new Error(`unexpected table: ${table}`);
    },
  };

  return { supabase: supabase as unknown as SupabaseClient, state };
}
import { SCHOOL_PROFILE_SECTIONS } from "@/components/school-admin/school-profile/school-profile-sections";

describe("school profile photos storage", () => {
  it("builds school-profile storage paths", () => {
    const path = buildSchoolProfilePhotoStoragePath(
      "org-1",
      "photo-1",
      "campus/hall.jpg",
    );
    assert.equal(path, "org-1/school-profile/photo-1/campus_hall.jpg");
  });
});

describe("school profile photos limits", () => {
  it("allows uploads within the max", () => {
    assertCanAddSchoolProfilePhotos(3, 2);
  });

  it("rejects uploads over the max", () => {
    assert.throws(
      () => assertCanAddSchoolProfilePhotos(4, 2),
      (error: unknown) => {
        assert.ok(error instanceof SchoolProfilePhotoError);
        assert.equal(error.code, "max_photos");
        return true;
      },
    );
  });

  it("defines max of 5", () => {
    assert.equal(MAX_SCHOOL_PROFILE_PHOTOS, 5);
  });

  it("detects database max-photos enforcement errors", () => {
    assert.ok(
      isSchoolProfilePhotoMaxPhotosError({
        code: "P0001",
        message: "school_profile_photo_max_photos",
      }),
    );
    assert.equal(isSchoolProfilePhotoMaxPhotosError({ code: "23505" }), false);
  });
});

describe("createSchoolProfilePhotosBatch", () => {
  it("validates every file before uploading", async () => {
    const { supabase, state } = createProfileBatchMockSupabase({});

    await assert.rejects(
      () =>
        createSchoolProfilePhotosBatch(supabase, {
          organizationId: "org-1",
          files: [
            makeImageFile("a.jpg"),
            makeImageFile("b.pdf", "application/pdf"),
          ],
          uploadedBy: "user-1",
          startSortOrder: 0,
        }),
      (error: unknown) => {
        assert.ok(error instanceof SchoolProfilePhotoError);
        assert.equal(error.code, "invalid_file");
        return true;
      },
    );

    assert.equal(state.uploadCalls, 0);
    assert.equal(state.insertCalls, 0);
  });

  it("maps database max-photos errors to SchoolProfilePhotoError", async () => {
    const { supabase, state } = createProfileBatchMockSupabase({
      insertError: {
        code: "P0001",
        message: "school_profile_photo_max_photos",
      },
    });

    await assert.rejects(
      () =>
        createSchoolProfilePhotosBatch(supabase, {
          organizationId: "org-1",
          files: [makeImageFile("a.jpg")],
          uploadedBy: "user-1",
          startSortOrder: 0,
        }),
      (error: unknown) => {
        assert.ok(error instanceof SchoolProfilePhotoError);
        assert.equal(error.code, "max_photos");
        return true;
      },
    );

    assert.equal(state.insertCalls, 1);
    assert.equal(state.uploadCalls, 1);
    assert.ok(state.removedPaths.length >= 1);
  });

  it("rolls back inserted rows and storage when a later upload fails", async () => {
    const { supabase, state } = createProfileBatchMockSupabase({
      failUploadOnAttempt: 2,
    });

    await assert.rejects(() =>
      createSchoolProfilePhotosBatch(supabase, {
        organizationId: "org-1",
        files: [makeImageFile("a.jpg"), makeImageFile("b.jpg")],
        uploadedBy: "user-1",
        startSortOrder: 0,
      }),
    );

    assert.equal(state.deletedIds?.length, 1);
    assert.ok(state.removedPaths.length >= 1);
    assert.equal(state.insertCalls, 1);
  });
});

describe("school profile photos section", () => {
  it("includes photos in school profile pill sections", () => {
    const ids = SCHOOL_PROFILE_SECTIONS.map((section) => section.id);
    assert.ok(ids.includes("photos"));
    assert.equal(ids[ids.length - 1], "photos");
  });
});

const PROFILE_ORG_ID = "org-1";
const PROFILE_PHOTO_ID = "photo-id-1";
const PROFILE_STORAGE_PATH = `${PROFILE_ORG_ID}/school-profile/${PROFILE_PHOTO_ID}/a.jpg`;

type ProfileDeleteMockState = {
  removedPaths: string[];
  rowDeleteCalled: boolean;
  callOrder: Array<"remove" | "delete">;
};

function createProfileDeleteMockSupabase(options: {
  failStorageRemove?: boolean;
}): { supabase: SupabaseClient; state: ProfileDeleteMockState } {
  const state: ProfileDeleteMockState = {
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
      if (table !== "organization_school_profile_photos") {
        throw new Error(`unexpected table: ${table}`);
      }

      return {
        select: () => ({
          eq: () => ({
            eq: () => ({
              maybeSingle: async () => ({
                data: { storage_path: PROFILE_STORAGE_PATH },
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

describe("deleteSchoolProfilePhoto", () => {
  it("removes storage before deleting the row", async () => {
    const { supabase, state } = createProfileDeleteMockSupabase({});

    await deleteSchoolProfilePhoto(supabase, PROFILE_ORG_ID, PROFILE_PHOTO_ID);

    assert.deepEqual(state.callOrder, ["remove", "delete"]);
    assert.deepEqual(state.removedPaths, [PROFILE_STORAGE_PATH]);
    assert.equal(state.rowDeleteCalled, true);
  });

  it("does not delete the row when storage removal fails", async () => {
    const { supabase, state } = createProfileDeleteMockSupabase({
      failStorageRemove: true,
    });

    await assert.rejects(() =>
      deleteSchoolProfilePhoto(supabase, PROFILE_ORG_ID, PROFILE_PHOTO_ID),
    );

    assert.deepEqual(state.callOrder, ["remove"]);
    assert.equal(state.removedPaths.length, 0);
    assert.equal(state.rowDeleteCalled, false);
  });
});
