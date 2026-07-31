import type { SupabaseClient } from "@supabase/supabase-js";
import type { PaymentRecord } from "@/lib/stripe/application-payments";
import { settleTuitionPayment } from "./payment-settlement";

export async function createTuitionPaymentRecord(
  supabase: SupabaseClient,
  input: {
    organizationId: string;
    familyId: string;
    tuitionChargeId: string;
    amountCents: number;
    label: string;
    payerUserId?: string;
    currency?: string;
    stripeCheckoutSessionId?: string;
    chargedAmountCents?: number;
    processingFeeCents?: number;
    paymentMethodType?: "card" | "us_bank_account";
  },
): Promise<PaymentRecord> {
  const { data, error } = await supabase
    .from("application_payments")
    .insert({
      organization_id: input.organizationId,
      application_id: null,
      family_id: input.familyId,
      tuition_charge_id: input.tuitionChargeId,
      payment_type: "tuition",
      label: input.label,
      amount_cents: input.amountCents,
      charged_amount_cents: input.chargedAmountCents ?? null,
      processing_fee_cents: input.processingFeeCents ?? null,
      payment_method_type: input.paymentMethodType ?? null,
      payer_user_id: input.payerUserId ?? null,
      currency: input.currency ?? "USD",
      status: "pending",
      stripe_checkout_session_id: input.stripeCheckoutSessionId ?? null,
    })
    .select("*")
    .single();

  if (error) throw error;

  return {
    id: String(data.id),
    organizationId: String(data.organization_id),
    applicationId: null,
    familyId: input.familyId,
    tuitionChargeId: input.tuitionChargeId,
    paymentType: "tuition",
    enrollmentChecklistItemId: null,
    label: typeof data.label === "string" ? data.label : null,
    payerUserId:
      typeof data.payer_user_id === "string" ? data.payer_user_id : null,
    stripeCheckoutSessionId:
      typeof data.stripe_checkout_session_id === "string"
        ? data.stripe_checkout_session_id
        : null,
    stripePaymentIntentId: null,
    amountCents: Number(data.amount_cents),
    chargedAmountCents:
      typeof data.charged_amount_cents === "number"
        ? data.charged_amount_cents
        : null,
    processingFeeCents:
      typeof data.processing_fee_cents === "number"
        ? data.processing_fee_cents
        : null,
    paymentMethodType:
      data.payment_method_type === "card" ||
      data.payment_method_type === "us_bank_account"
        ? data.payment_method_type
        : null,
    currency: String(data.currency ?? "USD"),
    status: "pending",
    paidAt: null,
    createdAt: String(data.created_at),
  };
}

export async function listTuitionPaymentsForFamily(
  supabase: SupabaseClient,
  familyId: string,
): Promise<PaymentRecord[]> {
  const { data, error } = await supabase
    .from("application_payments")
    .select("*")
    .eq("family_id", familyId)
    .eq("payment_type", "tuition")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: String(row.id),
    organizationId: String(row.organization_id),
    applicationId: null,
    familyId:
      typeof row.family_id === "string" ? row.family_id : familyId,
    tuitionChargeId:
      typeof row.tuition_charge_id === "string" ? row.tuition_charge_id : null,
    paymentType: "tuition" as const,
    enrollmentChecklistItemId: null,
    label: typeof row.label === "string" ? row.label : null,
    payerUserId:
      typeof row.payer_user_id === "string" ? row.payer_user_id : null,
    stripeCheckoutSessionId:
      typeof row.stripe_checkout_session_id === "string"
        ? row.stripe_checkout_session_id
        : null,
    stripePaymentIntentId:
      typeof row.stripe_payment_intent_id === "string"
        ? row.stripe_payment_intent_id
        : null,
    amountCents: Number(row.amount_cents),
    chargedAmountCents:
      typeof row.charged_amount_cents === "number"
        ? row.charged_amount_cents
        : null,
    processingFeeCents:
      typeof row.processing_fee_cents === "number"
        ? row.processing_fee_cents
        : null,
    paymentMethodType:
      row.payment_method_type === "card" ||
      row.payment_method_type === "us_bank_account"
        ? row.payment_method_type
        : null,
    currency: String(row.currency ?? "USD"),
    status: row.status as PaymentRecord["status"],
    paidAt: typeof row.paid_at === "string" ? row.paid_at : null,
    createdAt: String(row.created_at),
  }));
}

export async function recordManualTuitionPayment(
  supabase: SupabaseClient,
  input: {
    organizationId: string;
    familyId: string;
    tuitionChargeId: string;
    amountCents: number;
    label: string;
    payerUserId?: string;
  },
): Promise<void> {
  const { data: payment, error: paymentError } = await supabase
    .from("application_payments")
    .insert({
      organization_id: input.organizationId,
      family_id: input.familyId,
      tuition_charge_id: input.tuitionChargeId,
      payment_type: "tuition",
      label: input.label,
      amount_cents: input.amountCents,
      amount_applied_cents: input.amountCents,
      payer_user_id: input.payerUserId ?? null,
      status: "succeeded",
      paid_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (paymentError) throw paymentError;

  await settleTuitionPayment(supabase, {
    chargeId: input.tuitionChargeId,
    amountCents: input.amountCents,
    payerUserId: input.payerUserId ?? null,
    paymentId: String(payment.id),
  });
}
