import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { slugifyTierCode } from "./rate-tiers";
import {
  collapseToSingleTier,
  normalizeWizardTiers,
  validateWizardTiers,
  wizardStateFromRatePlan,
  wizardTiersToAnnualCents,
} from "./setup-wizard";
import type { RatePlanWithDetails } from "./types";

describe("rate tier helpers", () => {
  it("slugifies tier labels into stable codes", () => {
    assert.equal(slugifyTierCode("K-2 Full Time"), "k_2_full_time");
    assert.equal(slugifyTierCode("Part-time (Homeschool)"), "part_time_homeschool");
    assert.equal(slugifyTierCode("   "), "tier");
    assert.equal(slugifyTierCode("", 2), "tier_2");
  });
});

describe("wizard tier orchestration", () => {
  it("resolves default tier annual cents from wizard input", () => {
    const annualCents = wizardTiersToAnnualCents(
      [
        { label: "K-2 Full Time", amount: "600", isDefault: false },
        { label: "Part-time", amount: "400", isDefault: true },
      ],
      "monthly",
    );

    assert.equal(annualCents, 480000);
  });

  it("validates tier labels, amounts, and default selection", () => {
    assert.equal(
      validateWizardTiers([{ label: "", amount: "7200", isDefault: true }]),
      null,
    );
    assert.equal(
      validateWizardTiers([
        { label: "", amount: "7200", isDefault: true },
        { label: "Part-time", amount: "400", isDefault: false },
      ]),
      "Each tuition rate needs a name.",
    );
    assert.equal(
      validateWizardTiers([{ label: "Standard", amount: "0", isDefault: true }]),
      "Each tuition rate needs an amount greater than zero.",
    );
    assert.equal(
      validateWizardTiers([
        { label: "A", amount: "100", isDefault: false },
        { label: "B", amount: "200", isDefault: false },
      ]),
      null,
    );
    assert.equal(
      validateWizardTiers([{ label: "Standard", amount: "7200", isDefault: true }]),
      null,
    );
  });

  it("normalizes a single unnamed tier to Standard", () => {
    const [tier] = normalizeWizardTiers([
      { label: "", amount: "7200", isDefault: true },
    ]);
    assert.equal(tier?.label, "Standard");
    assert.equal(tier?.isDefault, true);
  });

  it("collapses to the tier with an amount when switching to single rate", () => {
    const [tier] = collapseToSingleTier([
      { label: "", amount: "", isDefault: true },
      { label: "K-2 Full Time", amount: "7200", isDefault: false },
    ]);
    assert.equal(tier?.label, "K-2 Full Time");
    assert.equal(tier?.amount, "7200");
    assert.equal(tier?.isDefault, true);
  });

  it("defaults collapsed single tier label when amount tier is unnamed", () => {
    const [tier] = collapseToSingleTier([
      { label: "", amount: "", isDefault: true },
      { label: "", amount: "7200", isDefault: false },
    ]);
    assert.equal(tier?.label, "Standard");
    assert.equal(tier?.amount, "7200");
  });

  it("loads tiers from rate plan details", () => {
    const plan = {
      name: "School Year 2026–27",
      billingBasis: "annual",
      amountCents: 720000,
      tiers: [
        {
          id: "tier-1",
          organizationId: "org",
          ratePlanId: "plan",
          code: "full_time",
          label: "K-2 Full Time",
          amountCents: 720000,
          sortOrder: 0,
          isDefault: true,
          metadata: {},
          createdAt: "",
          updatedAt: "",
        },
        {
          id: "tier-2",
          organizationId: "org",
          ratePlanId: "plan",
          code: "part_time",
          label: "Part-time",
          amountCents: 480000,
          sortOrder: 1,
          isDefault: false,
          metadata: {},
          createdAt: "",
          updatedAt: "",
        },
      ],
      paymentPlans: [{ installmentCount: 10, isDefault: true }],
      feeComponents: [],
    } as unknown as RatePlanWithDetails;

    const state = wizardStateFromRatePlan(plan);

    assert.equal(state.tiers.length, 2);
    assert.equal(state.tiers[0]?.label, "K-2 Full Time");
    assert.equal(state.tiers[0]?.amount, "7200");
    assert.equal(state.tiers[1]?.isDefault, false);
  });
});
