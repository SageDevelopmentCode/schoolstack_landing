import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { EnrollmentContractSection } from "./enrollment-checklist-schema";
import {
  allAgreementSectionsSigned,
  areAllPendingResignSectionsSigned,
  buildAgreementResponsesPatch,
  getAgreementInitialSectionIndex,
  getAgreementPendingResignSectionIndex,
  getAgreementResumeSectionIndex,
  getAgreementSectionIndexById,
  getAgreementSectionProgressLabel,
  isAgreementSectionPendingResign,
  mergeAgreementSectionSignature,
  parseAgreementConsentValue,
  parseAgreementSectionSignatures,
  parseAmendmentNotice,
  parsePendingResignSectionIds,
  hasPendingAgreementResign,
  shouldClearAgreementAmendmentAfterSectionSave,
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

describe("parseAgreementConsentValue", () => {
  it("returns null for missing or invalid consent", () => {
    assert.equal(parseAgreementConsentValue(null), null);
    assert.equal(parseAgreementConsentValue({}), null);
    assert.equal(parseAgreementConsentValue({ consentValue: "   " }), null);
  });

  it("returns trimmed consent value", () => {
    assert.equal(parseAgreementConsentValue({ consentValue: " full_use " }), "full_use");
  });
});

describe("buildAgreementResponsesPatch", () => {
  it("stores consentValue when provided", () => {
    const patch = buildAgreementResponsesPatch({}, [], "Jane Doe", "full_use");
    assert.equal(patch.signerName, "Jane Doe");
    assert.equal(patch.consentValue, "full_use");
  });

  it("clears amendment fields when requested", () => {
    const patch = buildAgreementResponsesPatch(
      {
        amendmentNotice: "Please re-sign",
        pendingResignSectionIds: ["s2"],
      },
      [],
      "Jane Doe",
      undefined,
      { clearAmendment: true, signedContentRevision: 3 },
    );
    assert.equal(patch.signerName, "Jane Doe");
    assert.equal(patch.signedContentRevision, 3);
    assert.equal("amendmentNotice" in patch, false);
    assert.equal("pendingResignSectionIds" in patch, false);
  });
});

describe("getAgreementPendingResignSectionIndex", () => {
  it("returns null when no pending sections", () => {
    assert.equal(getAgreementPendingResignSectionIndex(sections, []), null);
  });

  it("returns index of first pending section in document order", () => {
    assert.equal(getAgreementPendingResignSectionIndex(sections, ["s3", "s2"]), 1);
    assert.equal(getAgreementPendingResignSectionIndex(sections, ["missing"]), null);
  });
});

describe("getAgreementSectionIndexById", () => {
  it("returns section index or null", () => {
    assert.equal(getAgreementSectionIndexById(sections, "s2"), 1);
    assert.equal(getAgreementSectionIndexById(sections, "missing"), null);
  });
});

describe("isAgreementSectionPendingResign", () => {
  it("checks pending membership", () => {
    assert.equal(isAgreementSectionPendingResign("s2", ["s2", "s3"]), true);
    assert.equal(isAgreementSectionPendingResign("s1", ["s2"]), false);
  });
});

describe("getAgreementInitialSectionIndex", () => {
  it("prefers explicit section id when valid", () => {
    const signatures = parseAgreementSectionSignatures({
      sectionSignatures: [
        { sectionId: "s1", signerName: "Jane", signedAt: "2026-01-01T00:00:00.000Z" },
      ],
    });
    assert.equal(
      getAgreementInitialSectionIndex(sections, signatures, ["s2"], "s3"),
      2,
    );
  });

  it("prefers pending resign index over resume index", () => {
    const signatures = parseAgreementSectionSignatures({
      sectionSignatures: [
        { sectionId: "s1", signerName: "Jane", signedAt: "2026-01-01T00:00:00.000Z" },
        { sectionId: "s3", signerName: "Jane", signedAt: "2026-01-03T00:00:00.000Z" },
      ],
    });
    assert.equal(getAgreementInitialSectionIndex(sections, signatures, ["s2"]), 1);
  });

  it("falls back to resume index when no pending sections", () => {
    const signatures = parseAgreementSectionSignatures({
      sectionSignatures: [
        { sectionId: "s1", signerName: "Jane", signedAt: "2026-01-01T00:00:00.000Z" },
      ],
    });
    assert.equal(getAgreementInitialSectionIndex(sections, signatures, []), 1);
  });
});

describe("pending resign parsing", () => {
  it("parses pending resign section ids", () => {
    assert.deepEqual(
      parsePendingResignSectionIds({ pendingResignSectionIds: ["std-2", ""] }),
      ["std-2"],
    );
    assert.deepEqual(parsePendingResignSectionIds({}), []);
  });

  it("parses amendment notice and pending state", () => {
    assert.equal(
      parseAmendmentNotice({ amendmentNotice: " Updated contract " }),
      "Updated contract",
    );
    assert.equal(
      hasPendingAgreementResign({ pendingResignSectionIds: ["std-2"] }),
      true,
    );
    assert.equal(hasPendingAgreementResign({}), false);
  });
});

describe("shouldClearAgreementAmendmentAfterSectionSave", () => {
  it("clears amendment when the last pending section is re-signed", () => {
    const priorPending = ["std-2"];
    const nextPending = priorPending.filter((id) => id !== "std-2");
    assert.equal(
      shouldClearAgreementAmendmentAfterSectionSave(false, priorPending, nextPending),
      true,
    );

    const patch = buildAgreementResponsesPatch(
      {
        amendmentNotice: "Please re-sign",
        pendingResignSectionIds: ["std-2"],
        sectionSignatures: [],
      },
      [
        {
          sectionId: "std-2",
          signerName: "Jane Doe",
          signedAt: "2026-08-29T14:34:08.473Z",
        },
      ],
      undefined,
      undefined,
      {
        clearAmendment: shouldClearAgreementAmendmentAfterSectionSave(
          false,
          priorPending,
          nextPending,
        ),
      },
    );
    assert.equal("amendmentNotice" in patch, false);
    assert.equal("pendingResignSectionIds" in patch, false);
  });

  it("does not clear amendment while pending sections remain", () => {
    assert.equal(
      shouldClearAgreementAmendmentAfterSectionSave(false, ["std-2", "std-3"], ["std-3"]),
      false,
    );
  });
});

describe("areAllPendingResignSectionsSigned", () => {
  it("returns true when there are no pending sections", () => {
    assert.equal(areAllPendingResignSectionsSigned([], []), true);
  });

  it("returns false when a pending section lacks a signature", () => {
    assert.equal(
      areAllPendingResignSectionsSigned(
        ["std-2"],
        [{ sectionId: "std-3", signerName: "Jane", signedAt: "2026-01-01T00:00:00.000Z" }],
      ),
      false,
    );
  });

  it("returns true when every pending section is signed", () => {
    assert.equal(
      areAllPendingResignSectionsSigned(
        ["std-2"],
        [{ sectionId: "std-2", signerName: "Jane", signedAt: "2026-01-01T00:00:00.000Z" }],
      ),
      true,
    );
  });
});

describe("amendment acknowledge resume section", () => {
  it("returns the first unsigned section after amendment review", () => {
    const signatures = parseAgreementSectionSignatures({
      sectionSignatures: [
        { sectionId: "s2", signerName: "Jane", signedAt: "2026-01-01T00:00:00.000Z" },
        { sectionId: "s3", signerName: "Jane", signedAt: "2026-01-02T00:00:00.000Z" },
      ],
    });
    assert.equal(getAgreementResumeSectionIndex(sections, signatures), 0);
    assert.equal(sections[getAgreementResumeSectionIndex(sections, signatures)]?.id, "s1");
    assert.equal(allAgreementSectionsSigned(sections, signatures), false);
  });
});
