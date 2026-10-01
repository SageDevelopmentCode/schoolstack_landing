import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  assertConfirmableCheckoutSession,
  CheckoutSessionSyncError,
  isAdmissionsCheckoutPaymentType,
  isTuitionCheckoutPaymentType,
} from "./sync-checkout-session-completed";

describe("sync-checkout-session-completed", () => {
  it("accepts admissions checkout payment types", () => {
    assert.equal(isAdmissionsCheckoutPaymentType("enrollment_checklist"), true);
    assert.equal(isAdmissionsCheckoutPaymentType("tuition"), false);
  });

  it("accepts tuition checkout payment types", () => {
    assert.equal(isTuitionCheckoutPaymentType("tuition"), true);
    assert.equal(isTuitionCheckoutPaymentType("tuition_combined"), true);
  });

  it("rejects unpaid card checkout sessions", () => {
    assert.throws(
      () =>
        assertConfirmableCheckoutSession({
          status: "complete",
          payment_status: "unpaid",
          metadata: {
            payment_type: "enrollment_checklist",
            payment_method: "card",
          },
        } as never),
      (error: unknown) =>
        error instanceof CheckoutSessionSyncError && error.code === "checkout_not_paid",
    );
  });

  it("allows unpaid ACH tuition checkout when complete", () => {
    assert.doesNotThrow(() =>
      assertConfirmableCheckoutSession({
        status: "complete",
        payment_status: "unpaid",
        metadata: {
          payment_type: "tuition",
          payment_method: "us_bank_account",
        },
      } as never),
    );
  });

  it("rejects incomplete checkout sessions", () => {
    assert.throws(
      () =>
        assertConfirmableCheckoutSession({
          status: "open",
          payment_status: "paid",
          metadata: { payment_type: "tuition" },
        } as never),
      (error: unknown) =>
        error instanceof CheckoutSessionSyncError && error.code === "checkout_incomplete",
    );
  });
});
