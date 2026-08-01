import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildCommitteeResourceStoragePath,
  validateCommitteeResourceFile,
} from "./resource-file-storage";

describe("buildCommitteeResourceStoragePath", () => {
  it("builds org/committee scoped path with safe filename", () => {
    const path = buildCommitteeResourceStoragePath(
      "org-1",
      "committee-1",
      "my/doc.pdf",
      "file-1",
    );
    assert.equal(path, "org-1/committees/committee-1/file-1_my_doc.pdf");
  });
});

describe("validateCommitteeResourceFile", () => {
  it("accepts pdf files", () => {
    const file = new File(["x"], "notes.pdf", { type: "application/pdf" });
    assert.equal(validateCommitteeResourceFile(file, "pdf"), null);
  });

  it("rejects non-pdf for pdf type", () => {
    const file = new File(["x"], "notes.doc", {
      type: "application/msword",
    });
    assert.match(validateCommitteeResourceFile(file, "pdf") ?? "", /pdf/i);
  });

  it("accepts docx for doc type", () => {
    const file = new File(["x"], "plan.docx", {
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });
    assert.equal(validateCommitteeResourceFile(file, "doc"), null);
  });
});
