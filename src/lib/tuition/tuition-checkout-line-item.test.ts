import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildTuitionCheckoutLineItem,
  buildTuitionCheckoutLineItems,
} from "./tuition-checkout-line-item";

describe("buildTuitionCheckoutLineItem", () => {
  it("includes the student first name in the label for a standard installment", () => {
    const lineItem = buildTuitionCheckoutLineItem({
      studentName: "Jon Cecilia",
      chargeLabel: "Sep Tuition",
      remainingCents: 72000,
      requestedAmountCents: 72000,
      processingFeeCents: 2182,
    });

    assert.equal(lineItem.label, "Jon — Sep Tuition");
    assert.equal(lineItem.description, "Includes $21.82 processing fee.");
    assert.equal(lineItem.paymentKind, "installment");
  });

  it("adds lump-sum context when paying more than the remaining installment", () => {
    const lineItem = buildTuitionCheckoutLineItem({
      studentName: "Jon",
      chargeLabel: "Sep Tuition",
      remainingCents: 72000,
      requestedAmountCents: 500000,
      processingFeeCents: 14964,
    });

    assert.equal(lineItem.label, "Jon — Sep Tuition");
    assert.match(
      lineItem.description,
      /Includes \$149\.64 processing fee\. \$720\.00 toward this installment; remainder applies to future installments\./,
    );
    assert.equal(lineItem.paymentKind, "lump_sum");
  });

  it("falls back to the charge label when the student name is unknown", () => {
    const lineItem = buildTuitionCheckoutLineItem({
      studentName: null,
      chargeLabel: "Sep Tuition",
      remainingCents: 72000,
      requestedAmountCents: 72000,
      processingFeeCents: 500,
    });

    assert.equal(lineItem.label, "Sep Tuition");
    assert.equal(lineItem.description, "Includes $5.00 processing fee.");
    assert.equal(lineItem.paymentKind, "installment");
  });
});

describe("buildTuitionCheckoutLineItems", () => {
  it("returns installment, future, and card fee rows for lump-sum payments", () => {
    const breakdown = buildTuitionCheckoutLineItems({
      studentName: "Jon Cecilia",
      chargeLabel: "Aug Tuition",
      remainingCents: 72000,
      requestedAmountCents: 500000,
      processingFeeCents: 14964,
      paymentMethod: "card",
    });

    assert.equal(breakdown.lineItems.length, 3);
    assert.deepEqual(breakdown.lineItems[0], {
      label: "Jon — Aug Tuition",
      amountCents: 72000,
    });
    assert.deepEqual(breakdown.lineItems[1], {
      label: "Jon — Future installments",
      amountCents: 428000,
    });
    assert.deepEqual(breakdown.lineItems[2], {
      label: "Card processing fee",
      amountCents: 14964,
    });
    assert.equal(breakdown.netToSchoolCents, 500000);
    assert.equal(breakdown.grossAmountCents, 514964);
    assert.equal(breakdown.paymentKind, "lump_sum");
  });

  it("uses the bank fee label for ACH payments", () => {
    const breakdown = buildTuitionCheckoutLineItems({
      studentName: "Jon",
      chargeLabel: "Aug Tuition",
      remainingCents: 72000,
      requestedAmountCents: 500000,
      processingFeeCents: 500,
      paymentMethod: "us_bank_account",
    });

    assert.equal(breakdown.lineItems.at(-1)?.label, "Bank processing fee");
  });

  it("throws when the payment is not a lump sum", () => {
    assert.throws(
      () =>
        buildTuitionCheckoutLineItems({
          studentName: "Jon",
          chargeLabel: "Aug Tuition",
          remainingCents: 72000,
          requestedAmountCents: 72000,
          processingFeeCents: 2182,
          paymentMethod: "card",
        }),
      /lump-sum payment/,
    );
  });
});
