import type { SupabaseClient } from "@supabase/supabase-js";
import { getStripeClient } from "@/lib/stripe/client";
import { isStripeTestMode } from "@/lib/stripe/connect-status";
import {
  isPaymentMethodMissingError,
  paymentMethodExistsOnPlatform,
} from "@/lib/stripe/payment-method-validation";
import { executeTuitionAutopayCharge } from "@/lib/stripe/tuition-autopay-charge";
import {
  getOrganizationPaymentAccount,
  isPaymentReady,
} from "@/lib/stripe/organization-payment-account";
import { createAdjustment } from "./adjustments";
import { chargeRemainingCents } from "./billing-splits";
import { regenerateFutureCharges } from "./charge-generator";
import {
  notifyAutopayFailed,
  notifyAutopaySucceeded,
} from "./autopay-notifications";
import {
  AUTOPAY_LINES_PER_ORG_CAP,
  buildFamilyLabel,
  type AutopayLineItem,
  type AutopayOrgResult,
  type AutopaySkipReason,
} from "./autopay-cron-report";
import { rowToBillingAccount } from "./row-mappers";
import {
  extractPaymentMethodDisplayFields,
  removeFamilyPaymentMethod,
} from "./payment-methods";
import type { AdjustmentType, TuitionBillingAccount } from "./types";
import {
  ACTIVITY_ACTIONS,
  logTuitionActivity,
  summarizeFinancialAidImport,
  summarizePaymentAction,
  type TuitionActivityOptions,
} from "./tuition-activity";

const STALE_PAYMENT_METHOD_MESSAGE =
  "Saved payment method is no longer valid for autopay. Please re-save your card on the billing page.";

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

async function syncBillingAccountDefaultPaymentMethod(
  supabase: SupabaseClient,
  billingAccountId: string,
  stripePaymentMethodId: string,
): Promise<void> {
  const { error } = await supabase
    .from("tuition_billing_accounts")
    .update({ default_payment_method_id: stripePaymentMethodId })
    .eq("id", billingAccountId);

  if (error) throw error;
}

export async function saveFamilyPaymentMethod(
  supabase: SupabaseClient,
  input: {
    organizationId: string;
    familyId: string;
    billingAccountId: string;
    stripePaymentMethodId: string;
    guardianId?: string | null;
    brand?: string;
    last4?: string;
    expMonth?: number;
    expYear?: number;
    isDefault?: boolean;
  },
): Promise<void> {
  const isDefault = input.isDefault ?? true;
  const rowPayload = {
    stripe_payment_method_id: input.stripePaymentMethodId,
    brand: input.brand ?? null,
    last4: input.last4 ?? null,
    exp_month: input.expMonth ?? null,
    exp_year: input.expYear ?? null,
    is_default: isDefault,
  };

  if (input.guardianId) {
    const { error } = await supabase.from("family_payment_methods").upsert(
      {
        organization_id: input.organizationId,
        family_id: input.familyId,
        billing_account_id: input.billingAccountId,
        guardian_id: input.guardianId,
        ...rowPayload,
      },
      { onConflict: "billing_account_id,guardian_id" },
    );
    if (error) throw error;

    if (isDefault) {
      await syncBillingAccountDefaultPaymentMethod(
        supabase,
        input.billingAccountId,
        input.stripePaymentMethodId,
      );
    }
    return;
  }

  if (isDefault) {
    await supabase
      .from("family_payment_methods")
      .update({ is_default: false })
      .eq("billing_account_id", input.billingAccountId)
      .is("guardian_id", null);
  }

  const { error } = await supabase.from("family_payment_methods").upsert(
    {
      organization_id: input.organizationId,
      family_id: input.familyId,
      billing_account_id: input.billingAccountId,
      guardian_id: null,
      ...rowPayload,
    },
    { onConflict: "organization_id,stripe_payment_method_id" },
  );

  if (error) throw error;

  await syncBillingAccountDefaultPaymentMethod(
    supabase,
    input.billingAccountId,
    input.stripePaymentMethodId,
  );
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
  const displayFields = extractPaymentMethodDisplayFields(paymentMethod);

  const { data: billingAccount, error: billingError } = await supabase
    .from("tuition_billing_accounts")
    .select("id")
    .eq("organization_id", input.organizationId)
    .eq("family_id", input.familyId)
    .maybeSingle();

  if (billingError) throw billingError;
  if (!billingAccount) return;

  let guardianId: string | null = null;
  if (input.payerUserId) {
    const { data: guardian } = await supabase
      .from("guardians")
      .select("id")
      .eq("family_id", input.familyId)
      .eq("user_id", input.payerUserId)
      .maybeSingle();
    guardianId = guardian ? String(guardian.id) : null;
  }

  await saveFamilyPaymentMethod(supabase, {
    organizationId: input.organizationId,
    familyId: input.familyId,
    billingAccountId: String(billingAccount.id),
    stripePaymentMethodId: paymentMethodId,
    guardianId,
    ...displayFields,
    isDefault: true,
  });
}

