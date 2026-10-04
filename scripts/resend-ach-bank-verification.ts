/**
 * Resend ACH micro-deposit verification email, or print manual ops copy.
 *
 * Usage:
 *   PAYMENT_ID=040a76f7-... npx tsx --require ./src/test/integration/mock-server-only.cjs scripts/resend-ach-bank-verification.ts
 *   PAYMENT_IDS=uuid1,uuid2 PRINT_MANUAL=1 ...  # combined manual email draft
 *   DRY_RUN=0 PAYMENT_ID=...  # send via Zoho / Discord (DRY_RUN defaults on)
 *
 * Env (default 1 = on):
 *   SEND_FAMILY=1  — family/applicant verification email via MudKitchen
 *   SEND_OPS=1     — school admin email, Discord, activity_events
 *   FORCE_OPS=1    — re-send admin + Discord even if ops activity already logged
 *   EMAIL_SITE_URL — force MudKitchen links/logo base (default: production if unset before .env.local)
 *   HOSTED_VERIFICATION_URL — skip Stripe PI lookup; use this Stripe hosted verification link
 *
 * See .agents/skills/outbound-email-ops/SKILL.md for production URL requirements.
 */

import { resolve } from "node:path";
import { config } from "dotenv";

import type { PaymentRecord } from "@/lib/stripe/application-payments";
import type { AchVerificationAction } from "@/lib/stripe/payment-intent-bank-verification";

import { validateAchResendBatch } from "./lib/resend-ach-batch-validation";
import {
  assertNoLocalhostInOutboundHtml,
  ensureProductionSiteUrlForOutboundEmail,
  logOutboundEmailSiteUrl,
} from "./lib/outbound-email-production-site";

config({ path: resolve(process.cwd(), ".env.local") });

const SCRIPT_PREFIX = "resend-ach-bank-verification";

function log(message: string) {
  console.log(`[${SCRIPT_PREFIX}] ${message}`);
}

function envFlag(name: string, defaultOn = true): boolean {
  const value = process.env[name]?.trim();
  if (value === undefined || value === "") return defaultOn;
  return value === "1" || value.toLowerCase() === "true";
}

type ReadyPayment = {
  payment: PaymentRecord;
  verificationAction: AchVerificationAction;
};

function failBatchValidation(reason: string): never {
  console.error(`[resend-ach-bank-verification] ${reason}`);
  process.exit(1);
}

function validateOrgBatches(
  readyByOrg: Map<string, ReadyPayment[]>,
  requireSingleVerificationUrl: boolean,
): void {
  for (const readyPayments of readyByOrg.values()) {
    const result = validateAchResendBatch(readyPayments, {
      requireSingleVerificationUrl,
    });
    if (!result.ok) {
      failBatchValidation(result.reason);
    }
  }
}

