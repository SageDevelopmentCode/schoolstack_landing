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
  if (existing?.status === "active") return existing;

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
  const metadata = multiplePaymentPlans
    ? { pendingPaymentPlanSelection: true }
    : {};

  let assignment: TuitionEnrollmentAssignment;

  if (existing) {
    assignment = await updateAssignment(supabase, existing.id, {
      ratePlanId: ratePlan.id,
      rateTierId: defaultTier?.id ?? null,
      paymentPlanId: defaultPaymentPlan.id,
      status: "active",
      metadata,
    });
  } else {
    assignment = await createEnrollmentAssignment(supabase, {
      organizationId: input.organizationId,
      enrollmentId: input.enrollmentId,
      familyId: input.familyId,
      ratePlanId: ratePlan.id,
      rateTierId: defaultTier?.id ?? null,
      paymentPlanId: defaultPaymentPlan.id,
      assignmentSource: "default",
      assignedByUserId: input.assignedByUserId ?? null,
      effectiveStart: ratePlan.effectiveStart,
      metadata,
    });
  }

  await evaluateAndApplyRulesForAssignment(supabase, assignment.id);

  if (!multiplePaymentPlans) {
    await regenerateFutureCharges(supabase, assignment.id);
  }

  return assignment;
}

export type TuitionAssignmentBackfillResult = {
  assignedCount: number;
  failedCount: number;
  total: number;
};

export async function backfillTuitionAssignmentsForRatePlan(
  supabase: SupabaseClient,
  ratePlanId: string,
  assignedByUserId?: string | null,
): Promise<TuitionAssignmentBackfillResult> {
  const { data: ratePlan, error: ratePlanError } = await supabase
    .from("tuition_rate_plans")
    .select("id, organization_id, program_id, status")
    .eq("id", ratePlanId)
    .maybeSingle();

  if (ratePlanError) throw ratePlanError;
  if (!ratePlan || ratePlan.status !== "active") {
    return { assignedCount: 0, failedCount: 0, total: 0 };
  }

  return backfillTuitionAssignmentsForProgram(
    supabase,
    {
      organizationId: String(ratePlan.organization_id),
      programId: String(ratePlan.program_id),
      assignedByUserId,
    },
  );
}

export async function backfillTuitionAssignmentsForProgram(
  supabase: SupabaseClient,
  input: {
    organizationId: string;
    programId: string;
    assignedByUserId?: string | null;
  },
): Promise<TuitionAssignmentBackfillResult> {
  const { data: enrollments, error: enrollmentsError } = await supabase
    .from("enrollments")
    .select("id, student_id")
    .eq("organization_id", input.organizationId)
    .eq("program_id", input.programId)
    .eq("status", "enrolled");

  if (enrollmentsError) throw enrollmentsError;
  if (!enrollments?.length) {
    return { assignedCount: 0, failedCount: 0, total: 0 };
  }

  const enrollmentIds = enrollments.map((row) => String(row.id));
  const { data: assignments, error: assignmentsError } = await supabase
    .from("tuition_enrollment_assignments")
    .select("enrollment_id")
    .eq("organization_id", input.organizationId)
    .eq("status", "active")
    .in("enrollment_id", enrollmentIds);

  if (assignmentsError) throw assignmentsError;

  const assignedEnrollmentIds = new Set(
    (assignments ?? []).map((row) => String(row.enrollment_id)),
  );
  const unassigned = enrollments.filter(
    (row) => !assignedEnrollmentIds.has(String(row.id)),
  );

  const studentIds = unassigned.map((row) => String(row.student_id));
  const { data: students, error: studentsError } = studentIds.length
    ? await supabase
        .from("students")
        .select("id, family_id")
        .in("id", studentIds)
    : { data: [], error: null };

  if (studentsError) throw studentsError;

  const familyByStudent = new Map(
    (students ?? []).map((student) => [String(student.id), String(student.family_id)]),
  );

  let assignedCount = 0;
  let failedCount = 0;

  for (const enrollment of unassigned) {
    const familyId = familyByStudent.get(String(enrollment.student_id));
    if (!familyId) {
      failedCount += 1;
      continue;
    }

    try {
      const assignment = await autoAssignTuitionForEnrollment(supabase, {
        organizationId: input.organizationId,
        enrollmentId: String(enrollment.id),
        familyId,
        programId: input.programId,
        assignedByUserId: input.assignedByUserId,
      });
      if (assignment) assignedCount += 1;
      else failedCount += 1;
    } catch {
      failedCount += 1;
    }
  }

  return {
    assignedCount,
    failedCount,
    total: unassigned.length,
  };
}

export async function backfillTuitionAssignmentsForOrganization(
  supabase: SupabaseClient,
  organizationId: string,
  assignedByUserId?: string | null,
): Promise<TuitionAssignmentBackfillResult> {
  const { data: ratePlans, error: ratePlansError } = await supabase
    .from("tuition_rate_plans")
    .select("id, program_id")
    .eq("organization_id", organizationId)
    .eq("status", "active");

  if (ratePlansError) throw ratePlansError;
  if (!ratePlans?.length) {
    return { assignedCount: 0, failedCount: 0, total: 0 };
  }

  let assignedCount = 0;
  let failedCount = 0;
  let total = 0;

  for (const ratePlan of ratePlans) {
    const result = await backfillTuitionAssignmentsForProgram(supabase, {
      organizationId,
      programId: String(ratePlan.program_id),
      assignedByUserId,
    });
    assignedCount += result.assignedCount;
    failedCount += result.failedCount;
    total += result.total;
  }

  return { assignedCount, failedCount, total };
}

export async function unassignTuitionAssignment(
  supabase: SupabaseClient,
  assignmentId: string,
): Promise<TuitionEnrollmentAssignment> {
  const { error: voidError } = await supabase
    .from("tuition_charges")
    .update({ status: "void" })
    .eq("assignment_id", assignmentId)
    .in("status", ["scheduled", "sent", "overdue"]);

  if (voidError) throw voidError;

  return updateAssignment(supabase, assignmentId, { status: "ended" });
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
