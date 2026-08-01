import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  maxTuitionOverpayCents,
  validateTuitionPayAmountCents,
} from "./tuition-pay-amount";

describe("maxTuitionOverpayCents", () => {
  it("allows up to 12x the remaining balance", () => {
    assert.equal(maxTuitionOverpayCents(5000), 60000);
  });
});

describe("validateTuitionPayAmountCents", () => {
  it("rejects amounts below the remaining balance", () => {
    assert.equal(
      validateTuitionPayAmountCents({ amountCents: 4000, remainingCents: 5000 }),
      "Payment must cover at least the remaining balance.",
    );
  });

  it("rejects amounts above the max overpay limit", () => {
    assert.equal(
      validateTuitionPayAmountCents({ amountCents: 60001, remainingCents: 5000 }),
      "Payment amount is too large.",
    );
  });

  it("accepts the remaining balance and overpayments within the limit", () => {
    assert.equal(
      validateTuitionPayAmountCents({ amountCents: 5000, remainingCents: 5000 }),
      null,
    );
    assert.equal(
      validateTuitionPayAmountCents({ amountCents: 10000, remainingCents: 5000 }),
      null,
    );
  });
});
