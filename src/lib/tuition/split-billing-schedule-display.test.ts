import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildGuardianColorIndexMap,
  formatSharePercent,
  groupChargesForSplitBilling,
  resolveShareBps,
  stripPayerLabelSuffix,
} from "./split-billing-schedule-display";
import type { TuitionCharge } from "./types";

function makeCharge(overrides: Partial<TuitionCharge> = {}): TuitionCharge {
  return {
    id: "charge-1",
    organizationId: "org-1",
    assignmentId: "assignment-1",
    familyId: "family-1",
    guardianId: null,
    label: "Oct Tuition",
    baseAmountCents: 30000,
    amountCents: 30000,
    paidCents: 0,
    currency: "USD",
    dueDate: "2026-10-01",
    status: "scheduled",
    chargeType: "tuition",
    installmentNumber: 1,
    metadata: {},
    sentAt: null,
    paidAt: null,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

describe("stripPayerLabelSuffix", () => {
  it("removes guardian suffix from tuition labels", () => {
    assert.equal(stripPayerLabelSuffix("Oct Tuition (Francesca)"), "Oct Tuition");
  });

  it("returns label unchanged when no suffix exists", () => {
    assert.equal(stripPayerLabelSuffix("Late fee"), "Late fee");
  });
});

describe("formatSharePercent", () => {
  it("formats whole percentages without decimals", () => {
    assert.equal(formatSharePercent(5000), "50%");
  });

  it("formats fractional percentages with one decimal", () => {
    assert.equal(formatSharePercent(3333), "33.3%");
  });
});

describe("groupChargesForSplitBilling", () => {
  it("groups split guardians on the same installment with a monthly total", () => {
    const charges = [
      makeCharge({
        id: "charge-fran",
        guardianId: "guardian-fran",
        label: "Oct Tuition (Francesca)",
        amountCents: 30000,
      }),
      makeCharge({
        id: "charge-zach",
        guardianId: "guardian-zach",
        label: "Oct Tuition (Zachary)",
        amountCents: 30000,
      }),
    ];

    const groups = groupChargesForSplitBilling(charges);
    assert.equal(groups.length, 1);
    assert.equal(groups[0]?.isSplitGroup, true);
    assert.equal(groups[0]?.baseLabel, "Oct Tuition");
    assert.equal(groups[0]?.totalCents, 60000);
    assert.equal(groups[0]?.charges.length, 2);
  });

  it("keeps singleton charges as non-split groups", () => {
    const groups = groupChargesForSplitBilling([
      makeCharge({
        id: "late-fee",
        chargeType: "late_fee",
        label: "Late fee",
        installmentNumber: null,
      }),
    ]);

    assert.equal(groups.length, 1);
    assert.equal(groups[0]?.isSplitGroup, false);
    assert.equal(groups[0]?.baseLabel, "Late fee");
    assert.equal(groups[0]?.charges.length, 1);
  });
});

describe("resolveShareBps", () => {
  it("prefers configured share bps when available", () => {
    const charge = makeCharge({
      guardianId: "guardian-fran",
      amountCents: 30000,
    });

    assert.equal(
      resolveShareBps(charge, 60000, [
        { guardianId: "guardian-fran", shareBps: 5000, guardianName: "Francesca Ritchie" },
      ]),
      5000,
    );
  });

  it("falls back to amount-derived share when config is missing", () => {
    const charge = makeCharge({
      guardianId: "guardian-fran",
      amountCents: 30000,
    });

    assert.equal(resolveShareBps(charge, 60000, []), 5000);
  });
});

describe("buildGuardianColorIndexMap", () => {
  it("assigns stable palette indexes by sorted guardian id", () => {
    const map = buildGuardianColorIndexMap(["guardian-z", "guardian-a", "guardian-z"]);
    assert.equal(map.get("guardian-a"), 0);
    assert.equal(map.get("guardian-z"), 1);
  });
});
