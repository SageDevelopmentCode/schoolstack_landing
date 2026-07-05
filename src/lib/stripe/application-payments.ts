import type { SupabaseClient } from "@supabase/supabase-js";

export type ApplicationPaymentStatus =
  | "pending"
  | "succeeded"
  | "failed"
  | "refunded";

export type ApplicationPayment = {
  id: string;
  organizationId: string;
  applicationId: string;
  stripeCheckoutSessionId: string | null;
  stripePaymentIntentId: string | null;
  amountCents: number;
  currency: string;
  status: ApplicationPaymentStatus;
  paidAt: string | null;
};

function rowToPayment(row: Record<string, unknown>): ApplicationPayment {
  return {
    id: String(row.id),
    organizationId: String(row.organization_id),
    applicationId: String(row.application_id),
    stripeCheckoutSessionId:
      typeof row.stripe_checkout_session_id === "string"
        ? row.stripe_checkout_session_id
        : null,
    stripePaymentIntentId:
      typeof row.stripe_payment_intent_id === "string"
        ? row.stripe_payment_intent_id
        : null,
    amountCents: Number(row.amount_cents),
    currency: String(row.currency ?? "USD"),
    status: row.status as ApplicationPaymentStatus,
    paidAt: typeof row.paid_at === "string" ? row.paid_at : null,
  };
}

export async function createApplicationPayment(
  supabase: SupabaseClient,
  input: {
    organizationId: string;
    applicationId: string;
    amountCents: number;
    currency?: string;
    stripeCheckoutSessionId?: string;
  },
): Promise<ApplicationPayment> {
  const { data, error } = await supabase
    .from("application_payments")
    .insert({
      organization_id: input.organizationId,
      application_id: input.applicationId,
      amount_cents: input.amountCents,
      currency: input.currency ?? "USD",
      status: "pending",
      stripe_checkout_session_id: input.stripeCheckoutSessionId ?? null,
    })
    .select("*")
    .single();

  if (error) throw error;
  return rowToPayment(data as Record<string, unknown>);
}

export async function getApplicationPaymentByCheckoutSession(
  supabase: SupabaseClient,
  checkoutSessionId: string,
): Promise<ApplicationPayment | null> {
  const { data, error } = await supabase
    .from("application_payments")
    .select("*")
    .eq("stripe_checkout_session_id", checkoutSessionId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  return rowToPayment(data as Record<string, unknown>);
}

export async function markApplicationPaymentSucceeded(
  supabase: SupabaseClient,
  paymentId: string,
  input: {
    stripePaymentIntentId?: string;
    stripeCheckoutSessionId?: string;
  },
): Promise<ApplicationPayment | null> {
  const { data: existing, error: existingError } = await supabase
    .from("application_payments")
    .select("*")
    .eq("id", paymentId)
    .maybeSingle();

  if (existingError) throw existingError;
  if (!existing) return null;

  if (existing.status === "succeeded") {
    return rowToPayment(existing as Record<string, unknown>);
  }

  const updatePayload: Record<string, unknown> = {
    status: "succeeded",
    paid_at: new Date().toISOString(),
  };

  if (input.stripePaymentIntentId) {
    updatePayload.stripe_payment_intent_id = input.stripePaymentIntentId;
  }
  if (input.stripeCheckoutSessionId) {
    updatePayload.stripe_checkout_session_id = input.stripeCheckoutSessionId;
  }

  const { data, error } = await supabase
    .from("application_payments")
    .update(updatePayload)
    .eq("id", paymentId)
    .eq("status", "pending")
    .select("*")
    .maybeSingle();

  if (error) throw error;
  if (data) {
    return rowToPayment(data as Record<string, unknown>);
  }

  const { data: current, error: currentError } = await supabase
    .from("application_payments")
    .select("*")
    .eq("id", paymentId)
    .maybeSingle();

  if (currentError) throw currentError;
  return current ? rowToPayment(current as Record<string, unknown>) : null;
}

export async function attachCheckoutSessionToPayment(
  supabase: SupabaseClient,
  paymentId: string,
  checkoutSessionId: string,
): Promise<void> {
  const { error } = await supabase
    .from("application_payments")
    .update({ stripe_checkout_session_id: checkoutSessionId })
    .eq("id", paymentId);

  if (error) throw error;
}
