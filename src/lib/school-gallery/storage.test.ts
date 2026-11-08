import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  assertGalleryPhotoStoragePath,
  attachSignedUrlsToGalleryPhotos,
  buildGalleryPhotoStoragePath,
  galleryPhotoStoragePathPrefix,
  parseGalleryPhotoDate,
} from "./storage";
import type { GalleryPhoto } from "./types";

const ORG_ID = "11111111-1111-1111-1111-111111111111";
const PHOTO_ID = "22222222-2222-2222-2222-222222222222";

describe("school gallery storage helpers", () => {
  it("builds org-scoped storage paths", () => {
    const path = buildGalleryPhotoStoragePath(
      ORG_ID,
      PHOTO_ID,
      "field-day.webp",
    );
    assert.equal(path, `${ORG_ID}/gallery/${PHOTO_ID}/field-day.webp`);
  });

  it("accepts storage paths under the expected org and photo prefix", () => {
    const path = buildGalleryPhotoStoragePath(
      ORG_ID,
      PHOTO_ID,
      "field-day.webp",
    );
    assertGalleryPhotoStoragePath(ORG_ID, PHOTO_ID, path);
    assert.equal(
      galleryPhotoStoragePathPrefix(ORG_ID, PHOTO_ID),
      `${ORG_ID}/gallery/${PHOTO_ID}/`,
    );
  });

  it("rejects storage paths for a different organization", () => {
    const otherOrg = "33333333-3333-3333-3333-333333333333";
    const path = buildGalleryPhotoStoragePath(
      otherOrg,
      PHOTO_ID,
      "field-day.webp",
    );
    assert.throws(
      () => assertGalleryPhotoStoragePath(ORG_ID, PHOTO_ID, path),
      /does not match this school/,
    );
  });

  it("parses ISO photo dates", () => {
    assert.equal(parseGalleryPhotoDate("2026-10-18"), "2026-10-18");
  });

  it("rejects invalid photo dates", () => {
    assert.throws(() => parseGalleryPhotoDate("10/18/2026"));
  });

  it("reports operational errors when signed URL creation fails", async () => {
    const inserts: Array<Record<string, unknown>> = [];
    const supabase = {
      storage: {
        from: () => ({
          createSignedUrls: async () => ({
            data: null,
            error: { message: "storage signing failed" },
          }),
        }),
      },
      from(table: string) {
        return {
          insert(row: Record<string, unknown>) {
            if (table === "activity_events") {
              inserts.push(row);
            }
            return {
              select() {
                return {
                  single: async () => ({
                    data: { id: "event-1" },
                    error: null,
                  }),
                };
              },
            };
          },
        };
      },
    } as unknown as SupabaseClient;

    const photo: GalleryPhoto = {
      id: PHOTO_ID,
      organizationId: ORG_ID,
      photoDate: "2026-10-18",
      storagePath: buildGalleryPhotoStoragePath(
        ORG_ID,
        PHOTO_ID,
        "field-day.webp",
      ),
      fileName: "field-day.webp",
      mimeType: "image/jpeg",
      sizeBytes: 100,
      uploadBatchId: null,
      uploadedBy: null,
      createdAt: "2026-01-01T00:00:00Z",
      updatedAt: "2026-01-01T00:00:00Z",
    };

    const [result] = await attachSignedUrlsToGalleryPhotos(supabase, [photo]);
    assert.equal(result.imageUrl, undefined);

    await new Promise((resolve) => setImmediate(resolve));
    assert.equal(inserts.length, 1);
    const metadata = inserts[0]?.metadata as
      Record<string, unknown> | undefined;
    assert.equal(metadata?.operation, "school_gallery.photo_signed_url");
    assert.equal(inserts[0]?.entity_id, PHOTO_ID);
  });

  function makePhoto(id: string, name = "a.webp"): GalleryPhoto {
    return {
      id,
      organizationId: ORG_ID,
      photoDate: "2026-10-18",
      storagePath: buildGalleryPhotoStoragePath(ORG_ID, id, name),
      fileName: name,
      mimeType: "image/webp",
      sizeBytes: 100,
      uploadBatchId: null,
      uploadedBy: null,
      createdAt: "2026-01-01T00:00:00Z",
      updatedAt: "2026-01-01T00:00:00Z",
    };
  }

  function makeStorageClient(
    sign: (paths: string[]) => {
      data: Array<{
        path: string | null;
        signedUrl: string;
        error: string | null;
      }> | null;
      error: { message: string } | null;
    },
  ) {
    const state = {
      signCalls: [] as Array<{ paths: string[]; ttl: number }>,
      singleCalls: 0,
      activityEvents: [] as Array<Record<string, unknown>>,
    };
    const supabase = {
      storage: {
        from: () => ({
          createSignedUrl: async () => {
            state.singleCalls += 1;
            return { data: null, error: { message: "should not be used" } };
          },
          createSignedUrls: async (paths: string[], ttl: number) => {
            state.signCalls.push({ paths, ttl });
            return sign(paths);
          },
        }),
      },
      from(table: string) {
        return {
          insert(row: Record<string, unknown>) {
            if (table === "activity_events") state.activityEvents.push(row);
            return {
              select() {
                return {
                  single: async () => ({
                    data: { id: "event-1" },
                    error: null,
                  }),
                };
              },
            };
          },
        };
      },
    } as unknown as SupabaseClient;
    return { supabase, state };
  }

  it("signs a whole page of photos with one storage request", async () => {
    const photos = Array.from({ length: 24 }, (_, index) =>
      makePhoto(`22222222-2222-2222-2222-${String(index).padStart(12, "0")}`),
    );
    const { supabase, state } = makeStorageClient((paths) => ({
      data: paths.map((path) => ({
        path,
        signedUrl: `https://signed.example/${path}`,
        error: null,
      })),
      error: null,
    }));

    const result = await attachSignedUrlsToGalleryPhotos(supabase, photos);

    assert.equal(state.signCalls.length, 1);
    assert.equal(state.signCalls[0]?.paths.length, 24);
    assert.equal(state.singleCalls, 0);
    assert.equal(result.length, 24);
    for (const photo of result) {
      assert.equal(
        photo.imageUrl,
        `https://signed.example/${photo.storagePath}`,
      );
    }
    await new Promise((resolve) => setImmediate(resolve));
    assert.equal(state.activityEvents.length, 0);
  });

  it("keeps good URLs and sends one aggregated report when some photos fail", async () => {
    const photos = [
      makePhoto("22222222-2222-2222-2222-000000000001"),
      makePhoto("22222222-2222-2222-2222-000000000002"),
      makePhoto("22222222-2222-2222-2222-000000000003"),
    ];
    const { supabase, state } = makeStorageClient((paths) => ({
      data: paths.map((path, index) => ({
        path,
        signedUrl: index === 0 ? `https://signed.example/${path}` : "",
        error: index === 0 ? null : "Object not found",
      })),
      error: null,
    }));

    const result = await attachSignedUrlsToGalleryPhotos(supabase, photos);

    assert.ok(result[0]?.imageUrl);
    assert.equal(result[1]?.imageUrl, undefined);
    assert.equal(result[2]?.imageUrl, undefined);
    await new Promise((resolve) => setImmediate(resolve));
    assert.equal(
      state.activityEvents.length,
      1,
      "one report for the whole batch",
    );
    const metadata = state.activityEvents[0]?.metadata as Record<
      string,
      unknown
    >;
    assert.equal(metadata?.failedCount, 2);
  });

  it("does not sign photos whose storage path belongs to another school", async () => {
    const stray = {
      ...makePhoto("22222222-2222-2222-2222-000000000009"),
      storagePath: "other-org/gallery/x/a.webp",
    };
    const { supabase, state } = makeStorageClient((paths) => ({
      data: paths.map((path) => ({
        path,
        signedUrl: "https://signed",
        error: null,
      })),
      error: null,
    }));

    const [result] = await attachSignedUrlsToGalleryPhotos(supabase, [stray]);

    assert.equal(result?.imageUrl, undefined);
    assert.equal(state.signCalls.length, 0, "nothing to sign");
  });
});
