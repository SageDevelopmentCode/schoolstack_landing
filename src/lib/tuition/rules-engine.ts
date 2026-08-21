import type { SupabaseClient } from "@supabase/supabase-js";
import { upsertRuleAdjustment } from "./adjustments";
import { rowToAdjustmentRule } from "./row-mappers";
import {
  ACTIVITY_ACTIONS,
  logTuitionActivity,
  summarizeAdjustmentRuleChanges,
  type TuitionActivityOptions,
} from "./tuition-activity";
import type { RuleCondition, RuleConditions, TuitionAdjustmentRule } from "./types";

export async function listAdjustmentRules(
  supabase: SupabaseClient,
  organizationId: string,
): Promise<TuitionAdjustmentRule[]> {
  const { data, error } = await supabase
    .from("tuition_adjustment_rules")
    .select("*")
    .eq("organization_id", organizationId)
    .order("priority", { ascending: true });

  if (error) throw error;
  return (data ?? []).map(rowToAdjustmentRule);
}

export async function createAdjustmentRule(
  supabase: SupabaseClient,
  input: {
    organizationId: string;
    name: string;
    priority?: number;
    conditions: RuleConditions;
    adjustmentType: TuitionAdjustmentRule["adjustmentType"];
    valuePercent?: number | null;
    valueCents?: number | null;
    reason: string;
    autoApply?: boolean;
  },
  options?: TuitionActivityOptions,
): Promise<TuitionAdjustmentRule> {
  const { data, error } = await supabase
    .from("tuition_adjustment_rules")
    .insert({
      organization_id: input.organizationId,
      name: input.name,
      priority: input.priority ?? 0,
      conditions: input.conditions,
      adjustment_type: input.adjustmentType,
      value_percent: input.valuePercent ?? null,
      value_cents: input.valueCents ?? null,
      reason: input.reason,
      auto_apply: input.autoApply ?? true,
      active: true,
    })
    .select("*")
    .single();

  if (error) throw error;
  const rule = rowToAdjustmentRule(data);

  if (!options?.skip) {
    const changeSummary = summarizeAdjustmentRuleChanges(null, rule);
    void logTuitionActivity(supabase, {
      organizationId: input.organizationId,
      action: ACTIVITY_ACTIONS.TUITION_ADJUSTMENT_RULE_CREATED,
      entityType: "tuition_adjustment_rule",
      entityId: rule.id,
      summary: `Created adjustment rule “${rule.name}”`,
      changeSummary,
      logWhenEmpty: true,
      context: options?.context,
    });
  }

  return rule;
}

export async function updateAdjustmentRule(
  supabase: SupabaseClient,
  ruleId: string,
  input: Partial<{
    name: string;
    priority: number;
    conditions: RuleConditions;
    active: boolean;
    autoApply: boolean;
  }>,
  options?: TuitionActivityOptions,
): Promise<TuitionAdjustmentRule> {
  const { data: beforeRow, error: beforeError } = await supabase
    .from("tuition_adjustment_rules")
    .select("*")
    .eq("id", ruleId)
    .maybeSingle();

  if (beforeError) throw beforeError;
  const before = beforeRow ? rowToAdjustmentRule(beforeRow) : null;

  const patch: Record<string, unknown> = {};
  if (input.name !== undefined) patch.name = input.name;
  if (input.priority !== undefined) patch.priority = input.priority;
  if (input.conditions !== undefined) patch.conditions = input.conditions;
  if (input.active !== undefined) patch.active = input.active;
  if (input.autoApply !== undefined) patch.auto_apply = input.autoApply;

  const { data, error } = await supabase
    .from("tuition_adjustment_rules")
    .update(patch)
    .eq("id", ruleId)
    .select("*")
    .single();

  if (error) throw error;
  const rule = rowToAdjustmentRule(data);

  if (!options?.skip) {
    const changeSummary = summarizeAdjustmentRuleChanges(before, rule);
    void logTuitionActivity(supabase, {
      organizationId: rule.organizationId,
      action: ACTIVITY_ACTIONS.TUITION_ADJUSTMENT_RULE_UPDATED,
      entityType: "tuition_adjustment_rule",
      entityId: rule.id,
      summary: `Updated adjustment rule “${rule.name}”`,
      changeSummary,
      context: options?.context,
    });
  }

  return rule;
}

