import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildProgramCoopCurriculumStoragePath,
  formatProgramCoopCurriculumUploadError,
  validateProgramCoopCurriculumFile,
} from "./program-coop-curriculum-storage";

describe("buildProgramCoopCurriculumStoragePath", () => {
  it("builds org/program scoped path with safe filename", () => {
    const path = buildProgramCoopCurriculumStoragePath(
      "org-1",
      "program-1",
      "guide/curriculum.pdf",
      "file-1",
    );
    assert.equal(path, "org-1/programs/program-1/file-1_guide_curriculum.pdf");
  });
});

describe("validateProgramCoopCurriculumFile", () => {
  it("accepts pdf files", () => {
    const file = new File(["x"], "curriculum.pdf", { type: "application/pdf" });
    assert.equal(validateProgramCoopCurriculumFile(file), null);
  });

  it("rejects non-pdf files", () => {
    const file = new File(["x"], "notes.doc", {
      type: "application/msword",
    });
    assert.match(validateProgramCoopCurriculumFile(file) ?? "", /pdf/i);
  });

  it("rejects files over 100 MB", () => {
    const file = new File([new Uint8Array(100 * 1024 * 1024 + 1)], "big.pdf", {
      type: "application/pdf",
    });
    assert.match(validateProgramCoopCurriculumFile(file) ?? "", /100 mb/i);
  });
});

describe("formatProgramCoopCurriculumUploadError", () => {
  it("maps Supabase size limit errors to actionable guidance", () => {
    const message = formatProgramCoopCurriculumUploadError(
      new Error("The object exceeded the maximum allowed size"),
    );
    assert.match(message, /Supabase Storage limit/i);
    assert.match(message, /Global file size limit/i);
  });

  it("returns the original message for other errors", () => {
    assert.equal(
      formatProgramCoopCurriculumUploadError(new Error("Network failed")),
      "Network failed",
    );
  });
});
