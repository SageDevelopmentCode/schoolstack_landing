/**
 * Resend a tuition payment receipt email for a succeeded payment.
 *
 * Usage:
 *   npx tsx --require ./src/test/integration/mock-server-only.cjs scripts/resend-tuition-receipt.ts
 *   PAYMENT_ID=<uuid> npx tsx --require ./src/test/integration/mock-server-only.cjs scripts/resend-tuition-receipt.ts
 */

import { resolve } from "node:path";
import { config } from "dotenv";

config({ path: resolve(process.cwd(), ".env.local") });

const DEFAULT_PAYMENT_ID = "6694f4f0-fc6e-4708-b2b4-e26b1e324273";

function log(message: string) {
  console.log(`[resend-tuition-receipt] ${message}`);
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

async function resolveTargetEmails(
  admin: Awaited<ReturnType<typeof import("@/utils/supabase/admin").createAdminClient>>,
  familyId: string,
): Promise<string[]> {
  const { resolveFamilyNotificationEmails } = await import(
    "@/lib/notifications/family-notification-email-constants"
  );

  const { data: family, error: familyError } = await admin
    .from("families")
    .select("notification_emails, primary_email")
    .eq("id", familyId)
    .maybeSingle();

  if (familyError) throw familyError;
  if (!family) return [];

  const { data: guardians, error: guardiansError } = await admin
    .from("guardians")
    .select("email, user_id")
    .eq("family_id", familyId);

  if (guardiansError) throw guardiansError;

  const authEmails: string[] = [];
  const userIds = [
    ...new Set(
      (guardians ?? [])
        .map((guardian) =>
          guardian.user_id != null ? String(guardian.user_id) : null,
        )
        .filter((id): id is string => Boolean(id)),
    ),
  ];

  await Promise.all(
    userIds.map(async (userId) => {
      const { data, error } = await admin.auth.admin.getUserById(userId);
      if (error || !data.user?.email) return;
      authEmails.push(data.user.email.trim().toLowerCase());
    }),
  );

  return resolveFamilyNotificationEmails(family, guardians ?? [], authEmails).emails;
}

async function main() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
    console.error("[resend-tuition-receipt] Supabase credentials not configured in .env.local");
    process.exit(1);
  }

  const paymentId = process.env.PAYMENT_ID?.trim() || DEFAULT_PAYMENT_ID;
  const { createAdminClient } = await import("@/utils/supabase/admin");
  const { getPaymentById } = await import("@/lib/stripe/application-payments");
  const { sendTuitionPaymentReceiptNotifications } = await import(
    "@/lib/tuition/payment-receipt-notifications"
  );

  const admin = createAdminClient();

  const payment = await getPaymentById(admin, paymentId);
  if (!payment) {
    console.error(`[resend-tuition-receipt] Payment not found: ${paymentId}`);
    process.exit(1);
  }

  if (payment.status !== "succeeded") {
    console.error(
      `[resend-tuition-receipt] Payment ${paymentId} is "${payment.status}", not "succeeded"`,
    );
    process.exit(1);
  }

  if (payment.paymentType !== "tuition") {
    console.error(
      `[resend-tuition-receipt] Payment ${paymentId} is type "${payment.paymentType}", not tuition`,
    );
    process.exit(1);
  }

  if (!payment.familyId) {
    console.error(`[resend-tuition-receipt] Payment ${paymentId} has no family_id`);
    process.exit(1);
  }

  const emails = await resolveTargetEmails(admin, payment.familyId);
  if (emails.length === 0) {
    console.error(
      `[resend-tuition-receipt] No notification emails for family ${payment.familyId}`,
    );
    process.exit(1);
  }

  if (!isZohoReady()) {
    console.error(
      "[resend-tuition-receipt] Zoho email is not configured — receipt would not send",
    );
    process.exit(1);
  }

  log(`Payment: ${payment.id}`);
  log(`Label: ${payment.label ?? "Tuition"}`);
  log(`Amount: ${payment.amountCents} cents (charged ${payment.chargedAmountCents ?? payment.amountCents})`);
  log(`Sending receipt to: ${emails.join(", ")}`);

  await sendTuitionPaymentReceiptNotifications(admin, paymentId);

  log("Receipt send completed.");
}

void main().catch((error) => {
  console.error("[resend-tuition-receipt] Failed:", error);
  process.exit(1);
});
