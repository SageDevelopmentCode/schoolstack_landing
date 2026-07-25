import type { SupabaseClient } from "@supabase/supabase-js";
import { getStripeClient } from "@/lib/stripe/client";
import { executeTuitionAutopayCharge } from "@/lib/stripe/tuition-autopay-charge";
import {
  getOrganizationPaymentAccount,
  isPaymentReady,
} from "@/lib/stripe/organization-payment-account";
import { createAdjustment } from "./adjustments";
import { regenerateFutureCharges } from "./charge-generator";
import { rowToBillingAccount } from "./row-mappers";
import type { AdjustmentType, TuitionBillingAccount } from "./types";

export async function setAutopayEnabled(
  supabase: SupabaseClient,
  organizationId: string,
  familyId: string,
  enabled: boolean,
): Promise<TuitionBillingAccount> {
  const { data: existing, error: existingError } = await supabase
    .from("tuition_billing_accounts")
    .select("*")
    .eq("organization_id", organizationId)
    .eq("family_id", familyId)
    .maybeSingle();

  if (existingError) throw existingError;

  if (existing) {
    const { data, error } = await supabase
      .from("tuition_billing_accounts")
      .update({ autopay_enabled: enabled })
      .eq("id", existing.id)
      .select("*")
      .single();

    if (error) throw error;
    return rowToBillingAccount(data);
  }

  const { data, error } = await supabase
    .from("tuition_billing_accounts")
    .insert({
      organization_id: organizationId,
      family_id: familyId,
      autopay_enabled: enabled,
    })
    .select("*")
    .single();

  if (error) throw error;
  return rowToBillingAccount(data);
}

export async function saveFamilyPaymentMethod(
  supabase: SupabaseClient,
  input: {
    organizationId: string;
    familyId: string;
    billingAccountId: string;
    stripePaymentMethodId: string;
    brand?: string;
    last4?: string;
    expMonth?: number;
    expYear?: number;
    isDefault?: boolean;
  },
): Promise<void> {
  if (input.isDefault) {
    await supabase
      .from("family_payment_methods")
      .update({ is_default: false })
      .eq("billing_account_id", input.billingAccountId);
  }

  const { error } = await supabase.from("family_payment_methods").upsert(
    {
      organization_id: input.organizationId,
      family_id: input.familyId,
      billing_account_id: input.billingAccountId,
      stripe_payment_method_id: input.stripePaymentMethodId,
      brand: input.brand ?? null,
      last4: input.last4 ?? null,
      exp_month: input.expMonth ?? null,
      exp_year: input.expYear ?? null,
      is_default: input.isDefault ?? true,
    },
    { onConflict: "organization_id,stripe_payment_method_id" },
  );

  if (error) throw error;

  await supabase
    .from("tuition_billing_accounts")
    .update({ default_payment_method_id: input.stripePaymentMethodId })
    .eq("id", input.billingAccountId);
}

export async function trySaveTuitionPaymentMethod(
  supabase: SupabaseClient,
  input: {
    organizationId: string;
    familyId: string;
    paymentIntentId: string;
    payerUserId?: string | null;
  },
): Promise<void> {
  const stripe = getStripeClient();
  const paymentIntent = await stripe.paymentIntents.retrieve(input.paymentIntentId);
  const paymentMethodId =
    typeof paymentIntent.payment_method === "string"
      ? paymentIntent.payment_method
      : paymentIntent.payment_method?.id;

  if (!paymentMethodId) return;

  const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);
  const card = paymentMethod.card;

  const { data: billingAccount, error: billingError } = await supabase
    .from("tuition_billing_accounts")
    .select("id")
    .eq("organization_id", input.organizationId)
    .eq("family_id", input.familyId)
    .maybeSingle();

  if (billingError) throw billingError;
  if (!billingAccount) return;

  await saveFamilyPaymentMethod(supabase, {
    organizationId: input.organizationId,
    familyId: input.familyId,
    billingAccountId: String(billingAccount.id),
    stripePaymentMethodId: paymentMethodId,
    brand: card?.brand,
    last4: card?.last4,
    expMonth: card?.exp_month,
    expYear: card?.exp_year,
    isDefault: true,
  });
}

export type FinancialAidImportRow = {
  familyEmail: string;
  adjustmentType: AdjustmentType;
  valuePercent?: number;
  valueCents?: number;
  reason: string;
};

function parseCsvRows(csvContent: string): Array<Record<string, string>> {
  const lines = csvContent
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map((h) => h.trim());
  return lines.slice(1).map((line) => {
    const values = line.split(",").map((v) => v.trim());
    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header] = values[index] ?? "";
    });
    return row;
  });
}

