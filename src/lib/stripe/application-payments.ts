import type { SupabaseClient } from "@supabase/supabase-js";

export type PaymentStatus = "pending" | "succeeded" | "failed" | "refunded";

export type PaymentType = "application_fee" | "enrollment_checklist" | "tuition";

export type PaymentMethodType = "card" | "us_bank_account";

export type PaymentRecord = {
  id: string;
  organizationId: string;
  applicationId: string | null;
  familyId: string | null;
  tuitionChargeId: string | null;
  paymentType: PaymentType;
  enrollmentChecklistItemId: string | null;
  label: string | null;
  payerUserId: string | null;
  stripeCheckoutSessionId: string | null;
  stripePaymentIntentId: string | null;
  amountCents: number;
  chargedAmountCents: number | null;
  processingFeeCents: number | null;
  paymentMethodType: PaymentMethodType | null;
  currency: string;
  status: PaymentStatus;
  paidAt: string | null;
  createdAt: string;
};

/** @deprecated Use PaymentRecord */
export type ApplicationPaymentStatus = PaymentStatus;

/** @deprecated Use PaymentRecord */
export type ApplicationPayment = PaymentRecord;

export type ListPaymentRecordsFilters = {
  organizationId?: string;
  applicationId?: string;
  paymentType?: PaymentType;
  status?: PaymentStatus;
  limit?: number;
};

function rowToPayment(row: Record<string, unknown>): PaymentRecord {
  return {
    id: String(row.id),
    organizationId: String(row.organization_id),
    applicationId:
      typeof row.application_id === "string" ? row.application_id : null,
    familyId: typeof row.family_id === "string" ? row.family_id : null,
    tuitionChargeId:
      typeof row.tuition_charge_id === "string" ? row.tuition_charge_id : null,
    paymentType: (row.payment_type as PaymentType) ?? "application_fee",
    enrollmentChecklistItemId:
      typeof row.enrollment_checklist_item_id === "string"
        ? row.enrollment_checklist_item_id
        : null,
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
    status: row.status as PaymentStatus,
    paidAt: typeof row.paid_at === "string" ? row.paid_at : null,
    createdAt: typeof row.created_at === "string" ? row.created_at : "",
  };
}

export async function createPaymentRecord(
  supabase: SupabaseClient,
  input: {
    organizationId: string;
    applicationId: string;
    amountCents: number;
    paymentType?: PaymentType;
    label?: string;
    enrollmentChecklistItemId?: string;
    payerUserId?: string;
    currency?: string;
    stripeCheckoutSessionId?: string;
    chargedAmountCents?: number;
    processingFeeCents?: number;
    paymentMethodType?: PaymentMethodType;
  },
): Promise<PaymentRecord> {
  const { data, error } = await supabase
    .from("application_payments")
    .insert({
      organization_id: input.organizationId,
      application_id: input.applicationId,
      amount_cents: input.amountCents,
      charged_amount_cents: input.chargedAmountCents ?? input.amountCents,
      processing_fee_cents: input.processingFeeCents ?? 0,
      payment_method_type: input.paymentMethodType ?? null,
      currency: input.currency ?? "USD",
      status: "pending",
      payment_type: input.paymentType ?? "application_fee",
      label: input.label ?? null,
      enrollment_checklist_item_id: input.enrollmentChecklistItemId ?? null,
      payer_user_id: input.payerUserId ?? null,
      stripe_checkout_session_id: input.stripeCheckoutSessionId ?? null,
    })
    .select("*")
    .single();

  if (error) throw error;
  return rowToPayment(data as Record<string, unknown>);
}

export async function createApplicationPayment(
  supabase: SupabaseClient,
  input: {
    organizationId: string;
    applicationId: string;
    amountCents: number;
    currency?: string;
    stripeCheckoutSessionId?: string;
    label?: string;
    payerUserId?: string;
    chargedAmountCents?: number;
    processingFeeCents?: number;
    paymentMethodType?: PaymentMethodType;
  },
): Promise<PaymentRecord> {
  return createPaymentRecord(supabase, {
    ...input,
    paymentType: "application_fee",
    label: input.label ?? "Application fee",
  });
}

export async function getPaymentById(
  supabase: SupabaseClient,
  paymentId: string,
): Promise<PaymentRecord | null> {
  const { data, error } = await supabase
    .from("application_payments")
    .select("*")
    .eq("id", paymentId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  return rowToPayment(data as Record<string, unknown>);
}

export async function getApplicationPaymentByCheckoutSession(
  supabase: SupabaseClient,
  checkoutSessionId: string,
): Promise<PaymentRecord | null> {
  const { data, error } = await supabase
    .from("application_payments")
    .select("*")
    .eq("stripe_checkout_session_id", checkoutSessionId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  return rowToPayment(data as Record<string, unknown>);
}

export async function getPaymentByChecklistItem(
  supabase: SupabaseClient,
  checklistItemId: string,
  options?: { status?: PaymentStatus },
): Promise<PaymentRecord | null> {
  let query = supabase
    .from("application_payments")
    .select("*")
    .eq("enrollment_checklist_item_id", checklistItemId)
    .order("created_at", { ascending: false })
    .limit(1);

  if (options?.status) {
    query = query.eq("status", options.status);
  }

  const { data, error } = await query.maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return rowToPayment(data as Record<string, unknown>);
}

export async function listPaymentRecords(
  supabase: SupabaseClient,
  filters: ListPaymentRecordsFilters = {},
): Promise<PaymentRecord[]> {
  let query = supabase
    .from("application_payments")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(filters.limit ?? 500);

  if (filters.organizationId) {
    query = query.eq("organization_id", filters.organizationId);
  }
  if (filters.applicationId) {
    query = query.eq("application_id", filters.applicationId);
  }
  if (filters.paymentType) {
    query = query.eq("payment_type", filters.paymentType);
  }
  if (filters.status) {
    query = query.eq("status", filters.status);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map((row) =>
    rowToPayment(row as Record<string, unknown>),
  );
}

export async function markPaymentSucceeded(
  supabase: SupabaseClient,
  paymentId: string,
  input: {
    stripePaymentIntentId?: string;
    stripeCheckoutSessionId?: string;
  } = {},
): Promise<PaymentRecord | null> {
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

/** @deprecated Use markPaymentSucceeded */
export const markApplicationPaymentSucceeded = markPaymentSucceeded;

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
