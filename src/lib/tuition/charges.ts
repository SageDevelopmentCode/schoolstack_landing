import type { SupabaseClient } from "@supabase/supabase-js";
import { ACTIVITY_ACTIONS } from "@/lib/activity-log";
import {
  formatActiveAdjustmentsList,
  formatAssignmentAdjustmentBadgeLabel,
} from "./adjustment-impact";
import { formatBillingSplitSummary } from "./billing-splits";
import { computeFamilyAutopayStatus } from "./autopay-status";
import { computeFamilyBillingReadiness } from "./tuition-readiness";
import { rowToAdjustment, rowToCharge } from "./row-mappers";
import { resolveFamilyCatalogTuition } from "./pricing";
import type {
  ChargeStatus,
  EnrollmentBillingStatus,
  FamilyAssignmentSummary,
  FamilyBillingSummary,
  FamilyEnrollmentSummary,
  TuitionCharge,
  UnassignedEnrollmentSummary,
} from "./types";
import { paymentScheduleLabel } from "./setup-wizard";
import type { RawKpiChargeRow } from "./kpi-breakdown";
import {
  computeOutstandingCentsFromCharges,
  type OutstandingPeriod,
  type SchoolYearBounds,
} from "./outstanding-period";

export async function listChargesForFamily(
  supabase: SupabaseClient,
  familyId: string,
): Promise<TuitionCharge[]> {
  const { data, error } = await supabase
    .from("tuition_charges")
    .select("*")
    .eq("family_id", familyId)
    .not("status", "eq", "void")
    .order("due_date", { ascending: true });

  if (error) throw error;
  return (data ?? []).map(rowToCharge);
}

export function filterChargesForFamilyGuardian(
  charges: TuitionCharge[],
  guardianId: string | null,
  options?: { hasBillingSplit?: boolean },
): TuitionCharge[] {
  if (!options?.hasBillingSplit) {
    return charges;
  }

  if (!guardianId) {
    return charges.filter((charge) => charge.guardianId === null);
  }

  return charges.filter(
    (charge) => charge.guardianId === null || charge.guardianId === guardianId,
  );
}

export async function listChargesForFamilyGuardian(
  supabase: SupabaseClient,
  familyId: string,
  guardianId: string | null,
  options?: { hasBillingSplit?: boolean },
): Promise<TuitionCharge[]> {
  const charges = await listChargesForFamily(supabase, familyId);
  return filterChargesForFamilyGuardian(charges, guardianId, options);
}

export async function listChargesForAssignment(
  supabase: SupabaseClient,
  assignmentId: string,
): Promise<TuitionCharge[]> {
  const { data, error } = await supabase
    .from("tuition_charges")
    .select("*")
    .eq("assignment_id", assignmentId)
    .not("status", "eq", "void")
    .order("due_date", { ascending: true });

  if (error) throw error;
  return (data ?? []).map(rowToCharge);
}

export async function getChargeById(
  supabase: SupabaseClient,
  chargeId: string,
): Promise<TuitionCharge | null> {
  const { data, error } = await supabase
    .from("tuition_charges")
    .select("*")
    .eq("id", chargeId)
    .maybeSingle();

  if (error) throw error;
  return data ? rowToCharge(data) : null;
}

export async function updateChargeStatus(
  supabase: SupabaseClient,
  chargeId: string,
  status: ChargeStatus,
  extra?: { sentAt?: string; paidAt?: string },
): Promise<TuitionCharge> {
  const patch: Record<string, unknown> = { status };
  if (extra?.sentAt) patch.sent_at = extra.sentAt;
  if (extra?.paidAt) patch.paid_at = extra.paidAt;

  const { data, error } = await supabase
    .from("tuition_charges")
    .update(patch)
    .eq("id", chargeId)
    .select("*")
    .single();

  if (error) throw error;
  return rowToCharge(data);
}

export async function markChargePaid(
  supabase: SupabaseClient,
  chargeId: string,
  paidAt?: string,
): Promise<TuitionCharge> {
  return updateChargeStatus(supabase, chargeId, "paid", {
    paidAt: paidAt ?? new Date().toISOString(),
  });
}

