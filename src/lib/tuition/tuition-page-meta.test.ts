import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  parseAdminTuitionPageMetaRow,
  type TuitionPageMeta,
} from "./tuition-page-meta";
import { buildTuitionReadinessStatus } from "./tuition-readiness";

describe("parseAdminTuitionPageMetaRow", () => {
  it("maps RPC payload into KPI and readiness shapes", () => {
    const meta = parseAdminTuitionPageMetaRow({
      collected_ytd_cents: "125000",
      outstanding_cents: 42000,
      families_at_risk: 2,
      active_assignments: 18,
      readiness: {
        has_active_rate_plan: true,
        enrolled_count: 20,
        unassigned_enrollment_count: 3,
        pending_payment_plan_count: 1,
        assignments_without_charges_count: 2,
      },
    });

    assert.ok(meta);
    assert.equal(meta.kpis.collectedYtdCents, 125000);
    assert.equal(meta.kpis.outstandingCents, 42000);
    assert.equal(meta.kpis.familiesAtRisk, 2);
    assert.equal(meta.kpis.activeAssignments, 18);
    assert.equal(meta.readiness.unassignedEnrollmentCount, 3);
    assert.equal(meta.readiness.pendingPaymentPlanCount, 1);
    assert.equal(meta.readiness.assignmentsWithoutChargesCount, 2);
    assert.equal(meta.readiness.enrolledCount, 20);
    assert.equal(meta.readiness.completedCount, 1);
  });

  it("returns null when readiness payload is missing", () => {
    assert.equal(
      parseAdminTuitionPageMetaRow({
        collected_ytd_cents: 0,
        outstanding_cents: 0,
        families_at_risk: 0,
        active_assignments: 0,
        readiness: null,
      }),
      null,
    );
  });
});

describe("buildTuitionReadinessStatus", () => {
  it("marks assign step in progress when enrollments are unassigned", () => {
    const readiness = buildTuitionReadinessStatus({
      hasActiveRatePlan: true,
      enrolledCount: 4,
      unassignedEnrollmentCount: 2,
      pendingPaymentPlanCount: 0,
      assignmentsWithoutChargesCount: 0,
    });

    assert.equal(readiness.unassignedEnrollmentCount, 2);
    assert.equal(readiness.steps[0]?.status, "completed");
  });
});

describe("TuitionPageMeta shape", () => {
  it("accepts zeroed KPI defaults", () => {
    const meta: TuitionPageMeta = {
      kpis: {
        collectedYtdCents: 0,
        outstandingCents: 0,
        familiesAtRisk: 0,
        activeAssignments: 0,
      },
      readiness: buildTuitionReadinessStatus({
        hasActiveRatePlan: false,
        enrolledCount: 0,
        unassignedEnrollmentCount: 0,
        pendingPaymentPlanCount: 0,
        assignmentsWithoutChargesCount: 0,
      }),
    };

    assert.equal(meta.kpis.activeAssignments, 0);
    assert.equal(meta.readiness.firstIncompleteStepId, "rate_plan");
  });
});
