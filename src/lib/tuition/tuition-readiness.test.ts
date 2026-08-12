import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  assignTuitionLabel,
  buildTuitionReadinessStatus,
  computeAssignEnrollmentsStepStatus,
  computeBillingScheduleStepStatus,
  computeFamilyBillingReadiness,
  computePaymentPlansStepStatus,
  computeRatePlanStepStatus,
  partitionUnassignedEnrollments,
  type TuitionReadinessRawData,
} from "@/lib/tuition/tuition-readiness";
import type { FamilyAssignmentSummary, UnassignedEnrollmentSummary } from "@/lib/tuition/types";

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
    enrollmentStatus: "enrolled",
    ratePlanName: "School Year 2026–27",
    tierLabel: "Standard",
    paymentPlanLabel: "4 payments",
    pendingPaymentPlanSelection: false,
    activeAdjustmentCount: 0,
    adjustmentSummaryLabel: null,
    adjustmentSummaryFull: null,
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
      computePaymentPlansStepStatus({
        ...baseData,
        unassignedEnrollmentCount: 1,
      }),
      "not_started",
    );
  });

  it("is in progress when payment plans still need selection", () => {
    assert.equal(
      computePaymentPlansStepStatus({
        ...baseData,
        pendingPaymentPlanCount: 2,
      }),
      "in_progress",
    );
  });
});

describe("computeBillingScheduleStepStatus", () => {
  it("waits until payment plans are finalized", () => {
    assert.equal(
      computeBillingScheduleStepStatus(
        { ...baseData, assignmentsWithoutChargesCount: 2 },
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
      ),
      "in_progress",
    );
  });
});

describe("buildTuitionReadinessStatus", () => {
  it("gates payment_plans when enrollments lack assignments", () => {
    const status = buildTuitionReadinessStatus({
      ...baseData,
      unassignedEnrollmentCount: 3,
    });

    assert.equal(status.firstIncompleteStepId, "payment_plans");
    assert.equal(status.completedCount, 1);
    assert.equal(status.totalCount, 3);
    assert.equal(status.steps[1]?.status, "not_started");
    assert.equal(status.unassignedEnrollmentCount, 3);
  });

  it("uses family-facing copy for payment plan step", () => {
    const status = buildTuitionReadinessStatus({
      ...baseData,
      pendingPaymentPlanCount: 2,
    });

    assert.equal(status.firstIncompleteStepId, "payment_plans");
    assert.equal(status.steps[1]?.title, "Families choose payment schedules");
    assert.match(
      status.steps[1]?.description ?? "",
      /parent portal under Billing/i,
    );
  });

  it("marks all steps complete when billing is ready", () => {
    const status = buildTuitionReadinessStatus(baseData);

    assert.equal(status.firstIncompleteStepId, null);
    assert.equal(status.completedCount, 3);
    assert.equal(status.totalCount, 3);
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

  it("does not treat pending-only enrollments as needing assignment", () => {
    assert.equal(
      computeFamilyBillingReadiness({
        enrolledEnrollmentIds: [],
        assignments: [],
        chargeCount: 0,
      }),
      "ready",
    );
  });

  it("does not treat pending enrollments with assignments as needing assignment", () => {
    assert.equal(
      computeFamilyBillingReadiness({
        enrolledEnrollmentIds: [],
        assignments: [assignment()],
        chargeCount: 0,
      }),
      "no_charges",
    );
  });
});

describe("partitionUnassignedEnrollments", () => {
  function unassigned(
    overrides: Partial<UnassignedEnrollmentSummary> = {},
  ): UnassignedEnrollmentSummary {
    return {
      enrollmentId: "enrollment-1",
      studentName: "Clara Caballero",
      programName: "School Year 2026–27",
      status: "pending",
      ...overrides,
    };
  }

  it("separates enrolling students from enrolled students missing tuition", () => {
    const result = partitionUnassignedEnrollments([
      unassigned({ enrollmentId: "pending-1", status: "pending" }),
      unassigned({
        enrollmentId: "enrolled-1",
        status: "enrolled",
        studentName: "Helene Miller",
      }),
    ]);

    assert.equal(result.enrolling.length, 1);
    assert.equal(result.enrolledUnassigned.length, 1);
    assert.equal(result.enrolling[0]?.enrollmentId, "pending-1");
    assert.equal(result.enrolledUnassigned[0]?.enrollmentId, "enrolled-1");
  });
});

describe("assignTuitionLabel", () => {
  it("uses singular copy for one student", () => {
    assert.equal(assignTuitionLabel(1), "Assign tuition");
  });

  it("uses plural copy for multiple students", () => {
    assert.equal(assignTuitionLabel(2), "Assign tuition to 2 students");
  });
});
