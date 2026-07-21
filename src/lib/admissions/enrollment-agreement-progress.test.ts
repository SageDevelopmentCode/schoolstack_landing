import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { EnrollmentContractSection } from "./enrollment-checklist-schema";
import {
  allAgreementSectionsSigned,
  getAgreementResumeSectionIndex,
  getAgreementSectionProgressLabel,
  mergeAgreementSectionSignature,
  parseAgreementSectionSignatures,
} from "./enrollment-agreement-progress";

const sections: EnrollmentContractSection[] = [
  { id: "s1", title: "Section 1", body: "Body 1" },
  { id: "s2", title: "Section 2", body: "Body 2" },
  { id: "s3", title: "Section 3", body: "Body 3" },
];

describe("parseAgreementSectionSignatures", () => {
  it("returns empty array for missing or invalid data", () => {
    assert.deepEqual(parseAgreementSectionSignatures(null), []);
    assert.deepEqual(parseAgreementSectionSignatures({}), []);
    assert.deepEqual(parseAgreementSectionSignatures({ sectionSignatures: "bad" }), []);
  });

  it("parses valid section signatures", () => {
    const parsed = parseAgreementSectionSignatures({
      sectionSignatures: [
        { sectionId: "s1", signerName: "Jane Doe", signedAt: "2026-01-01T00:00:00.000Z" },
        { sectionId: 1, signerName: "bad" },
      ],
    });
    assert.equal(parsed.length, 1);
    assert.equal(parsed[0]?.sectionId, "s1");
    assert.equal(parsed[0]?.signerName, "Jane Doe");
  });
});

describe("mergeAgreementSectionSignature", () => {
  it("appends a new signature", () => {
    const merged = mergeAgreementSectionSignature(
      [],
      "s1",
      "Jane Doe",
      "2026-01-01T00:00:00.000Z",
    );
    assert.equal(merged.length, 1);
    assert.equal(merged[0]?.signerName, "Jane Doe");
  });

  it("upserts by sectionId", () => {
    const existing = mergeAgreementSectionSignature(
      [],
      "s1",
      "Jane Doe",
      "2026-01-01T00:00:00.000Z",
    );
    const merged = mergeAgreementSectionSignature(
      existing,
      "s1",
      "John Doe",
      "2026-01-02T00:00:00.000Z",
    );
    assert.equal(merged.length, 1);
    assert.equal(merged[0]?.signerName, "John Doe");
  });
});

describe("getAgreementResumeSectionIndex", () => {
  it("returns 0 when no sections are signed", () => {
    assert.equal(getAgreementResumeSectionIndex(sections, []), 0);
  });

  it("returns index of first unsigned section", () => {
    const signatures = parseAgreementSectionSignatures({
      sectionSignatures: [
        { sectionId: "s1", signerName: "Jane", signedAt: "2026-01-01T00:00:00.000Z" },
        { sectionId: "s2", signerName: "Jane", signedAt: "2026-01-02T00:00:00.000Z" },
      ],
    });
    assert.equal(getAgreementResumeSectionIndex(sections, signatures), 2);
  });

  it("returns last index when all sections are signed", () => {
    const signatures = parseAgreementSectionSignatures({
      sectionSignatures: [
        { sectionId: "s1", signerName: "Jane", signedAt: "2026-01-01T00:00:00.000Z" },
        { sectionId: "s2", signerName: "Jane", signedAt: "2026-01-02T00:00:00.000Z" },
        { sectionId: "s3", signerName: "Jane", signedAt: "2026-01-03T00:00:00.000Z" },
      ],
    });
    assert.equal(getAgreementResumeSectionIndex(sections, signatures), 2);
  });
});

describe("getAgreementSectionProgressLabel", () => {
  it("formats signed section counts", () => {
    const signatures = parseAgreementSectionSignatures({
      sectionSignatures: [
        { sectionId: "s1", signerName: "Jane", signedAt: "2026-01-01T00:00:00.000Z" },
      ],
    });
    assert.equal(getAgreementSectionProgressLabel(sections, signatures), "1 of 3 sections signed");
  });

  it("uses singular section label", () => {
    const single = [{ id: "s1", title: "Only", body: "Body" }];
    assert.equal(getAgreementSectionProgressLabel(single, []), "0 of 1 section signed");
  });
});

describe("allAgreementSectionsSigned", () => {
  it("returns false until every section is signed", () => {
    const partial = parseAgreementSectionSignatures({
      sectionSignatures: [
        { sectionId: "s1", signerName: "Jane", signedAt: "2026-01-01T00:00:00.000Z" },
      ],
    });
    assert.equal(allAgreementSectionsSigned(sections, partial), false);
    assert.equal(allAgreementSectionsSigned(sections, []), false);
  });

  it("returns true when all sections are signed", () => {
    const complete = parseAgreementSectionSignatures({
      sectionSignatures: [
        { sectionId: "s1", signerName: "Jane", signedAt: "2026-01-01T00:00:00.000Z" },
        { sectionId: "s2", signerName: "Jane", signedAt: "2026-01-02T00:00:00.000Z" },
        { sectionId: "s3", signerName: "Jane", signedAt: "2026-01-03T00:00:00.000Z" },
      ],
    });
    assert.equal(allAgreementSectionsSigned(sections, complete), true);
  });
});
