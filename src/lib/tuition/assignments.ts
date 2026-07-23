import type { SupabaseClient } from "@supabase/supabase-js";
import { regenerateFutureCharges } from "./charge-generator";
import { evaluateAndApplyRulesForAssignment } from "./rules-engine";
import { rowToAssignment, rowToBillingAccount } from "./row-mappers";
import { getDefaultRatePlanForProgram } from "./rate-plans";
import type {
  AssignmentSource,
  TuitionBillingAccount,
  TuitionEnrollmentAssignment,
} from "./types";

export async function ensureBillingAccount(
  supabase: SupabaseClient,
  organizationId: string,
  familyId: string,
): Promise<TuitionBillingAccount> {
  const { data: existing, error: existingError } = await supabase
    .from("tuition_billing_accounts")
    .select("*")
    .eq("organization_id", organizationId)
    .eq("family_id", familyId)
    .maybeSingle();

  if (existingError) throw existingError;
  if (existing) return rowToBillingAccount(existing);

  const { data, error } = await supabase
    .from("tuition_billing_accounts")
    .insert({
      organization_id: organizationId,
      family_id: familyId,
    })
    .select("*")
    .single();

  if (error) throw error;
  return rowToBillingAccount(data);
}

export async function getAssignmentForEnrollment(
  supabase: SupabaseClient,
  enrollmentId: string,
): Promise<TuitionEnrollmentAssignment | null> {
  const { data, error } = await supabase
    .from("tuition_enrollment_assignments")
    .select("*")
    .eq("enrollment_id", enrollmentId)
    .maybeSingle();

  if (error) throw error;
  return data ? rowToAssignment(data) : null;
}

export async function createEnrollmentAssignment(
  supabase: SupabaseClient,
  input: {
    organizationId: string;
    enrollmentId: string;
    familyId: string;
    ratePlanId: string;
    paymentPlanId: string;
    assignmentSource?: AssignmentSource;
    assignedByUserId?: string | null;
    effectiveStart?: string | null;
  },
): Promise<TuitionEnrollmentAssignment> {
  const { data, error } = await supabase
    .from("tuition_enrollment_assignments")
    .insert({
      organization_id: input.organizationId,
      enrollment_id: input.enrollmentId,
      family_id: input.familyId,
      rate_plan_id: input.ratePlanId,
      payment_plan_id: input.paymentPlanId,
      assignment_source: input.assignmentSource ?? "manual",
      assigned_by_user_id: input.assignedByUserId ?? null,
      effective_start: input.effectiveStart ?? null,
      status: "active",
    })
    .select("*")
    .single();

  if (error) throw error;
  return rowToAssignment(data);
}

export async function autoAssignTuitionForEnrollment(
  supabase: SupabaseClient,
  input: {
    organizationId: string;
    enrollmentId: string;
    familyId: string;
    programId: string;
    assignedByUserId?: string | null;
  },
): Promise<TuitionEnrollmentAssignment | null> {
  const existing = await getAssignmentForEnrollment(supabase, input.enrollmentId);
  if (existing) return existing;

  const ratePlan = await getDefaultRatePlanForProgram(
    supabase,
    input.organizationId,
    input.programId,
  );
  if (!ratePlan) return null;

  const defaultPaymentPlan =
    ratePlan.paymentPlans.find((p) => p.isDefault) ??
    ratePlan.paymentPlans[0];
  if (!defaultPaymentPlan) return null;

  await ensureBillingAccount(supabase, input.organizationId, input.familyId);

  const assignment = await createEnrollmentAssignment(supabase, {
    organizationId: input.organizationId,
    enrollmentId: input.enrollmentId,
    familyId: input.familyId,
    ratePlanId: ratePlan.id,
    paymentPlanId: defaultPaymentPlan.id,
    assignmentSource: "default",
    assignedByUserId: input.assignedByUserId ?? null,
    effectiveStart: ratePlan.effectiveStart,
  });

  await evaluateAndApplyRulesForAssignment(supabase, assignment.id);
  await regenerateFutureCharges(supabase, assignment.id);

  return assignment;
}

export async function listAssignmentsForOrganization(
  supabase: SupabaseClient,
  organizationId: string,
): Promise<TuitionEnrollmentAssignment[]> {
  const { data, error } = await supabase
    .from("tuition_enrollment_assignments")
    .select("*")
    .eq("organization_id", organizationId)
    .eq("status", "active");

  if (error) throw error;
  return (data ?? []).map(rowToAssignment);
}

export async function updateAssignment(
  supabase: SupabaseClient,
  assignmentId: string,
  input: Partial<{
    ratePlanId: string;
    paymentPlanId: string;
    status: TuitionEnrollmentAssignment["status"];
  }>,
): Promise<TuitionEnrollmentAssignment> {
  const patch: Record<string, unknown> = {
    assignment_source: "manual",
  };
  if (input.ratePlanId !== undefined) patch.rate_plan_id = input.ratePlanId;
  if (input.paymentPlanId !== undefined) patch.payment_plan_id = input.paymentPlanId;
  if (input.status !== undefined) patch.status = input.status;

  const { data, error } = await supabase
    .from("tuition_enrollment_assignments")
    .update(patch)
    .eq("id", assignmentId)
    .select("*")
    .single();

  if (error) throw error;

  if (input.ratePlanId || input.paymentPlanId) {
    await regenerateFutureCharges(supabase, assignmentId);
  }

  return rowToAssignment(data);
}
