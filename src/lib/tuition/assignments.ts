import type { SupabaseClient } from "@supabase/supabase-js";
import { regenerateFutureCharges } from "./charge-generator";
import { evaluateAndApplyRulesForAssignment } from "./rules-engine";
import { rowToAssignment, rowToBillingAccount } from "./row-mappers";
import { getDefaultRatePlanForProgram } from "./rate-plans";
import { getDefaultTierForRatePlan, getTierById } from "./rate-tiers";
import type {
  AssignmentSource,
  TuitionBillingAccount,
  TuitionEnrollmentAssignment,
} from "./types";

export function assignmentNeedsPaymentPlanSelection(
  assignment: Pick<TuitionEnrollmentAssignment, "metadata">,
): boolean {
  return assignment.metadata.pendingPaymentPlanSelection === true;
}

export async function getAssignmentById(
  supabase: SupabaseClient,
  assignmentId: string,
): Promise<TuitionEnrollmentAssignment | null> {
  const { data, error } = await supabase
    .from("tuition_enrollment_assignments")
    .select("*")
    .eq("id", assignmentId)
    .maybeSingle();

  if (error) throw error;
  return data ? rowToAssignment(data) : null;
}

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
    rateTierId?: string | null;
    paymentPlanId: string;
    assignmentSource?: AssignmentSource;
    assignedByUserId?: string | null;
    effectiveStart?: string | null;
    metadata?: TuitionEnrollmentAssignment["metadata"];
  },
): Promise<TuitionEnrollmentAssignment> {
  const { data, error } = await supabase
    .from("tuition_enrollment_assignments")
    .insert({
      organization_id: input.organizationId,
      enrollment_id: input.enrollmentId,
      family_id: input.familyId,
      rate_plan_id: input.ratePlanId,
      rate_tier_id: input.rateTierId ?? null,
      payment_plan_id: input.paymentPlanId,
      assignment_source: input.assignmentSource ?? "manual",
      assigned_by_user_id: input.assignedByUserId ?? null,
      effective_start: input.effectiveStart ?? null,
      status: "active",
      metadata: input.metadata ?? {},
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

  const defaultTier = await getDefaultTierForRatePlan(supabase, ratePlan.id);

  await ensureBillingAccount(supabase, input.organizationId, input.familyId);

  const multiplePaymentPlans = ratePlan.paymentPlans.length > 1;

  const assignment = await createEnrollmentAssignment(supabase, {
    organizationId: input.organizationId,
    enrollmentId: input.enrollmentId,
    familyId: input.familyId,
    ratePlanId: ratePlan.id,
    rateTierId: defaultTier?.id ?? null,
    paymentPlanId: defaultPaymentPlan.id,
    assignmentSource: "default",
    assignedByUserId: input.assignedByUserId ?? null,
    effectiveStart: ratePlan.effectiveStart,
    metadata: multiplePaymentPlans
      ? { pendingPaymentPlanSelection: true }
      : {},
  });

  await evaluateAndApplyRulesForAssignment(supabase, assignment.id);

  if (!multiplePaymentPlans) {
    await regenerateFutureCharges(supabase, assignment.id);
  }

  return assignment;
}

export async function finalizeEnrollmentPaymentPlan(
  supabase: SupabaseClient,
  input: {
    assignmentId: string;
    paymentPlanId: string;
  },
): Promise<TuitionEnrollmentAssignment> {
  const { data: existing, error: existingError } = await supabase
    .from("tuition_enrollment_assignments")
    .select("*")
    .eq("id", input.assignmentId)
    .maybeSingle();

  if (existingError) throw existingError;
  if (!existing) throw new Error("Assignment not found");

  const assignment = rowToAssignment(existing);
  if (!assignmentNeedsPaymentPlanSelection(assignment)) {
    throw new Error("Payment plan has already been selected for this enrollment.");
  }

  const { data: paymentPlan, error: planError } = await supabase
    .from("tuition_payment_plans")
    .select("id, rate_plan_id")
    .eq("id", input.paymentPlanId)
    .maybeSingle();

  if (planError) throw planError;
  if (!paymentPlan) throw new Error("Payment plan not found.");
  if (String(paymentPlan.rate_plan_id) !== assignment.ratePlanId) {
    throw new Error("Payment plan does not belong to this rate plan.");
  }

  const { data, error } = await supabase
    .from("tuition_enrollment_assignments")
    .update({
      payment_plan_id: input.paymentPlanId,
      assignment_source: "manual",
      metadata: { pendingPaymentPlanSelection: false },
    })
    .eq("id", input.assignmentId)
    .select("*")
    .single();

  if (error) throw error;

  const updated = rowToAssignment(data);
  await regenerateFutureCharges(supabase, updated.id);
  return updated;
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
    rateTierId: string | null;
    paymentPlanId: string;
    status: TuitionEnrollmentAssignment["status"];
    metadata: TuitionEnrollmentAssignment["metadata"];
  }>,
): Promise<TuitionEnrollmentAssignment> {
  const patch: Record<string, unknown> = {
    assignment_source: "manual",
  };
  if (input.ratePlanId !== undefined) patch.rate_plan_id = input.ratePlanId;
  if (input.rateTierId !== undefined) patch.rate_tier_id = input.rateTierId;
  if (input.paymentPlanId !== undefined) patch.payment_plan_id = input.paymentPlanId;
  if (input.status !== undefined) patch.status = input.status;
  if (input.metadata !== undefined) patch.metadata = input.metadata;

  const { data, error } = await supabase
    .from("tuition_enrollment_assignments")
    .update(patch)
    .eq("id", assignmentId)
    .select("*")
    .single();

  if (error) throw error;

  if (input.ratePlanId || input.rateTierId || input.paymentPlanId) {
    await regenerateFutureCharges(supabase, assignmentId);
  }

  return rowToAssignment(data);
}

export async function resolveAssignmentTier(
  supabase: SupabaseClient,
  assignment: Pick<TuitionEnrollmentAssignment, "ratePlanId" | "rateTierId">,
) {
  if (assignment.rateTierId) {
    const tier = await getTierById(supabase, assignment.rateTierId);
    if (tier) return tier;
  }
  return getDefaultTierForRatePlan(supabase, assignment.ratePlanId);
}

export function computeInstallmentAmountCents(
  tierAnnualAmountCents: number,
  installmentCount: number,
): number {
  if (installmentCount < 1) {
    throw new Error("Installment count must be at least 1.");
  }
  return Math.round(tierAnnualAmountCents / installmentCount);
}
