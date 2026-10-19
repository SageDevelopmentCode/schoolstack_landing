import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildGalleryPhotoStoragePath,
  parseGalleryPhotoDate,
} from "./storage";

describe("school gallery storage helpers", () => {
  it("builds org-scoped storage paths", () => {
    const path = buildGalleryPhotoStoragePath(
      "11111111-1111-1111-1111-111111111111",
      "22222222-2222-2222-2222-222222222222",
      "field-day.webp",
    );
    assert.equal(
      path,
      "11111111-1111-1111-1111-111111111111/gallery/22222222-2222-2222-2222-222222222222/field-day.webp",
    );
  });

  it("parses ISO photo dates", () => {
    assert.equal(parseGalleryPhotoDate("2026-10-18"), "2026-10-18");
  });

  it("rejects invalid photo dates", () => {
    assert.throws(() => parseGalleryPhotoDate("10/18/2026"));
  });
});
