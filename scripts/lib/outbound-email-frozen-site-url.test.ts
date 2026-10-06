/**
 * Run with localhost frozen at module load:
 *   NEXT_PUBLIC_SITE_URL=http://localhost:3000 node --test scripts/lib/outbound-email-frozen-site-url.test.ts
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { PRODUCTION_SITE_URL, SITE_URL, getRuntimeSiteUrl } from "@/lib/site";
import { schoolAdminPath } from "@/lib/organization-settings/admin-routes";
import { buildPaymentReceivedAdminNotificationHtml } from "@/lib/emails";

import {
  assertNoLocalhostInOutboundHtml,
  ensureProductionSiteUrlForOutboundEmail,
} from "./outbound-email-production-site";

describe("frozen SITE_URL with production outbound links", () => {
  it("uses getRuntimeSiteUrl for admin payment email when SITE_URL is localhost", () => {
    if (!SITE_URL.includes("localhost") && !SITE_URL.includes("127.0.0.1")) {
      return;
    }

    process.env.NEXT_PUBLIC_SITE_URL = "http://localhost:3000";
    ensureProductionSiteUrlForOutboundEmail();
    assert.equal(getRuntimeSiteUrl(), PRODUCTION_SITE_URL);
    assert.match(SITE_URL, /localhost/);

    const paymentsAdminUrl = `${getRuntimeSiteUrl()}${schoolAdminPath("demo-school", "admissions", "payments")}`;
    const html = buildPaymentReceivedAdminNotificationHtml({
      schoolName: "Demo School",
      paymentTypeLabel: "Tuition",
      payerLabel: "Demo Family",
      amountCents: 10000,
      chargedAmountCents: 10000,
      paymentMethodLabel: "Card",
      paidAtLabel: "Jan 1, 2026",
      paymentsAdminUrl,
    });

    assert.match(html, /trymudkitchen\.com/);
    assertNoLocalhostInOutboundHtml(html);
  });
});
