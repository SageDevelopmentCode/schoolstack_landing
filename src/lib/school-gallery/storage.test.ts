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
    const path = buildGalleryPhotoStoragePath(ORG_ID, PHOTO_ID, "field-day.webp");
    assert.equal(
      path,
      `${ORG_ID}/gallery/${PHOTO_ID}/field-day.webp`,
    );
  });

  it("accepts storage paths under the expected org and photo prefix", () => {
    const path = buildGalleryPhotoStoragePath(ORG_ID, PHOTO_ID, "field-day.webp");
    assertGalleryPhotoStoragePath(ORG_ID, PHOTO_ID, path);
    assert.equal(galleryPhotoStoragePathPrefix(ORG_ID, PHOTO_ID), `${ORG_ID}/gallery/${PHOTO_ID}/`);
  });

  it("rejects storage paths for a different organization", () => {
    const otherOrg = "33333333-3333-3333-3333-333333333333";
    const path = buildGalleryPhotoStoragePath(otherOrg, PHOTO_ID, "field-day.webp");
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
          createSignedUrl: async () => ({
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
                  single: async () => ({ data: { id: "event-1" }, error: null }),
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
      storagePath: buildGalleryPhotoStoragePath(ORG_ID, PHOTO_ID, "field-day.webp"),
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
    const metadata = inserts[0]?.metadata as Record<string, unknown> | undefined;
    assert.equal(metadata?.operation, "school_gallery.photo_signed_url");
    assert.equal(inserts[0]?.entity_id, PHOTO_ID);
  });
});
