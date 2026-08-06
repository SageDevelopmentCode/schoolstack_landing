/**
 * Stripe webhook endpoint.
 *
 * Production must subscribe to:
 * - checkout.session.completed
 * - checkout.session.async_payment_succeeded
 * - checkout.session.async_payment_failed
 * - account.updated
 *
 * Configure STRIPE_WEBHOOK_SECRET in the environment for signature verification.
 */
import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { apiError } from "@/lib/api/route-errors";
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
    // #region agent log
    fetch('http://127.0.0.1:7667/ingest/3cb8dff8-e332-4ae8-b1e5-8d6e920d55ef',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'89972b'},body:JSON.stringify({sessionId:'89972b',location:'api/stripe/webhook/route.ts:catch',message:'stripe webhook handler failed',data:{eventType:event.type,eventId:event.id,errorMessage:error instanceof Error?error.message:String(error),errorCode:error&&typeof error==='object'&&'code' in error?String((error as {code?:unknown}).code):null},timestamp:Date.now(),hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    return apiError(ROUTE, {
      request,
      status: 500,
      error: "Webhook handler failed.",
      cause: error,
    });
  }

  return NextResponse.json({ received: true });
}
