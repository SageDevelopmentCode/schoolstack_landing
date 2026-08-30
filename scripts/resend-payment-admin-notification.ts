/**
 * Resend payment-received admin notification emails for succeeded payments.
 *
 * Usage:
 *   NEXT_PUBLIC_SITE_URL=https://trymudkitchen.com \
 *   PAYMENT_IDS=<uuid>,<uuid> \
 *   npx tsx --require ./src/test/integration/mock-server-only.cjs scripts/resend-payment-admin-notification.ts
 *
 * Dry run (no send):
 *   DRY_RUN=1 PAYMENT_IDS=... npx tsx --require ./src/test/integration/mock-server-only.cjs scripts/resend-payment-admin-notification.ts
 */

import { resolve } from "node:path";
import { config } from "dotenv";

config({ path: resolve(process.cwd(), ".env.local") });

const PRODUCTION_SITE_URL = "https://trymudkitchen.com";

const DEFAULT_PAYMENT_IDS = [
  "6694f4f0-fc6e-4708-b2b4-e26b1e324273",
  "6260fb94-7f68-42cc-894a-747f315e4670",
  "64689b86-194c-4ebf-a8a4-f18827cd6720",
  "4efc9526-8b2a-47ad-b1f7-0de90945d892",
];

function log(message: string) {
  console.log(`[resend-payment-admin-notification] ${message}`);
}

function ensureProductionSiteUrl(): string {
  const current = process.env.NEXT_PUBLIC_SITE_URL?.trim() ?? "";
  if (!current || current.includes("localhost")) {
    process.env.NEXT_PUBLIC_SITE_URL = PRODUCTION_SITE_URL;
  }
  return process.env.NEXT_PUBLIC_SITE_URL!;
}

function isDryRun(): boolean {
  const value = process.env.DRY_RUN?.trim().toLowerCase();
  return value === "1" || value === "true" || value === "yes";
}

function isZohoReady(): boolean {
  const disabled =
    process.env.DISABLE_OUTBOUND_EMAIL === "1" ||
    process.env.DISABLE_OUTBOUND_EMAIL === "true";
  if (disabled) return false;

  return !!(
    process.env.ZOHO_CLIENT_ID &&
    process.env.ZOHO_CLIENT_SECRET &&
    process.env.ZOHO_REDIRECT_URI &&
    process.env.ZOHO_REFRESH_TOKEN
  );
}

function parsePaymentIds(): string[] {
  const fromList = process.env.PAYMENT_IDS?.trim();
  if (fromList) {
    return fromList
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean);
  }

  const single = process.env.PAYMENT_ID?.trim();
  if (single) return [single];

  return DEFAULT_PAYMENT_IDS;
}

async function main() {
  const siteUrl = ensureProductionSiteUrl();
  log(`Using site URL: ${siteUrl}`);

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
    console.error(
      "[resend-payment-admin-notification] Supabase credentials not configured in .env.local",
    );
    process.exit(1);
  }

  const paymentIds = parsePaymentIds();
  if (paymentIds.length === 0) {
    console.error(
      "[resend-payment-admin-notification] No payment IDs provided (PAYMENT_ID or PAYMENT_IDS)",
    );
    process.exit(1);
  }

  const dryRun = isDryRun();
  if (dryRun) {
    log("DRY_RUN enabled — will not send emails");
  } else if (!isZohoReady()) {
    console.error(
      "[resend-payment-admin-notification] Zoho email is not configured — emails would not send",
    );
    process.exit(1);
  }

  const { createAdminClient } = await import("@/utils/supabase/admin");
  const { getPaymentById } = await import("@/lib/stripe/application-payments");
  const { resolvePaymentNotificationEmails } = await import(
    "@/lib/notifications/org-notification-settings"
  );
  const { sendPaymentReceivedAdminNotifications } = await import(
    "@/lib/notifications/payment-admin-notifications"
  );
  const { schoolAdminPath } = await import(
    "@/lib/organization-settings/admin-routes"
  );

  const admin = createAdminClient();

  for (const paymentId of paymentIds) {
    const payment = await getPaymentById(admin, paymentId);
    if (!payment) {
      console.error(
        `[resend-payment-admin-notification] Payment not found: ${paymentId}`,
      );
      process.exit(1);
    }

    if (payment.status !== "succeeded") {
      console.error(
        `[resend-payment-admin-notification] Payment ${paymentId} is "${payment.status}", not "succeeded"`,
      );
      process.exit(1);
    }

    const notifyEmails = await resolvePaymentNotificationEmails(
      admin,
      payment.organizationId,
    );

    const { data: org, error: orgError } = await admin
      .from("organizations")
      .select("name, slug")
      .eq("id", payment.organizationId)
      .maybeSingle();

    if (orgError) throw orgError;
    if (!org?.slug) {
      console.error(
        `[resend-payment-admin-notification] Organization not found for payment ${paymentId}`,
      );
      process.exit(1);
    }

    const paymentsAdminUrl = `${siteUrl}${schoolAdminPath(String(org.slug), "admissions", "payments")}`;

    log(`Payment: ${payment.id}`);
    log(`School: ${org.name}`);
    log(`Label: ${payment.label ?? payment.paymentType}`);
    log(
      `Amount: ${payment.amountCents} cents (charged ${payment.chargedAmountCents ?? payment.amountCents})`,
    );
    log(`Recipients: ${notifyEmails.length > 0 ? notifyEmails.join(", ") : "(none)"}`);
    log(`View payments URL: ${paymentsAdminUrl}`);

    if (notifyEmails.length === 0) {
      console.error(
        `[resend-payment-admin-notification] No notification recipients configured for org ${payment.organizationId}`,
      );
      process.exit(1);
    }

    if (paymentsAdminUrl.includes("localhost")) {
      console.error(
        `[resend-payment-admin-notification] Refusing to send with localhost URL: ${paymentsAdminUrl}`,
      );
      process.exit(1);
    }

    if (!dryRun) {
      await sendPaymentReceivedAdminNotifications(admin, paymentId);
      log(`Sent admin notification for ${paymentId}`);
    }
  }

  log(dryRun ? "Dry run completed." : "All admin notifications sent.");
}

void main().catch((error) => {
  console.error("[resend-payment-admin-notification] Failed:", error);
  process.exit(1);
});