type RuleEvaluationContext = {
  familyId: string;
  organizationId: string;
  programId: string;
  enrollmentId: string;
  activeEnrollmentCount: number;
  guardianRoles: string[];
  checklistResponses: Record<string, string>;
};

async function buildRuleContext(
  supabase: SupabaseClient,
  assignmentId: string,
): Promise<RuleEvaluationContext | null> {
  const { data: assignment, error: assignmentError } = await supabase
    .from("tuition_enrollment_assignments")
    .select("id, organization_id, family_id, enrollment_id")
    .eq("id", assignmentId)
    .maybeSingle();

  if (assignmentError) throw assignmentError;
  if (!assignment) return null;

  const { data: enrollment, error: enrollmentError } = await supabase
    .from("enrollments")
    .select("id, program_id, student_id")
    .eq("id", assignment.enrollment_id)
    .maybeSingle();

  if (enrollmentError) throw enrollmentError;
  if (!enrollment) return null;

  const { count: activeEnrollmentCount, error: countError } = await supabase
    .from("enrollments")
    .select("id", { count: "exact", head: true })
    .eq("organization_id", assignment.organization_id)
    .in(
      "student_id",
      (
        await supabase
          .from("students")
          .select("id")
          .eq("family_id", assignment.family_id)
      ).data?.map((s) => s.id) ?? [],
    )
    .eq("status", "enrolled");

  if (countError) throw countError;

  const { data: guardians, error: guardiansError } = await supabase
    .from("guardians")
    .select("user_id")
    .eq("family_id", assignment.family_id);

  if (guardiansError) throw guardiansError;

  const guardianUserIds = (guardians ?? [])
    .map((g) => g.user_id)
    .filter((id): id is string => typeof id === "string");

  let guardianRoles: string[] = [];
  if (guardianUserIds.length > 0) {
    const { data: memberships, error: membershipsError } = await supabase
      .from("organization_memberships")
      .select("role")
      .eq("organization_id", assignment.organization_id)
      .in("user_id", guardianUserIds)
      .eq("status", "active");

    if (membershipsError) throw membershipsError;
    guardianRoles = (memberships ?? []).map((m) => String(m.role));
  }

  const checklistResponses: Record<string, string> = {};
  const { data: checklistItems, error: checklistError } = await supabase
    .from("enrollment_checklist_items")
    .select("item_key, responses, status")
    .eq("organization_id", assignment.organization_id)
    .eq("status", "completed");

  if (checklistError) throw checklistError;

  for (const item of checklistItems ?? []) {
    const responses = item.responses;
    if (!responses || typeof responses !== "object" || Array.isArray(responses)) {
      continue;
    }
    for (const [key, value] of Object.entries(
      responses as Record<string, unknown>,
    )) {
      if (typeof value === "string") {
        checklistResponses[item.item_key ?? key] = value;
      }
    }
  }

  return {
    familyId: String(assignment.family_id),
    organizationId: String(assignment.organization_id),
    programId: String(enrollment.program_id),
    enrollmentId: String(enrollment.id),
    activeEnrollmentCount: activeEnrollmentCount ?? 0,
    guardianRoles,
    checklistResponses,
  };
}

function evaluateCondition(
  condition: RuleCondition,
  context: RuleEvaluationContext,
): boolean {
  switch (condition.field) {
    case "active_enrollments_in_family": {
      const count = context.activeEnrollmentCount;
      if (condition.op === "gte") return count >= condition.value;
      return count === condition.value;
    }
    case "enrollment.program_id":
      return context.programId === condition.value;
    case "guardian_has_role":
      return context.guardianRoles.includes(condition.value);
    case "checklist_response": {
      const response = context.checklistResponses[condition.item_key];
      return response === condition.response_value;
    }
    default:
      return false;
  }
}

