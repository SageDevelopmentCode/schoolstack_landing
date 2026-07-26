import type { SupabaseClient } from "@supabase/supabase-js";
import { computeAdjustedAmountCents } from "./pricing";
import {
  assignmentNeedsPaymentPlanSelection,
  computeInstallmentAmountCents,
  resolveAssignmentTier,
} from "./assignments";
import { rowToAdjustment, rowToAssignment, rowToCharge } from "./row-mappers";
import type {
  TuitionAdjustment,
  TuitionCharge,
  TuitionFeeComponent,
  TuitionPaymentPlan,
} from "./types";

export type ChargeDraft = {
  label: string;
  baseAmountCents: number;
  amountCents: number;
  dueDate: string;
  chargeType: TuitionCharge["chargeType"];
  installmentNumber: number | null;
};

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export function buildInstallmentDueDates(
  paymentPlan: TuitionPaymentPlan,
  startDate: Date,
): string[] {
  const day = paymentPlan.billingDayOfMonth ?? startDate.getUTCDate();
  const dates: string[] = [];

  for (let i = 0; i < paymentPlan.installmentCount; i++) {
    const d = new Date(
      Date.UTC(
        startDate.getUTCFullYear(),
        startDate.getUTCMonth() + i,
        Math.min(day, 28),
      ),
    );
    dates.push(d.toISOString().slice(0, 10));
  }

  return dates;
}

export function buildChargeDrafts(input: {
  paymentPlan: TuitionPaymentPlan;
  feeComponents: TuitionFeeComponent[];
  adjustments: TuitionAdjustment[];
  startDate?: Date;
  installmentAmountCents?: number;
}): ChargeDraft[] {
  const { paymentPlan, feeComponents, adjustments } = input;
  const startDate = input.startDate ?? new Date();
  const dueDates = buildInstallmentDueDates(paymentPlan, startDate);
  const drafts: ChargeDraft[] = [];
  const perInstallmentCents =
    input.installmentAmountCents ?? paymentPlan.installmentAmountCents;

  const activeAdjustments = adjustments.filter((a) => a.status === "active");

  for (const fee of feeComponents) {
    if (fee.timing !== "enrollment") continue;
    const baseAmountCents = fee.amountCents;
    const amountCents = computeAdjustedAmountCents(
      baseAmountCents,
      activeAdjustments.filter((a) => a.scope === "fee_component"),
    );
    drafts.push({
      label: fee.label,
      baseAmountCents,
      amountCents,
      dueDate: dueDates[0] ?? startDate.toISOString().slice(0, 10),
      chargeType: "fee",
      installmentNumber: null,
    });
  }

  dueDates.forEach((dueDate, index) => {
    const baseAmountCents = perInstallmentCents;
    const amountCents = computeAdjustedAmountCents(
      baseAmountCents,
      activeAdjustments,
    );
    const monthLabel = MONTH_NAMES[new Date(`${dueDate}T00:00:00Z`).getUTCMonth()];
    drafts.push({
      label: `${monthLabel} Tuition`,
      baseAmountCents,
      amountCents,
      dueDate,
      chargeType: "tuition",
      installmentNumber: index + 1,
    });
  });

  return drafts;
}

