import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  prepareGalleryBatchFiles,
  uploadGalleryBatch,
} from "./upload-gallery-batch";

class MockXMLHttpRequest {
  upload = { onprogress: null as ((event: ProgressEvent) => void) | null };
  status = 0;
  responseText = "";
  responseType = "";
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;

  open(_method: string, _url: string) {}

  send(_body?: Document | XMLHttpRequestBodyInit | null) {
    this.status = 200;
    this.responseText = JSON.stringify({
      photos: [
        {
          id: "photo-1",
          organization_id: "org-1",
          photo_date: "2026-01-01",
          storage_path: "org-1/gallery/photo-1/a.webp",
          file_name: "a.webp",
          mime_type: "image/webp",
          size_bytes: 10,
          upload_batch_id: "batch-1",
          uploaded_by: "user-1",
          created_at: "2026-01-01T00:00:00Z",
          updated_at: "2026-01-01T00:00:00Z",
        },
      ],
    });
    this.onload?.();
  }
}

describe("prepareGalleryBatchFiles", () => {
  it("returns the same files without preparing when alreadyPrepared is true", async () => {
    const file = new File([new Uint8Array([1, 2, 3])], "a.webp", {
      type: "image/webp",
    });

    const result = await prepareGalleryBatchFiles([file], {
      alreadyPrepared: true,
    });

    assert.equal(result.length, 1);
    assert.equal(result[0], file);
  });
});

describe("uploadGalleryBatch", () => {
  it("uploads already-prepared files without a prepare step", async () => {
    const previousXhr = globalThis.XMLHttpRequest;
    globalThis.XMLHttpRequest =
      MockXMLHttpRequest as unknown as typeof XMLHttpRequest;

    try {
      const file = new File([new Uint8Array([1, 2, 3])], "a.webp", {
        type: "image/webp",
      });

      const result = await uploadGalleryBatch({
        files: [file],
        photoDate: "2026-01-01",
        uploadUrl: "/api/school/demo/gallery",
        alreadyPrepared: true,
      });

      assert.equal(result.photos.length, 1);
    } finally {
      globalThis.XMLHttpRequest = previousXhr;
    }
  });
});
