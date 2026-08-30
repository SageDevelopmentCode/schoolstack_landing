import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type Stripe from "stripe";
import { inferStripeProviderStatusFromCheckoutSession } from "./stripe-provider-status";

function buildSession(
  input: Partial<Stripe.Checkout.Session> & {
    metadata?: Record<string, string>;
  },
): Stripe.Checkout.Session {
  return {
    payment_status: "unpaid",
    metadata: {},
    ...input,
  } as Stripe.Checkout.Session;
}

describe("inferStripeProviderStatusFromCheckoutSession", () => {
  it("returns succeeded when checkout payment_status is paid", () => {
    assert.equal(
      inferStripeProviderStatusFromCheckoutSession(
        buildSession({ payment_status: "paid" }),
      ),
      "succeeded",
    );
  });

  it("returns processing for unpaid ACH checkout", () => {
    assert.equal(
      inferStripeProviderStatusFromCheckoutSession(
        buildSession({
          payment_status: "unpaid",
          metadata: { payment_method: "us_bank_account" },
        }),
      ),
      "processing",
    );
  });

  it("returns unpaid for unpaid non-ACH checkout", () => {
    assert.equal(
      inferStripeProviderStatusFromCheckoutSession(
        buildSession({
          payment_status: "unpaid",
          metadata: { payment_method: "card" },
        }),
      ),
      "unpaid",
    );
  });
});
