import type { SupabaseClient } from "@supabase/supabase-js";
import { schoolAdminPath } from "@/lib/organization-settings/admin-routes";
import type {
  FamilyAssignmentSummary,
  FamilyBillingReadinessState,
  UnassignedEnrollmentSummary,
} from "./types";

export type TuitionReadinessStepId =
  | "rate_plan"
  | "payment_plans"
  | "billing_schedule";

export type TuitionReadinessStepStatus =
  | "not_started"
  | "in_progress"
  | "completed";

export type TuitionReadinessStep = {
  id: TuitionReadinessStepId;
  title: string;
  description: string;
  status: TuitionReadinessStepStatus;
};

export type TuitionReadinessRawData = {
  hasActiveRatePlan: boolean;
  enrolledCount: number;
  unassignedEnrollmentCount: number;
  pendingPaymentPlanCount: number;
  assignmentsWithoutChargesCount: number;
};

export type TuitionReadinessStatus = {
  steps: TuitionReadinessStep[];
  completedCount: number;
  totalCount: number;
  firstIncompleteStepId: TuitionReadinessStepId | null;
  enrolledCount: number;
  unassignedEnrollmentCount: number;
  pendingPaymentPlanCount: number;
  assignmentsWithoutChargesCount: number;
};

export type FamilyBillingReadiness = {
  state: FamilyBillingReadinessState;
  unassignedEnrollments: UnassignedEnrollmentSummary[];
  pendingPaymentPlanAssignments: FamilyAssignmentSummary[];
  enrollmentChecklistHref: string | null;
  firstChargeDue: { date: string; amountCents: number; label: string } | null;
  childrenNames: string[];
};

export function computeRatePlanStepStatus(
  hasActiveRatePlan: boolean,
): TuitionReadinessStepStatus {
  return hasActiveRatePlan ? "completed" : "not_started";
}

export function computeAssignEnrollmentsStepStatus(
  data: Pick<
    TuitionReadinessRawData,
    "hasActiveRatePlan" | "enrolledCount" | "unassignedEnrollmentCount"
  >,
): TuitionReadinessStepStatus {
  if (!data.hasActiveRatePlan) return "not_started";
  if (data.enrolledCount === 0 || data.unassignedEnrollmentCount === 0) {
    return "completed";
  }
  return "in_progress";
}

function enrollmentsAreAssigned(
  data: Pick<TuitionReadinessRawData, "hasActiveRatePlan" | "unassignedEnrollmentCount">,
): boolean {
  return data.hasActiveRatePlan && data.unassignedEnrollmentCount === 0;
}

export function computePaymentPlansStepStatus(
  data: Pick<
    TuitionReadinessRawData,
    | "hasActiveRatePlan"
    | "unassignedEnrollmentCount"
    | "pendingPaymentPlanCount"
  >,
): TuitionReadinessStepStatus {
  if (!enrollmentsAreAssigned(data)) {
    return "not_started";
  }
  if (data.pendingPaymentPlanCount === 0) return "completed";
  return "in_progress";
}

export function computeBillingScheduleStepStatus(
  data: Pick<
    TuitionReadinessRawData,
    | "hasActiveRatePlan"
    | "enrolledCount"
    | "unassignedEnrollmentCount"
    | "assignmentsWithoutChargesCount"
    | "pendingPaymentPlanCount"
  >,
  paymentPlanStatus: TuitionReadinessStepStatus,
): TuitionReadinessStepStatus {
  if (!enrollmentsAreAssigned(data) || paymentPlanStatus !== "completed") {
    return "not_started";
  }
  if (data.enrolledCount === 0 || data.assignmentsWithoutChargesCount === 0) {
    return "completed";
  }
  return "in_progress";
}

export function buildTuitionReadinessStatus(
  data: TuitionReadinessRawData,
): TuitionReadinessStatus {
  const ratePlanStatus = computeRatePlanStepStatus(data.hasActiveRatePlan);
  const paymentPlanStatus = computePaymentPlansStepStatus(data);
  const billingStatus = computeBillingScheduleStepStatus(data, paymentPlanStatus);

  const steps: TuitionReadinessStep[] = [
    {
      id: "rate_plan",
      title: "Publish a rate plan",
      description:
        "Set tuition amounts, payment schedules, and school-year dates for each program.",
      status: ratePlanStatus,
    },
    {
      id: "payment_plans",
      title: "Families choose payment schedules",
      description:
        "When multiple installment options exist, families confirm their schedule in the parent portal under Billing. Admins can set the payment schedule from Set schedule if needed.",
      status: paymentPlanStatus,
    },
    {
      id: "billing_schedule",
      title: "Generate billing schedules",
      description:
        "Charges appear once assignments are complete and payment plans are finalized.",
      status: billingStatus,
    },
  ];

  const completedCount = steps.filter((step) => step.status === "completed").length;
  const firstIncompleteStepId =
    steps.find((step) => step.status !== "completed")?.id ?? null;

  return {
    steps,
    completedCount,
    totalCount: steps.length,
    firstIncompleteStepId,
    enrolledCount: data.enrolledCount,
    unassignedEnrollmentCount: data.unassignedEnrollmentCount,
    pendingPaymentPlanCount: data.pendingPaymentPlanCount,
    assignmentsWithoutChargesCount: data.assignmentsWithoutChargesCount,
  };
}

