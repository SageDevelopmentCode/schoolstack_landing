import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { sendApplicationSubmittedNotifications } from "@/lib/admissions/application-notifications";
import {
  completeApplicationPaymentAndSubmit,
  getApplicationForSubmit,
} from "@/lib/admissions/application-submit";
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

  let payment = await getApplicationPaymentByCheckoutSession(
    admin,
    checkoutSessionId,
  );

  const metadata = session.metadata ?? {};
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
}

async function handleAccountUpdated(account: Stripe.Account): Promise<void> {
  const admin = createAdminClient();
  await syncPaymentAccountFromStripe(admin, account.id, account);
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
