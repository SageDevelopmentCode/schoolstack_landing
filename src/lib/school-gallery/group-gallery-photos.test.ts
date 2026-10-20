import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { groupGalleryPhotosByDate } from "./group-gallery-photos";
import type { GalleryPhoto } from "./types";

function makePhoto(overrides: Partial<GalleryPhoto>): GalleryPhoto {
  return {
    id: overrides.id ?? "photo-1",
    organizationId: overrides.organizationId ?? "org-1",
    photoDate: overrides.photoDate ?? "2026-10-01",
    storagePath: overrides.storagePath ?? "org-1/gallery/photo-1/a.webp",
    fileName: overrides.fileName ?? "a.webp",
    mimeType: overrides.mimeType ?? "image/webp",
    sizeBytes: overrides.sizeBytes ?? 1000,
    uploadBatchId: overrides.uploadBatchId ?? null,
    uploadedBy: overrides.uploadedBy ?? null,
    createdAt: overrides.createdAt ?? "2026-10-01T12:00:00.000Z",
    updatedAt: overrides.updatedAt ?? "2026-10-01T12:00:00.000Z",
    imageUrl: overrides.imageUrl,
  };
}

describe("groupGalleryPhotosByDate", () => {
  it("groups photos by date with newest dates first", () => {
    const groups = groupGalleryPhotosByDate([
      makePhoto({ id: "a", photoDate: "2026-10-01" }),
      makePhoto({ id: "b", photoDate: "2026-10-18" }),
      makePhoto({ id: "c", photoDate: "2026-10-01", createdAt: "2026-10-01T13:00:00.000Z" }),
    ]);

    assert.equal(groups.length, 2);
    assert.equal(groups[0]?.photoDate, "2026-10-18");
    assert.equal(groups[1]?.photos.length, 2);
  });
});
