import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { EnrollmentChecklistItem } from "./enrollment-checklist-schema";
import { summarizeEnrollmentDocumentChanges } from "./enrollment-checklist-document-changes";

function inlineAgreementItem(
  id: string,
  label: string,
  sections: Array<{ id: string; title: string; body: string }>,
  documentTemplateId = "doc-1",
): EnrollmentChecklistItem {
  return {
    id,
    itemKey: id,
    label,
    type: "document_sign",
    required: true,
    document: {
      kind: "inline_sections",
      sections,
    },
    metadata: { documentTemplateId },
  };
}

describe("summarizeEnrollmentDocumentChanges", () => {
  it("returns no changes when section bodies are unchanged", () => {
    const items = [
      inlineAgreementItem("item-1", "Enrollment Agreement", [
        { id: "s1", title: "Section 1", body: "Body 1" },
      ]),
    ];

    assert.deepEqual(summarizeEnrollmentDocumentChanges(items, items), []);
  });

  it("detects changed section bodies", () => {
    const before = [
      inlineAgreementItem("item-1", "Enrollment Agreement", [
        { id: "s1", title: "Section 1", body: "Body 1" },
        { id: "s2", title: "Section 2", body: "Old body" },
      ]),
    ];
    const after = [
      inlineAgreementItem("item-1", "Enrollment Agreement", [
        { id: "s1", title: "Section 1", body: "Body 1" },
        { id: "s2", title: "Section 2", body: "New body" },
      ]),
    ];

    const changes = summarizeEnrollmentDocumentChanges(before, after);
    assert.equal(changes.length, 1);
    assert.equal(changes[0]?.checklistItemId, "item-1");
    assert.equal(changes[0]?.changedSections.length, 1);
    assert.equal(changes[0]?.changedSections[0]?.sectionId, "s2");
  });

  it("ignores non-inline agreement items", () => {
    const pdfItem: EnrollmentChecklistItem = {
      id: "pdf-1",
      itemKey: "pdf-1",
      label: "PDF Agreement",
      type: "document_sign_pdf",
      required: true,
      document: {
        kind: "pdf",
        fileName: "agreement.pdf",
      },
      metadata: {},
    };

    assert.deepEqual(
      summarizeEnrollmentDocumentChanges([pdfItem], [pdfItem]),
      [],
    );
  });
});
