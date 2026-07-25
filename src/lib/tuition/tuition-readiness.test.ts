import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildTuitionReadinessStatus,
  computeAssignEnrollmentsStepStatus,
  computeBillingScheduleStepStatus,
  computeFamilyBillingReadiness,
  computePaymentPlansStepStatus,
  computeRatePlanStepStatus,
  type TuitionReadinessRawData,
} from "@/lib/tuition/tuition-readiness";
import type { FamilyAssignmentSummary } from "@/lib/tuition/types";

const baseData: TuitionReadinessRawData = {
  hasActiveRatePlan: true,
  enrolledCount: 3,
  unassignedEnrollmentCount: 0,
  pendingPaymentPlanCount: 0,
  assignmentsWithoutChargesCount: 0,
};

function assignment(
  overrides: Partial<FamilyAssignmentSummary> = {},
): FamilyAssignmentSummary {
  return {
    assignmentId: "assignment-1",
    enrollmentId: "enrollment-1",
    studentName: "Test Child",
    ratePlanName: "School Year 2026–27",
    tierLabel: "Standard",
    paymentPlanLabel: "4 payments",
    pendingPaymentPlanSelection: false,
    ...overrides,
  };
}

describe("computeRatePlanStepStatus", () => {
  it("returns completed when an active rate plan exists", () => {
    assert.equal(computeRatePlanStepStatus(true), "completed");
  });

  it("returns not_started when no active rate plan exists", () => {
    assert.equal(computeRatePlanStepStatus(false), "not_started");
  });
});

describe("computeAssignEnrollmentsStepStatus", () => {
  it("waits for a rate plan before assigning enrollments", () => {
    assert.equal(
      computeAssignEnrollmentsStepStatus({
        hasActiveRatePlan: false,
        enrolledCount: 2,
        unassignedEnrollmentCount: 2,
      }),
      "not_started",
    );
  });

  it("completes when all enrolled students have assignments", () => {
    assert.equal(computeAssignEnrollmentsStepStatus(baseData), "completed");
  });

  it("is in progress when enrolled students are missing assignments", () => {
    assert.equal(
      computeAssignEnrollmentsStepStatus({
        ...baseData,
        unassignedEnrollmentCount: 2,
      }),
      "in_progress",
    );
  });
});

describe("computePaymentPlansStepStatus", () => {
  it("waits until enrollments are assigned", () => {
    assert.equal(
      computePaymentPlansStepStatus(
        { ...baseData, unassignedEnrollmentCount: 1 },
        "in_progress",
      ),
      "not_started",
    );
  });

  it("is in progress when payment plans still need selection", () => {
    assert.equal(
      computePaymentPlansStepStatus(
        { ...baseData, pendingPaymentPlanCount: 2 },
        "completed",
      ),
      "in_progress",
    );
  });
});

describe("computeBillingScheduleStepStatus", () => {
  it("waits until payment plans are finalized", () => {
    assert.equal(
      computeBillingScheduleStepStatus(
        { ...baseData, assignmentsWithoutChargesCount: 2 },
        "completed",
        "in_progress",
      ),
      "not_started",
    );
  });

  it("is in progress when assignments have no charges yet", () => {
    assert.equal(
      computeBillingScheduleStepStatus(
        { ...baseData, assignmentsWithoutChargesCount: 2 },
        "completed",
        "completed",
      ),
      "in_progress",
    );
  });
});

describe("buildTuitionReadinessStatus", () => {
  it("identifies assign_enrollments as the first incomplete step", () => {
    const status = buildTuitionReadinessStatus({
      ...baseData,
      unassignedEnrollmentCount: 3,
    });

    assert.equal(status.firstIncompleteStepId, "assign_enrollments");
    assert.equal(status.completedCount, 1);
  });

  it("marks all steps complete when billing is ready", () => {
    const status = buildTuitionReadinessStatus(baseData);

    assert.equal(status.firstIncompleteStepId, null);
    assert.equal(status.completedCount, 4);
  });
});

describe("computeFamilyBillingReadiness", () => {
  it("detects missing assignments", () => {
    assert.equal(
      computeFamilyBillingReadiness({
        enrolledEnrollmentIds: ["enrollment-1"],
        assignments: [],
        chargeCount: 0,
      }),
      "needs_assignment",
    );
  });

  it("detects pending payment plan selection", () => {
    assert.equal(
      computeFamilyBillingReadiness({
        enrolledEnrollmentIds: ["enrollment-1"],
        assignments: [
          assignment({ pendingPaymentPlanSelection: true }),
        ],
        chargeCount: 0,
      }),
      "needs_payment_plan",
    );
  });

  it("detects assignments without generated charges", () => {
    assert.equal(
      computeFamilyBillingReadiness({
        enrolledEnrollmentIds: ["enrollment-1"],
        assignments: [assignment()],
        chargeCount: 0,
      }),
      "no_charges",
    );
  });

  it("returns ready when assignments and charges exist", () => {
    assert.equal(
      computeFamilyBillingReadiness({
        enrolledEnrollmentIds: ["enrollment-1"],
        assignments: [assignment()],
        chargeCount: 4,
      }),
      "ready",
    );
  });
});
