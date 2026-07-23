import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildChargeDrafts,
  buildInstallmentDueDates,
} from "./charge-generator";
import { computeInstallmentAmountCents } from "./assignments";
import type { TuitionPaymentPlan } from "./types";

const paymentPlan: TuitionPaymentPlan = {
  id: "plan-1",
  organizationId: "org-1",
  ratePlanId: "rate-1",
  name: "10 payments",
  installmentCount: 10,
  installmentAmountCents: 72000,
  billingDayOfMonth: 1,
  isDefault: true,
  createdAt: "",
  updatedAt: "",
};

describe("computeInstallmentAmountCents", () => {
  it("divides tier annual amount across installments", () => {
    assert.equal(computeInstallmentAmountCents(720000, 10), 72000);
    assert.equal(computeInstallmentAmountCents(750000, 10), 75000);
  });
});

describe("buildChargeDrafts tier-aware installments", () => {
  it("uses installmentAmountCents override when provided", () => {
    const drafts = buildChargeDrafts({
      paymentPlan,
      feeComponents: [],
      adjustments: [],
      installmentAmountCents: 60000,
      startDate: new Date("2026-08-01T00:00:00Z"),
    });

    const tuitionDrafts = drafts.filter((draft) => draft.chargeType === "tuition");
    assert.equal(tuitionDrafts.length, 10);
    assert.ok(tuitionDrafts.every((draft) => draft.baseAmountCents === 60000));
  });

  it("falls back to payment plan installment amount", () => {
    const drafts = buildChargeDrafts({
      paymentPlan,
      feeComponents: [],
      adjustments: [],
      startDate: new Date("2026-08-01T00:00:00Z"),
    });

    const tuitionDrafts = drafts.filter((draft) => draft.chargeType === "tuition");
    assert.ok(tuitionDrafts.every((draft) => draft.baseAmountCents === 72000));
  });
});

describe("buildInstallmentDueDates", () => {
  it("generates monthly due dates", () => {
    const dates = buildInstallmentDueDates(
      paymentPlan,
      new Date("2026-08-01T00:00:00Z"),
    );
    assert.deepEqual(dates.slice(0, 3), ["2026-08-01", "2026-09-01", "2026-10-01"]);
  });
});
