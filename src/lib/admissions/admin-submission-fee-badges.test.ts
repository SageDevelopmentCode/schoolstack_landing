import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildSubmissionFeeBadges,
  formatSubmissionFeeBadgeLabel,
  submissionHasFeeBadges,
} from "./admin-submission-fee-badges";
import type { AdminApplicationSubmission } from "./application-submissions";

function submission(
  overrides: Partial<AdminApplicationSubmission> = {},
): AdminApplicationSubmission {
  return {
    id: "app-1",
    status: "submitted",
    feeStatus: "paid",
    feeEnabled: true,
    formTitle: "Application",
    formSlug: "apply",
    programName: "School Year 2026–27",
    guardianName: "Parent",
    primaryGuardianId: null,
    contactEmail: "parent@example.com",
    studentLabel: "Student",
    stepIndex: 0,
    totalSteps: 1,
    createdAt: "2026-01-01T00:00:00.000Z",
    submittedAt: "2026-01-02T00:00:00.000Z",
    updatedAt: "2026-01-03T00:00:00.000Z",
    hasPostSubmitActions: false,
    postSubmitSummary: null,
    applicationProgressSummary: null,
    enrollmentSummary: null,
    ...overrides,
  };
}

describe("buildSubmissionFeeBadges", () => {
  it("shows application fee paid for submitted applications", () => {
    const badges = buildSubmissionFeeBadges(submission());

    assert.equal(badges.length, 1);
    assert.equal(badges[0]?.key, "application");
    assert.equal(badges[0]?.status, "paid");
    assert.equal(formatSubmissionFeeBadgeLabel(badges[0]!), "Application · Paid");
  });

  it("shows application unpaid and enrollment unpaid while enrolling", () => {
    const badges = buildSubmissionFeeBadges(
      submission({
        status: "enrolling",
        enrollmentSummary: {
          label: "0/9 complete",
          tone: "not_started",
          completed: 0,
          total: 9,
          checklistStatus: "in_progress",
          paymentSummary: {
            hasPaymentItems: true,
            allPaid: false,
            allWaived: false,
          },
        },
      }),
    );

    assert.deepEqual(
      badges.map((badge) => `${badge.key}:${badge.status}`),
      ["application:paid", "enrollment:pending"],
    );
  });

  it("shows both fees paid when enrolled", () => {
    const badges = buildSubmissionFeeBadges(
      submission({
        status: "enrolled",
        enrollmentSummary: {
          label: "9/9 complete",
          tone: "complete",
          completed: 9,
          total: 9,
          checklistStatus: "completed",
          paymentSummary: {
            hasPaymentItems: true,
            allPaid: true,
            allWaived: false,
          },
        },
      }),
    );

    assert.deepEqual(
      badges.map((badge) => badge.status),
      ["paid", "paid"],
    );
  });

  it("omits application badge when fee is disabled", () => {
    const badges = buildSubmissionFeeBadges(
      submission({
        feeEnabled: false,
        feeStatus: "not_required",
      }),
    );

    assert.equal(badges.length, 0);
    assert.equal(submissionHasFeeBadges(submission({ feeEnabled: false })), false);
  });

  it("omits enrollment badge when checklist has no payment steps", () => {
    const badges = buildSubmissionFeeBadges(
      submission({
        enrollmentSummary: {
          label: "2/5 complete",
          tone: "in_progress",
          completed: 2,
          total: 5,
          checklistStatus: "in_progress",
          paymentSummary: null,
        },
      }),
    );

    assert.equal(badges.length, 1);
    assert.equal(badges[0]?.key, "application");
  });
});
