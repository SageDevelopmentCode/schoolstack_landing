import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildGalleryUploadActivitySummary } from "@/lib/school-gallery/gallery-activity";

describe("buildGalleryUploadActivitySummary", () => {
  it("formats plural photo count with date label", () => {
    const summary = buildGalleryUploadActivitySummary({
      uploaderName: "Jordan Taylor",
      photoCount: 5,
      photoDate: "2026-10-18",
    });
    assert.match(summary, /Jordan Taylor uploaded 5 photos/);
    assert.match(summary, /Oct/);
  });

  it("uses singular photo label for one file", () => {
    const summary = buildGalleryUploadActivitySummary({
      uploaderName: "Ada",
      photoCount: 1,
      photoDate: "2026-10-18",
    });
    assert.equal(summary.includes("1 photo"), true);
    assert.equal(summary.includes("1 photos"), false);
  });
});
