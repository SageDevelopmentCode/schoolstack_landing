import type { SupabaseClient } from "@supabase/supabase-js";
import {
  rowToFeeComponent,
  rowToPaymentPlan,
  rowToRatePlan,
  rowToRateTier,
} from "./row-mappers";
import type {
  BillingBasis,
  RatePlanStatus,
  RatePlanWithDetails,
  TuitionFeeComponent,
  TuitionPaymentPlan,
  TuitionRatePlan,
} from "./types";

export async function listRatePlans(
  supabase: SupabaseClient,
  organizationId: string,
): Promise<TuitionRatePlan[]> {
  const { data, error } = await supabase
    .from("tuition_rate_plans")
    .select("*")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map(rowToRatePlan);
}

export async function listRatePlansWithDetails(
  supabase: SupabaseClient,
  organizationId: string,
): Promise<RatePlanWithDetails[]> {
  const plans = await listRatePlans(supabase, organizationId);
  if (plans.length === 0) return [];

  const planIds = plans.map((p) => p.id);

  const [{ data: paymentPlans }, { data: feeComponents }, { data: tiers }, { data: programs }] =
    await Promise.all([
      supabase
        .from("tuition_payment_plans")
        .select("*")
        .in("rate_plan_id", planIds),
      supabase
        .from("tuition_fee_components")
        .select("*")
        .in("rate_plan_id", planIds),
      supabase
        .from("tuition_rate_tiers")
        .select("*")
        .in("rate_plan_id", planIds)
        .order("sort_order", { ascending: true }),
      supabase
        .from("programs")
        .select("id, name")
        .eq("organization_id", organizationId),
    ]);

  const programMap = new Map(
    (programs ?? []).map((p) => [String(p.id), String(p.name)]),
  );

  return plans.map((plan) => ({
    ...plan,
    programName: plan.programId ? programMap.get(plan.programId) ?? null : null,
    paymentPlans: (paymentPlans ?? [])
      .filter((row) => String(row.rate_plan_id) === plan.id)
      .map(rowToPaymentPlan),
    feeComponents: (feeComponents ?? [])
      .filter((row) => String(row.rate_plan_id) === plan.id)
      .map(rowToFeeComponent),
    tiers: (tiers ?? [])
      .filter((row) => String(row.rate_plan_id) === plan.id)
      .map(rowToRateTier),
  }));
}

export async function getDefaultRatePlanForProgram(
  supabase: SupabaseClient,
  organizationId: string,
  programId: string,
): Promise<RatePlanWithDetails | null> {
  const { data, error } = await supabase
    .from("tuition_rate_plans")
    .select("*")
    .eq("organization_id", organizationId)
    .eq("program_id", programId)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const plan = rowToRatePlan(data);

  const [{ data: paymentPlans }, { data: feeComponents }, { data: tiers }] =
    await Promise.all([
    supabase
      .from("tuition_payment_plans")
      .select("*")
      .eq("rate_plan_id", plan.id)
      .order("is_default", { ascending: false }),
    supabase
      .from("tuition_fee_components")
      .select("*")
      .eq("rate_plan_id", plan.id),
    supabase
      .from("tuition_rate_tiers")
      .select("*")
      .eq("rate_plan_id", plan.id)
      .order("sort_order", { ascending: true }),
  ]);

  return {
    ...plan,
    paymentPlans: (paymentPlans ?? []).map(rowToPaymentPlan),
    feeComponents: (feeComponents ?? []).map(rowToFeeComponent),
    tiers: (tiers ?? []).map(rowToRateTier),
  };
}

export async function createRatePlan(
  supabase: SupabaseClient,
  input: {
    organizationId: string;
    programId?: string | null;
    name: string;
    billingBasis?: BillingBasis;
    amountCents: number;
    currency?: string;
    effectiveStart?: string | null;
    effectiveEnd?: string | null;
    status?: RatePlanStatus;
    metadata?: Record<string, unknown>;
  },
): Promise<TuitionRatePlan> {
  const { data, error } = await supabase
    .from("tuition_rate_plans")
    .insert({
      organization_id: input.organizationId,
      program_id: input.programId ?? null,
      name: input.name,
      billing_basis: input.billingBasis ?? "annual",
      amount_cents: input.amountCents,
      currency: input.currency ?? "USD",
      effective_start: input.effectiveStart ?? null,
      effective_end: input.effectiveEnd ?? null,
      status: input.status ?? "active",
      metadata: input.metadata ?? {},
    })
    .select("*")
    .single();

  if (error) throw error;
  return rowToRatePlan(data);
}

