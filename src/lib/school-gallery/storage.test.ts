import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  assertGalleryPhotoStoragePath,
  buildGalleryPhotoStoragePath,
  galleryPhotoStoragePathPrefix,
  parseGalleryPhotoDate,
} from "./storage";

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
});