async function main() {
  ensureProductionSiteUrlForOutboundEmail();
  logOutboundEmailSiteUrl(SCRIPT_PREFIX);

  const paymentIds = (
    process.env.PAYMENT_IDS ??
    process.env.PAYMENT_ID ??
    ""
  )
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean)
    .sort();

  if (paymentIds.length === 0) {
    console.error(
      "[resend-ach-bank-verification] Set PAYMENT_ID or PAYMENT_IDS (comma-separated)",
    );
    process.exit(1);
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
    console.error(
      "[resend-ach-bank-verification] Supabase credentials missing in .env.local",
    );
    process.exit(1);
  }

  if (!process.env.STRIPE_SECRET_KEY?.trim()) {
    console.error(
      "[resend-ach-bank-verification] STRIPE_SECRET_KEY missing in .env.local",
    );
    process.exit(1);
  }

  const printManual = process.env.PRINT_MANUAL === "1";
  const dryRun = process.env.DRY_RUN !== "0";
  const sendFamily = envFlag("SEND_FAMILY");
  const sendOps = envFlag("SEND_OPS");
  const forceOps = envFlag("FORCE_OPS", false);

  if (dryRun) {
    log(
      "DRY_RUN is on by default; set DRY_RUN=0 to send family email, Discord, and activity events.",
    );
  }

  const { createAdminClient } = await import("@/utils/supabase/admin");
  const { getPaymentById } = await import("@/lib/stripe/application-payments");
  const {
    resolveAchVerificationActionForPaymentIntent,
  } = await import("@/lib/stripe/payment-intent-bank-verification");
  const { sendAchBankVerificationNotificationsForPayments } = await import(
    "@/lib/stripe/ach-bank-verification-notifications"
  );
  const { loadFamilyNotificationEmails } = await import(
    "@/lib/notifications/family-notification-emails"
  );

  const admin = createAdminClient();
  const blocks: string[] = [];
  const readyByOrg = new Map<string, ReadyPayment[]>();

  for (const paymentId of paymentIds) {
    const payment = await getPaymentById(admin, paymentId);
    if (!payment) {
      log(`Payment not found: ${paymentId}`);
      continue;
    }
    if (!payment.stripePaymentIntentId) {
      log(`Payment ${paymentId} has no stripe_payment_intent_id`);
      continue;
    }

    const hostedOverride = process.env.HOSTED_VERIFICATION_URL?.trim();
    let verificationAction: AchVerificationAction | null = null;

    if (hostedOverride) {
      verificationAction = {
        hostedVerificationUrl: hostedOverride,
        microdepositType: "descriptor_code",
        arrivalDate: null,
      };
    } else {
      try {
        verificationAction = await resolveAchVerificationActionForPaymentIntent(
          payment.stripePaymentIntentId,
        );
      } catch (error) {
        const message =
          error instanceof Error ? error.message : String(error);
        if (process.env.STRIPE_SECRET_KEY?.startsWith("sk_test_")) {
          console.error(
            "[resend-ach-bank-verification] Stripe lookup failed with sk_test_*. " +
              "Use live STRIPE_SECRET_KEY or set HOSTED_VERIFICATION_URL from Stripe Dashboard.",
          );
        }
        throw error;
      }
    }

    if (!verificationAction) {
      log(
        `Payment ${paymentId} PI is not awaiting micro-deposit verification (check Stripe Dashboard).`,
      );
      continue;
    }

    log(`OK ${payment.label ?? paymentId}: ${verificationAction.hostedVerificationUrl}`);

    blocks.push(
      `${payment.label ?? "Tuition"} (${(payment.chargedAmountCents ?? payment.amountCents) / 100} USD):\n${verificationAction.hostedVerificationUrl}`,
    );

    const orgBatch = readyByOrg.get(payment.organizationId) ?? [];
    orgBatch.push({ payment, verificationAction });
    readyByOrg.set(payment.organizationId, orgBatch);
  }

  if (blocks.length === 0) {
    process.exit(1);
  }

  const requireSingleVerificationUrl = !printManual && !dryRun;
  validateOrgBatches(readyByOrg, requireSingleVerificationUrl);

  if (printManual || dryRun) {
    const samplePayment =
      readyByOrg.values().next().value?.[0]?.payment ?? null;
    const emails =
      samplePayment?.familyId != null
        ? await loadFamilyNotificationEmails(admin, samplePayment.familyId)
        : [];

    console.log("\n--- Manual email draft ---\n");
    console.log(`To: ${emails.join(", ") || "(set family notification emails)"}`);
    console.log(
      "Subject: Action needed: verify your bank for tuition (Rooted Meadows)\n",
    );
    console.log(
      "Hi,\n\nStripe still needs you to verify your bank account before your tuition payment can go through. Until you complete verification, no debit has been submitted.\n",
    );
    for (const block of blocks) {
      console.log(block);
      console.log("");
    }
    console.log(
      "Watch your bank for a small Stripe entry with a verification code in the description, then open the matching link above.\n",
    );
    console.log("--- end draft ---\n");
    return;
  }

  const { getRuntimeSiteUrl } = await import("@/lib/site");
  const {
    buildAchBankVerificationAdminNotificationHtml,
    buildAchBankVerificationHtml,
  } = await import("@/lib/emails");
  const { schoolAdminPath } = await import(
    "@/lib/organization-settings/admin-routes"
  );
  const siteUrl = getRuntimeSiteUrl();
  const sampleVerifyUrl =
    readyByOrg.values().next().value?.[0]?.verificationAction
      .hostedVerificationUrl ?? "https://payments.stripe.com/microdeposit/sample";
  const sampleFamilyHtml = buildAchBankVerificationHtml({
    name: "Family",
    schoolName: "School",
    verificationUrl: sampleVerifyUrl,
    portalUrl: `${siteUrl}/school/sample/parent/billing`,
  });
  const sampleAdminHtml = buildAchBankVerificationAdminNotificationHtml({
    schoolName: "School",
    paymentTypeLabel: "Tuition",
    payerLabel: "Family",
    familyEmailSent: true,
    financesAdminUrl: `${siteUrl}${schoolAdminPath("sample", "finances", "transactions")}`,
  });
  assertNoLocalhostInOutboundHtml(sampleFamilyHtml);
  assertNoLocalhostInOutboundHtml(sampleAdminHtml);

  for (const [organizationId, readyPayments] of readyByOrg) {
    const payments = readyPayments.map((row) => row.payment);
    const sortedIds = payments.map((p) => p.id).sort();
    const checkoutSessionId =
      payments[0]?.stripeCheckoutSessionId ??
      `manual-resend-${sortedIds.join("-")}`;

    const verificationAction = readyPayments[0]!.verificationAction;

    await sendAchBankVerificationNotificationsForPayments(admin, {
      organizationId,
      checkoutSessionId,
      payments,
      verificationAction,
      sendFamily,
      sendOps,
      forceOps,
    });

    log(
      `Sent batched notifications for ${payments.length} payment(s) (family=${sendFamily}, ops=${sendOps}, forceOps=${forceOps})`,
    );
  }
}

main().catch((error) => {
  console.error("[resend-ach-bank-verification] Failed:", error);
  process.exit(1);
});
