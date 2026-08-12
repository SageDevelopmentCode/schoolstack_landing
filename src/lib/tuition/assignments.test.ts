import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  assignmentNeedsPaymentPlanSelection,
  computeInstallmentAmountCents,
  shouldRegenerateChargesForAssignment,
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
