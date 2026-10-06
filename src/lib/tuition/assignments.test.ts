import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  assignmentNeedsPaymentPlanSelection,
  computeInstallmentAmountCents,
  resolveCatalogChangeAssignmentFields,
  shouldRegenerateChargesForAssignment,
} from "./assignments";
import type { RatePlanWithDetails } from "./types";

function minimalPlan(
  overrides: Partial<Pick<RatePlanWithDetails, "tiers" | "paymentPlans">> = {},
): Pick<RatePlanWithDetails, "tiers" | "paymentPlans"> {
  return {
    tiers: overrides.tiers ?? [
      {
        id: "tier-default",
        organizationId: "org",
        ratePlanId: "plan",
        code: "default",
        label: "Default",
        amountCents: 10000,
        sortOrder: 0,
        isDefault: true,
        metadata: {},
        createdAt: "",
        updatedAt: "",
      },
      {
        id: "tier-alt",
        organizationId: "org",
        ratePlanId: "plan",
        code: "alt",
        label: "Alt",
        amountCents: 12000,
        sortOrder: 1,
        isDefault: false,
        metadata: {},
        createdAt: "",
        updatedAt: "",
      },
    ],
    paymentPlans: overrides.paymentPlans ?? [
      {
        id: "pay-default",
        organizationId: "org",
        ratePlanId: "plan",
        name: "Annual",
        installmentCount: 1,
        installmentAmountCents: 10000,
        billingDayOfMonth: 1,
        isDefault: true,
        createdAt: "",
        updatedAt: "",
      },
      {
        id: "pay-alt",
        organizationId: "org",
        ratePlanId: "plan",
        name: "Monthly",
        installmentCount: 10,
        installmentAmountCents: 1000,
        billingDayOfMonth: 1,
        isDefault: false,
        createdAt: "",
        updatedAt: "",
      },
    ],
  };
}

describe("resolveCatalogChangeAssignmentFields", () => {
  it("keeps submitted tier and schedule when they belong to the new catalog", () => {
    const result = resolveCatalogChangeAssignmentFields({
      newPlan: minimalPlan(),
      submittedRateTierId: "tier-alt",
      submittedPaymentPlanId: "pay-alt",
      defaultRateTierId: "tier-default",
      defaultPaymentPlanId: "pay-default",
      existingMetadata: { billingStartLocked: true },
    });

    assert.equal(result.rateTierId, "tier-alt");
    assert.equal(result.paymentPlanId, "pay-alt");
    assert.equal(result.metadata.pendingPaymentPlanSelection, false);
    assert.equal(result.metadata.billingStartLocked, true);
  });

  it("falls back to defaults when submitted ids do not belong to the new catalog", () => {
    const result = resolveCatalogChangeAssignmentFields({
      newPlan: minimalPlan(),
      submittedRateTierId: "tier-foreign",
      submittedPaymentPlanId: "pay-foreign",
      defaultRateTierId: "tier-default",
      defaultPaymentPlanId: "pay-default",
      existingMetadata: {},
    });

    assert.equal(result.rateTierId, "tier-default");
    assert.equal(result.paymentPlanId, "pay-default");
    assert.equal(result.metadata.pendingPaymentPlanSelection, true);
  });

  it("sets pending when multi-schedule catalog and no valid schedule was submitted", () => {
    const result = resolveCatalogChangeAssignmentFields({
      newPlan: minimalPlan(),
      submittedRateTierId: "tier-alt",
      defaultRateTierId: "tier-default",
      defaultPaymentPlanId: "pay-default",
      existingMetadata: {},
    });

    assert.equal(result.rateTierId, "tier-alt");
    assert.equal(result.paymentPlanId, "pay-default");
    assert.equal(result.metadata.pendingPaymentPlanSelection, true);
  });

  it("clears pending for single-schedule catalogs even without a submitted schedule", () => {
    const result = resolveCatalogChangeAssignmentFields({
      newPlan: minimalPlan({
        paymentPlans: [
          {
            id: "pay-only",
            organizationId: "org",
            ratePlanId: "plan",
            name: "Annual",
            installmentCount: 1,
            installmentAmountCents: 10000,
            billingDayOfMonth: 1,
            isDefault: true,
            createdAt: "",
            updatedAt: "",
          },
        ],
      }),
      submittedRateTierId: "tier-alt",
      defaultRateTierId: "tier-default",
      defaultPaymentPlanId: "pay-only",
      existingMetadata: { pendingPaymentPlanSelection: true },
    });

    assert.equal(result.paymentPlanId, "pay-only");
    assert.equal(result.metadata.pendingPaymentPlanSelection, false);
  });
});

describe("assignmentNeedsPaymentPlanSelection", () => {
  it("returns true when metadata flag is set", () => {
    assert.equal(
      assignmentNeedsPaymentPlanSelection({
        metadata: { pendingPaymentPlanSelection: true },
      }),
      true,
    );
  });

  it("returns false when metadata flag is absent", () => {
    assert.equal(
      assignmentNeedsPaymentPlanSelection({
        metadata: {},
      }),
      false,
    );
  });
});

describe("shouldRegenerateChargesForAssignment", () => {
  it("skips charge generation for pending enrollments", () => {
    assert.equal(
      shouldRegenerateChargesForAssignment(false, { metadata: {} }),
      false,
    );
  });

  it("skips charge generation when payment plan selection is pending", () => {
    assert.equal(
      shouldRegenerateChargesForAssignment(true, {
        metadata: { pendingPaymentPlanSelection: true },
      }),
      false,
    );
  });

  it("generates charges for enrolled students with a finalized schedule", () => {
    assert.equal(
      shouldRegenerateChargesForAssignment(true, { metadata: {} }),
      true,
    );
  });
});

describe("computeInstallmentAmountCents", () => {
  it("rounds installment amounts from tier annual total", () => {
    assert.equal(computeInstallmentAmountCents(720000, 10), 72000);
    assert.equal(computeInstallmentAmountCents(650000, 10), 65000);
  });
});
