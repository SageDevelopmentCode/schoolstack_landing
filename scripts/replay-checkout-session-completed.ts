/**
 * Replay Stripe checkout.session.completed handling for a stuck payment.
 *
 * Usage:
 *   CHECKOUT_SESSION_ID=cs_live_... \
 *   npx tsx --require ./src/test/integration/mock-server-only.cjs scripts/replay-checkout-session-completed.ts
 *
 * When .env.local only has test Stripe keys but the session is live, export the session JSON
 * from Stripe and pass CHECKOUT_SESSION_JSON=/path/to/session.json instead.
 */

import { resolve } from "node:path";
import { config } from "dotenv";
import type Stripe from "stripe";

config({ path: resolve(process.cwd(), ".env.local") });

function log(message: string) {
  console.log(`[replay-checkout-session-completed] ${message}`);
}

async function main() {
  const checkoutSessionJsonPath = process.env.CHECKOUT_SESSION_JSON?.trim();
  const checkoutSessionId = process.env.CHECKOUT_SESSION_ID?.trim();
  if (!checkoutSessionJsonPath && !checkoutSessionId) {
    console.error(
      "[replay-checkout-session-completed] Set CHECKOUT_SESSION_ID or CHECKOUT_SESSION_JSON",
    );
    process.exit(1);
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
    console.error(
      "[replay-checkout-session-completed] Supabase credentials not configured in .env.local",
    );
    process.exit(1);
  }

  if (!checkoutSessionJsonPath && !process.env.STRIPE_SECRET_KEY?.trim()) {
    console.error(
      "[replay-checkout-session-completed] STRIPE_SECRET_KEY not configured in .env.local",
    );
    process.exit(1);
  }

  const { createAdminClient } = await import("@/utils/supabase/admin");
  const { handleCheckoutSessionCompleted } = await import("@/lib/stripe/webhook-handlers");

  const admin = createAdminClient();

  let session: Stripe.Checkout.Session;
  if (checkoutSessionJsonPath) {
    const { readFile } = await import("node:fs/promises");
    log(`Loading session from ${checkoutSessionJsonPath}...`);
    session = JSON.parse(
      await readFile(checkoutSessionJsonPath, "utf8"),
    ) as Stripe.Checkout.Session;
  } else {
    const { getStripeClient } = await import("@/lib/stripe/client");
    const stripe = getStripeClient();
    log(`Retrieving session ${checkoutSessionId}...`);
    session = await stripe.checkout.sessions.retrieve(checkoutSessionId!);
  }

  if (session.payment_status !== "paid") {
    const achTuitionComplete =
      session.status === "complete" &&
      session.metadata?.payment_method === "us_bank_account" &&
      (session.metadata?.payment_type === "tuition" ||
        session.metadata?.payment_type === "tuition_combined");
    if (!achTuitionComplete) {
      console.error(
        `[replay-checkout-session-completed] Session payment_status is "${session.payment_status}", expected "paid"`,
      );
      process.exit(1);
    }
  }

  log(
    `Session complete (${session.metadata?.payment_type ?? "unknown type"}). Running webhook handler...`,
  );
  await handleCheckoutSessionCompleted(admin, session);
  log("Done.");

  const paymentId =
    typeof session.metadata?.payment_id === "string" ? session.metadata.payment_id : null;
  if (paymentId) {
    const { data: payment, error } = await admin
      .from("application_payments")
      .select("id, status, paid_at, stripe_payment_intent_id")
      .eq("id", paymentId)
      .maybeSingle();
    if (error) throw error;
    log(`application_payments ${paymentId}: ${JSON.stringify(payment)}`);
  }

  const checklistItemId =
    typeof session.metadata?.checklist_item_id === "string"
      ? session.metadata.checklist_item_id
      : null;
  if (checklistItemId) {
    const { data: item, error } = await admin
      .from("enrollment_checklist_items")
      .select("id, status, payment_status, completed_at")
      .eq("id", checklistItemId)
      .maybeSingle();
    if (error) throw error;
    log(`enrollment_checklist_items ${checklistItemId}: ${JSON.stringify(item)}`);
  }

  const applicationId =
    typeof session.metadata?.application_id === "string"
      ? session.metadata.application_id
      : null;
  if (applicationId) {
    const { data: application, error } = await admin
      .from("applications")
      .select("id, status")
      .eq("id", applicationId)
      .maybeSingle();
    if (error) throw error;
    log(`applications ${applicationId}: ${JSON.stringify(application)}`);
  }
}

void main().catch((error) => {
  console.error("[replay-checkout-session-completed] Failed:", error);
  process.exit(1);
});
