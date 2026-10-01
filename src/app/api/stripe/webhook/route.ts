/**
 * Stripe webhook endpoint.
 *
 * Production must subscribe to:
 * - checkout.session.completed
 * - checkout.session.async_payment_succeeded
 * - checkout.session.async_payment_failed
 * - account.updated
 *
 * Live endpoint (Stripe): https://trymudkitchen.com/api/stripe/webhook
 * Do not use www.trymudkitchen.com — Vercel 308-redirects www to apex and Stripe
 * does not follow redirects, so checkout.session.completed would never reach this handler.
 * Families returning from Checkout with a missed webhook can reconcile via
 * POST /api/admissions/checkout-sessions/{sessionId}/confirm (enrollment and tuition).
 *
 * Configure STRIPE_WEBHOOK_SECRET in the environment for signature verification.
 */
import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { apiError } from "@/lib/api/route-errors";
import { messageFromCause } from "@/lib/api/error-serialization";
import { notifyStripeWebhookCriticalError } from "@/lib/discord";
import { getStripeClient, getStripeWebhookSecret } from "@/lib/stripe/client";
import {
  handleAccountUpdated,
  handleCheckoutSessionAsyncPaymentFailed,
  handleCheckoutSessionAsyncPaymentSucceeded,
  handleCheckoutSessionCompleted,
} from "@/lib/stripe/webhook-handlers";
import { createAdminClient } from "@/utils/supabase/admin";

const ROUTE = "/api/stripe/webhook";

export const runtime = "nodejs";

function checkoutContextFromSession(
  session: Stripe.Checkout.Session,
): { checkoutSessionId: string; paymentIntentId?: string } {
  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id;
  return {
    checkoutSessionId: session.id,
    paymentIntentId,
  };
}

function checkoutContextFromEvent(
  event: Stripe.Event,
): { checkoutSessionId?: string; paymentIntentId?: string } {
  if (!event.type.startsWith("checkout.session.")) {
    return {};
  }
  const session = event.data.object as Stripe.Checkout.Session;
  return checkoutContextFromSession(session);
}

async function reportStripeWebhookFailure(
  input: {
    status: number;
    error: string;
    code?: string;
    event?: Stripe.Event;
  },
): Promise<void> {
  const checkoutContext = input.event
    ? checkoutContextFromEvent(input.event)
    : {};
  try {
    await notifyStripeWebhookCriticalError({
      status: input.status,
      error: input.error,
      code: input.code,
      eventType: input.event?.type,
      checkoutSessionId: checkoutContext.checkoutSessionId,
      paymentIntentId: checkoutContext.paymentIntentId,
    });
  } catch (discordError) {
    console.error("Stripe webhook Discord notification failed:", discordError);
  }
}

export async function POST(request: Request) {
  const stripe = getStripeClient();
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  // Pre-verify 400s are logged via apiError only — no billing Discord (@everyone).
  if (!signature) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "Missing stripe-signature.",
      notify: false,
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
      notify: false,
      cause: error,
    });
  }

  try {
    const admin = createAdminClient();
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutSessionCompleted(
          admin,
          event.data.object as Stripe.Checkout.Session,
        );
        break;
      case "checkout.session.async_payment_succeeded":
        await handleCheckoutSessionAsyncPaymentSucceeded(
          admin,
          event.data.object as Stripe.Checkout.Session,
        );
        break;
      case "checkout.session.async_payment_failed":
        await handleCheckoutSessionAsyncPaymentFailed(
          admin,
          event.data.object as Stripe.Checkout.Session,
        );
        break;
      case "account.updated":
        await handleAccountUpdated(admin, event.data.object as Stripe.Account);
        break;
      default:
        break;
    }
  } catch (error) {
    const causeMessage = messageFromCause(error);
    await reportStripeWebhookFailure({
      status: 500,
      error: causeMessage
        ? `Webhook handler failed. — ${causeMessage}`
        : "Webhook handler failed.",
      event,
    });
    return apiError(ROUTE, {
      request,
      status: 500,
      error: "Webhook handler failed.",
      notify: false,
      cause: error,
    });
  }

  return NextResponse.json({ received: true });
}
