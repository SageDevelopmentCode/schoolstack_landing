import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildTuitionPaymentReceiptHtml } from "@/lib/emails";

const basePayload = {
  name: "Jon Cecilia",
  schoolName: "Rooted Meadows",
  billingUrl: "https://trymudkitchen.com/school/rooted-meadows/parent/billing",
  paidAtLabel: "August 8, 2026 at 2:30 PM",
  paymentMethodLabel: "Card",
  amountCents: 72000,
  chargedAmountCents: 74182,
  processingFeeCents: 2182,
};

describe("buildTuitionPaymentReceiptHtml", () => {
  it("includes standard receipt rows for a single charge", () => {
    const html = buildTuitionPaymentReceiptHtml({
      ...basePayload,
      studentName: "Jon",
      chargeLabel: "Aug Tuition",
    });

    assert.match(html, /Payment Receipt/);
    assert.match(html, /Thank you/);
    assert.match(html, /Student/);
    assert.match(html, /Jon/);
    assert.match(html, /Aug Tuition/);
    assert.match(html, /School amount/);
    assert.match(html, /\$720\.00/);
    assert.match(html, /Processing fee/);
    assert.match(html, /\$21\.82/);
    assert.match(html, /Total paid/);
    assert.match(html, /\$741\.82/);
    assert.match(html, /View billing/);
    assert.doesNotMatch(html, /Charges paid/);
    assert.doesNotMatch(html, /Payment breakdown/);
  });

  it("includes lump-sum breakdown when surplus is applied to future installments", () => {
    const html = buildTuitionPaymentReceiptHtml({
      ...basePayload,
      amountCents: 500000,
      chargedAmountCents: 514550,
      processingFeeCents: 14550,
      studentName: "Jon",
      chargeLabel: "Aug Tuition",
      lumpSumBreakdown: {
        installmentCents: 72000,
        futureCents: 428000,
        redistributed: true,
      },
    });

    assert.match(html, /Payment breakdown/);
    assert.match(html, /\$720\.00 installment/);
    assert.match(html, /\$4,280\.00 future/);
    assert.match(html, /Future installments were recalculated/);
  });

  it("omits lump-sum breakdown when there is no surplus", () => {
    const html = buildTuitionPaymentReceiptHtml({
      ...basePayload,
      studentName: "Jon",
      chargeLabel: "Aug Tuition",
      lumpSumBreakdown: {
        installmentCents: 72000,
        futureCents: 0,
        redistributed: false,
      },
    });

    assert.doesNotMatch(html, /Payment breakdown/);
  });

  it("renders combined payment line items instead of a single charge row", () => {
    const html = buildTuitionPaymentReceiptHtml({
      ...basePayload,
      amountCents: 144000,
      chargedAmountCents: 148364,
      processingFeeCents: 4364,
      combinedLineItems: [
        {
          studentName: "Caleb",
          chargeLabel: "Aug Tuition",
          amountCents: 72000,
        },
        {
          studentName: "Jon",
          chargeLabel: "Aug Tuition",
          amountCents: 72000,
        },
      ],
    });

    assert.match(html, /Charges paid/);
    assert.match(html, /Caleb/);
    assert.match(html, /Jon/);
    assert.doesNotMatch(html, />Charge</);
    assert.doesNotMatch(html, />Student</);
  });
});
