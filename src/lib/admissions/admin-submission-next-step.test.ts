import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { deriveSubmissionNextStep } from "./admin-submission-next-step";
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
    totalSteps: 10,
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

describe("deriveSubmissionNextStep", () => {
  it("returns All set for enrolled applications", () => {
    const next = deriveSubmissionNextStep(submission({ status: "enrolled" }));
    assert.equal(next.primary, "All set");
    assert.equal(next.kind, "complete");
    assert.equal(next.presentation, "chip");
  });

  it("returns Closed for declined and withdrawn applications", () => {
    assert.equal(
      deriveSubmissionNextStep(submission({ status: "declined" })).primary,
      "Closed",
    );
    assert.equal(
      deriveSubmissionNextStep(submission({ status: "withdrawn" })).primary,
      "Closed",
    );
  });

  it("returns Awaiting family for in-progress drafts", () => {
    const next = deriveSubmissionNextStep(
      submission({
        status: "draft",
        applicationProgressSummary: { completed: 2, total: 10, label: "2/10 complete" },
      }),
    );
    assert.equal(next.primary, "Awaiting family");
    assert.equal(next.secondary, "2/10 complete");
    assert.equal(next.kind, "waiting_family");
  });

  it("returns Awaiting payment when fee blocks submit on nearly complete draft", () => {
    const next = deriveSubmissionNextStep(
      submission({
        status: "draft",
        feeStatus: "pending",
        feeEnabled: true,
        applicationProgressSummary: { completed: 9, total: 10, label: "9/10 complete" },
      }),
    );
    assert.equal(next.primary, "Awaiting payment");
    assert.equal(next.secondary, "9/10 complete");
  });

  it("returns Review application CTA for submitted applications", () => {
    const next = deriveSubmissionNextStep(submission({ status: "submitted" }));
    assert.equal(next.primary, "Review application");
    assert.equal(next.presentation, "cta");
    assert.equal(next.kind, "admin_action");
  });

  it("returns Start enrollment for accepted applications", () => {
    const next = deriveSubmissionNextStep(submission({ status: "accepted" }));
    assert.equal(next.primary, "Start enrollment");
    assert.equal(next.presentation, "cta");
  });

  it("returns Complete enrollment for enrolling applications", () => {
    const next = deriveSubmissionNextStep(
      submission({
        status: "enrolling",
        enrollmentSummary: {
          completed: 3,
          total: 9,
          label: "3/9 required items",
          tone: "in_progress",
          checklistStatus: "in_progress",
          paymentSummary: null,
        },
      }),
    );
    assert.equal(next.primary, "Complete enrollment");
    assert.equal(next.secondary, "3/9 complete");
  });

  it("returns All set when enrollment checklist is complete", () => {
    const next = deriveSubmissionNextStep(
      submission({
        status: "enrolling",
        enrollmentSummary: {
          completed: 9,
          total: 9,
          label: "9/9 required items",
          tone: "complete",
          checklistStatus: "completed",
          paymentSummary: null,
        },
      }),
    );
    assert.equal(next.primary, "All set");
    assert.equal(next.kind, "complete");
  });
});
