import type { SupabaseClient } from "@supabase/supabase-js";
import { regenerateFutureCharges } from "./charge-generator";
import { rowToAdjustment } from "./row-mappers";
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
  return rowToAdjustment(data);
}

export async function revokeAdjustment(
  supabase: SupabaseClient,
  adjustmentId: string,
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
  return rowToAdjustment(data);
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