export function evaluateRuleConditions(
  conditions: RuleConditions,
  context: RuleEvaluationContext,
): boolean {
  if (conditions.all && conditions.all.length > 0) {
    return conditions.all.every((c) => evaluateCondition(c, context));
  }
  if (conditions.any && conditions.any.length > 0) {
    return conditions.any.some((c) => evaluateCondition(c, context));
  }
  return false;
}

export async function evaluateAndApplyRulesForAssignment(
  supabase: SupabaseClient,
  assignmentId: string,
): Promise<void> {
  const context = await buildRuleContext(supabase, assignmentId);
  if (!context) return;

  const rules = await listAdjustmentRules(supabase, context.organizationId);
  const activeRules = rules.filter((r) => r.active && r.autoApply);

  for (const rule of activeRules) {
    if (!evaluateRuleConditions(rule.conditions, context)) continue;

    await upsertRuleAdjustment(supabase, {
      organizationId: context.organizationId,
      assignmentId,
      ruleId: rule.id,
      adjustmentType: rule.adjustmentType,
      valuePercent: rule.valuePercent,
      valueCents: rule.valueCents,
      reason: rule.reason,
      priority: rule.priority,
    });
  }
}

export async function evaluateRulesForOrganization(
  supabase: SupabaseClient,
  organizationId: string,
): Promise<number> {
  const { data: assignments, error } = await supabase
    .from("tuition_enrollment_assignments")
    .select("id")
    .eq("organization_id", organizationId)
    .eq("status", "active");

  if (error) throw error;

  for (const assignment of assignments ?? []) {
    await evaluateAndApplyRulesForAssignment(supabase, String(assignment.id));
  }

  return assignments?.length ?? 0;
}

export type RulePreviewMatch = {
  assignmentId: string;
  familyId: string;
  familyName: string;
  studentName: string;
  alreadyApplied: boolean;
};

export async function previewRuleMatches(
  supabase: SupabaseClient,
  ruleId: string,
): Promise<RulePreviewMatch[]> {
  const { data: ruleRow, error: ruleError } = await supabase
    .from("tuition_adjustment_rules")
    .select("*")
    .eq("id", ruleId)
    .maybeSingle();

  if (ruleError) throw ruleError;
  if (!ruleRow) return [];

  const rule = rowToAdjustmentRule(ruleRow);

  const { data: assignments, error: assignmentsError } = await supabase
    .from("tuition_enrollment_assignments")
    .select("id, family_id, enrollment_id")
    .eq("organization_id", rule.organizationId)
    .eq("status", "active");

  if (assignmentsError) throw assignmentsError;

  const matches: RulePreviewMatch[] = [];

  for (const assignment of assignments ?? []) {
    const assignmentId = String(assignment.id);
    const context = await buildRuleContext(supabase, assignmentId);
    if (!context || !evaluateRuleConditions(rule.conditions, context)) {
      continue;
    }

    const [{ data: family }, { data: enrollment }] = await Promise.all([
      supabase
        .from("families")
        .select("name")
        .eq("id", assignment.family_id)
        .maybeSingle(),
      supabase
        .from("enrollments")
        .select("student_id")
        .eq("id", assignment.enrollment_id)
        .maybeSingle(),
    ]);

    let studentName = "Student";
    if (enrollment?.student_id) {
      const { data: student } = await supabase
        .from("students")
        .select("first_name, last_name")
        .eq("id", enrollment.student_id)
        .maybeSingle();

      if (student) {
        studentName = `${student.first_name} ${student.last_name}`.trim();
      }
    }

    const { data: existingAdjustment } = await supabase
      .from("tuition_adjustments")
      .select("id")
      .eq("assignment_id", assignmentId)
      .eq("rule_id", ruleId)
      .eq("status", "active")
      .maybeSingle();

    matches.push({
      assignmentId,
      familyId: String(assignment.family_id),
      familyName: String(family?.name ?? "Family"),
      studentName,
      alreadyApplied: Boolean(existingAdjustment),
    });
  }

  return matches;
}
