import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildEnrollmentAgreementAmendmentBannerItems,
} from "./enrollment-agreement-amendment-banner";
import { buildAgreementEnrollmentHref } from "./enrollment-agreement-enrollment-href";
import {
  buildEnrollmentAgreementIncompleteBannerItems,
} from "./enrollment-agreement-incomplete-banner";
import {
  allAgreementSectionsSigned,
  getAgreementResumeSectionIndex,
  parseAgreementSectionSignatures,
} from "./enrollment-agreement-progress";
import type { EnrollmentContractSection } from "./enrollment-checklist-schema";

const standardSections: EnrollmentContractSection[] = [
  { id: "std-1", title: "Tuition Summary", body: "Body 1" },
  { id: "std-2", title: "Withdrawal", body: "Body 2" },
  { id: "std-3", title: "Sign and Complete", body: "Body 3" },
];

describe("buildAgreementEnrollmentHref", () => {
  it("includes item and resume section query params", () => {
    const href = buildAgreementEnrollmentHref(
      "/school/demo/apply/app-1/enrollment",
      "template-item-1",
      "std-1",
    );

    assert.equal(
      href,
      "/school/demo/apply/app-1/enrollment?item=template-item-1&section=std-1",
    );
  });
});

describe("buildEnrollmentAgreementIncompleteBannerItems", () => {
  it("builds href to the resume section for incomplete agreements", () => {
    const items = buildEnrollmentAgreementIncompleteBannerItems({
      schoolSlug: "demo",
      familyChildren: [
        { applicationId: "app-1", studentName: "Alpha Child" },
      ],
      incompleteByApplicationId: {
        "app-1": [
          {
            checklistItemLabel: "Standard Enrollment Agreement",
            templateItemId: "template-item-1",
            resumeSectionId: "std-1",
          },
        ],
      },
    });

    assert.equal(items.length, 1);
    assert.equal(items[0]?.studentName, "Alpha Child");
    assert.match(items[0]?.enrollmentHref ?? "", /section=std-1/);
    assert.match(items[0]?.enrollmentHref ?? "", /item=template-item-1/);
  });
});

describe("buildEnrollmentAgreementAmendmentBannerItems", () => {
  it("uses resumeSectionId instead of only the first pending section", () => {
    const items = buildEnrollmentAgreementAmendmentBannerItems({
      schoolSlug: "demo",
      familyChildren: [
        { applicationId: "app-1", studentName: "Amelia Sisco Thompson" },
      ],
      amendmentsByApplicationId: {
        "app-1": [
          {
            checklistItemLabel: "Standard Enrollment Agreement",
            amendmentNotice: "Please review and re-sign.",
            templateItemId: "template-item-1",
            resumeSectionId: "std-1",
          },
        ],
      },
    });

    assert.equal(items.length, 1);
    assert.match(items[0]?.enrollmentHref ?? "", /section=std-1/);
    assert.doesNotMatch(items[0]?.enrollmentHref ?? "", /section=std-2/);
  });
});

describe("incomplete agreement resume section", () => {
  it("identifies std-1 as resume target when std-2 through std-5 are signed", () => {
    const signatures = parseAgreementSectionSignatures({
      sectionSignatures: [
        { sectionId: "std-2", signerName: "Parent", signedAt: "2026-08-30T00:00:00.000Z" },
        { sectionId: "std-3", signerName: "Parent", signedAt: "2026-08-30T00:00:01.000Z" },
      ],
    });

    assert.equal(allAgreementSectionsSigned(standardSections, signatures), false);
    assert.equal(
      standardSections[getAgreementResumeSectionIndex(standardSections, signatures)]?.id,
      "std-1",
    );
  });

  it("treats fully signed agreements as complete", () => {
    const signatures = parseAgreementSectionSignatures({
      sectionSignatures: [
        { sectionId: "std-1", signerName: "Parent", signedAt: "2026-08-30T00:00:00.000Z" },
        { sectionId: "std-2", signerName: "Parent", signedAt: "2026-08-30T00:00:01.000Z" },
        { sectionId: "std-3", signerName: "Parent", signedAt: "2026-08-30T00:00:02.000Z" },
      ],
    });

    assert.equal(allAgreementSectionsSigned(standardSections, signatures), true);
  });
});
