import type { SupabaseClient } from "@supabase/supabase-js";
import {
  isPaymentPlanAllowedForBillingStart,
  normalizeBillingStartForSchedule,
  resolveAssignmentBillingStart,
} from "./billing-start";
import { regenerateFutureCharges } from "./charge-generator";
import { evaluateAndApplyRulesForAssignment } from "./rules-engine";
import { rowToAssignment, rowToBillingAccount } from "./row-mappers";
import { getDefaultRatePlanForProgram, getRatePlanWithDetails } from "./rate-plans";
import { getDefaultTierForRatePlan, getTierById } from "./rate-tiers";
import {
  ACTIVITY_ACTIONS,
  logTuitionActivity,
  summarizeAssignmentChanges,
  summarizeBackfillResult,
  type TuitionActivityOptions,
} from "./tuition-activity";
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

export function assignmentBillingStartLocked(
  assignment: Pick<TuitionEnrollmentAssignment, "metadata">,
): boolean {
  return assignment.metadata.billingStartLocked === true;
}

/** True when a PATCH effectiveStart value is an explicit change from stored. */
export function shouldSetBillingStartLocked(
  storedEffectiveStart: string | null,
  incomingEffectiveStart: string | null | undefined,
): boolean {
  if (incomingEffectiveStart === undefined) return false;
  return (incomingEffectiveStart ?? null) !== (storedEffectiveStart ?? null);
}

/** Enroll-complete date for billing; null while enrollment is still pending. */
export async function getBillingEnrollmentDate(
  supabase: SupabaseClient,
  enrollmentId: string,
): Promise<Date | null> {
  const { data, error } = await supabase
    .from("enrollments")
    .select("enrolled_at, status")
    .eq("id", enrollmentId)
    .maybeSingle();

  if (error) throw error;
  if (data?.enrolled_at) {
    return new Date(String(data.enrolled_at));
  }
  if (data?.status === "enrolled") {
    return null;
  }
  return null;
}

export async function resolveBillingStartForAssignment(
  supabase: SupabaseClient,
  input: {
    enrollmentId: string;
    ratePlanStart: string | null;
    billingDayOfMonth: number;
  },
): Promise<string | null> {
  const enrollmentDate = await getBillingEnrollmentDate(supabase, input.enrollmentId);
  if (!enrollmentDate) return null;

  return resolveAssignmentBillingStart({
    ratePlanStart: input.ratePlanStart,
    enrollmentDate,
    billingDayOfMonth: input.billingDayOfMonth,
  });
}

export async function ensureAssignmentBillingStart(
  supabase: SupabaseClient,
  assignment: TuitionEnrollmentAssignment,
): Promise<TuitionEnrollmentAssignment> {
  if (assignmentBillingStartLocked(assignment)) {
    return assignment;
  }

  const enrollmentDate = await getBillingEnrollmentDate(
    supabase,
    assignment.enrollmentId,
  );
  if (!enrollmentDate) {
    return assignment;
  }

  const ratePlan = await getRatePlanWithDetails(supabase, assignment.ratePlanId);
  if (!ratePlan) return assignment;

  const paymentPlan = ratePlan.paymentPlans.find(
    (plan) => plan.id === assignment.paymentPlanId,
  );
  const billingDay = paymentPlan?.billingDayOfMonth ?? 1;
  const resolvedStart = resolveAssignmentBillingStart({
    ratePlanStart: ratePlan.effectiveStart,
    enrollmentDate,
    billingDayOfMonth: billingDay,
  });
  if (!resolvedStart) return assignment;

  const billingStart = normalizeBillingStartForSchedule(resolvedStart, billingDay);
  const normalizedExisting = assignment.effectiveStart
    ? normalizeBillingStartForSchedule(assignment.effectiveStart, billingDay)
    : null;

  if (billingStart === normalizedExisting) {
    return assignment;
  }

  // Forward-only: fill missing starts or advance late joiners; never pull back admin delays.
  if (normalizedExisting != null && billingStart <= normalizedExisting) {
    return assignment;
  }

  const { data, error } = await supabase
    .from("tuition_enrollment_assignments")
    .update({ effective_start: billingStart })
    .eq("id", assignment.id)
    .select("*")
    .single();

  if (error) throw error;
  const updated = rowToAssignment(data);

  void logTuitionActivity(supabase, {
    organizationId: assignment.organizationId,
    action: ACTIVITY_ACTIONS.TUITION_ASSIGNMENT_UPDATED,
    entityType: "tuition_enrollment_assignment",
    entityId: assignment.id,
    summary: "Recomputed billing start from enrollment date",
    changeSummary: {
      changedFields: ["effectiveStart"],
      changes: [
        `Billing start changed from ${assignment.effectiveStart ?? "unset"} to ${billingStart}`,
      ],
    },
    metadata: {
      enrollmentId: assignment.enrollmentId,
      familyId: assignment.familyId,
      billingStartRecomputed: true,
    },
  });

  return updated;
}

