import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type Stripe from "stripe";
import {
  getAchVerificationAction,
  isAchCheckoutMetadata,
} from "./payment-intent-bank-verification";

describe("getAchVerificationAction", () => {
  it("returns verification details for descriptor_code microdeposits", () => {
    const paymentIntent = {
      status: "requires_action",
      next_action: {
        type: "verify_with_microdeposits",
        verify_with_microdeposits: {
          arrival_date: 1791183600,
          hosted_verification_url:
            "https://payments.stripe.com/microdeposit/pacs_live_test",
          microdeposit_type: "descriptor_code",
        },
      },
    } as Stripe.PaymentIntent;

    const action = getAchVerificationAction(paymentIntent);
    assert.ok(action);
    assert.equal(
      action.hostedVerificationUrl,
      "https://payments.stripe.com/microdeposit/pacs_live_test",
    );
    assert.equal(action.microdepositType, "descriptor_code");
    assert.ok(action.arrivalDate);
    assert.equal(action.arrivalDate?.getTime(), 1791183600 * 1000);
  });

  it("returns null when status is not requires_action", () => {
    const paymentIntent = {
      status: "processing",
      next_action: null,
    } as Stripe.PaymentIntent;

    assert.equal(getAchVerificationAction(paymentIntent), null);
  });

  it("returns null when next_action is not verify_with_microdeposits", () => {
    const paymentIntent = {
      status: "requires_action",
      next_action: { type: "use_stripe_sdk" },
    } as Stripe.PaymentIntent;

    assert.equal(getAchVerificationAction(paymentIntent), null);
  });

  it("returns null when hosted_verification_url is missing", () => {
    const paymentIntent = {
      status: "requires_action",
      next_action: {
        type: "verify_with_microdeposits",
        verify_with_microdeposits: {
          microdeposit_type: "amounts",
        },
      },
    } as Stripe.PaymentIntent;

    assert.equal(getAchVerificationAction(paymentIntent), null);
  });
});

describe("isAchCheckoutMetadata", () => {
  it("detects us_bank_account checkout metadata", () => {
    assert.equal(
      isAchCheckoutMetadata({ payment_method: "us_bank_account" }),
      true,
    );
    assert.equal(isAchCheckoutMetadata({ payment_method: "card" }), false);
  });
});