export async function markChargeSent(
  supabase: SupabaseClient,
  chargeId: string,
): Promise<TuitionCharge> {
  return updateChargeStatus(supabase, chargeId, "sent", {
    sentAt: new Date().toISOString(),
  });
}

export async function voidCharge(
  supabase: SupabaseClient,
  chargeId: string,
): Promise<TuitionCharge> {
  return updateChargeStatus(supabase, chargeId, "void");
}

export function familyHasBillingRelevance(input: {
  assignmentCount: number;
  chargeCount: number;
  enrollmentCount: number;
}): boolean {
  return (
    input.assignmentCount > 0 ||
    input.chargeCount > 0 ||
    input.enrollmentCount > 0
  );
}

export async function listFamilyBillingSummaries(
  supabase: SupabaseClient,
  organizationId: string,
  options: { limit?: number | null; offset?: number } = {},
): Promise<FamilyBillingSummary[]> {
  const offset = Math.max(options.offset ?? 0, 0);
  const limit =
    options.limit === null
      ? null
      : Math.min(Math.max(options.limit ?? 100, 1), 500);

  let familiesQuery = supabase
    .from("families")
    .select("id, name, primary_email")
    .eq("organization_id", organizationId)
    .order("name", { ascending: true });

  if (limit != null) {
    familiesQuery = familiesQuery.range(offset, offset + limit - 1);
  }

  const { data: families, error: familiesError } = await familiesQuery;

  if (familiesError) throw familiesError;
  if (!families?.length) return [];

  const familyIds = families.map((f) => String(f.id));

  const { data: students, error: studentsError } = await supabase
    .from("students")
    .select("id, family_id, first_name, last_name")
    .in("family_id", familyIds);

  if (studentsError) throw studentsError;

  const studentIds = (students ?? []).map((s) => String(s.id));

  const [
    { data: billingAccounts },
    { data: assignments },
    { data: charges },
    { data: billingSplits },
    { data: paymentMethods },
    { data: autopayFailures },
    { data: guardians },
    { data: enrollments },
    { data: programs },
    { data: ratePlans },
    { data: tiers },
    { data: paymentPlans },
    { data: adjustmentRows },
  ] = await Promise.all([
    supabase
      .from("tuition_billing_accounts")
      .select(
        "id, organization_id, family_id, autopay_enabled, default_payment_method_id, billing_email, status, metadata, created_at, updated_at",
      )
      .eq("organization_id", organizationId)
      .in("family_id", familyIds),
    supabase
      .from("tuition_enrollment_assignments")
      .select(
        "id, family_id, enrollment_id, rate_plan_id, rate_tier_id, payment_plan_id, metadata",
      )
      .eq("organization_id", organizationId)
      .eq("status", "active")
      .in("family_id", familyIds),
    supabase
      .from("tuition_charges")
      .select(
        "id, family_id, amount_cents, paid_cents, status, due_date, label, paid_at",
      )
      .eq("organization_id", organizationId)
      .in("family_id", familyIds)
      .not("status", "eq", "void"),
    supabase
      .from("tuition_billing_splits")
      .select("family_id, share_bps, guardians(first_name, last_name)")
      .eq("organization_id", organizationId)
      .in("family_id", familyIds),
    supabase
      .from("family_payment_methods")
      .select("billing_account_id, guardian_id")
      .eq("organization_id", organizationId)
      .in("family_id", familyIds),
    supabase
      .from("activity_events")
      .select("metadata, created_at")
      .eq("organization_id", organizationId)
      .eq("action", ACTIVITY_ACTIONS.TUITION_AUTOPAY_FAILED)
      .order("created_at", { ascending: false })
      .limit(200),
    supabase
      .from("guardians")
      .select("id, family_id, first_name, last_name, email, user_id, relationship")
      .in("family_id", familyIds)
      .order("created_at", { ascending: true }),
    studentIds.length > 0
      ? supabase
          .from("enrollments")
          .select("id, student_id, program_id, status")
          .eq("organization_id", organizationId)
          .in("status", ["enrolled", "pending"])
          .in("student_id", studentIds)
      : Promise.resolve({
          data: [] as Array<{
            id: string;
            student_id: string;
            program_id: string;
            status: string;
          }>,
          error: null,
        }),
    supabase
      .from("programs")
      .select("id, name")
      .eq("organization_id", organizationId),
    supabase
      .from("tuition_rate_plans")
      .select("id, name, amount_cents")
      .eq("organization_id", organizationId),
    supabase
      .from("tuition_rate_tiers")
      .select("id, rate_plan_id, label, amount_cents, is_default")
      .eq("organization_id", organizationId),
    supabase
      .from("tuition_payment_plans")
      .select("id, rate_plan_id, name, installment_count")
      .eq("organization_id", organizationId),
    supabase
      .from("tuition_adjustments")
      .select("*")
      .eq("organization_id", organizationId)
      .eq("status", "active"),
  ]);

  const programMap = new Map(
    (programs ?? []).map((p) => [String(p.id), String(p.name)]),
  );
  const studentMap = new Map(
    (students ?? []).map((s) => [
      String(s.id),
      `${s.first_name} ${s.last_name}`.trim(),
    ]),
  );
  const enrollmentToStudent = new Map(
    (enrollments ?? []).map((e) => [String(e.id), String(e.student_id)]),
  );
  const enrollmentToProgram = new Map(
    (enrollments ?? []).map((e) => [String(e.id), String(e.program_id)]),
  );
  const enrollmentToStatus = new Map(
    (enrollments ?? []).map((e) => [
      String(e.id),
      String(e.status) as EnrollmentBillingStatus,
    ]),
  );
  const ratePlanMap = new Map(
    (ratePlans ?? []).map((plan) => [String(plan.id), String(plan.name)]),
  );
  const ratePlanAmountById = new Map(
    (ratePlans ?? []).map((plan) => [String(plan.id), Number(plan.amount_cents)]),
  );
  const tierMap = new Map(
    (tiers ?? []).map((tier) => [String(tier.id), String(tier.label)]),
  );
  const tierAmountById = new Map(
    (tiers ?? []).map((tier) => [String(tier.id), Number(tier.amount_cents)]),
  );
  const defaultTierAmountByRatePlanId = new Map<string, number>();
  for (const tier of tiers ?? []) {
    const ratePlanId = String(tier.rate_plan_id);
    if (tier.is_default === true) {
      defaultTierAmountByRatePlanId.set(ratePlanId, Number(tier.amount_cents));
      continue;
    }
    if (!defaultTierAmountByRatePlanId.has(ratePlanId)) {
      defaultTierAmountByRatePlanId.set(ratePlanId, Number(tier.amount_cents));
    }
  }
  const paymentPlanMap = new Map(
    (paymentPlans ?? []).map((plan) => [
      String(plan.id),
      {
        name: String(plan.name),
        installmentCount: Number(plan.installment_count),
      },
    ]),
  );

  const adjustmentsByAssignment = new Map<string, ReturnType<typeof rowToAdjustment>[]>();
  for (const row of adjustmentRows ?? []) {
    const assignmentId = String(row.assignment_id);
    const existing = adjustmentsByAssignment.get(assignmentId) ?? [];
    existing.push(rowToAdjustment(row));
    adjustmentsByAssignment.set(assignmentId, existing);
  }

  const billingSplitsByFamily = new Map<string, Array<{ shareBps: number; guardianName: string }>>();
  for (const row of billingSplits ?? []) {
    const familyId = String(row.family_id);
    const guardian = row.guardians as
      | { first_name?: string; last_name?: string }
      | null
      | undefined;
    const guardianName = guardian
      ? [guardian.first_name, guardian.last_name].filter(Boolean).join(" ").trim()
      : "Guardian";
    const existing = billingSplitsByFamily.get(familyId) ?? [];
    existing.push({
      shareBps: Number(row.share_bps),
      guardianName: guardianName || "Guardian",
    });
    billingSplitsByFamily.set(familyId, existing);
  }

  const guardiansByFamily = new Map<
    string,
    Array<{
      id: string;
      firstName: string;
      lastName: string;
      email: string | null;
      userId: string | null;
      relationship: string | null;
      isLinked: boolean;
    }>
  >();
  for (const row of guardians ?? []) {
    const familyId = String(row.family_id);
    const userId =
      row.user_id != null && String(row.user_id).trim() !== ""
        ? String(row.user_id)
        : null;
    const existing = guardiansByFamily.get(familyId) ?? [];
    existing.push({
      id: String(row.id),
      firstName: String(row.first_name ?? ""),
      lastName: String(row.last_name ?? ""),
      email: typeof row.email === "string" ? row.email : null,
      userId,
      relationship: typeof row.relationship === "string" ? row.relationship : null,
      isLinked: userId != null,
    });
    guardiansByFamily.set(familyId, existing);
  }

  const lastFailureByFamily = new Map<string, string>();
  for (const row of autopayFailures ?? []) {
    const metadata =
      row.metadata &&
      typeof row.metadata === "object" &&
      !Array.isArray(row.metadata)
        ? (row.metadata as Record<string, unknown>)
        : {};
    const failedFamilyId =
      typeof metadata.familyId === "string" ? metadata.familyId : null;
    if (failedFamilyId && !lastFailureByFamily.has(failedFamilyId)) {
      lastFailureByFamily.set(failedFamilyId, String(row.created_at));
    }
  }

  const yearStart = new Date();
  yearStart.setUTCMonth(0, 1);
  yearStart.setUTCHours(0, 0, 0, 0);

  return families.map((family) => {
    const familyId = String(family.id);
    const familyAssignments = (assignments ?? []).filter(
      (a) => String(a.family_id) === familyId,
    );
    const familyCharges = (charges ?? []).filter(
      (c) => String(c.family_id) === familyId,
    );
    const billingAccount = (billingAccounts ?? []).find(
      (b) => String(b.family_id) === familyId,
    );

    const openStatuses = new Set(["scheduled", "sent", "overdue"]);
    const openCharges = familyCharges.filter((c) =>
      openStatuses.has(String(c.status)),
    );
    const balanceDueCents = openCharges.reduce((sum, c) => {
      const amountCents = Number(c.amount_cents);
      const paidCents = Number(c.paid_cents ?? 0);
      return sum + Math.max(0, amountCents - paidCents);
    }, 0);
    const paidYtdCents = familyCharges
      .filter((c) => c.status === "paid" && new Date(String(c.paid_at)) >= yearStart)
      .reduce((sum, c) => sum + Number(c.amount_cents), 0);

    const nextOpen = openCharges.sort((a, b) =>
      String(a.due_date).localeCompare(String(b.due_date)),
    )[0];

    const hasOverdue = familyCharges.some((c) => c.status === "overdue");
    const hasSent = familyCharges.some((c) => c.status === "sent");

    const children = new Set<string>();
    const programNames = new Set<string>();
    const assignmentSummaries: FamilyAssignmentSummary[] = [];
    for (const assignment of familyAssignments) {
      const enrollmentId = String(assignment.enrollment_id);
      const studentId = enrollmentToStudent.get(enrollmentId);
      const programId = enrollmentToProgram.get(enrollmentId);
      const studentName = studentId ? studentMap.get(studentId) ?? null : null;
      if (studentId) {
        const name = studentMap.get(studentId);
        if (name) children.add(name);
      }
      if (programId) {
        const name = programMap.get(programId);
        if (name) programNames.add(name);
      }

      const paymentPlanId = String(assignment.payment_plan_id);
      const paymentPlan = paymentPlanMap.get(paymentPlanId);
      const ratePlanId = String(assignment.rate_plan_id);
      const metadata =
        assignment.metadata &&
        typeof assignment.metadata === "object" &&
        !Array.isArray(assignment.metadata)
          ? (assignment.metadata as Record<string, unknown>)
          : {};
      const assignmentId = String(assignment.id);
      const assignmentAdjustments = adjustmentsByAssignment.get(assignmentId) ?? [];

      assignmentSummaries.push({
        assignmentId,
        enrollmentId,
        studentName,
        enrollmentStatus: enrollmentToStatus.get(enrollmentId) ?? "enrolled",
        ratePlanName: ratePlanMap.get(ratePlanId) ?? "Rate plan",
        tierLabel:
          typeof assignment.rate_tier_id === "string"
            ? tierMap.get(assignment.rate_tier_id) ?? null
            : null,
        paymentPlanLabel: paymentPlan
          ? paymentPlan.name ||
            paymentScheduleLabel(paymentPlan.installmentCount)
          : "Payment plan",
        pendingPaymentPlanSelection: metadata.pendingPaymentPlanSelection === true,
        activeAdjustmentCount: assignmentAdjustments.length,
        adjustmentSummaryLabel:
          formatAssignmentAdjustmentBadgeLabel(assignmentAdjustments),
        adjustmentSummaryFull:
          assignmentAdjustments.length > 0
            ? formatActiveAdjustmentsList(assignmentAdjustments)
            : null,
      });
    }

    const familyStudentIds = new Set(
      (students ?? [])
        .filter((s) => String(s.family_id) === familyId)
        .map((s) => String(s.id)),
    );
    const familyEnrollments = (enrollments ?? []).filter((enrollment) =>
      familyStudentIds.has(String(enrollment.student_id)),
    );
    const assignedEnrollmentIds = new Set(
      familyAssignments.map((assignment) => String(assignment.enrollment_id)),
    );
    const enrolledFamilyEnrollments = familyEnrollments.filter(
      (enrollment) => String(enrollment.status) === "enrolled",
    );
    const unassignedEnrollments: UnassignedEnrollmentSummary[] = familyEnrollments
      .filter((enrollment) => !assignedEnrollmentIds.has(String(enrollment.id)))
      .map((enrollment) => ({
        enrollmentId: String(enrollment.id),
        studentName: studentMap.get(String(enrollment.student_id)) ?? "Student",
        programName:
          programMap.get(String(enrollment.program_id)) ?? "Program",
        status: String(enrollment.status) as UnassignedEnrollmentSummary["status"],
      }));

    for (const enrollment of familyEnrollments) {
      const studentId = String(enrollment.student_id);
      const name = studentMap.get(studentId);
      if (name) children.add(name);
      const programId = enrollmentToProgram.get(String(enrollment.id));
      if (programId) {
        const programName = programMap.get(programId);
        if (programName) programNames.add(programName);
      }
    }

    const familyEnrollmentSummaries: FamilyEnrollmentSummary[] = familyEnrollments.map(
      (enrollment) => ({
        enrollmentId: String(enrollment.id),
        studentName: studentMap.get(String(enrollment.student_id)) ?? "Student",
        programName:
          programMap.get(String(enrollment.program_id)) ?? "Program",
        status: String(enrollment.status) as EnrollmentBillingStatus,
      }),
    );

    const readiness = computeFamilyBillingReadiness({
      enrolledEnrollmentIds: enrolledFamilyEnrollments.map((enrollment) =>
        String(enrollment.id),
      ),
      assignments: assignmentSummaries,
      chargeCount: familyCharges.length,
    });

    const hasPendingEnrollment = familyEnrollments.some(
      (enrollment) => String(enrollment.status) === "pending",
    );

    const hasBillingRelevance = familyHasBillingRelevance({
      assignmentCount: familyAssignments.length,
      chargeCount: familyCharges.length,
      enrollmentCount: familyEnrollments.length,
    });

    const familySplitRows = billingSplitsByFamily.get(familyId) ?? [];
    const hasBillingSplit = familySplitRows.length > 0;
    const billingSplitSummary = hasBillingSplit
      ? formatBillingSplitSummary(
          familySplitRows.map((row, index) => ({
            id: `${familyId}-${index}`,
            organizationId,
            familyId,
            guardianId: "",
            shareBps: row.shareBps,
            createdAt: "",
            updatedAt: "",
            guardianName: row.guardianName,
          })),
        )
      : null;

    const familyAutopay = computeFamilyAutopayStatus({
      billingAccountRow: billingAccount ?? null,
      guardians: guardiansByFamily.get(familyId) ?? [],
      paymentMethods: (paymentMethods ?? []).map((method) => ({
        billing_account_id: String(method.billing_account_id),
        guardian_id:
          method.guardian_id === null || method.guardian_id === undefined
            ? null
            : String(method.guardian_id),
      })),
      hasBillingSplit,
    });

    const catalogTuition = resolveFamilyCatalogTuition({
      assignments: familyAssignments.map((assignment) => {
        const assignmentId = String(assignment.id);
        const assignmentAdjustments = adjustmentsByAssignment.get(assignmentId) ?? [];
        return {
          rateTierId:
            typeof assignment.rate_tier_id === "string"
              ? assignment.rate_tier_id
              : null,
          ratePlanId: String(assignment.rate_plan_id),
          adjustments: assignmentAdjustments.map((adjustment) => ({
            adjustmentType: adjustment.adjustmentType,
            valuePercent: adjustment.valuePercent,
            valueCents: adjustment.valueCents,
            priority: adjustment.priority,
            scope: adjustment.scope,
          })),
        };
      }),
      tierAmountById,
      ratePlanAmountById,
      defaultTierAmountByRatePlanId,
      balanceDueCents,
    });

    return {
      familyId,
      familyName: String(family.name),
      primaryEmail:
        typeof family.primary_email === "string" ? family.primary_email : null,
      children: [...children],
      programs: [...programNames],
      balanceDueCents,
      paidYtdCents,
      nextDue: nextOpen
        ? {
            date: String(nextOpen.due_date),
            amountCents: Number(nextOpen.amount_cents),
            label: String(nextOpen.label),
          }
        : null,
      autopayEnabled: familyAutopay.autopayStatus !== "off",
      autopayStatus: familyAutopay.autopayStatus,
      guardianAutopay: familyAutopay.guardianAutopay,
      hasPaymentMethod: familyAutopay.hasPaymentMethod,
      lastAutopayFailedAt: lastFailureByFamily.get(familyId) ?? null,
      status: hasOverdue
        ? "overdue"
        : hasSent
          ? "invoice_sent"
          : "current",
      assignmentIds: familyAssignments.map((a) => String(a.id)),
      assignments: assignmentSummaries,
      enrollments: familyEnrollmentSummaries,
      unassignedEnrollments,
      readiness,
      billingSplitSummary,
      hasBillingSplit,
      hasPendingEnrollment,
      catalogTuition,
      hasBillingRelevance,
    } satisfies FamilyBillingSummary & { hasBillingRelevance: boolean };
  })
    .filter((summary) => summary.hasBillingRelevance)
    .map(({ hasBillingRelevance: _ignored, ...summary }) => summary)
    .sort((a, b) => {
      if (b.balanceDueCents !== a.balanceDueCents) {
        return b.balanceDueCents - a.balanceDueCents;
      }
      return a.familyName.localeCompare(b.familyName);
    });
}

