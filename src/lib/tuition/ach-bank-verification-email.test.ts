import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildAchBankVerificationAdminNotificationHtml,
  buildAchBankVerificationHtml,
} from "@/lib/emails";

describe("buildAchBankVerificationHtml", () => {
  it("includes verification CTA and descriptor instructions", () => {
    const html = buildAchBankVerificationHtml({
      name: "Hayley Calvert",
      schoolName: "Rooted Meadows",
      verificationUrl: "https://payments.stripe.com/microdeposit/test",
      portalUrl: "https://trymudkitchen.com/school/rooted-meadows/parent/billing",
      microdepositType: "descriptor_code",
      arrivalDateLabel: "October 5, 2026",
      lineItems: [{ label: "Sep Tuition", amountCents: 72500, studentName: "Arrow" }],
    });

    assert.match(html, /Action required/);
    assert.match(html, /Verify bank account/);
    assert.match(html, /verification code/);
    assert.match(html, /Sep Tuition/);
    assert.match(html, /https:\/\/payments\.stripe\.com\/microdeposit\/test/);
  });
});

describe("buildAchBankVerificationAdminNotificationHtml", () => {
  it("uses informational tone and family email status", () => {
    const html = buildAchBankVerificationAdminNotificationHtml({
      schoolName: "Rooted Meadows",
      paymentTypeLabel: "Tuition",
      payerLabel: "Hayley Calvert",
      familyEmailSent: true,
      lineItems: [{ label: "Sep Tuition", amountCents: 72000, studentName: "Arrow" }],
      financesAdminUrl: "https://trymudkitchen.com/school/rooted-meadows/admin/finances/transactions",
    });

    assert.doesNotMatch(html, /Action required/);
    assert.match(html, /Payment update/);
    assert.match(html, /pending bank verification/i);
    assert.match(html, /No action is needed/i);
    assert.match(html, /View transactions/);
    assert.match(html, /Sep Tuition/);
  });
});