export async function isEnrollmentEnrolled(
  supabase: SupabaseClient,
  enrollmentId: string,
): Promise<boolean> {
  const { data, error } = await supabase
    .from("enrollments")
    .select("status")
    .eq("id", enrollmentId)
    .maybeSingle();

  if (error) throw error;
  return data?.status === "enrolled";
}

export function shouldRegenerateChargesForAssignment(
  isEnrolled: boolean,
  assignment: Pick<TuitionEnrollmentAssignment, "metadata">,
): boolean {
  return isEnrolled && !assignmentNeedsPaymentPlanSelection(assignment);
}

async function maybeRegenerateChargesForAssignment(
  supabase: SupabaseClient,
  enrollmentId: string,
  assignment: TuitionEnrollmentAssignment,
): Promise<void> {
  const isEnrolled = await isEnrollmentEnrolled(supabase, enrollmentId);
  if (!shouldRegenerateChargesForAssignment(isEnrolled, assignment)) {
    return;
  }
  await regenerateFutureCharges(supabase, assignment.id);
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
  options?: TuitionActivityOptions,
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
  const assignment = rowToAssignment(data);

  if (!options?.skip) {
    const changeSummary = summarizeAssignmentChanges(null, assignment);
    void logTuitionActivity(supabase, {
      organizationId: input.organizationId,
      action: ACTIVITY_ACTIONS.TUITION_ASSIGNMENT_CREATED,
      entityType: "tuition_enrollment_assignment",
      entityId: assignment.id,
      summary: "Assigned tuition to enrollment",
      changeSummary,
      logWhenEmpty: true,
      metadata: {
        enrollmentId: input.enrollmentId,
        familyId: input.familyId,
        ratePlanId: input.ratePlanId,
      },
      context: options?.context,
    });
  }

  return assignment;
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
  options?: TuitionActivityOptions,
): Promise<TuitionEnrollmentAssignment | null> {
  const existing = await getAssignmentForEnrollment(supabase, input.enrollmentId);
  if (existing?.status === "active") {
    let assignment = existing;
    const isEnrolled = await isEnrollmentEnrolled(supabase, input.enrollmentId);
    if (isEnrolled) {
      assignment = await ensureAssignmentBillingStart(supabase, existing);
    }
    await maybeRegenerateChargesForAssignment(
      supabase,
      input.enrollmentId,
      assignment,
    );
    return assignment;
  }

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
      effectiveStart: null,
      status: "active",
      metadata,
    }, options);
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
      effectiveStart: null,
      metadata,
    }, options);
  }

  const isEnrolled = await isEnrollmentEnrolled(supabase, input.enrollmentId);
  if (isEnrolled) {
    assignment = await ensureAssignmentBillingStart(supabase, assignment);
  }

  await evaluateAndApplyRulesForAssignment(supabase, assignment.id);

  await maybeRegenerateChargesForAssignment(
    supabase,
    input.enrollmentId,
    assignment,
  );

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
    .in("status", ["enrolled", "pending"]);

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
      }, { skip: true });
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
  options?: TuitionActivityOptions,
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

  const summary = { assignedCount, failedCount, total };
  if (!options?.skip && total > 0) {
    void logTuitionActivity(supabase, {
      organizationId,
      action: ACTIVITY_ACTIONS.TUITION_ASSIGNMENT_CREATED,
      entityType: "organization",
      entityId: organizationId,
      summary: `Assigned tuition to ${assignedCount} enrollment${assignedCount === 1 ? "" : "s"}`,
      changeSummary: summarizeBackfillResult(summary),
      logWhenEmpty: true,
      context: options?.context,
    });
  }

  return summary;
}

export async function unassignTuitionAssignment(
  supabase: SupabaseClient,
  assignmentId: string,
  options?: TuitionActivityOptions,
): Promise<TuitionEnrollmentAssignment> {
  const before = await getAssignmentById(supabase, assignmentId);

  const { error: voidError } = await supabase
    .from("tuition_charges")
    .update({ status: "void" })
    .eq("assignment_id", assignmentId)
    .in("status", ["scheduled", "sent", "overdue"]);

  if (voidError) throw voidError;

  const assignment = await updateAssignment(
    supabase,
    assignmentId,
    { status: "ended" },
    { skip: true },
  );

  if (!options?.skip && before) {
    void logTuitionActivity(supabase, {
      organizationId: assignment.organizationId,
      action: ACTIVITY_ACTIONS.TUITION_ASSIGNMENT_UNASSIGNED,
      entityType: "tuition_enrollment_assignment",
      entityId: assignment.id,
      summary: "Unassigned tuition",
      changeSummary: {
        changedFields: ["status"],
        changes: ["Ended tuition assignment and voided open charges"],
      },
      metadata: {
        enrollmentId: assignment.enrollmentId,
        familyId: assignment.familyId,
      },
      logWhenEmpty: true,
      context: options?.context,
    });
  }

  return assignment;
}