export async function getTuitionKpis(
  supabase: SupabaseClient,
  organizationId: string,
  options?: {
    outstandingPeriod?: OutstandingPeriod;
    schoolYearBounds?: SchoolYearBounds;
    referenceDate?: Date;
  },
): Promise<{
  collectedYtdCents: number;
  outstandingCents: number;
  familiesAtRisk: number;
  activeAssignments: number;
}> {
  const outstandingPeriod = options?.outstandingPeriod ?? "current_month";
  const schoolYearBounds = options?.schoolYearBounds ?? {
    effectiveStart: null,
    effectiveEnd: null,
  };
  const referenceDate = options?.referenceDate ?? new Date();

  const [summaries, chargesResult, assignmentsResult] = await Promise.all([
    listFamilyBillingSummaries(supabase, organizationId, {
      limit: null,
    }),
    supabase
      .from("tuition_charges")
      .select("id, family_id, assignment_id, label, amount_cents, paid_cents, status, due_date, paid_at")
      .eq("organization_id", organizationId)
      .not("status", "eq", "void"),
    supabase
      .from("tuition_enrollment_assignments")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", organizationId)
      .eq("status", "active"),
  ]);

  if (chargesResult.error) throw chargesResult.error;
  if (assignmentsResult.error) throw assignmentsResult.error;

  const chargeRows = (chargesResult.data ?? []) as RawKpiChargeRow[];
  const outstandingCents = computeOutstandingCentsFromCharges(
    chargeRows,
    outstandingPeriod,
    schoolYearBounds,
    referenceDate,
  );

  return {
    collectedYtdCents: summaries.reduce((s, f) => s + f.paidYtdCents, 0),
    outstandingCents,
    familiesAtRisk: summaries.filter((f) => f.status === "overdue").length,
    activeAssignments: assignmentsResult.count ?? 0,
  };
}
