import type { SupabaseClient } from "@supabase/supabase-js";
import type Stripe from "stripe";
import { getStripeClient } from "@/lib/stripe/client";

function isStripeResourceMissing(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "resource_missing"
  );
}

async function persistStripeCustomerId(
  supabase: SupabaseClient,
  userId: string,
  stripeCustomerId: string,
): Promise<void> {
  const { error } = await supabase.from("user_stripe_customers").upsert(
    {
      user_id: userId,
      stripe_customer_id: stripeCustomerId,
    },
    { onConflict: "user_id" },
  );

  if (error) throw error;
}

export async function getOrCreateStripeCustomer(
  supabase: SupabaseClient,
  input: { userId: string; email: string | null | undefined },
): Promise<string> {
  const stripe = getStripeClient();

  const { data: existing, error: existingError } = await supabase
    .from("user_stripe_customers")
    .select("stripe_customer_id")
    .eq("user_id", input.userId)
    .maybeSingle();

  if (existingError) throw existingError;

  if (existing?.stripe_customer_id) {
    try {
      await stripe.customers.retrieve(existing.stripe_customer_id);
      return existing.stripe_customer_id;
    } catch (error) {
      if (!isStripeResourceMissing(error)) {
        throw error;
      }
    }
  }

  const customer = await stripe.customers.create({
    email: input.email ?? undefined,
    metadata: {
      supabase_user_id: input.userId,
    },
  });

  await persistStripeCustomerId(supabase, input.userId, customer.id);
  return customer.id;
}

export async function backfillStripeCustomerId(
  supabase: SupabaseClient,
  userId: string,
  stripeCustomerId: string,
): Promise<void> {
  const { data: existing, error: existingError } = await supabase
    .from("user_stripe_customers")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (existingError) throw existingError;
  if (existing) return;

  const { error } = await supabase.from("user_stripe_customers").insert({
    user_id: userId,
    stripe_customer_id: stripeCustomerId,
  });

  if (error) throw error;
}

export function resolveCheckoutSessionCustomerId(
  session: Stripe.Checkout.Session,
): string | null {
  if (typeof session.customer === "string") {
    return session.customer;
  }

  if (session.customer && typeof session.customer === "object") {
    return session.customer.id ?? null;
  }

  return null;
}

export function resolveCheckoutSessionSupabaseUserId(
  session: Stripe.Checkout.Session,
): string | null {
  const sessionUserId = session.metadata?.supabase_user_id;
  if (typeof sessionUserId === "string" && sessionUserId.length > 0) {
    return sessionUserId;
  }

  const paymentIntent = session.payment_intent;
  if (
    paymentIntent &&
    typeof paymentIntent === "object" &&
    paymentIntent.metadata?.supabase_user_id
  ) {
    const paymentIntentUserId = paymentIntent.metadata.supabase_user_id;
    if (typeof paymentIntentUserId === "string" && paymentIntentUserId.length > 0) {
      return paymentIntentUserId;
    }
  }

  return null;
}