export async function regenerateFutureCharges(
  supabase: SupabaseClient,
  assignmentId: string,
): Promise<TuitionCharge[]> {
  const { data: assignment, error: assignmentError } = await supabase
    .from("tuition_enrollment_assignments")
    .select(
      "id, organization_id, family_id, payment_plan_id, rate_plan_id, rate_tier_id, effective_start, metadata",
    )
    .eq("id", assignmentId)
    .maybeSingle();

  if (assignmentError) throw assignmentError;
  if (!assignment) throw new Error("Assignment not found");

  const parsedAssignment = rowToAssignment(assignment);
  if (assignmentNeedsPaymentPlanSelection(parsedAssignment)) {
    return [];
  }

  const tier = await resolveAssignmentTier(supabase, parsedAssignment);

  const { data: paymentPlan, error: planError } = await supabase
    .from("tuition_payment_plans")
    .select("*")
    .eq("id", assignment.payment_plan_id)
    .maybeSingle();

  if (planError) throw planError;
  if (!paymentPlan) throw new Error("Payment plan not found");

  const { data: feeComponents, error: feeError } = await supabase
    .from("tuition_fee_components")
    .select("*")
    .eq("rate_plan_id", assignment.rate_plan_id);

  if (feeError) throw feeError;

  const { data: adjustments, error: adjError } = await supabase
    .from("tuition_adjustments")
    .select("*")
    .eq("assignment_id", assignmentId)
    .eq("status", "active");

  if (adjError) throw adjError;

  const startDate = assignment.effective_start
    ? new Date(`${assignment.effective_start}T00:00:00Z`)
    : new Date();

  const paymentPlanRow = paymentPlan;
  const installmentCount = Number(paymentPlanRow.installment_count);
  const installmentAmountCents = tier
    ? computeInstallmentAmountCents(tier.amountCents, installmentCount)
    : Number(paymentPlanRow.installment_amount_cents);

  const drafts = buildChargeDrafts({
    paymentPlan: {
      id: String(paymentPlan.id),
      organizationId: String(paymentPlan.organization_id),
      ratePlanId: String(paymentPlan.rate_plan_id),
      name: String(paymentPlan.name),
      installmentCount,
      installmentAmountCents: Number(paymentPlan.installment_amount_cents),
      billingDayOfMonth:
        typeof paymentPlan.billing_day_of_month === "number"
          ? paymentPlan.billing_day_of_month
          : null,
      isDefault: Boolean(paymentPlan.is_default),
      createdAt: String(paymentPlan.created_at),
      updatedAt: String(paymentPlan.updated_at),
    },
    feeComponents: (feeComponents ?? []).map((row) => ({
      id: String(row.id),
      organizationId: String(row.organization_id),
      ratePlanId: String(row.rate_plan_id),
      code: String(row.code),
      label: String(row.label),
      amountCents: Number(row.amount_cents),
      currency: String(row.currency ?? "USD"),
      timing: row.timing as TuitionFeeComponent["timing"],
      required: Boolean(row.required),
      createdAt: String(row.created_at),
      updatedAt: String(row.updated_at),
    })),
    adjustments: (adjustments ?? []).map(rowToAdjustment),
    startDate,
    installmentAmountCents,
  });

  const { data: existingCharges, error: existingError } = await supabase
    .from("tuition_charges")
    .select("id, status, installment_number, charge_type, label")
    .eq("assignment_id", assignmentId);

  if (existingError) throw existingError;

  const lockedStatuses = new Set(["paid", "waived"]);
  const locked = (existingCharges ?? []).filter((c) =>
    lockedStatuses.has(String(c.status)),
  );
  const lockedKeys = new Set(
    locked.map(
      (c) =>
        `${c.charge_type}:${c.installment_number ?? c.label}`,
    ),
  );

  const { error: voidError } = await supabase
    .from("tuition_charges")
    .update({ status: "void" })
    .eq("assignment_id", assignmentId)
    .in("status", ["scheduled", "sent", "overdue"]);

  if (voidError) throw voidError;

  const toInsert = drafts.filter((draft) => {
    const key = `${draft.chargeType}:${draft.installmentNumber ?? draft.label}`;
    return !lockedKeys.has(key);
  });

  if (toInsert.length === 0) {
    const { data: remaining, error: remainingError } = await supabase
      .from("tuition_charges")
      .select("*")
      .eq("assignment_id", assignmentId)
      .not("status", "eq", "void")
      .order("due_date", { ascending: true });

    if (remainingError) throw remainingError;
    return (remaining ?? []).map(rowToCharge);
  }

  const { data: inserted, error: insertError } = await supabase
    .from("tuition_charges")
    .insert(
      toInsert.map((draft) => ({
        organization_id: assignment.organization_id,
        assignment_id: assignmentId,
        family_id: assignment.family_id,
        label: draft.label,
        base_amount_cents: draft.baseAmountCents,
        amount_cents: draft.amountCents,
        due_date: draft.dueDate,
        status: "scheduled",
        charge_type: draft.chargeType,
        installment_number: draft.installmentNumber,
      })),
    )
    .select("*");

  if (insertError) throw insertError;

  const { data: allCharges, error: allError } = await supabase
    .from("tuition_charges")
    .select("*")
    .eq("assignment_id", assignmentId)
    .not("status", "eq", "void")
    .order("due_date", { ascending: true });

  if (allError) throw allError;
  return (allCharges ?? []).map(rowToCharge);
}

export type RatePlanChargeRegenerationResult = {
  processed: number;
  skipped: number;
};

export async function regenerateFutureChargesForRatePlan(
  supabase: SupabaseClient,
  ratePlanId: string,
): Promise<RatePlanChargeRegenerationResult> {
  const { data: assignments, error } = await supabase
    .from("tuition_enrollment_assignments")
    .select("id, metadata, status")
    .eq("rate_plan_id", ratePlanId)
    .eq("status", "active");

  if (error) throw error;

  let processed = 0;
  let skipped = 0;

  for (const row of assignments ?? []) {
    const assignment = rowToAssignment(row);
    if (assignmentNeedsPaymentPlanSelection(assignment)) {
      skipped += 1;
      continue;
    }

    await regenerateFutureCharges(supabase, String(row.id));
    processed += 1;
  }

  return { processed, skipped };
}

export async function markOverdueCharges(
  supabase: SupabaseClient,
  organizationId: string,
  graceDays = 5,
): Promise<number> {
  const cutoff = new Date();
  cutoff.setUTCDate(cutoff.getUTCDate() - graceDays);
  const cutoffStr = cutoff.toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from("tuition_charges")
    .update({ status: "overdue" })
    .eq("organization_id", organizationId)
    .in("status", ["scheduled", "sent"])
    .lt("due_date", cutoffStr)
    .select("id");

  if (error) throw error;
  return data?.length ?? 0;
}