export async function savePaymentMethodFromSetupIntent(
  supabase: SupabaseClient,
  input: {
    organizationId: string;
    familyId: string;
    setupIntentId: string;
    payerUserId?: string | null;
    guardianId?: string | null;
  },
): Promise<{ last4?: string; brand?: string } | null> {
  const stripe = getStripeClient();
  const setupIntent = await stripe.setupIntents.retrieve(input.setupIntentId);
  const paymentMethodId =
    typeof setupIntent.payment_method === "string"
      ? setupIntent.payment_method
      : setupIntent.payment_method?.id;

  if (!paymentMethodId) return null;

  const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);
  const displayFields = extractPaymentMethodDisplayFields(paymentMethod);

  const { data: billingAccount, error: billingError } = await supabase
    .from("tuition_billing_accounts")
    .select("id")
    .eq("organization_id", input.organizationId)
    .eq("family_id", input.familyId)
    .maybeSingle();

  if (billingError) throw billingError;
  if (!billingAccount) return null;

  let guardianId = input.guardianId ?? null;
  if (!guardianId && input.payerUserId) {
    const { data: guardian } = await supabase
      .from("guardians")
      .select("id")
      .eq("family_id", input.familyId)
      .eq("user_id", input.payerUserId)
      .maybeSingle();
    guardianId = guardian ? String(guardian.id) : null;
  }

  await saveFamilyPaymentMethod(supabase, {
    organizationId: input.organizationId,
    familyId: input.familyId,
    billingAccountId: String(billingAccount.id),
    stripePaymentMethodId: paymentMethodId,
    guardianId,
    ...displayFields,
    isDefault: true,
  });

  return displayFields;
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
  options?: TuitionActivityOptions,
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
    }, { skip: true });

    await regenerateFutureCharges(supabase, String(assignment.id));
    imported++;
  }

  if (imported > 0 || skipped > 0) {
    void logTuitionActivity(supabase, {
      organizationId,
      action: ACTIVITY_ACTIONS.TUITION_ADJUSTMENT_CREATED,
      entityType: "organization",
      entityId: organizationId,
      summary: "Imported financial aid adjustments",
      changeSummary: summarizeFinancialAidImport({ imported, skipped }),
      logWhenEmpty: true,
      metadata: { imported, skipped, source: "import" },
      context: options?.context,
    });
  }

  return { imported, skipped };
}

function emptyAutopayOrgResult(): AutopayOrgResult {
  return {
    processed: 0,
    skipped: 0,
    failed: 0,
    attempted: 0,
    dueCandidates: 0,
    lines: [],
    truncated: false,
  };
}

function pushAutopayLine(
  lines: AutopayLineItem[],
  line: AutopayLineItem,
  state: { truncated: boolean },
): void {
  if (lines.length >= AUTOPAY_LINES_PER_ORG_CAP) {
    state.truncated = true;
    return;
  }
  lines.push(line);
}

