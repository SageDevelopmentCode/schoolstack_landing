import { NextResponse } from "next/server";
import type Stripe from "stripe";
import {
  ACTIVITY_ACTIONS,
  logActivityEvent,
} from "@/lib/activity-log";
import { sendApplicationSubmittedNotifications } from "@/lib/admissions/application-notifications";
import {
  completeApplicationPaymentAndSubmit,
  getApplicationForSubmit,
} from "@/lib/admissions/application-submit";
import { completeChecklistPaymentFromWebhook } from "@/lib/admissions/enrollment-checklist-materialization";
import { apiError } from "@/lib/api/route-errors";
import {
  attachCheckoutSessionToPayment,
  getApplicationPaymentByCheckoutSession,
  markApplicationPaymentSucceeded,
} from "@/lib/stripe/application-payments";
import { getStripeClient, getStripeWebhookSecret } from "@/lib/stripe/client";
import { syncPaymentAccountFromStripe } from "@/lib/stripe/organization-payment-account";
import { createAdminClient } from "@/utils/supabase/admin";

const ROUTE = "/api/stripe/webhook";

export const runtime = "nodejs";

async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session,
): Promise<void> {
  const admin = createAdminClient();
  const checkoutSessionId = session.id;
  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id;

  const metadata = session.metadata ?? {};

  if (
    metadata.payment_type === "enrollment_checklist" &&
    metadata.checklist_item_id &&
    metadata.organization_id
  ) {
    await completeChecklistPaymentFromWebhook(admin, {
      instanceId: metadata.checklist_item_id,
      organizationId: metadata.organization_id,
      checkoutSessionId,
      paymentIntentId,
    });

    void logActivityEvent(admin, {
      organizationId: metadata.organization_id,
      actorType: "system",
      surface: "system",
      action: ACTIVITY_ACTIONS.APPLICATION_PAYMENT_COMPLETED,
      entityType: "enrollment_checklist_item",
      entityId: metadata.checklist_item_id,
      summary: "Enrollment checklist payment completed",
      metadata: {
        checkoutSessionId,
        applicationId: metadata.application_id ?? null,
      },
    });
    return;
  }

  let payment = await getApplicationPaymentByCheckoutSession(
    admin,
    checkoutSessionId,
  );

  const paymentId = metadata.payment_id;

  if (!payment && paymentId) {
    await attachCheckoutSessionToPayment(admin, paymentId, checkoutSessionId);
    payment = await markApplicationPaymentSucceeded(admin, paymentId, {
      stripePaymentIntentId: paymentIntentId,
      stripeCheckoutSessionId: checkoutSessionId,
    });
  }

  if (!payment) {
    console.warn("checkout.session.completed: payment not found", checkoutSessionId);
    return;
  }

  const application = await getApplicationForSubmit(admin, payment.applicationId);
  if (!application) {
    console.warn("checkout.session.completed: application not found", payment.applicationId);
    return;
  }

  if (application.status !== "draft") {
    return;
  }

  await completeApplicationPaymentAndSubmit(admin, payment.applicationId);
  void sendApplicationSubmittedNotifications(admin, payment.applicationId);

  void logActivityEvent(admin, {
    organizationId: application.organizationId,
    actorType: "system",
    surface: "system",
    action: ACTIVITY_ACTIONS.APPLICATION_PAYMENT_COMPLETED,
    entityType: "application",
    entityId: payment.applicationId,
    summary: `Application fee payment completed`,
    metadata: {
      paymentId: payment.id,
      checkoutSessionId,
      amountCents: payment.amountCents,
    },
  });
}

async function handleAccountUpdated(account: Stripe.Account): Promise<void> {
  const admin = createAdminClient();

  const { data: existing } = await admin
    .from("organization_payment_accounts")
    .select("organization_id, charges_enabled")
    .eq("stripe_connect_account_id", account.id)
    .maybeSingle();

  const wasChargesEnabled = Boolean(existing?.charges_enabled);
  const chargesNowEnabled = Boolean(account.charges_enabled);

  await syncPaymentAccountFromStripe(admin, account.id, account);

  if (!wasChargesEnabled && chargesNowEnabled && existing?.organization_id) {
    void logActivityEvent(admin, {
      organizationId: String(existing.organization_id),
      actorType: "system",
      surface: "system",
      action: ACTIVITY_ACTIONS.PAYMENTS_STRIPE_CONNECTED,
      entityType: "organization_payment_account",
      summary: "Stripe Connect account is ready to accept payments",
      metadata: {
        stripeConnectAccountId: account.id,
        chargesEnabled: chargesNowEnabled,
        payoutsEnabled: Boolean(account.payouts_enabled),
      },
    });
  }
}

export async function POST(request: Request) {
  const stripe = getStripeClient();
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "Missing stripe-signature.",
      notify: true,
    });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      getStripeWebhookSecret(),
    );
  } catch (error) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "Invalid signature.",
      notify: true,
      cause: error,
    });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutSessionCompleted(
          event.data.object as Stripe.Checkout.Session,
        );
        break;
      case "account.updated":
        await handleAccountUpdated(event.data.object as Stripe.Account);
        break;
      default:
        break;
    }
  } catch (error) {
    return apiError(ROUTE, {
      request,
      status: 500,
      error: "Webhook handler failed.",
      cause: error,
    });
  }

  return NextResponse.json({ received: true });
}
