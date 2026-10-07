/**
 * Resend MudKitchen "bank payment did not go through" parent email for a failed tuition ACH payment.
 *
 * Usage:
 *   PAYMENT_ID=<uuid> \
 *   npx tsx --require ./src/test/integration/mock-server-only.cjs scripts/resend-tuition-ach-failure-parent-email.ts
 *
 * Dry run (no send):
 *   DRY_RUN=1 PAYMENT_ID=... npx tsx --require ./src/test/integration/mock-server-only.cjs scripts/resend-tuition-ach-failure-parent-email.ts
 */

import { resolve } from "node:path";
import { config } from "dotenv";

config({ path: resolve(process.cwd(), ".env.local") });

import {
  ensureProductionSiteUrlForOutboundEmail,
  logOutboundEmailSiteUrl,
} from "./lib/outbound-email-production-site";
import { loadFamilyNotificationEmails } from "@/lib/notifications/family-notification-emails";
import { getChargeById } from "@/lib/tuition/charges";
import { sendTuitionAchSettlementFailedNotifications } from "@/lib/stripe/ach-bank-verification-notifications";
import { getPaymentById } from "@/lib/stripe/application-payments";

const SCRIPT_PREFIX = "resend-tuition-ach-failure-parent-email";

/** Calvert Family — Sep Tuition (Arrow), failed Oct 2026 */
const DEFAULT_PAYMENT_ID = "040a76f7-06bf-4f80-962d-ff0154b873ba";

function log(message: string) {
  console.log(`[${SCRIPT_PREFIX}] ${message}`);
}

function isDryRun(): boolean {
  const value = process.env.DRY_RUN?.trim().toLowerCase();
  return value === "1" || value === "true" || value === "yes";
}

async function main() {
  ensureProductionSiteUrlForOutboundEmail();
  logOutboundEmailSiteUrl(SCRIPT_PREFIX);

  const paymentId = process.env.PAYMENT_ID?.trim() || DEFAULT_PAYMENT_ID;
  const { createAdminClient } = await import("@/utils/supabase/admin");
  const admin = createAdminClient();
  const payment = await getPaymentById(admin, paymentId);

  if (!payment) {
    throw new Error(`Payment not found: ${paymentId}`);
  }
  if (payment.paymentType !== "tuition") {
    throw new Error(`Payment ${paymentId} is not tuition`);
  }
  if (payment.status !== "failed") {
    log(`Warning: payment status is ${payment.status}, not failed`);
  }

  const recipientPreview =
    payment.familyId != null
      ? await loadFamilyNotificationEmails(admin, payment.familyId)
      : [];
  log(
    `Recipients: ${recipientPreview.length > 0 ? recipientPreview.join(", ") : "(none)"}`,
  );

  const charge =
    payment.tuitionChargeId != null
      ? await getChargeById(admin, payment.tuitionChargeId)
      : null;
  const chargeReopened =
    charge != null && charge.paidCents < charge.amountCents;

  if (isDryRun()) {
    log(
      `DRY_RUN: would notify for payment ${paymentId} (settlementFailure=true, chargeReopened=${chargeReopened})`,
    );
    return;
  }

  const { isZohoConfigured } = await import("@/lib/zoho");
  if (!(await isZohoConfigured())) {
    console.error(
      `[${SCRIPT_PREFIX}] Zoho outbound email is not configured in this environment (need ZOHO_FROM_ADDRESS plus SMTP or OAuth credentials).`,
    );
    process.exit(1);
  }

  const forceParentEmail =
    process.env.FORCE?.trim() === "1" ||
    process.env.FORCE?.trim().toLowerCase() === "true";

  const { parentEmailAttempts } = await sendTuitionAchSettlementFailedNotifications(
    admin,
    {
      payment,
      settlementFailure: true,
      chargeReopened,
      forceParentEmail,
      parentEmailOnly: true,
    },
  );

  if (parentEmailAttempts.length === 0) {
    log("No parent email attempts were made (missing family contact or payment type).");
    process.exitCode = 1;
    return;
  }

  let successCount = 0;
  for (const attempt of parentEmailAttempts) {
    if (attempt.skippedReason === "deferred_until_billing_reopened") {
      log(`${attempt.email}: deferred (billing not reopened yet)`);
      continue;
    }
    if (attempt.skippedReason === "already_sent") {
      log(`${attempt.email}: skipped (already sent for this payment)`);
      if (attempt.result.ok) successCount += 1;
      continue;
    }
    if (attempt.result.ok) {
      log(`${attempt.email}: sent`);
      successCount += 1;
    } else {
      log(
        `${attempt.email}: failed${attempt.result.error ? ` — ${attempt.result.error}` : ""}`,
      );
    }
  }

  if (successCount === 0) {
    log("All parent email attempts failed or were deferred.");
    process.exitCode = 1;
    return;
  }

  log(
    `Done: ${successCount}/${parentEmailAttempts.length} parent email attempt(s) succeeded for payment ${paymentId}`,
  );
}

main().catch((error) => {
  console.error(`[${SCRIPT_PREFIX}] Failed:`, error);
  process.exitCode = 1;
});