function recordSkippedDueCharges(input: {
  lines: AutopayLineItem[];
  lineState: { truncated: boolean };
  dueCharges: Array<{
    id: string | number;
    amount_cents: number;
    paid_cents?: number | null;
    label: string;
  }>;
  skipReason: AutopaySkipReason;
  organizationSlug: string;
  familyId: string;
  familyLabel: string;
  counters: { skipped: number; dueCandidates: number };
}): void {
  for (const charge of input.dueCharges) {
    const amountCents = chargeRemainingCents({
      amountCents: Number(charge.amount_cents),
      paidCents: Number(charge.paid_cents ?? 0),
    });
    if (amountCents <= 0) {
      input.counters.skipped++;
      pushAutopayLine(
        input.lines,
        {
          organizationSlug: input.organizationSlug,
          familyId: input.familyId,
          familyLabel: input.familyLabel,
          chargeId: String(charge.id),
          chargeLabel: String(charge.label),
          amountCents: 0,
          outcome: "skipped",
          skipReason: "zero_balance",
        },
        input.lineState,
      );
      continue;
    }

    input.counters.dueCandidates++;
    input.counters.skipped++;
    pushAutopayLine(
      input.lines,
      {
        organizationSlug: input.organizationSlug,
        familyId: input.familyId,
        familyLabel: input.familyLabel,
        chargeId: String(charge.id),
        chargeLabel: String(charge.label),
        amountCents,
        outcome: "skipped",
        skipReason: input.skipReason,
      },
      input.lineState,
    );
  }
}

