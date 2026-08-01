import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  isPaymentMethodMissingError,
  isStripeResourceMissing,
  paymentMethodExistsOnPlatform,
} from "./payment-method-validation";

describe("payment-method-validation", () => {
  it("detects Stripe resource_missing errors", () => {
    assert.equal(isStripeResourceMissing({ code: "resource_missing" }), true);
    assert.equal(isStripeResourceMissing(new Error("nope")), false);
  });

  it("detects payment method missing messages", () => {
    assert.equal(
      isPaymentMethodMissingError(
        new Error("No such PaymentMethod: 'pm_test'"),
      ),
      true,
    );
    assert.equal(isPaymentMethodMissingError(new Error("Card declined")), false);
  });

  it("returns false when Stripe cannot find the payment method", async () => {
    const stripe = {
      paymentMethods: {
        retrieve: async () => {
          const error = new Error("No such payment_method") as Error & {
            code?: string;
          };
          error.code = "resource_missing";
          throw error;
        },
      },
    };

    const exists = await paymentMethodExistsOnPlatform(
      stripe as never,
      "pm_missing",
    );
    assert.equal(exists, false);
  });

  it("returns true when Stripe finds the payment method", async () => {
    const stripe = {
      paymentMethods: {
        retrieve: async () => ({ id: "pm_test" }),
      },
    };

    const exists = await paymentMethodExistsOnPlatform(
      stripe as never,
      "pm_test",
    );
    assert.equal(exists, true);
  });
});
