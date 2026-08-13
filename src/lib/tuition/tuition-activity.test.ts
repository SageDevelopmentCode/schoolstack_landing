import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type {
  TuitionAdjustment,
  TuitionEnrollmentAssignment,
  TuitionOrgSettings,
  TuitionRatePlan,
} from "./types";
import {
  summarizeAssignmentChanges,
  summarizeAutopayCharge,
  summarizeAutopayToggle,
  summarizeBackfillResult,
  summarizeBillingRunSummary,
  summarizeBillingSplitChanges,
  summarizeFinancialAidImport,
  summarizeOrgSettingsChanges,
  summarizePaymentAction,
  summarizePaymentMethodSaved,
  summarizeRatePlanChanges,
} from "./tuition-activity";

function baseRatePlan(
  overrides: Partial<TuitionRatePlan> = {},
): TuitionRatePlan {
  return {
    id: "plan-1",
    organizationId: "org-1",
    programId: "program-1",
    name: "2026 Tuition",
    billingBasis: "annual",
    amountCents: 1200000,
    currency: "usd",
    effectiveStart: null,
    effectiveEnd: null,
    status: "active",
    metadata: {},
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function baseAssignment(
  overrides: Partial<TuitionEnrollmentAssignment> = {},
): TuitionEnrollmentAssignment {
  return {
    id: "assign-1",
    organizationId: "org-1",
    enrollmentId: "enroll-1",
    familyId: "family-1",
    ratePlanId: "plan-1",
    rateTierId: "tier-1",
    paymentPlanId: "plan-1",
    assignmentSource: "default",
    assignedByUserId: null,
    effectiveStart: null,
    effectiveEnd: null,
    status: "active",
    metadata: {},
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function baseOrgSettings(
  overrides: Partial<TuitionOrgSettings> = {},
): TuitionOrgSettings {
  return {
    graceDays: 5,
    lateFeeEnabled: true,
    lateFeeAmountCents: 2500,
    lateFeeDayOfMonth: 15,
    lateFeeRecurring: false,
    reminderDaysBefore: [7, 3, 1],
    ...overrides,
  };
}

describe("summarizeRatePlanChanges", () => {
  it("reports creation when before is null", () => {
    const after = baseRatePlan();
    const summary = summarizeRatePlanChanges(null, after);
    assert.deepEqual(summary.changedFields, ["created"]);
    assert.match(summary.changes[0], /Created rate plan/);
    assert.match(summary.changes[0], /\$12,000/);
  });

  it("reports amount and name changes", () => {
    const before = baseRatePlan();
    const after = baseRatePlan({
      name: "2027 Tuition",
      amountCents: 1300000,
    });
    const summary = summarizeRatePlanChanges(before, after);
    assert.deepEqual(summary.changedFields, ["name", "amountCents"]);
    assert.match(summary.changes[0], /Renamed rate plan/);
    assert.match(summary.changes[1], /\$13,000/);
  });
});

describe("summarizeAssignmentChanges", () => {
  it("reports creation with student label", () => {
    const summary = summarizeAssignmentChanges(null, baseAssignment(), {
      studentName: "Ada Lovelace",
      ratePlanName: "2026 Tuition",
    });
    assert.match(summary.changes[0], /Ada Lovelace/);
    assert.match(summary.changes[0], /2026 Tuition/);
  });

  it("reports payment plan change", () => {
    const before = baseAssignment();
    const after = baseAssignment({ paymentPlanId: "pp-1" });
    const summary = summarizeAssignmentChanges(before, after, {
      paymentPlanName: "10-month plan",
    });
    assert.deepEqual(summary.changedFields, ["paymentPlanId"]);
    assert.match(summary.changes[0], /10-month plan/);
  });
});

describe("summarizeOrgSettingsChanges", () => {
  it("reports grace days and late fee toggles", () => {
    const before = baseOrgSettings();
    const after = baseOrgSettings({
      graceDays: 10,
      lateFeeEnabled: false,
    });
    const summary = summarizeOrgSettingsChanges(before, after);
    assert.deepEqual(summary.changedFields, ["graceDays", "lateFeeEnabled"]);
    assert.match(summary.changes[0], /10/);
    assert.match(summary.changes[1], /Disabled late fees/);
  });
});

describe("summarizePaymentAction", () => {
  it("formats manual payment with family and method", () => {
    const summary = summarizePaymentAction({
      kind: "manual",
      amountCents: 50000,
      chargeLabel: "September tuition",
      familyName: "Smith family",
      method: "check",
    });
    assert.match(summary.changes[0], /\$500/);
    assert.match(summary.changes[0], /Smith family/);
    assert.match(summary.changes[0], /check/);
  });

  it("formats refund", () => {
    const summary = summarizePaymentAction({
      kind: "refunded",
      amountCents: 25000,
      chargeLabel: "October tuition",
    });
    assert.match(summary.changes[0], /Refunded/);
    assert.match(summary.changes[0], /\$250/);
  });
});

describe("summarizeBillingRunSummary", () => {
  it("includes manual prefix and counts", () => {
    const summary = summarizeBillingRunSummary(
      {
        overdueCount: 3,
        autopayFailed: 1,
      },
      { manual: true },
    );
    assert.match(summary.changes[0], /3 charges overdue/);
    assert.match(summary.changes[1], /failed/);
  });

  it("reports no changes when counts are zero", () => {
    const summary = summarizeBillingRunSummary({});
    assert.match(summary.changes[0], /completed with no changes/);
  });
});

describe("summarizeBillingSplitChanges", () => {
  it("reports disabled split billing", () => {
    const summary = summarizeBillingSplitChanges({
      enabled: false,
      familyName: "Jones family",
    });
    assert.match(summary.changes[0], /Disabled split billing/);
  });
});

describe("summarizeAutopayToggle", () => {
  it("includes payment method when enabling", () => {
    const summary = summarizeAutopayToggle({
      enabled: true,
      familyName: "Lee family",
      paymentMethodLabel: "Visa •••• 4242",
    });
    assert.match(summary.changes[0], /Enabled autopay/);
    assert.match(summary.changes[0], /4242/);
  });
});

describe("summarizeAutopayCharge", () => {
  it("reports failure with error message", () => {
    const summary = summarizeAutopayCharge({
      succeeded: false,
      chargeLabel: "November tuition",
      amountCents: 100000,
      familyName: "Park family",
      errorMessage: "Card declined",
    });
    assert.match(summary.changes[0], /failed/);
    assert.match(summary.changes[0], /Card declined/);
  });
});

describe("summarizePaymentMethodSaved", () => {
  it("formats card details", () => {
    const summary = summarizePaymentMethodSaved({
      familyName: "Nguyen family",
      brand: "Visa",
      last4: "1234",
    });
    assert.match(summary.changes[0], /Visa/);
    assert.match(summary.changes[0], /1234/);
  });
});

describe("summarizeBackfillResult", () => {
  it("reports assigned and failed counts", () => {
    const summary = summarizeBackfillResult({
      assignedCount: 8,
      failedCount: 2,
      total: 10,
    });
    assert.match(summary.changes[0], /8 of 10/);
    assert.match(summary.changes[1], /2 assignments failed/);
  });
});

describe("summarizeFinancialAidImport", () => {
  it("reports imported and skipped rows", () => {
    const summary = summarizeFinancialAidImport({ imported: 5, skipped: 2 });
    assert.match(summary.changes[0], /5 financial aid/);
    assert.match(summary.changes[1], /Skipped 2 rows/);
  });
});