export async function processAutopayForOrganization(
  supabase: SupabaseClient,
  organizationId: string,
): Promise<AutopayOrgResult> {
  const today = new Date().toISOString().slice(0, 10);

  const paymentAccount = await getOrganizationPaymentAccount(supabase, organizationId);
  const stripeConnectAccountId = paymentAccount?.stripeConnectAccountId;
  if (!paymentAccount || !stripeConnectAccountId || !isPaymentReady(paymentAccount)) {
    return emptyAutopayOrgResult();
  }

  const { data: organization, error: organizationError } = await supabase
    .from("organizations")
    .select("slug")
    .eq("id", organizationId)
    .maybeSingle();

  if (organizationError) throw organizationError;
  const orgSlug = typeof organization?.slug === "string" ? organization.slug : "";

  const { data: accounts, error: accountsError } = await supabase
    .from("tuition_billing_accounts")
    .select("id, family_id, default_payment_method_id, autopay_enabled, metadata")
    .eq("organization_id", organizationId);

  if (accountsError) throw accountsError;

  const familyIds = [
    ...new Set(
      (accounts ?? []).map((accountRow) => String(accountRow.family_id)),
    ),
  ];

  const guardiansByFamily = new Map<string, Array<{ last_name?: string | null }>>();
  if (familyIds.length > 0) {
    const { data: guardians, error: guardiansError } = await supabase
      .from("guardians")
      .select("family_id, last_name")
      .in("family_id", familyIds)
      .order("created_at", { ascending: true });

    if (guardiansError) throw guardiansError;

    for (const row of guardians ?? []) {
      const familyId = String(row.family_id);
      const existing = guardiansByFamily.get(familyId) ?? [];
      existing.push({ last_name: row.last_name });
      guardiansByFamily.set(familyId, existing);
    }
  }

  const familyLabel = (familyId: string) =>
    buildFamilyLabel(familyId, guardiansByFamily.get(familyId) ?? []);

  const stats = {
    processed: 0,
    skipped: 0,
    failed: 0,
    dueCandidates: 0,
  };
  const lines: AutopayLineItem[] = [];
  const lineState = { truncated: false };
  const stripe = getStripeClient();
  const stripeTestMode = isStripeTestMode();

  for (const accountRow of accounts ?? []) {
    const account = rowToBillingAccount(accountRow);
    const autopayTargets = new Map<string | null, boolean>();

    const autopayByGuardian =
      account.metadata.autopayByGuardian &&
      typeof account.metadata.autopayByGuardian === "object" &&
      !Array.isArray(account.metadata.autopayByGuardian)
        ? (account.metadata.autopayByGuardian as Record<string, boolean>)
        : {};

    for (const [guardianId, enabled] of Object.entries(autopayByGuardian)) {
      if (enabled) autopayTargets.set(guardianId, true);
    }

    if (autopayTargets.size === 0 && account.autopayEnabled) {
      autopayTargets.set(null, true);
    }

    if (autopayTargets.size === 0) {
      stats.skipped++;
      continue;
    }

    const accountFamilyLabel = familyLabel(account.familyId);

    for (const guardianId of autopayTargets.keys()) {
      let dueChargesQuery = supabase
        .from("tuition_charges")
        .select("id, amount_cents, paid_cents, label, currency, guardian_id")
        .eq("family_id", account.familyId)
        .eq("due_date", today)
        .in("status", ["scheduled", "sent"]);

      if (guardianId) {
        dueChargesQuery = dueChargesQuery.eq("guardian_id", guardianId);
      } else {
        dueChargesQuery = dueChargesQuery.is("guardian_id", null);
      }

      const { data: dueCharges, error: chargesError } = await dueChargesQuery;
      if (chargesError) throw chargesError;
      if (!dueCharges?.length) {
        stats.skipped++;
        continue;
      }

      let paymentMethodId = account.defaultPaymentMethodId;
      if (guardianId) {
        const { data: guardianMethod } = await supabase
          .from("family_payment_methods")
          .select("stripe_payment_method_id")
          .eq("billing_account_id", account.id)
          .eq("guardian_id", guardianId)
          .eq("is_default", true)
          .maybeSingle();
        paymentMethodId =
          typeof guardianMethod?.stripe_payment_method_id === "string"
            ? guardianMethod.stripe_payment_method_id
            : paymentMethodId;
      }

      if (!paymentMethodId) {
        recordSkippedDueCharges({
          lines,
          lineState,
          dueCharges,
          skipReason: "no_payment_method",
          organizationSlug: orgSlug,
          familyId: account.familyId,
          familyLabel: accountFamilyLabel,
          counters: stats,
        });
        continue;
      }

      let guardianUserId: string | null = null;
      if (guardianId) {
        const { data: guardian } = await supabase
          .from("guardians")
          .select("user_id")
          .eq("id", guardianId)
          .maybeSingle();
        guardianUserId =
          typeof guardian?.user_id === "string" ? guardian.user_id : null;
      } else {
        const { data: guardian } = await supabase
          .from("guardians")
          .select("user_id")
          .eq("family_id", account.familyId)
          .not("user_id", "is", null)
          .order("created_at", { ascending: true })
          .limit(1)
          .maybeSingle();
        guardianUserId =
          typeof guardian?.user_id === "string" ? guardian.user_id : null;
      }

      if (!guardianUserId) {
        recordSkippedDueCharges({
          lines,
          lineState,
          dueCharges,
          skipReason: "no_guardian",
          organizationSlug: orgSlug,
          familyId: account.familyId,
          familyLabel: accountFamilyLabel,
          counters: stats,
        });
        continue;
      }

      const { data: stripeCustomer, error: customerError } = await supabase
        .from("user_stripe_customers")
        .select("stripe_customer_id")
        .eq("user_id", guardianUserId)
        .maybeSingle();

      if (customerError) throw customerError;
      if (!stripeCustomer?.stripe_customer_id) {
        recordSkippedDueCharges({
          lines,
          lineState,
          dueCharges,
          skipReason: "no_stripe_customer",
          organizationSlug: orgSlug,
          familyId: account.familyId,
          familyLabel: accountFamilyLabel,
          counters: stats,
        });
        continue;
      }

      for (const charge of dueCharges) {
        const amountCents = chargeRemainingCents({
          amountCents: Number(charge.amount_cents),
          paidCents: Number(charge.paid_cents ?? 0),
        });
        if (amountCents <= 0) {
          stats.skipped++;
          pushAutopayLine(
            lines,
            {
              organizationSlug: orgSlug,
              familyId: account.familyId,
              familyLabel: accountFamilyLabel,
              chargeId: String(charge.id),
              chargeLabel: String(charge.label),
              amountCents: 0,
              outcome: "skipped",
              skipReason: "zero_balance",
            },
            lineState,
          );
          continue;
        }

        stats.dueCandidates++;

        const paymentMethodExists = await paymentMethodExistsOnPlatform(
          stripe,
          paymentMethodId,
        );
        if (!paymentMethodExists) {
          await removeFamilyPaymentMethod(supabase, {
            billingAccountId: account.id,
            stripePaymentMethodId: paymentMethodId,
            guardianId,
          });
          await notifyAutopayFailed(supabase, {
            organizationId,
            familyId: account.familyId,
            chargeId: String(charge.id),
            chargeLabel: String(charge.label),
            amountCents,
            guardianId,
            guardianUserId,
            errorMessage: STALE_PAYMENT_METHOD_MESSAGE,
            orgSlug,
            stripeTestMode,
          });
          stats.skipped++;
          pushAutopayLine(
            lines,
            {
              organizationSlug: orgSlug,
              familyId: account.familyId,
              familyLabel: accountFamilyLabel,
              chargeId: String(charge.id),
              chargeLabel: String(charge.label),
              amountCents,
              outcome: "skipped",
              skipReason: "stale_payment_method",
            },
            lineState,
          );
          continue;
        }

        try {
          await executeTuitionAutopayCharge(supabase, {
            organizationId,
            familyId: account.familyId,
            chargeId: String(charge.id),
            amountCents,
            label: String(charge.label),
            currency: typeof charge.currency === "string" ? charge.currency : "USD",
            stripeConnectAccountId,
            stripeCustomerId: stripeCustomer.stripe_customer_id,
            stripePaymentMethodId: paymentMethodId,
            payerUserId: guardianUserId,
          });
          await notifyAutopaySucceeded(supabase, {
            organizationId,
            familyId: account.familyId,
            chargeId: String(charge.id),
            chargeLabel: String(charge.label),
            amountCents,
            guardianUserId,
          });
          stats.processed++;
          pushAutopayLine(
            lines,
            {
              organizationSlug: orgSlug,
              familyId: account.familyId,
              familyLabel: accountFamilyLabel,
              chargeId: String(charge.id),
              chargeLabel: String(charge.label),
              amountCents,
              outcome: "charged",
            },
            lineState,
          );
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Payment could not be processed.";
          console.error("Autopay charge failed:", charge.id, error);
          if (isPaymentMethodMissingError(error)) {
            await removeFamilyPaymentMethod(supabase, {
              billingAccountId: account.id,
              stripePaymentMethodId: paymentMethodId,
              guardianId,
            });
          }
          await notifyAutopayFailed(supabase, {
            organizationId,
            familyId: account.familyId,
            chargeId: String(charge.id),
            chargeLabel: String(charge.label),
            amountCents,
            guardianId,
            guardianUserId,
            errorMessage: isPaymentMethodMissingError(error)
              ? STALE_PAYMENT_METHOD_MESSAGE
              : errorMessage,
            orgSlug,
            stripeTestMode,
          });
          if (isPaymentMethodMissingError(error)) {
            stats.skipped++;
            pushAutopayLine(
              lines,
              {
                organizationSlug: orgSlug,
                familyId: account.familyId,
                familyLabel: accountFamilyLabel,
                chargeId: String(charge.id),
                chargeLabel: String(charge.label),
                amountCents,
                outcome: "skipped",
                skipReason: "stale_payment_method",
              },
              lineState,
            );
            continue;
          }
          stats.failed++;
          pushAutopayLine(
            lines,
            {
              organizationSlug: orgSlug,
              familyId: account.familyId,
              familyLabel: accountFamilyLabel,
              chargeId: String(charge.id),
              chargeLabel: String(charge.label),
              amountCents,
              outcome: "failed",
              errorMessage,
            },
            lineState,
          );
        }
      }
    }
  }

  return {
    processed: stats.processed,
    skipped: stats.skipped,
    failed: stats.failed,
    attempted: stats.processed + stats.failed,
    dueCandidates: stats.dueCandidates,
    lines,
    truncated: lineState.truncated,
  };
}