export async function updateRatePlan(
  supabase: SupabaseClient,
  ratePlanId: string,
  input: Partial<{
    name: string;
    billingBasis: BillingBasis;
    amountCents: number;
    status: RatePlanStatus;
    effectiveStart: string | null;
    effectiveEnd: string | null;
    programId: string | null;
    metadata: Record<string, unknown>;
  }>,
): Promise<TuitionRatePlan> {
  const patch: Record<string, unknown> = {};
  if (input.name !== undefined) patch.name = input.name;
  if (input.billingBasis !== undefined) patch.billing_basis = input.billingBasis;
  if (input.amountCents !== undefined) patch.amount_cents = input.amountCents;
  if (input.status !== undefined) patch.status = input.status;
  if (input.effectiveStart !== undefined) patch.effective_start = input.effectiveStart;
  if (input.effectiveEnd !== undefined) patch.effective_end = input.effectiveEnd;
  if (input.programId !== undefined) patch.program_id = input.programId;
  if (input.metadata !== undefined) patch.metadata = input.metadata;

  const { data, error } = await supabase
    .from("tuition_rate_plans")
    .update(patch)
    .eq("id", ratePlanId)
    .select("*")
    .single();

  if (error) throw error;
  return rowToRatePlan(data);
}

export async function createPaymentPlan(
  supabase: SupabaseClient,
  input: {
    organizationId: string;
    ratePlanId: string;
    name: string;
    installmentCount: number;
    installmentAmountCents: number;
    billingDayOfMonth?: number | null;
    isDefault?: boolean;
  },
): Promise<TuitionPaymentPlan> {
  if (input.isDefault) {
    await supabase
      .from("tuition_payment_plans")
      .update({ is_default: false })
      .eq("rate_plan_id", input.ratePlanId);
  }

  const { data, error } = await supabase
    .from("tuition_payment_plans")
    .insert({
      organization_id: input.organizationId,
      rate_plan_id: input.ratePlanId,
      name: input.name,
      installment_count: input.installmentCount,
      installment_amount_cents: input.installmentAmountCents,
      billing_day_of_month: input.billingDayOfMonth ?? 1,
      is_default: input.isDefault ?? false,
    })
    .select("*")
    .single();

  if (error) throw error;
  return rowToPaymentPlan(data);
}

export async function createFeeComponent(
  supabase: SupabaseClient,
  input: {
    organizationId: string;
    ratePlanId: string;
    code: string;
    label: string;
    amountCents: number;
    timing?: TuitionFeeComponent["timing"];
    required?: boolean;
  },
): Promise<TuitionFeeComponent> {
  const { data, error } = await supabase
    .from("tuition_fee_components")
    .insert({
      organization_id: input.organizationId,
      rate_plan_id: input.ratePlanId,
      code: input.code,
      label: input.label,
      amount_cents: input.amountCents,
      timing: input.timing ?? "enrollment",
      required: input.required ?? true,
    })
    .select("*")
    .single();

  if (error) throw error;
  return rowToFeeComponent(data);
}

export async function deleteRatePlan(
  supabase: SupabaseClient,
  ratePlanId: string,
): Promise<void> {
  const { error } = await supabase
    .from("tuition_rate_plans")
    .delete()
    .eq("id", ratePlanId);

  if (error) throw error;
}

export async function publishRatePlan(
  supabase: SupabaseClient,
  ratePlanId: string,
): Promise<TuitionRatePlan> {
  const ratePlan = await updateRatePlan(supabase, ratePlanId, { status: "active" });
  const { backfillTuitionAssignmentsForRatePlan } = await import("./assignments");
  await backfillTuitionAssignmentsForRatePlan(supabase, ratePlanId);
  return ratePlan;
}

export async function getDraftRatePlanForOrganization(
  supabase: SupabaseClient,
  organizationId: string,
): Promise<RatePlanWithDetails | null> {
  const { data, error } = await supabase
    .from("tuition_rate_plans")
    .select("*")
    .eq("organization_id", organizationId)
    .eq("status", "draft")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return getRatePlanWithDetails(supabase, String(data.id));
}

