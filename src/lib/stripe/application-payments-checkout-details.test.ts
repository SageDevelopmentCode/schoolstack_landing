import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseCheckoutMetadataPaymentPatch } from "./application-payments";

describe("parseCheckoutMetadataPaymentPatch", () => {
  it("fills missing payment method and fee fields from checkout metadata", () => {
    const patch = parseCheckoutMetadataPaymentPatch(
      {
        payment_method: "card",
        gross_amount_cents: "309117",
        processing_fee_cents: "9117",
      },
      {
        paymentMethodType: null,
        chargedAmountCents: null,
        processingFeeCents: null,
      },
    );

    assert.equal(patch.payment_method_type, "card");
    assert.equal(patch.charged_amount_cents, 309117);
    assert.equal(patch.processing_fee_cents, 9117);
  });

  it("does not overwrite existing payment fields", () => {
    const patch = parseCheckoutMetadataPaymentPatch(
      {
        payment_method: "card",
        gross_amount_cents: "309117",
        processing_fee_cents: "9117",
      },
      {
        paymentMethodType: "us_bank_account",
        chargedAmountCents: 300000,
        processingFeeCents: 2400,
      },
    );

    assert.deepEqual(patch, {});
  });
});