export function computeFamilyBillingReadiness(input: {
  enrolledEnrollmentIds: string[];
  assignments: FamilyAssignmentSummary[];
  chargeCount: number;
}): FamilyBillingReadinessState {
  const assignedEnrollmentIds = new Set(
    input.assignments.map((assignment) => assignment.enrollmentId),
  );
  const hasUnassigned = input.enrolledEnrollmentIds.some(
    (enrollmentId) => !assignedEnrollmentIds.has(enrollmentId),
  );
  if (hasUnassigned) return "needs_assignment";
  if (input.assignments.some((assignment) => assignment.pendingPaymentPlanSelection)) {
    return "needs_payment_plan";
  }
  if (input.assignments.length > 0 && input.chargeCount === 0) {
    return "no_charges";
  }
  return "ready";
}

function parseAssignmentMetadata(metadata: unknown): Record<string, unknown> {
  if (metadata && typeof metadata === "object" && !Array.isArray(metadata)) {
    return metadata as Record<string, unknown>;
  }
  return {};
}

export async function fetchTuitionReadinessRawData(
  supabase: SupabaseClient,
  organizationId: string,
): Promise<TuitionReadinessRawData> {
  const [
    { count: activeRatePlanCount, error: ratePlanError },
    { data: enrollments, error: enrollmentsError },
    { data: assignments, error: assignmentsError },
    { data: charges, error: chargesError },
  ] = await Promise.all([
    supabase
      .from("tuition_rate_plans")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", organizationId)
      .eq("status", "active"),
    supabase
      .from("enrollments")
      .select("id")
      .eq("organization_id", organizationId)
      .eq("status", "enrolled"),
    supabase
      .from("tuition_enrollment_assignments")
      .select("id, enrollment_id, metadata")
      .eq("organization_id", organizationId)
      .eq("status", "active"),
    supabase
      .from("tuition_charges")
      .select("assignment_id")
      .eq("organization_id", organizationId)
      .not("status", "eq", "void"),
  ]);

  if (ratePlanError) throw ratePlanError;
  if (enrollmentsError) throw enrollmentsError;
  if (assignmentsError) throw assignmentsError;
  if (chargesError) throw chargesError;

  const enrolledIds = new Set((enrollments ?? []).map((row) => String(row.id)));
  const assignmentEnrollmentIds = new Set(
    (assignments ?? []).map((row) => String(row.enrollment_id)),
  );
  const unassignedEnrollmentCount = [...enrolledIds].filter(
    (enrollmentId) => !assignmentEnrollmentIds.has(enrollmentId),
  ).length;

  const pendingPaymentPlanCount = (assignments ?? []).filter((row) => {
    const metadata = parseAssignmentMetadata(row.metadata);
    return metadata.pendingPaymentPlanSelection === true;
  }).length;

  const assignmentIdsWithCharges = new Set(
    (charges ?? []).map((row) => String(row.assignment_id)),
  );
  const assignmentsWithoutChargesCount = (assignments ?? []).filter((row) => {
    const metadata = parseAssignmentMetadata(row.metadata);
    if (metadata.pendingPaymentPlanSelection === true) return false;
    return !assignmentIdsWithCharges.has(String(row.id));
  }).length;

  return {
    hasActiveRatePlan: (activeRatePlanCount ?? 0) > 0,
    enrolledCount: enrolledIds.size,
    unassignedEnrollmentCount,
    pendingPaymentPlanCount,
    assignmentsWithoutChargesCount,
  };
}

export async function fetchTuitionReadinessStatus(
  supabase: SupabaseClient,
  organizationId: string,
): Promise<TuitionReadinessStatus> {
  const raw = await fetchTuitionReadinessRawData(supabase, organizationId);
  return buildTuitionReadinessStatus(raw);
}

export type UnassignedEnrollmentRecord = {
  enrollmentId: string;
  familyId: string;
  programId: string;
  studentName: string;
  programName: string;
};