export async function refundTuitionPayment(
  supabase: SupabaseClient,
  paymentId: string,
  options?: TuitionActivityOptions,
): Promise<void> {
  const { data: payment, error: paymentError } = await supabase
    .from("application_payments")
    .select("id, organization_id, family_id, tuition_charge_id, status, stripe_payment_intent_id, amount_cents, label")
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
      .update({ status: "scheduled", paid_at: null, paid_cents: 0 })
      .eq("id", payment.tuition_charge_id);
  }

  if (!options?.skip) {
    const chargeLabel =
      typeof payment.label === "string" && payment.label.trim()
        ? payment.label
        : "tuition charge";
    const changeSummary = summarizePaymentAction({
      kind: "refunded",
      amountCents: Number(payment.amount_cents),
      chargeLabel,
    });
    void logTuitionActivity(supabase, {
      organizationId: String(payment.organization_id),
      action: ACTIVITY_ACTIONS.TUITION_PAYMENT_REFUNDED,
      entityType: "application_payment",
      entityId: paymentId,
      summary: `Refunded tuition payment for “${chargeLabel}”`,
      changeSummary,
      logWhenEmpty: true,
      metadata: {
        familyId: payment.family_id ? String(payment.family_id) : null,
        tuitionChargeId: payment.tuition_charge_id
          ? String(payment.tuition_charge_id)
          : null,
      },
      context: options?.context,
    });
  }
}
