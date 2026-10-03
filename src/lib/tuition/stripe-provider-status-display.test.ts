import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  paymentRecordAdminStatusBadge,
  pendingCheckoutPaymentHint,
  tuitionPaymentStripeStatusBadge,
  tuitionPaymentStripeStatusHint,
} from "./stripe-provider-status-display";

describe("tuitionPaymentStripeStatusHint", () => {
  it("returns verification hint for requires_action ACH", () => {
    const hint = tuitionPaymentStripeStatusHint({
      paymentMethodType: "us_bank_account",
      stripeProviderStatus: "requires_action",
      status: "succeeded",
    });
    assert.ok(hint);
    assert.match(hint!.message, /verification/i);
  });

  it("returns null for succeeded card payments", () => {
    assert.equal(
      tuitionPaymentStripeStatusHint({
        paymentMethodType: "card",
        stripeProviderStatus: "succeeded",
        status: "succeeded",
      }),
      null,
    );
  });
});

describe("tuitionPaymentStripeStatusBadge", () => {
  it("returns REQUIRES ACTION for requires_action ACH", () => {
    const badge = tuitionPaymentStripeStatusBadge({
      paymentMethodType: "us_bank_account",
      stripeProviderStatus: "requires_action",
      status: "succeeded",
    });
    assert.equal(badge?.label, "REQUIRES ACTION");
    assert.equal(badge?.tone, "warning");
  });

  it("returns null for settled ACH", () => {
    assert.equal(
      tuitionPaymentStripeStatusBadge({
        paymentMethodType: "us_bank_account",
        stripeProviderStatus: "succeeded",
        status: "succeeded",
      }),
      null,
    );
  });
});

describe("paymentRecordAdminStatusBadge", () => {
  it("shows Verify bank instead of Succeeded when requires_action", () => {
    const badge = paymentRecordAdminStatusBadge({
      status: "succeeded",
      paymentMethodType: "us_bank_account",
      stripeProviderStatus: "requires_action",
    });
    assert.equal(badge.label, "Verify bank");
    assert.equal(badge.tone, "warning");
  });

  it("shows Succeeded for settled ACH", () => {
    const badge = paymentRecordAdminStatusBadge({
      status: "succeeded",
      paymentMethodType: "us_bank_account",
      stripeProviderStatus: "succeeded",
    });
    assert.equal(badge.label, "Succeeded");
    assert.equal(badge.tone, "success");
  });

  it("shows Processing for succeeded ACH still processing", () => {
    const badge = paymentRecordAdminStatusBadge({
      status: "succeeded",
      paymentMethodType: "us_bank_account",
      stripeProviderStatus: "processing",
    });
    assert.equal(badge.label, "Processing");
    assert.equal(badge.tone, "info");
  });
});

describe("pendingCheckoutPaymentHint", () => {
  it("returns verification copy for requires_action", () => {
    assert.match(
      pendingCheckoutPaymentHint({
        paymentMethodType: "us_bank_account",
        stripeProviderStatus: "requires_action",
      }) ?? "",
      /verification/i,
    );
  });
});
