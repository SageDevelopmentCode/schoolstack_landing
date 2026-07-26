import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  assignmentNeedsPaymentPlanSelection,
  computeInstallmentAmountCents,
} from "./assignments";

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

describe("computeInstallmentAmountCents", () => {
  it("rounds installment amounts from tier annual total", () => {
    assert.equal(computeInstallmentAmountCents(720000, 10), 72000);
    assert.equal(computeInstallmentAmountCents(650000, 10), 65000);
  });
});
