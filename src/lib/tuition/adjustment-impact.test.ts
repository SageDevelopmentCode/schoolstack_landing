import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  computeAdjustmentImpactPreview,
  formatAssignmentAdjustmentBadgeLabel,
} from "./adjustment-impact";
import type { TuitionAdjustment, TuitionCharge } from "./types";

function makeCharge(
  overrides: Partial<TuitionCharge> & Pick<TuitionCharge, "label" | "status" | "amountCents">,
): TuitionCharge {
  return {
    id: overrides.id ?? "charge-1",
    organizationId: "org-1",
    assignmentId: "assign-1",
    familyId: "family-1",
    guardianId: null,
    baseAmountCents: overrides.baseAmountCents ?? 60000,
    paidCents: overrides.paidCents ?? 0,
    currency: "USD",
    dueDate: overrides.dueDate ?? "2026-09-01",
    chargeType: "tuition",
    installmentNumber: overrides.installmentNumber ?? 1,
    metadata: {},
    sentAt: null,
    paidAt: null,
    createdAt: "",
    updatedAt: "",
    ...overrides,
  };
}

const draftAdjustment = {
  adjustmentType: "percent_discount" as const,
  valuePercent: 10,
  valueCents: null,
  priority: 0,
  scope: "installment" as const,
};

describe("computeAdjustmentImpactPreview", () => {
  it("returns pending_schedule when schedule is not set but base amount is known", () => {
    const preview = computeAdjustmentImpactPreview({
      charges: [],
      baseAmountCents: 60000,
      existingAdjustments: [],
      draftAdjustment,
      pendingSchedule: true,
    });

    assert.equal(preview.scenario, "pending_schedule");
    assert.equal(preview.upcomingInstallments.length, 1);
    assert.equal(preview.upcomingInstallments[0]?.label, "Estimated installment");
    assert.equal(preview.upcomingInstallments[0]?.currentAmountCents, 60000);
    assert.equal(preview.upcomingInstallments[0]?.newAmountCents, 54000);
    assert.equal(preview.totals.annualSavingsCents, 6000);
  });

  it("returns no_charges when there are no tuition charges", () => {
    const preview = computeAdjustmentImpactPreview({
      charges: [],
      baseAmountCents: 60000,
      existingAdjustments: [],
      draftAdjustment,
    });

    assert.equal(preview.scenario, "no_charges");
    assert.equal(preview.upcomingInstallments.length, 0);
    assert.equal(preview.totals.annualSavingsCents, 0);
  });

  it("handles Claire-style partial paid schedule", () => {
    const charges: TuitionCharge[] = [
      makeCharge({
        id: "aug",
        label: "Aug Tuition",
        status: "paid",
        amountCents: 60000,
        installmentNumber: 1,
        dueDate: "2026-08-01",
      }),
      ...["Sep", "Oct", "Nov"].map((month, index) =>
        makeCharge({
          id: month.toLowerCase(),
          label: `${month} Tuition`,
          status: "scheduled",
          amountCents: 60000,
          installmentNumber: index + 2,
          dueDate: `2026-${String(index + 9).padStart(2, "0")}-01`,
        }),
      ),
    ];

    const preview = computeAdjustmentImpactPreview({
      charges,
      baseAmountCents: 60000,
      existingAdjustments: [],
      draftAdjustment,
    });

    assert.equal(preview.scenario, "partial_paid");
    assert.equal(preview.paidInstallments.length, 1);
    assert.equal(preview.paidInstallments[0]?.label, "Aug Tuition");
    assert.equal(preview.upcomingInstallments.length, 3);
    assert.equal(preview.upcomingInstallments[0]?.newAmountCents, 54000);
    assert.equal(preview.totals.paidCents, 60000);
    assert.equal(preview.totals.remainingBeforeCents, 180000);
    assert.equal(preview.totals.remainingAfterCents, 162000);
    assert.equal(preview.totals.annualSavingsCents, 18000);
  });

  it("handles Georgie-style fully paid annual tuition", () => {
    const charges: TuitionCharge[] = [
      makeCharge({
        label: "Aug Tuition",
        status: "paid",
        amountCents: 720000,
        baseAmountCents: 720000,
        installmentNumber: 1,
      }),
    ];

    const preview = computeAdjustmentImpactPreview({
      charges,
      baseAmountCents: 720000,
      existingAdjustments: [],
      draftAdjustment,
    });

    assert.equal(preview.scenario, "all_paid");
    assert.equal(preview.paidInstallments.length, 1);
    assert.equal(preview.upcomingInstallments.length, 0);
    assert.equal(preview.totals.paidCents, 720000);
    assert.equal(preview.totals.remainingBeforeCents, 0);
    assert.equal(preview.totals.remainingAfterCents, 0);
    assert.equal(preview.totals.annualSavingsCents, 0);
  });

  it("stacks existing adjustments with the draft adjustment", () => {
    const existing: TuitionAdjustment[] = [
      {
        id: "adj-1",
        organizationId: "org-1",
        assignmentId: "assign-1",
        scope: "installment",
        adjustmentType: "percent_discount",
        valuePercent: 10,
        valueCents: null,
        reason: "Sibling discount",
        source: "manual",
        ruleId: null,
        priority: 0,
        createdByUserId: null,
        effectiveStart: null,
        effectiveEnd: null,
        status: "active",
        createdAt: "",
        updatedAt: "",
      },
    ];

    const preview = computeAdjustmentImpactPreview({
      charges: [
        makeCharge({
          label: "Sep Tuition",
          status: "scheduled",
          amountCents: 54000,
          baseAmountCents: 60000,
        }),
      ],
      baseAmountCents: 60000,
      existingAdjustments: existing,
      draftAdjustment: {
        adjustmentType: "fixed_discount",
        valuePercent: null,
        valueCents: 2000,
        priority: 1,
        scope: "installment",
      },
    });

    assert.equal(preview.upcomingInstallments[0]?.newAmountCents, 52000);
  });
});

describe("formatAssignmentAdjustmentBadgeLabel", () => {
  it("returns null when there are no active adjustments", () => {
    assert.equal(formatAssignmentAdjustmentBadgeLabel([]), null);
  });

  it("returns a summary for a single adjustment", () => {
    assert.equal(
      formatAssignmentAdjustmentBadgeLabel([
        {
          id: "adj-1",
          organizationId: "org-1",
          assignmentId: "assign-1",
          scope: "installment",
          adjustmentType: "percent_discount",
          valuePercent: 10,
          valueCents: null,
          reason: "Sibling discount",
          source: "manual",
          ruleId: null,
          priority: 0,
          createdByUserId: null,
          effectiveStart: null,
          effectiveEnd: null,
          status: "active",
          createdAt: "",
          updatedAt: "",
        },
      ]),
      "10% sibling discount",
    );
  });

  it("returns a count label for multiple adjustments", () => {
    const adjustment = {
      id: "adj-1",
      organizationId: "org-1",
      assignmentId: "assign-1",
      scope: "installment" as const,
      adjustmentType: "percent_discount" as const,
      valuePercent: 10,
      valueCents: null,
      reason: "Sibling discount",
      source: "manual" as const,
      ruleId: null,
      priority: 0,
      createdByUserId: null,
      effectiveStart: null,
      effectiveEnd: null,
      status: "active" as const,
      createdAt: "",
      updatedAt: "",
    };
    assert.equal(
      formatAssignmentAdjustmentBadgeLabel([adjustment, { ...adjustment, id: "adj-2" }]),
      "2 adjustments",
    );
  });
});
