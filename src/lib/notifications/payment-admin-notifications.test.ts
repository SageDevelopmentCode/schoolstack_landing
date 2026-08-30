import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildPaymentReceivedAdminNotificationHtml } from "@/lib/emails";

describe("buildPaymentReceivedAdminNotificationHtml", () => {
  it("includes payment details and admin CTA", () => {
    const html = buildPaymentReceivedAdminNotificationHtml({
      schoolName: "Rooted Meadows Waldorf School",
      paymentTypeLabel: "Tuition",
      payerLabel: "Sparhawk Family",
      amountCents: 42000,
      chargedAmountCents: 42339,
      processingFeeCents: 339,
      paymentMethodLabel: "ACH",
      paidAtLabel: "August 29, 2026 at 2:47 PM",
      studentName: "Olivia Sparhawk",
      chargeLabel: "Aug Tuition",
      paymentsAdminUrl:
        "https://trymudkitchen.com/school/rooted-meadows/admin/admissions/payments",
    });

    assert.match(html, /Payment Received/);
    assert.match(html, /Sparhawk Family/);
    assert.match(html, /Olivia Sparhawk/);
    assert.match(html, /View payments/);
    assert.match(html, /423\.39/);
  });

  it("renders combined line items when provided", () => {
    const html = buildPaymentReceivedAdminNotificationHtml({
      schoolName: "Rooted Meadows Waldorf School",
      paymentTypeLabel: "Tuition",
      payerLabel: "Thompson Family",
      amountCents: 144000,
      chargedAmountCents: 145000,
      processingFeeCents: 1000,
      paymentMethodLabel: "ACH",
      paidAtLabel: "August 29, 2026 at 2:52 PM",
      lineItems: [
        {
          studentName: "Maggie Thompson",
          label: "Aug Tuition",
          amountCents: 72000,
        },
        {
          studentName: "Nina Thompson",
          label: "Aug Tuition",
          amountCents: 72000,
        },
      ],
      paymentsAdminUrl:
        "https://trymudkitchen.com/school/rooted-meadows/admin/admissions/payments",
    });

    assert.match(html, /Maggie Thompson/);
    assert.match(html, /Nina Thompson/);
    assert.match(html, /1,450\.00/);
  });
});
