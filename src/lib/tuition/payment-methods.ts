import type { SupabaseClient } from "@supabase/supabase-js";
import type Stripe from "stripe";

export type PaymentMethodDisplayFields = {
  brand?: string;
  last4?: string;
  expMonth?: number;
  expYear?: number;
};

export function extractPaymentMethodDisplayFields(
  paymentMethod: Stripe.PaymentMethod,
): PaymentMethodDisplayFields {
  if (paymentMethod.card) {
    return {
      brand: paymentMethod.card.brand,
      last4: paymentMethod.card.last4 ?? undefined,
      expMonth: paymentMethod.card.exp_month,
      expYear: paymentMethod.card.exp_year,
    };
  }

  if (paymentMethod.us_bank_account) {
    return {
      brand: paymentMethod.us_bank_account.bank_name ?? "Bank account",
      last4: paymentMethod.us_bank_account.last4 ?? undefined,
    };
  }

  return {};
}

export type SavedPaymentMethodSummary = {
  brand: string | null;
  last4: string | null;
  expMonth: number | null;
  expYear: number | null;
};

function mapPaymentMethodRow(
  row: Record<string, unknown>,
): SavedPaymentMethodSummary {
  return {
    brand: typeof row.brand === "string" ? row.brand : null,
    last4: typeof row.last4 === "string" ? row.last4 : null,
    expMonth: typeof row.exp_month === "number" ? row.exp_month : null,
    expYear: typeof row.exp_year === "number" ? row.exp_year : null,
  };
}

export async function getDefaultPaymentMethodForGuardian(
  supabase: SupabaseClient,
  input: {
    billingAccountId: string;
    guardianId: string | null;
    defaultPaymentMethodId?: string | null;
  },
): Promise<SavedPaymentMethodSummary | null> {
  let query = supabase
    .from("family_payment_methods")
    .select("brand, last4, exp_month, exp_year")
    .eq("billing_account_id", input.billingAccountId)
    .eq("is_default", true);

  if (input.guardianId) {
    query = query.eq("guardian_id", input.guardianId);
  } else {
    query = query.is("guardian_id", null);
  }

  const { data, error } = await query.maybeSingle();
  if (error) throw error;
  if (data) {
    return mapPaymentMethodRow(data as Record<string, unknown>);
  }

  if (!input.guardianId && input.defaultPaymentMethodId) {
    const { data: fallback, error: fallbackError } = await supabase
      .from("family_payment_methods")
      .select("brand, last4, exp_month, exp_year")
      .eq("billing_account_id", input.billingAccountId)
      .eq("stripe_payment_method_id", input.defaultPaymentMethodId)
      .maybeSingle();

    if (fallbackError) throw fallbackError;
    if (fallback) {
      return mapPaymentMethodRow(fallback as Record<string, unknown>);
    }
  }

  return null;
}

export async function familyHasPaymentMethod(
  supabase: SupabaseClient,
  billingAccountId: string,
  defaultPaymentMethodId?: string | null,
): Promise<boolean> {
  const { count, error } = await supabase
    .from("family_payment_methods")
    .select("id", { count: "exact", head: true })
    .eq("billing_account_id", billingAccountId);

  if (error) throw error;
  if ((count ?? 0) > 0) return true;
  return Boolean(defaultPaymentMethodId);
}

export function formatPaymentMethodLabel(
  method: SavedPaymentMethodSummary | null,
): string | null {
  if (!method?.last4) return null;
  const brand = method.brand
    ? method.brand.charAt(0).toUpperCase() + method.brand.slice(1)
    : "Card";
  return `${brand} •••• ${method.last4}`;
}

export async function removeFamilyPaymentMethod(
  supabase: SupabaseClient,
  input: {
    billingAccountId: string;
    stripePaymentMethodId: string;
    guardianId?: string | null;
  },
): Promise<void> {
  let deleteQuery = supabase
    .from("family_payment_methods")
    .delete()
    .eq("billing_account_id", input.billingAccountId)
    .eq("stripe_payment_method_id", input.stripePaymentMethodId);

  if (input.guardianId) {
    deleteQuery = deleteQuery.eq("guardian_id", input.guardianId);
  }

  const { error: deleteError } = await deleteQuery;
  if (deleteError) throw deleteError;

  const { data: billingAccount, error: billingError } = await supabase
    .from("tuition_billing_accounts")
    .select("default_payment_method_id")
    .eq("id", input.billingAccountId)
    .maybeSingle();

  if (billingError) throw billingError;

  if (billingAccount?.default_payment_method_id === input.stripePaymentMethodId) {
    const { error: updateError } = await supabase
      .from("tuition_billing_accounts")
      .update({ default_payment_method_id: null })
      .eq("id", input.billingAccountId);

    if (updateError) throw updateError;
  }
}
