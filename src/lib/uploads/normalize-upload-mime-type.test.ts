import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { PortalRouteError, portalRouteErrorStatus } from "@/lib/api/portal-route-errors";
import {
  assertUploadFileSize,
  normalizeUploadFile,
} from "./normalize-upload-mime-type";

const ALLOWED = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

function file(name: string, type: string, bytes = "data"): File {
  return new File([bytes], name, { type });
}

describe("normalizeUploadFile", () => {
  it("returns an allowed file unchanged", () => {
    const input = file("photo.jpg", "image/jpeg");
    assert.equal(normalizeUploadFile(input, ALLOWED), input);
  });

  it("retypes an Android octet-stream photo from its extension", async () => {
    const input = file("1000047910.jpg", "application/octet-stream", "jpeg-bytes");
    const result = normalizeUploadFile(input, ALLOWED);
    assert.equal(result.type, "image/jpeg");
    assert.equal(result.name, "1000047910.jpg");
    assert.equal(await result.text(), "jpeg-bytes");
  });

  it("retypes a file with no type from its extension", () => {
    assert.equal(normalizeUploadFile(file("1000047945.PNG", ""), ALLOWED).type, "image/png");
    assert.equal(normalizeUploadFile(file("form.pdf", ""), ALLOWED).type, "application/pdf");
  });

  it("maps non-standard aliases", () => {
    assert.equal(normalizeUploadFile(file("a.jpg", "image/jpg"), ALLOWED).type, "image/jpeg");
    assert.equal(normalizeUploadFile(file("a", "image/pjpeg"), ALLOWED).type, "image/jpeg");
  });

  it("rejects unsupported types as a 400", () => {
    for (const input of [
      file("setup.exe", "application/octet-stream"),
      file("noext", ""),
      file("clip.mov", "video/quicktime"),
      file("fake.jpg", "text/html"),
    ]) {
      assert.throws(
        () => normalizeUploadFile(input, ALLOWED),
        (err: unknown) =>
          err instanceof PortalRouteError &&
          err.status === 400 &&
          err.code === "unsupported_file_type" &&
          portalRouteErrorStatus(err, "x").status === 400,
      );
    }
  });
});

describe("assertUploadFileSize", () => {
  it("allows files at the limit and rejects larger ones as a 400", () => {
    assert.doesNotThrow(() => assertUploadFileSize(file("a.jpg", "image/jpeg", "1234"), 4));
    assert.throws(
      () => assertUploadFileSize(file("a.jpg", "image/jpeg", "12345"), 4),
      (err: unknown) => err instanceof PortalRouteError && err.code === "file_too_large",
    );
  });
});
