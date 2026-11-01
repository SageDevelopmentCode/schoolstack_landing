import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  chunkGalleryUploadByByteBudget,
  GalleryUploadChunkError,
  MAX_GALLERY_UPLOAD_REQUEST_BYTES,
} from "./gallery-upload-chunks";

describe("chunkGalleryUploadByByteBudget", () => {
  it("keeps a small batch in one request", () => {
    const chunks = chunkGalleryUploadByByteBudget([
      { item: "a", sizeBytes: 500_000 },
      { item: "b", sizeBytes: 500_000 },
    ]);

    assert.deepEqual(chunks, [["a", "b"]]);
  });

  it("splits when combined size exceeds the byte budget", () => {
    const half = Math.floor(MAX_GALLERY_UPLOAD_REQUEST_BYTES / 2) + 1;
    const chunks = chunkGalleryUploadByByteBudget([
      { item: "a", sizeBytes: half },
      { item: "b", sizeBytes: half },
    ]);

    assert.deepEqual(chunks, [["a"], ["b"]]);
  });

  it("splits when file count exceeds 25 per request", () => {
    const files = Array.from({ length: 26 }, (_, index) => ({
      item: `file-${index}`,
      sizeBytes: 10_000,
    }));

    const chunks = chunkGalleryUploadByByteBudget(files);
    assert.equal(chunks.length, 2);
    assert.equal(chunks[0].length, 25);
    assert.equal(chunks[1].length, 1);
  });

  it("rejects a single file larger than the request budget", () => {
    assert.throws(
      () =>
        chunkGalleryUploadByByteBudget([
          {
            item: "huge",
            sizeBytes: MAX_GALLERY_UPLOAD_REQUEST_BYTES + 1,
          },
        ]),
      GalleryUploadChunkError,
    );
  });
});