export async function listUnassignedEnrollmentsForOrganization(
  supabase: SupabaseClient,
  organizationId: string,
): Promise<UnassignedEnrollmentRecord[]> {
  const [
    { data: enrollments, error: enrollmentsError },
    { data: assignments, error: assignmentsError },
    { data: students, error: studentsError },
    { data: programs, error: programsError },
  ] = await Promise.all([
    supabase
      .from("enrollments")
      .select("id, student_id, program_id")
      .eq("organization_id", organizationId)
      .eq("status", "enrolled"),
    supabase
      .from("tuition_enrollment_assignments")
      .select("enrollment_id")
      .eq("organization_id", organizationId)
      .eq("status", "active"),
    supabase
      .from("students")
      .select("id, family_id, first_name, last_name")
      .eq("organization_id", organizationId),
    supabase
      .from("programs")
      .select("id, name")
      .eq("organization_id", organizationId),
  ]);

  if (enrollmentsError) throw enrollmentsError;
  if (assignmentsError) throw assignmentsError;
  if (studentsError) throw studentsError;
  if (programsError) throw programsError;

  const assignedEnrollmentIds = new Set(
    (assignments ?? []).map((row) => String(row.enrollment_id)),
  );
  const studentMap = new Map(
    (students ?? []).map((student) => [
      String(student.id),
      {
        familyId: String(student.family_id),
        name: `${student.first_name} ${student.last_name}`.trim(),
      },
    ]),
  );
  const programMap = new Map(
    (programs ?? []).map((program) => [String(program.id), String(program.name)]),
  );

  return (enrollments ?? [])
    .filter((enrollment) => !assignedEnrollmentIds.has(String(enrollment.id)))
    .map((enrollment) => {
      const student = studentMap.get(String(enrollment.student_id));
      return {
        enrollmentId: String(enrollment.id),
        familyId: student?.familyId ?? "",
        programId: String(enrollment.program_id),
        studentName: student?.name ?? "Student",
        programName: programMap.get(String(enrollment.program_id)) ?? "Program",
      };
    })
    .filter((record) => record.familyId.length > 0);
}

