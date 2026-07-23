import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildPaymentOptionPreviews,
  buildWizardMetadata,
  filterAllowedPaymentCounts,
  formatPaymentSchedulePreview,
  isPaymentCountAllowed,
  parseWizardMetadata,
  paymentOptionLabel,
  paymentScheduleCadence,
  paymentScheduleLabel,
  schoolYearMonthSpan,
  serializeWizardFormState,
  serializeWizardState,
  slugifyFeeCode,
  suggestPlanNameFromProgram,
  validateCustomPaymentCount,
  validateWizardFees,
  validateWizardTiers,
  wizardFeesFromRatePlan,
  wizardStateFromRatePlan,
} from "./setup-wizard";
import type { RatePlanWithDetails, TuitionFeeComponent } from "./types";

describe("setup wizard helpers", () => {
  it("builds payment previews for Rooted Meadows annual tuition", () => {
    const previews = buildPaymentOptionPreviews(720000, [1, 2, 10, 12]);

    assert.equal(previews.length, 4);
    assert.equal(previews.find((p) => p.count === 10)?.amountCents, 72000);
    assert.equal(previews.find((p) => p.count === 12)?.amountCents, 60000);
    assert.equal(previews.find((p) => p.count === 2)?.amountCents, 360000);
    assert.equal(previews.find((p) => p.count === 1)?.amountCents, 720000);
  });

  it("labels payment options with friendly schedule names", () => {
    assert.equal(paymentScheduleLabel(1), "Pay in full");
    assert.equal(paymentScheduleLabel(4), "4 payments");
    assert.equal(paymentScheduleLabel(9), "9 payments");
    assert.equal(paymentScheduleLabel(10), "10 payments");
    assert.equal(paymentOptionLabel(1), "Pay in full");
    assert.equal(paymentScheduleCadence(4), "Quarterly");
    assert.equal(paymentScheduleCadence(6), "6 equal installments");
    assert.equal(
      paymentScheduleCadence(10, 10),
      "Monthly (matches your school year)",
    );
  });

  it("formats structured payment schedule previews", () => {
    const [preview] = buildPaymentOptionPreviews(720000, [10]);
    assert.ok(preview);
    const summary = formatPaymentSchedulePreview(preview, 720000, 10);
    assert.equal(summary.label, "10 payments");
    assert.equal(summary.cadence, "Monthly (matches your school year)");
    assert.equal(summary.perPaymentLabel, "$720");
    assert.equal(summary.annualLabel, "$7,200");
  });

  it("computes inclusive school year month span", () => {
    assert.equal(
      schoolYearMonthSpan("2026-08-01", "2027-05-31"),
      10,
    );
    assert.equal(
      schoolYearMonthSpan("2026-01-01", "2026-12-31"),
      12,
    );
    assert.equal(schoolYearMonthSpan("2026-08-01", null), null);
  });

  it("allows payment counts based on school year length", () => {
    assert.equal(isPaymentCountAllowed(1, 10), true);
    assert.equal(isPaymentCountAllowed(10, 10), true);
    assert.equal(isPaymentCountAllowed(12, 10), false);
    assert.equal(isPaymentCountAllowed(12, null), true);
  });

  it("filters selected counts to those allowed for the school year", () => {
    assert.deepEqual(
      filterAllowedPaymentCounts([1, 10, 12], "2026-08-01", "2027-05-31"),
      [1, 10],
    );
  });

  it("validates custom payment counts", () => {
    assert.equal(validateCustomPaymentCount(6, [1, 10]), null);
    assert.equal(
      validateCustomPaymentCount(10, [1, 10]),
      "That payment schedule is already enabled.",
    );
    assert.match(
      validateCustomPaymentCount(30, []) ?? "",
      /at most 24/,
    );
    assert.match(
      validateCustomPaymentCount(11, [], 10) ?? "",
      /10 months/,
    );
  });

  it("suggests plan name from program", () => {
    assert.equal(
      suggestPlanNameFromProgram("School Year 2026–27"),
      "School Year 2026–27",
    );
  });

  it("sorts preview counts ascending", () => {
    const previews = buildPaymentOptionPreviews(120000, [12, 1, 10]);
    assert.deepEqual(
      previews.map((preview) => preview.count),
      [1, 10, 12],
    );
  });

  it("maps all rate plan fee components to wizard fees", () => {
    const components: TuitionFeeComponent[] = [
      {
        id: "1",
        organizationId: "org",
        ratePlanId: "plan",
        code: "supply_fee",
        label: "Supply fee",
        amountCents: 50000,
        currency: "USD",
        timing: "enrollment",
        required: true,
        createdAt: "",
        updatedAt: "",
      },
      {
        id: "2",
        organizationId: "org",
        ratePlanId: "plan",
        code: "technology_fee",
        label: "Technology fee",
        amountCents: 20000,
        currency: "USD",
        timing: "enrollment",
        required: true,
        createdAt: "",
        updatedAt: "",
      },
    ];

    assert.deepEqual(wizardFeesFromRatePlan(components), [
      {
        code: "supply_fee",
        label: "Supply fee",
        amountCents: 50000,
        timing: "enrollment",
      },
      {
        code: "technology_fee",
        label: "Technology fee",
        amountCents: 20000,
        timing: "enrollment",
      },
    ]);
  });

  it("validates wizard fees and allows an empty list", () => {
    assert.equal(validateWizardFees([]), null);
    assert.equal(
      validateWizardFees([{ label: "Supply fee", amountCents: 50000 }]),
      null,
    );
    assert.equal(
      validateWizardFees([{ label: "", amountCents: 50000 }]),
      "Each fee needs a label.",
    );
    assert.equal(
      validateWizardFees([{ label: "Supply fee", amountCents: 0 }]),
      "Each fee needs an amount greater than zero.",
    );
    assert.equal(
      validateWizardFees([
        { label: "Supply fee", amountCents: 50000 },
        { label: "supply fee", amountCents: 10000 },
      ]),
      "Fee labels must be unique.",
    );
  });

  it("slugifies fee codes from labels", () => {
    assert.equal(slugifyFeeCode("Technology Fee"), "technology_fee");
    assert.equal(slugifyFeeCode("Supply Fee"), "supply_fee");
  });

  it("serializes wizard state deterministically for dirty checks", () => {
    const base = {
      programId: "program-1",
      planName: "School Year 2026–27",
      pricingMode: "single" as const,
      tuitionInputMode: "annual" as const,
      tiers: [{ label: "Standard", amount: "7200", isDefault: true }],
      effectiveStart: "2026-08-01",
      effectiveEnd: "2027-05-31",
      paymentCounts: [1, 10],
      defaultPaymentCount: 10,
      fees: [] as Array<{ label: string; amountCents: number }>,
      stepIndex: 2,
    };

    const first = serializeWizardState(base);
    const second = serializeWizardState(base);
    assert.equal(first, second);

    const changed = serializeWizardState({
      ...base,
      planName: "School Year 2027–28",
    });
    assert.notEqual(first, changed);
  });

  it("serializes wizard form state without step index", () => {
    const base = {
      programId: "program-1",
      planName: "School Year 2026–27",
      pricingMode: "single" as const,
      tuitionInputMode: "annual" as const,
      tiers: [{ label: "Standard", amount: "7200", isDefault: true }],
      effectiveStart: "2026-08-01",
      effectiveEnd: "2027-05-31",
      paymentCounts: [1, 10],
      defaultPaymentCount: 10,
      fees: [] as Array<{ label: string; amountCents: number }>,
    };

    const stepZero = serializeWizardFormState(base);
    const stepThree = serializeWizardFormState(base);
    assert.equal(stepZero, stepThree);

    const changed = serializeWizardFormState({
      ...base,
      planName: "School Year 2027–28",
    });
    assert.notEqual(stepZero, changed);
  });

  it("round-trips wizard metadata", () => {
    const metadata = buildWizardMetadata(3, "multiple");
    const parsed = parseWizardMetadata(metadata);
    assert.deepEqual(parsed, {
      wizardStepIndex: 3,
      pricingMode: "multiple",
    });
  });

  it("clamps wizard metadata step index to valid range", () => {
    assert.deepEqual(parseWizardMetadata({ wizardStepIndex: 99 }).wizardStepIndex, 4);
    assert.deepEqual(parseWizardMetadata({ wizardStepIndex: -2 }).wizardStepIndex, 0);
  });

  it("restores draft wizard state with empty payments and saved step", () => {
    const plan: RatePlanWithDetails = {
      id: "plan-1",
      organizationId: "org-1",
      programId: "program-1",
      name: "Draft plan",
      billingBasis: "annual",
      amountCents: 0,
      currency: "USD",
      effectiveStart: "2026-08-01",
      effectiveEnd: "2027-05-31",
      status: "draft",
      metadata: buildWizardMetadata(2, "multiple"),
      createdAt: "",
      updatedAt: "",
      programName: "Primary",
      paymentPlans: [],
      feeComponents: [],
      tiers: [
        {
          id: "tier-1",
          organizationId: "org-1",
          ratePlanId: "plan-1",
          code: "standard",
          label: "Standard",
          amountCents: 0,
          sortOrder: 0,
          isDefault: true,
          metadata: {},
          createdAt: "",
          updatedAt: "",
        },
      ],
    };

    const state = wizardStateFromRatePlan(plan);
    assert.equal(state.wizardStepIndex, 2);
    assert.equal(state.pricingMode, "multiple");
    assert.deepEqual(state.paymentCounts, []);
    assert.equal(state.defaultPaymentCount, null);
  });

  it("requires valid tiers for strict step-1 validation", () => {
    assert.equal(
      validateWizardTiers([{ label: "Standard", amount: "", isDefault: true }]),
      "Each tuition rate needs an amount greater than zero.",
    );
    assert.equal(
      validateWizardTiers([{ label: "Standard", amount: "7200", isDefault: true }]),
      null,
    );
  });
});
