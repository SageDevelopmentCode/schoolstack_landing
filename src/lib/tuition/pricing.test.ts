import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  annualCentsFromTiers,
  annualCentsToTuitionInput,
  applySingleAdjustment,
  buildChargeAdjustmentBreakdown,
  computeAdjustedAmountCents,
  formatCents,
  formatTierAmountRange,
  tuitionInputToAnnualCents,
} from "./pricing";
import { buildPaymentOptionPreviews } from "./setup-wizard";
import { buildChargeDrafts } from "./charge-generator";
import { evaluateRuleConditions } from "./rules-engine";
import type { TuitionAdjustment } from "./types";

describe("tuition pricing", () => {
  it("applies percent discount", () => {
    assert.equal(
      applySingleAdjustment(72000, {
        adjustmentType: "percent_discount",
        valuePercent: 10,
        valueCents: null,
      }),
      64800,
    );
  });

  it("applies fixed discount", () => {
    assert.equal(
      applySingleAdjustment(72000, {
        adjustmentType: "fixed_discount",
        valuePercent: null,
        valueCents: 5000,
      }),
      67000,
    );
  });

  it("applies custom amount", () => {
    assert.equal(
      applySingleAdjustment(72000, {
        adjustmentType: "custom_amount",
        valuePercent: null,
        valueCents: 50000,
      }),
      50000,
    );
  });

  it("stacks adjustments by priority", () => {
    const adjustments: TuitionAdjustment[] = [
      {
        id: "1",
        organizationId: "org",
        assignmentId: "a",
        scope: "installment",
        adjustmentType: "percent_discount",
        valuePercent: 10,
        valueCents: null,
        reason: "Sibling",
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
      {
        id: "2",
        organizationId: "org",
        assignmentId: "a",
        scope: "installment",
        adjustmentType: "fixed_discount",
        valuePercent: null,
        valueCents: 2000,
        reason: "Aid",
        source: "manual",
        ruleId: null,
        priority: 1,
        createdByUserId: null,
        effectiveStart: null,
        effectiveEnd: null,
        status: "active",
        createdAt: "",
        updatedAt: "",
      },
    ];

    assert.equal(computeAdjustedAmountCents(72000, adjustments), 62800);
  });

  it("formats cents as currency", () => {
    assert.equal(formatCents(72000), "$720");
  });

  it("converts annual tuition input to cents", () => {
    assert.equal(tuitionInputToAnnualCents(7200, "annual"), 720000);
    assert.equal(tuitionInputToAnnualCents(0, "annual"), 0);
  });

  it("converts monthly tuition input to annual cents", () => {
    assert.equal(tuitionInputToAnnualCents(600, "monthly"), 720000);
  });

  it("converts annual cents back to tuition input values", () => {
    assert.equal(annualCentsToTuitionInput(720000, "annual"), 7200);
    assert.equal(annualCentsToTuitionInput(720000, "monthly"), 600);
    assert.equal(annualCentsToTuitionInput(0, "monthly"), 0);
  });

  it("feeds monthly input into payment previews", () => {
    const annualCents = tuitionInputToAnnualCents(600, "monthly");
    const previews = buildPaymentOptionPreviews(annualCents, [10]);
    assert.equal(previews[0]?.amountCents, 72000);
  });

  it("resolves default tier annual cents", () => {
    assert.equal(
      annualCentsFromTiers([
        { amountCents: 720000, isDefault: false },
        { amountCents: 480000, isDefault: true },
      ]),
      480000,
    );
  });

  it("formats tier amount ranges for monthly and annual modes", () => {
    const tiers = [
      { amountCents: 480000 },
      { amountCents: 720000 },
    ];
    assert.equal(formatTierAmountRange(tiers, "monthly"), "$400–$600/mo");
    assert.equal(formatTierAmountRange(tiers, "annual"), "$4,800–$7,200/yr");
    assert.equal(
      formatTierAmountRange([{ amountCents: 720000 }], "annual"),
      "$7,200/yr",
    );
  });
});

describe("buildChargeAdjustmentBreakdown", () => {
  it("returns a single total line when there are no adjustments", () => {
    const lines = buildChargeAdjustmentBreakdown({
      baseAmountCents: 72000,
      amountCents: 72000,
      adjustments: [],
    });

    assert.equal(lines.length, 1);
    assert.equal(lines[0]?.kind, "total");
    assert.equal(lines[0]?.amountCents, 72000);
  });

  it("shows percent discount lines for adjusted charges", () => {
    const lines = buildChargeAdjustmentBreakdown({
      baseAmountCents: 72000,
      amountCents: 64800,
      adjustments: [
        {
          adjustmentType: "percent_discount",
          valuePercent: 10,
          valueCents: null,
          priority: 0,
          scope: "installment",
          reason: "Sibling discount",
          status: "active",
        },
      ],
    });

    assert.equal(lines[0]?.kind, "base");
    assert.equal(lines[1]?.kind, "adjustment");
    assert.equal(lines[1]?.amountCents, -7200);
    assert.match(lines[1]?.label ?? "", /sibling discount/i);
    assert.equal(lines[2]?.kind, "total");
    assert.equal(lines[2]?.amountCents, 64800);
  });

  it("shows fixed discount and waiver lines", () => {
    const fixedLines = buildChargeAdjustmentBreakdown({
      baseAmountCents: 72000,
      amountCents: 67000,
      adjustments: [
        {
          adjustmentType: "fixed_discount",
          valuePercent: null,
          valueCents: 5000,
          priority: 0,
          scope: "installment",
          reason: "Financial aid",
          status: "active",
        },
      ],
    });

    assert.equal(fixedLines[1]?.amountCents, -5000);

    const waiverLines = buildChargeAdjustmentBreakdown({
      baseAmountCents: 72000,
      amountCents: 0,
      adjustments: [
        {
          adjustmentType: "waiver",
          valuePercent: null,
          valueCents: null,
          priority: 0,
          scope: "installment",
          reason: "Staff child",
          status: "active",
        },
      ],
    });

    assert.equal(waiverLines[1]?.amountCents, -72000);
    assert.equal(waiverLines[2]?.amountCents, 0);
  });
});

describe("charge generator", () => {
  it("builds installments and enrollment fees", () => {
    const drafts = buildChargeDrafts({
      paymentPlan: {
        id: "pp",
        organizationId: "org",
        ratePlanId: "rp",
        name: "10 monthly",
        installmentCount: 2,
        installmentAmountCents: 72000,
        billingDayOfMonth: 1,
        isDefault: true,
        createdAt: "",
        updatedAt: "",
      },
      feeComponents: [
        {
          id: "f1",
          organizationId: "org",
          ratePlanId: "rp",
          code: "supply",
          label: "Supply Fee",
          amountCents: 50000,
          currency: "USD",
          timing: "enrollment",
          required: true,
          createdAt: "",
          updatedAt: "",
        },
      ],
      adjustments: [],
      startDate: new Date("2026-08-01T00:00:00Z"),
    });

    assert.equal(drafts.length, 3);
    assert.equal(drafts[0].label, "Supply Fee");
    assert.equal(drafts[0].chargeType, "fee");
    assert.equal(drafts[1].chargeType, "tuition");
    assert.equal(drafts[2].installmentNumber, 2);
  });
});

describe("rules engine", () => {
  it("evaluates sibling discount rule", () => {
    const matches = evaluateRuleConditions(
      {
        all: [{ field: "active_enrollments_in_family", op: "gte", value: 2 }],
      },
      {
        familyId: "f1",
        organizationId: "org",
        programId: "p1",
        enrollmentId: "e1",
        activeEnrollmentCount: 2,
        guardianRoles: [],
        checklistResponses: {},
      },
    );

    assert.equal(matches, true);
  });

  it("evaluates checklist response rule", () => {
    const matches = evaluateRuleConditions(
      {
        all: [
          {
            field: "checklist_response",
            item_key: "idaho_parent_choice_tax_credit",
            response_value: "yes",
          },
        ],
      },
      {
        familyId: "f1",
        organizationId: "org",
        programId: "p1",
        enrollmentId: "e1",
        activeEnrollmentCount: 1,
        guardianRoles: [],
        checklistResponses: {
          idaho_parent_choice_tax_credit: "yes",
        },
      },
    );

    assert.equal(matches, true);
  });
});