export async function fetchFamilyBillingReadiness(
  supabase: SupabaseClient,
  input: {
    organizationId: string;
    familyId: string;
    slug: string;
  },
): Promise<FamilyBillingReadiness> {
  const { organizationId, familyId, slug } = input;

  const { data: students, error: studentsError } = await supabase
    .from("students")
    .select("id, first_name, last_name")
    .eq("family_id", familyId);

  if (studentsError) throw studentsError;

  const familyStudentIds = (students ?? []).map((row) => String(row.id));

  const [
    { data: enrollments, error: enrollmentsError },
    { data: assignments, error: assignmentsError },
    { data: charges, error: chargesError },
    { data: programs, error: programsError },
    { data: ratePlans, error: ratePlansError },
    { data: tiers, error: tiersError },
    { data: paymentPlans, error: paymentPlansError },
  ] = await Promise.all([
    familyStudentIds.length > 0
      ? supabase
          .from("enrollments")
          .select("id, student_id, program_id, status")
          .eq("organization_id", organizationId)
          .eq("status", "enrolled")
          .in("student_id", familyStudentIds)
      : Promise.resolve({ data: [] as Array<{
          id: string;
          student_id: string;
          program_id: string;
          status: string;
        }>, error: null }),
    supabase
      .from("tuition_enrollment_assignments")
      .select(
        "id, enrollment_id, rate_plan_id, rate_tier_id, payment_plan_id, metadata",
      )
      .eq("organization_id", organizationId)
      .eq("family_id", familyId)
      .eq("status", "active"),
    supabase
      .from("tuition_charges")
      .select("id, due_date, amount_cents, label, status")
      .eq("family_id", familyId)
      .not("status", "eq", "void")
      .order("due_date", { ascending: true }),
    supabase.from("programs").select("id, name").eq("organization_id", organizationId),
    supabase
      .from("tuition_rate_plans")
      .select("id, name")
      .eq("organization_id", organizationId),
    supabase
      .from("tuition_rate_tiers")
      .select("id, label")
      .eq("organization_id", organizationId),
    supabase
      .from("tuition_payment_plans")
      .select("id, name, installment_count")
      .eq("organization_id", organizationId),
  ]);

  if (enrollmentsError) throw enrollmentsError;
  if (assignmentsError) throw assignmentsError;
  if (chargesError) throw chargesError;
  if (programsError) throw programsError;
  if (ratePlansError) throw ratePlansError;
  if (tiersError) throw tiersError;
  if (paymentPlansError) throw paymentPlansError;

  const studentMap = new Map(
    (students ?? []).map((student) => [
      String(student.id),
      `${student.first_name} ${student.last_name}`.trim(),
    ]),
  );
  const programMap = new Map(
    (programs ?? []).map((program) => [String(program.id), String(program.name)]),
  );
  const ratePlanMap = new Map(
    (ratePlans ?? []).map((plan) => [String(plan.id), String(plan.name)]),
  );
  const tierMap = new Map(
    (tiers ?? []).map((tier) => [String(tier.id), String(tier.label)]),
  );
  const paymentPlanMap = new Map(
    (paymentPlans ?? []).map((plan) => [String(plan.id), String(plan.name)]),
  );

  const familyEnrollments = enrollments ?? [];
  const enrolledEnrollmentIds = familyEnrollments.map((enrollment) =>
    String(enrollment.id),
  );

  const assignmentSummaries: FamilyAssignmentSummary[] = (assignments ?? []).map(
    (assignment) => {
      const enrollmentId = String(assignment.enrollment_id);
      const studentId = familyEnrollments.find(
        (enrollment) => String(enrollment.id) === enrollmentId,
      )?.student_id;
      const metadata = parseAssignmentMetadata(assignment.metadata);
      const paymentPlanId = String(assignment.payment_plan_id);
      return {
        assignmentId: String(assignment.id),
        enrollmentId,
        studentName: studentId ? studentMap.get(String(studentId)) ?? null : null,
        ratePlanName:
          ratePlanMap.get(String(assignment.rate_plan_id)) ?? "Rate plan",
        tierLabel:
          typeof assignment.rate_tier_id === "string"
            ? tierMap.get(assignment.rate_tier_id) ?? null
            : null,
        paymentPlanLabel:
          paymentPlanMap.get(paymentPlanId) ?? "Payment plan",
        pendingPaymentPlanSelection: metadata.pendingPaymentPlanSelection === true,
      };
    },
  );

  const assignedEnrollmentIds = new Set(
    assignmentSummaries.map((assignment) => assignment.enrollmentId),
  );
  const unassignedEnrollments: UnassignedEnrollmentSummary[] = familyEnrollments
    .filter((enrollment) => !assignedEnrollmentIds.has(String(enrollment.id)))
    .map((enrollment) => ({
      enrollmentId: String(enrollment.id),
      studentName: studentMap.get(String(enrollment.student_id)) ?? "Student",
      programName: programMap.get(String(enrollment.program_id)) ?? "Program",
    }));

  const chargeRows = charges ?? [];
  const state = computeFamilyBillingReadiness({
    enrolledEnrollmentIds,
    assignments: assignmentSummaries,
    chargeCount: chargeRows.length,
  });

  const pendingPaymentPlanAssignments = assignmentSummaries.filter(
    (assignment) => assignment.pendingPaymentPlanSelection,
  );

  const childrenNames = [
    ...new Set(
      familyEnrollments
        .map((enrollment) => studentMap.get(String(enrollment.student_id)))
        .filter((name): name is string => Boolean(name)),
    ),
  ];

  let enrollmentChecklistHref: string | null = null;
  const pendingEnrollmentId =
    pendingPaymentPlanAssignments[0]?.enrollmentId ??
    unassignedEnrollments[0]?.enrollmentId ??
    null;

  if (pendingEnrollmentId && state !== "needs_payment_plan") {
    const { data: checklist, error: checklistError } = await supabase
      .from("enrollment_checklists")
      .select("application_id")
      .eq("enrollment_id", pendingEnrollmentId)
      .maybeSingle();

    if (!checklistError && checklist?.application_id) {
      enrollmentChecklistHref = `/school/${slug}/apply/${String(checklist.application_id)}/enrollment`;
    }
  }

  const openStatuses = new Set(["scheduled", "sent", "overdue"]);
  const firstOpenCharge = chargeRows.find((charge) =>
    openStatuses.has(String(charge.status)),
  );

  return {
    state,
    unassignedEnrollments,
    pendingPaymentPlanAssignments,
    enrollmentChecklistHref,
    firstChargeDue: firstOpenCharge
      ? {
          date: String(firstOpenCharge.due_date),
          amountCents: Number(firstOpenCharge.amount_cents),
          label: String(firstOpenCharge.label),
        }
      : null,
    childrenNames,
  };
}

export function tuitionReadinessPrimaryAction(
  status: TuitionReadinessStatus,
): {
  stepId: TuitionReadinessStepId;
  label: string;
} | null {
  if (!status.firstIncompleteStepId) return null;

  switch (status.firstIncompleteStepId) {
    case "rate_plan":
      return { stepId: "rate_plan", label: "Set up rate plan" };
    case "payment_plans":
      return {
        stepId: "payment_plans",
        label: "View families waiting",
      };
    case "billing_schedule":
      return {
        stepId: "billing_schedule",
        label: "Review family billing",
      };
    default:
      return null;
  }
}

export function tuitionFamiliesTabPath(slug: string): string {
  return schoolAdminPath(slug, "tuition");
}
