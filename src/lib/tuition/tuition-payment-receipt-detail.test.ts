import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { ParentTuitionPaymentRecord } from "./payments";
import {
  buildTuitionPaymentReceiptDetail,
  formatTuitionPaymentMethodLabel,
  resolveRelatedTuitionPayments,
} from "./tuition-payment-receipt-detail";

function payment(
  overrides: Partial<ParentTuitionPaymentRecord> = {},
): ParentTuitionPaymentRecord {
  return {
    id: "payment-1",
    organizationId: "org-1",
    applicationId: null,
    familyId: "family-1",
    tuitionChargeId: "charge-1",
    paymentType: "tuition",
    enrollmentChecklistItemId: null,
    label: "Aug Tuition",
    payerUserId: null,
    stripeCheckoutSessionId: null,
    stripePaymentIntentId: null,
    amountCents: 72000,
    amountAppliedCents: 72000,
    chargedAmountCents: 74182,
    processingFeeCents: 2182,
    paymentMethodType: "card",
    currency: "USD",
    status: "succeeded",
    paidAt: "2026-08-08T14:30:00.000Z",
    createdAt: "2026-08-08T14:29:00.000Z",
    studentFirstName: "Jon",
    enrollmentId: "enrollment-jon",
    ...overrides,
  };
}

describe("resolveRelatedTuitionPayments", () => {
  it("groups payments that share a checkout session", () => {
    const payments = [
      payment({ id: "payment-1", stripeCheckoutSessionId: "cs_1" }),
      payment({
        id: "payment-2",
        stripeCheckoutSessionId: "cs_1",
        tuitionChargeId: "charge-2",
        label: "Sep Tuition",
        studentFirstName: "Caleb",
        enrollmentId: "enrollment-caleb",
      }),
      payment({
        id: "payment-3",
        stripeCheckoutSessionId: "cs_2",
        tuitionChargeId: "charge-3",
      }),
    ];

    const related = resolveRelatedTuitionPayments(payments, "payment-1");
    assert.equal(related.length, 2);
    assert.deepEqual(
      related.map((row) => row.id).sort(),
      ["payment-1", "payment-2"],
    );
  });

  it("returns a single payment when there is no shared session", () => {
    const payments = [payment({ id: "payment-1" })];
    const related = resolveRelatedTuitionPayments(payments, "payment-1");
    assert.equal(related.length, 1);
    assert.equal(related[0]?.id, "payment-1");
  });
});

describe("buildTuitionPaymentReceiptDetail", () => {
  it("builds a standard single-payment receipt", () => {
    const detail = buildTuitionPaymentReceiptDetail([payment()]);

    assert.ok(detail);
    assert.equal(detail.isCombined, false);
    assert.equal(detail.schoolAmountCents, 72000);
    assert.equal(detail.processingFeeCents, 2182);
    assert.equal(detail.totalPaidCents, 74182);
    assert.equal(detail.paymentMethodLabel, "Card");
    assert.equal(detail.lineItems.length, 1);
    assert.equal(detail.lineItems[0]?.studentName, "Jon");
    assert.equal(detail.lumpSumBreakdown, undefined);
  });

  it("includes lump-sum breakdown when applied amount is less than payment", () => {
    const detail = buildTuitionPaymentReceiptDetail([
      payment({
        amountCents: 500000,
        amountAppliedCents: 72000,
        chargedAmountCents: 514964,
        processingFeeCents: 14964,
      }),
    ]);

    assert.ok(detail?.lumpSumBreakdown);
    assert.equal(detail.lumpSumBreakdown.installmentCents, 72000);
    assert.equal(detail.lumpSumBreakdown.futureCents, 428000);
  });

  it("builds a combined checkout receipt with multiple line items", () => {
    const detail = buildTuitionPaymentReceiptDetail([
      payment({
        id: "payment-1",
        stripeCheckoutSessionId: "cs_1",
        amountCents: 72000,
        chargedAmountCents: 74182,
        processingFeeCents: 2182,
      }),
      payment({
        id: "payment-2",
        stripeCheckoutSessionId: "cs_1",
        tuitionChargeId: "charge-2",
        label: "Sep Tuition",
        studentFirstName: "Caleb",
        enrollmentId: "enrollment-caleb",
        amountCents: 72000,
        chargedAmountCents: 0,
        processingFeeCents: 0,
      }),
    ]);

    assert.ok(detail);
    assert.equal(detail.isCombined, true);
    assert.equal(detail.lineItems.length, 2);
    assert.equal(detail.schoolAmountCents, 144000);
    assert.equal(detail.processingFeeCents, 2182);
    assert.equal(detail.totalPaidCents, 74182);
    assert.equal(detail.lumpSumBreakdown, undefined);
  });

  it("labels manual payments without a payment method type", () => {
    const detail = buildTuitionPaymentReceiptDetail([
      payment({
        paymentMethodType: null,
        chargedAmountCents: 72000,
        processingFeeCents: 0,
      }),
    ]);

    assert.equal(detail?.paymentMethodLabel, "Manual payment");
  });

  it("labels legacy Stripe checkout payments as paid online", () => {
    assert.equal(
      formatTuitionPaymentMethodLabel({
        paymentMethodType: null,
        stripeCheckoutSessionId: "cs_test",
      }),
      "Paid online",
    );

    const detail = buildTuitionPaymentReceiptDetail([
      payment({
        paymentMethodType: null,
        stripeCheckoutSessionId: "cs_test",
        chargedAmountCents: 300000,
        processingFeeCents: 0,
      }),
    ]);

    assert.equal(detail?.paymentMethodLabel, "Paid online");
  });
});