export async function finalizeEnrollmentPaymentPlan(
  supabase: SupabaseClient,
  input: {
    assignmentId: string;
    paymentPlanId: string;
  },
  options?: TuitionActivityOptions,
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

  const ratePlan = await getRatePlanWithDetails(supabase, assignment.ratePlanId);
  if (!ratePlan) throw new Error("Rate plan not found.");

  const selectedPlan = ratePlan.paymentPlans.find(
    (plan) => plan.id === input.paymentPlanId,
  );
  if (!selectedPlan) throw new Error("Payment plan not found.");

  const isEnrolled = await isEnrollmentEnrolled(supabase, assignment.enrollmentId);
  const billingStart = isEnrolled
    ? await resolveBillingStartForAssignment(supabase, {
        enrollmentId: assignment.enrollmentId,
        ratePlanStart: ratePlan.effectiveStart,
        billingDayOfMonth: selectedPlan.billingDayOfMonth ?? 1,
      })
    : null;
  const validationStart = billingStart ?? ratePlan.effectiveStart;

  if (
    validationStart &&
    !isPaymentPlanAllowedForBillingStart(
      selectedPlan.installmentCount,
      ratePlan.effectiveStart,
      ratePlan.effectiveEnd,
      validationStart,
    )
  ) {
    throw new Error(
      "This payment schedule has too many installments for the remaining school year.",
    );
  }

  const { data, error } = await supabase
    .from("tuition_enrollment_assignments")
    .update({
      payment_plan_id: input.paymentPlanId,
      effective_start: billingStart,
      assignment_source: "manual",
      metadata: {
        ...assignment.metadata,
        pendingPaymentPlanSelection: false,
      },
    })
    .eq("id", input.assignmentId)
    .select("*")
    .single();

  if (error) throw error;

  const updated = rowToAssignment(data);
  await regenerateFutureCharges(supabase, updated.id);

  if (!options?.skip) {
    const changeSummary = summarizeAssignmentChanges(assignment, updated);
    void logTuitionActivity(supabase, {
      organizationId: updated.organizationId,
      action: ACTIVITY_ACTIONS.TUITION_ASSIGNMENT_UPDATED,
      entityType: "tuition_enrollment_assignment",
      entityId: updated.id,
      summary: "Finalized tuition payment plan selection",
      changeSummary,
      logWhenEmpty: true,
      context: options?.context,
      metadata: options?.activityMetadata,
    });
  }

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
    effectiveStart: string | null;
    status: TuitionEnrollmentAssignment["status"];
    metadata: TuitionEnrollmentAssignment["metadata"];
  }>,
  options?: TuitionActivityOptions,
): Promise<TuitionEnrollmentAssignment> {
  const before = await getAssignmentById(supabase, assignmentId);
  const patch: Record<string, unknown> = {
    assignment_source: "manual",
  };
  if (input.ratePlanId !== undefined) patch.rate_plan_id = input.ratePlanId;
  if (input.rateTierId !== undefined) patch.rate_tier_id = input.rateTierId;
  if (input.paymentPlanId !== undefined) patch.payment_plan_id = input.paymentPlanId;
  if (input.effectiveStart !== undefined) patch.effective_start = input.effectiveStart;
  if (input.status !== undefined) patch.status = input.status;
  if (input.metadata !== undefined) patch.metadata = input.metadata;

  const { data, error } = await supabase
    .from("tuition_enrollment_assignments")
    .update(patch)
    .eq("id", assignmentId)
    .select("*")
    .single();

  if (error) throw error;

  if (
    input.ratePlanId ||
    input.rateTierId ||
    input.paymentPlanId ||
    input.effectiveStart !== undefined
  ) {
    await regenerateFutureCharges(supabase, assignmentId);
  }

  const assignment = rowToAssignment(data);

  if (!options?.skip && before) {
    const changeSummary = summarizeAssignmentChanges(before, assignment);
    void logTuitionActivity(supabase, {
      organizationId: assignment.organizationId,
      action: before
        ? ACTIVITY_ACTIONS.TUITION_ASSIGNMENT_UPDATED
        : ACTIVITY_ACTIONS.TUITION_ASSIGNMENT_CREATED,
      entityType: "tuition_enrollment_assignment",
      entityId: assignment.id,
      summary: "Updated tuition assignment",
      changeSummary,
      metadata: {
        enrollmentId: assignment.enrollmentId,
        familyId: assignment.familyId,
      },
      context: options?.context,
    });
  }

  return assignment;
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
