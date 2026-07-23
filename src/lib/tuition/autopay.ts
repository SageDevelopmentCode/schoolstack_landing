import type { SupabaseClient } from "@supabase/supabase-js";
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
): Promise<{ processed: number; skipped: number }> {
  const today = new Date().toISOString().slice(0, 10);

  const { data: accounts, error: accountsError } = await supabase
    .from("tuition_billing_accounts")
    .select("id, family_id, default_payment_method_id")
    .eq("organization_id", organizationId)
    .eq("autopay_enabled", true)
    .not("default_payment_method_id", "is", null);

  if (accountsError) throw accountsError;

  let processed = 0;
  let skipped = 0;

  for (const account of accounts ?? []) {
    const { data: dueCharges, error: chargesError } = await supabase
      .from("tuition_charges")
      .select("id, amount_cents, label")
      .eq("family_id", account.family_id)
      .eq("due_date", today)
      .in("status", ["scheduled", "sent"]);

    if (chargesError) throw chargesError;
    if (!dueCharges?.length) {
      skipped++;
      continue;
    }

    // Autopay charge execution is delegated to Stripe PaymentIntents in API layer.
    // This function identifies due charges for cron/edge invocation.
    processed += dueCharges.length;
  }

  return { processed, skipped };
}

export async function refundTuitionPayment(
  supabase: SupabaseClient,
  paymentId: string,
): Promise<void> {
  const { data: payment, error: paymentError } = await supabase
    .from("application_payments")
    .select("id, tuition_charge_id, status")
    .eq("id", paymentId)
    .eq("payment_type", "tuition")
    .maybeSingle();

  if (paymentError) throw paymentError;
  if (!payment) throw new Error("Tuition payment not found");

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