export async function importFinancialAidCsv(
  supabase: SupabaseClient,
  organizationId: string,
  csvContent: string,
  createdByUserId?: string,
): Promise<{ imported: number; skipped: number }> {
  const rows = parseCsvRows(csvContent);

  let imported = 0;
  let skipped = 0;

  for (const row of rows) {
    const familyEmail = row.family_email ?? row.email;
    if (!familyEmail) {
      skipped++;
      continue;
    }

    const { data: family, error: familyError } = await supabase
      .from("families")
      .select("id")
      .eq("organization_id", organizationId)
      .eq("primary_email", familyEmail)
      .maybeSingle();

    if (familyError) throw familyError;
    if (!family) {
      skipped++;
      continue;
    }

    const { data: assignment, error: assignmentError } = await supabase
      .from("tuition_enrollment_assignments")
      .select("id")
      .eq("family_id", family.id)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (assignmentError) throw assignmentError;
    if (!assignment) {
      skipped++;
      continue;
    }

    const adjustmentType = (row.adjustment_type ?? "percent_discount") as AdjustmentType;

    await createAdjustment(supabase, {
      organizationId,
      assignmentId: String(assignment.id),
      adjustmentType,
      valuePercent: row.value_percent ? Number(row.value_percent) : null,
      valueCents: row.value_cents ? Number(row.value_cents) : null,
      reason: row.reason ?? "Financial aid import",
      source: "import",
      createdByUserId,
    });

    await regenerateFutureCharges(supabase, String(assignment.id));
    imported++;
  }

  return { imported, skipped };
}

export async function processAutopayForOrganization(
  supabase: SupabaseClient,
  organizationId: string,
): Promise<{ processed: number; skipped: number; failed: number }> {
  const today = new Date().toISOString().slice(0, 10);

  const paymentAccount = await getOrganizationPaymentAccount(supabase, organizationId);
  const stripeConnectAccountId = paymentAccount?.stripeConnectAccountId;
  if (!paymentAccount || !stripeConnectAccountId || !isPaymentReady(paymentAccount)) {
    return { processed: 0, skipped: 0, failed: 0 };
  }

  const { data: accounts, error: accountsError } = await supabase
    .from("tuition_billing_accounts")
    .select("id, family_id, default_payment_method_id")
    .eq("organization_id", organizationId)
    .eq("autopay_enabled", true)
    .not("default_payment_method_id", "is", null);

  if (accountsError) throw accountsError;

  let processed = 0;
  let skipped = 0;
  let failed = 0;

  for (const account of accounts ?? []) {
    const { data: dueCharges, error: chargesError } = await supabase
      .from("tuition_charges")
      .select("id, amount_cents, label, currency")
      .eq("family_id", account.family_id)
      .eq("due_date", today)
      .in("status", ["scheduled", "sent"]);

    if (chargesError) throw chargesError;
    if (!dueCharges?.length) {
      skipped++;
      continue;
    }

    const { data: guardian, error: guardianError } = await supabase
      .from("guardians")
      .select("user_id, email")
      .eq("family_id", account.family_id)
      .not("user_id", "is", null)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (guardianError) throw guardianError;
    if (!guardian?.user_id) {
      skipped += dueCharges.length;
      continue;
    }

    const { data: stripeCustomer, error: customerError } = await supabase
      .from("user_stripe_customers")
      .select("stripe_customer_id")
      .eq("user_id", guardian.user_id)
      .maybeSingle();

    if (customerError) throw customerError;
    if (!stripeCustomer?.stripe_customer_id) {
      skipped += dueCharges.length;
      continue;
    }

    for (const charge of dueCharges) {
      try {
        await executeTuitionAutopayCharge(supabase, {
          organizationId,
          familyId: String(account.family_id),
          chargeId: String(charge.id),
          amountCents: Number(charge.amount_cents),
          label: String(charge.label),
          currency: typeof charge.currency === "string" ? charge.currency : "USD",
          stripeConnectAccountId,
          stripeCustomerId: stripeCustomer.stripe_customer_id,
          stripePaymentMethodId: String(account.default_payment_method_id),
          payerUserId: String(guardian.user_id),
        });
        processed++;
      } catch (error) {
        console.error("Autopay charge failed:", charge.id, error);
        failed++;
      }
    }
  }

  return { processed, skipped, failed };
}

export async function refundTuitionPayment(
  supabase: SupabaseClient,
  paymentId: string,
): Promise<void> {
  const { data: payment, error: paymentError } = await supabase
    .from("application_payments")
    .select("id, tuition_charge_id, status, stripe_payment_intent_id, amount_cents")
    .eq("id", paymentId)
    .eq("payment_type", "tuition")
    .maybeSingle();

  if (paymentError) throw paymentError;
  if (!payment) throw new Error("Tuition payment not found");
  if (payment.status !== "succeeded") {
    throw new Error("Only succeeded payments can be refunded.");
  }

  if (payment.stripe_payment_intent_id) {
    const stripe = getStripeClient();
    await stripe.refunds.create({
      payment_intent: payment.stripe_payment_intent_id,
    });
  }

  const { error: updateError } = await supabase
    .from("application_payments")
    .update({ status: "refunded" })
    .eq("id", paymentId);

  if (updateError) throw updateError;

  if (payment.tuition_charge_id) {
    await supabase
      .from("tuition_charges")
      .update({ status: "scheduled", paid_at: null })
      .eq("id", payment.tuition_charge_id);
  }
}
