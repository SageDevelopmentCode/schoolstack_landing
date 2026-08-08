import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { PaymentRecord } from "@/lib/stripe/application-payments";
import {
  pendingCheckoutMatchesRequest,
  pendingCombinedCheckoutMatchesRequest,
} from "./pending-checkout-session";

function pendingPayment(amountCents: number): PaymentRecord {
  return {
    id: "pay_test",
    organizationId: "org_test",
    applicationId: null,
    familyId: "family_test",
    tuitionChargeId: "charge_test",
    paymentType: "tuition",
    enrollmentChecklistItemId: null,
    label: "Aug Tuition",
    payerUserId: "user_test",
    stripeCheckoutSessionId: "cs_test",
    stripePaymentIntentId: null,
    amountCents,
    amountAppliedCents: null,
    chargedAmountCents: null,
    processingFeeCents: null,
    paymentMethodType: "card",
    currency: "USD",
    status: "pending",
    paidAt: null,
    createdAt: "2026-01-01T00:00:00.000Z",
  };
}

describe("pendingCheckoutMatchesRequest", () => {
  it("matches lump-sum requests when amount, method, and payment_kind align", () => {
    const matches = pendingCheckoutMatchesRequest({
      pendingPayment: pendingPayment(500000),
      requestedAmountCents: 500000,
      paymentMethod: "card",
      isLumpSum: true,
      sessionMetadata: {
        payment_method: "card",
        payment_kind: "lump_sum",
      },
    });

    assert.equal(matches, true);
  });

  it("rejects stale sessions when the amount changed", () => {
    const matches = pendingCheckoutMatchesRequest({
      pendingPayment: pendingPayment(72000),
      requestedAmountCents: 500000,
      paymentMethod: "card",
      isLumpSum: true,
      sessionMetadata: {
        payment_method: "card",
        payment_kind: "lump_sum",
      },
    });

    assert.equal(matches, false);
  });

  it("rejects lump-sum requests when the open session is installment format", () => {
    const matches = pendingCheckoutMatchesRequest({
      pendingPayment: pendingPayment(500000),
      requestedAmountCents: 500000,
      paymentMethod: "card",
      isLumpSum: true,
      sessionMetadata: {
        payment_method: "card",
        payment_kind: "installment",
      },
    });

    assert.equal(matches, false);
  });

  it("matches installment requests when payment_kind is absent or installment", () => {
    assert.equal(
      pendingCheckoutMatchesRequest({
        pendingPayment: pendingPayment(72000),
        requestedAmountCents: 72000,
        paymentMethod: "card",
        isLumpSum: false,
        sessionMetadata: {
          payment_method: "card",
        },
      }),
      true,
    );

    assert.equal(
      pendingCheckoutMatchesRequest({
        pendingPayment: pendingPayment(72000),
        requestedAmountCents: 72000,
        paymentMethod: "card",
        isLumpSum: false,
        sessionMetadata: {
          payment_method: "card",
          payment_kind: "installment",
        },
      }),
      true,
    );
  });
});

describe("pendingCombinedCheckoutMatchesRequest", () => {
  it("matches combined checkout when charge ids, amount, and method align", () => {
    const matches = pendingCombinedCheckoutMatchesRequest({
      tuitionChargeIds: ["charge-b", "charge-a"],
      totalNetCents: 144000,
      paymentMethod: "card",
      sessionMetadata: {
        payment_type: "tuition_combined",
        payment_method: "card",
        tuition_charge_ids: "charge-a,charge-b",
        net_amount_cents: "144000",
      },
    });

    assert.equal(matches, true);
  });

  it("rejects combined checkout when charge ids differ", () => {
    const matches = pendingCombinedCheckoutMatchesRequest({
      tuitionChargeIds: ["charge-a", "charge-b"],
      totalNetCents: 144000,
      paymentMethod: "card",
      sessionMetadata: {
        payment_type: "tuition_combined",
        payment_method: "card",
        tuition_charge_ids: "charge-a,charge-c",
        net_amount_cents: "144000",
      },
    });

    assert.equal(matches, false);
  });
});