export async function getRatePlanWithDetails(
  supabase: SupabaseClient,
  ratePlanId: string,
): Promise<RatePlanWithDetails | null> {
  const { data, error } = await supabase
    .from("tuition_rate_plans")
    .select("*")
    .eq("id", ratePlanId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const plan = rowToRatePlan(data);
  const [{ data: paymentPlans }, { data: feeComponents }, { data: tiers }, programResult] =
    await Promise.all([
      supabase
        .from("tuition_payment_plans")
        .select("*")
        .eq("rate_plan_id", plan.id)
        .order("installment_count", { ascending: true }),
      supabase
        .from("tuition_fee_components")
        .select("*")
        .eq("rate_plan_id", plan.id),
      supabase
        .from("tuition_rate_tiers")
        .select("*")
        .eq("rate_plan_id", plan.id)
        .order("sort_order", { ascending: true }),
      plan.programId
        ? supabase.from("programs").select("name").eq("id", plan.programId).maybeSingle()
        : Promise.resolve({ data: null, error: null }),
    ]);

  if (programResult.error) throw programResult.error;

  return {
    ...plan,
    programName: programResult.data?.name ? String(programResult.data.name) : null,
    paymentPlans: (paymentPlans ?? []).map(rowToPaymentPlan),
    feeComponents: (feeComponents ?? []).map(rowToFeeComponent),
    tiers: (tiers ?? []).map(rowToRateTier),
  };
}

export async function upsertPaymentPlansForRatePlan(
  supabase: SupabaseClient,
  input: {
    organizationId: string;
    ratePlanId: string;
    annualAmountCents: number;
    options: Array<{
      installmentCount: number;
      installmentAmountCents: number;
      isDefault?: boolean;
    }>;
  },
): Promise<TuitionPaymentPlan[]> {
  const { data: existing, error: existingError } = await supabase
    .from("tuition_payment_plans")
    .select("*")
    .eq("rate_plan_id", input.ratePlanId);

  if (existingError) throw existingError;

  const desiredCounts = new Set(input.options.map((o) => o.installmentCount));
  const toDelete = (existing ?? []).filter(
    (row) => !desiredCounts.has(Number(row.installment_count)),
  );

  if (toDelete.length > 0) {
    const { error: deleteError } = await supabase
      .from("tuition_payment_plans")
      .delete()
      .in(
        "id",
        toDelete.map((row) => String(row.id)),
      );
    if (deleteError) throw deleteError;
  }

  const results: TuitionPaymentPlan[] = [];
  const hasDefault = input.options.some((o) => o.isDefault);

  for (const option of input.options) {
    const existingRow = (existing ?? []).find(
      (row) => Number(row.installment_count) === option.installmentCount,
    );

    if (existingRow) {
      const { data, error } = await supabase
        .from("tuition_payment_plans")
        .update({
          installment_amount_cents: option.installmentAmountCents,
          is_default: option.isDefault ?? false,
          name: `${option.installmentCount} payment${option.installmentCount === 1 ? "" : "s"}`,
        })
        .eq("id", existingRow.id)
        .select("*")
        .single();

      if (error) throw error;
      results.push(rowToPaymentPlan(data));
    } else {
      const created = await createPaymentPlan(supabase, {
        organizationId: input.organizationId,
        ratePlanId: input.ratePlanId,
        name: `${option.installmentCount} payment${option.installmentCount === 1 ? "" : "s"}`,
        installmentCount: option.installmentCount,
        installmentAmountCents: option.installmentAmountCents,
        isDefault: option.isDefault ?? false,
      });
      results.push(created);
    }
  }

  if (hasDefault) {
    const defaultOption = input.options.find((o) => o.isDefault);
    if (defaultOption) {
      await supabase
        .from("tuition_payment_plans")
        .update({ is_default: false })
        .eq("rate_plan_id", input.ratePlanId)
        .neq("installment_count", defaultOption.installmentCount);

      await supabase
        .from("tuition_payment_plans")
        .update({ is_default: true })
        .eq("rate_plan_id", input.ratePlanId)
        .eq("installment_count", defaultOption.installmentCount);
    }
  }

  return results.sort((a, b) => a.installmentCount - b.installmentCount);
}

export async function syncRatePlanPaymentOptions(
  supabase: SupabaseClient,
  input: {
    organizationId: string;
    ratePlanId: string;
    annualAmountCents: number;
    paymentCounts: number[];
    defaultPaymentCount: number;
  },
): Promise<TuitionPaymentPlan[]> {
  const options = input.paymentCounts.map((count) => ({
    installmentCount: count,
    installmentAmountCents: Math.round(input.annualAmountCents / count),
    isDefault: count === input.defaultPaymentCount,
  }));

  const plans = await upsertPaymentPlansForRatePlan(supabase, {
    organizationId: input.organizationId,
    ratePlanId: input.ratePlanId,
    annualAmountCents: input.annualAmountCents,
    options,
  });

  const { regenerateFutureChargesForRatePlan } = await import("./charge-generator");
  await regenerateFutureChargesForRatePlan(supabase, input.ratePlanId);

  return plans;
}
