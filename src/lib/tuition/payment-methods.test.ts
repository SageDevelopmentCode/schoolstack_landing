import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type Stripe from "stripe";
import { extractPaymentMethodDisplayFields } from "@/lib/tuition/payment-methods";

describe("extractPaymentMethodDisplayFields", () => {
  it("reads card fields", () => {
    const fields = extractPaymentMethodDisplayFields({
      id: "pm_card",
      object: "payment_method",
      type: "card",
      card: {
        brand: "visa",
        last4: "4242",
        exp_month: 12,
        exp_year: 2030,
      },
    } as Stripe.PaymentMethod);

    assert.equal(fields.brand, "visa");
    assert.equal(fields.last4, "4242");
    assert.equal(fields.expMonth, 12);
    assert.equal(fields.expYear, 2030);
  });

  it("reads us_bank_account fields", () => {
    const fields = extractPaymentMethodDisplayFields({
      id: "pm_ach",
      object: "payment_method",
      type: "us_bank_account",
      us_bank_account: {
        bank_name: "Chase",
        last4: "3225",
      },
    } as Stripe.PaymentMethod);

    assert.equal(fields.brand, "Chase");
    assert.equal(fields.last4, "3225");
    assert.equal(fields.expMonth, undefined);
  });
});
