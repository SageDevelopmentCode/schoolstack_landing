import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isStripeMissingDestinationError } from "./stripe-errors";

describe("isStripeMissingDestinationError", () => {
  it("matches Stripe resource_missing on transfer_data destination", () => {
    assert.equal(
      isStripeMissingDestinationError({
        type: "StripeInvalidRequestError",
        code: "resource_missing",
        param: "payment_intent_data[transfer_data][destination]",
        message: "No such destination: 'acct_123'",
      }),
      true,
    );
  });

  it("matches on message when param is missing", () => {
    assert.equal(
      isStripeMissingDestinationError(new Error("No such destination: 'acct_123'")),
      true,
    );
  });

  it("ignores other resource_missing errors", () => {
    assert.equal(
      isStripeMissingDestinationError({
        code: "resource_missing",
        param: "customer",
        message: "No such customer: 'cus_123'",
      }),
      false,
    );
  });

  it("ignores non-objects", () => {
    assert.equal(isStripeMissingDestinationError(null), false);
    assert.equal(isStripeMissingDestinationError("No such destination"), false);
  });
});
