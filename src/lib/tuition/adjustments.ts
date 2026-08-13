import type { SupabaseClient } from "@supabase/supabase-js";
import { regenerateFutureCharges } from "./charge-generator";
import { rowToAdjustment } from "./row-mappers";
import {
  ACTIVITY_ACTIONS,
  logTuitionActivity,
  summarizeAdjustmentCreated,
  type TuitionActivityOptions,
} from "./tuition-activity";
import type {
  AdjustmentScope,
  AdjustmentSource,
  AdjustmentType,
  TuitionAdjustment,
} from "./types";

export async function listAdjustmentsForAssignment(
  supabase: SupabaseClient,
  assignmentId: string,
): Promise<TuitionAdjustment[]> {
  const { data, error } = await supabase
    .from("tuition_adjustments")
    .select("*")
    .eq("assignment_id", assignmentId)
    .eq("status", "active")
    .order("priority", { ascending: true });

  if (error) throw error;
  return (data ?? []).map(rowToAdjustment);
}

export async function listAdjustmentsForFamily(
  supabase: SupabaseClient,
  familyId: string,
): Promise<TuitionAdjustment[]> {
  const { data: assignments, error: assignmentsError } = await supabase
    .from("tuition_enrollment_assignments")
    .select("id")
    .eq("family_id", familyId)
    .eq("status", "active");

  if (assignmentsError) throw assignmentsError;
  if (!assignments?.length) return [];

  const assignmentIds = assignments.map((row) => String(row.id));
  const { data, error } = await supabase
    .from("tuition_adjustments")
    .select("*")
    .in("assignment_id", assignmentIds)
    .eq("status", "active")
    .order("priority", { ascending: true });

  if (error) throw error;
  return (data ?? []).map(rowToAdjustment);
}

export async function createAdjustment(
  supabase: SupabaseClient,
  input: {
    organizationId: string;
    assignmentId: string;
    adjustmentType: AdjustmentType;
    valuePercent?: number | null;
    valueCents?: number | null;
    reason: string;
    scope?: AdjustmentScope;
    source?: AdjustmentSource;
    ruleId?: string | null;
    priority?: number;
    createdByUserId?: string | null;
  },
  options?: TuitionActivityOptions,
): Promise<TuitionAdjustment> {
  const { data, error } = await supabase
    .from("tuition_adjustments")
    .insert({
      organization_id: input.organizationId,
      assignment_id: input.assignmentId,
      adjustment_type: input.adjustmentType,
      value_percent: input.valuePercent ?? null,
      value_cents: input.valueCents ?? null,
      reason: input.reason,
      scope: input.scope ?? "installment",
      source: input.source ?? "manual",
      rule_id: input.ruleId ?? null,
      priority: input.priority ?? 0,
      created_by_user_id: input.createdByUserId ?? null,
      status: "active",
    })
    .select("*")
    .single();

  if (error) throw error;

  await regenerateFutureCharges(supabase, input.assignmentId);
  const adjustment = rowToAdjustment(data);

  if (!options?.skip) {
    const changeSummary = summarizeAdjustmentCreated(adjustment);
    void logTuitionActivity(supabase, {
      organizationId: input.organizationId,
      action: ACTIVITY_ACTIONS.TUITION_ADJUSTMENT_CREATED,
      entityType: "tuition_adjustment",
      entityId: adjustment.id,
      summary: "Created tuition adjustment",
      changeSummary,
      logWhenEmpty: true,
      metadata: {
        assignmentId: input.assignmentId,
        source: input.source ?? "manual",
      },
      context: options?.context,
    });
  }

  return adjustment;
}

export async function revokeAdjustment(
  supabase: SupabaseClient,
  adjustmentId: string,
  options?: TuitionActivityOptions,
): Promise<TuitionAdjustment> {
  const { data: existing, error: existingError } = await supabase
    .from("tuition_adjustments")
    .select("assignment_id")
    .eq("id", adjustmentId)
    .maybeSingle();

  if (existingError) throw existingError;
  if (!existing) throw new Error("Adjustment not found");

  const { data, error } = await supabase
    .from("tuition_adjustments")
    .update({ status: "revoked" })
    .eq("id", adjustmentId)
    .select("*")
    .single();

  if (error) throw error;

  await regenerateFutureCharges(supabase, String(existing.assignment_id));
  const adjustment = rowToAdjustment(data);

  if (!options?.skip) {
    void logTuitionActivity(supabase, {
      organizationId: adjustment.organizationId,
      action: ACTIVITY_ACTIONS.TUITION_ADJUSTMENT_REVOKED,
      entityType: "tuition_adjustment",
      entityId: adjustment.id,
      summary: "Revoked tuition adjustment",
      changeSummary: {
        changedFields: ["status"],
        changes: [`Revoked adjustment: ${adjustment.reason}`],
      },
      logWhenEmpty: true,
      context: options?.context,
    });
  }

  return adjustment;
}

export async function upsertRuleAdjustment(
  supabase: SupabaseClient,
  input: {
    organizationId: string;
    assignmentId: string;
    ruleId: string;
    adjustmentType: AdjustmentType;
    valuePercent?: number | null;
    valueCents?: number | null;
    reason: string;
    priority?: number;
  },
): Promise<TuitionAdjustment> {
  const { data: existing, error: existingError } = await supabase
    .from("tuition_adjustments")
    .select("*")
    .eq("assignment_id", input.assignmentId)
    .eq("rule_id", input.ruleId)
    .eq("status", "active")
    .maybeSingle();

  if (existingError) throw existingError;

  if (existing) {
    const { data, error } = await supabase
      .from("tuition_adjustments")
      .update({
        adjustment_type: input.adjustmentType,
        value_percent: input.valuePercent ?? null,
        value_cents: input.valueCents ?? null,
        reason: input.reason,
        priority: input.priority ?? 0,
      })
      .eq("id", existing.id)
      .select("*")
      .single();

    if (error) throw error;
    await regenerateFutureCharges(supabase, input.assignmentId);
    return rowToAdjustment(data);
  }

  return createAdjustment(supabase, {
    ...input,
    source: "rule",
    scope: "installment",
  });
}
