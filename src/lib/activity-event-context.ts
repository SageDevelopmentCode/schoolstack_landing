import type { SupabaseClient } from "@supabase/supabase-js";
import { ACTIVITY_ACTIONS } from "@/lib/activity-log";

export type AssignmentActivityContext = {
  enrollmentId?: string | null;
  familyId?: string | null;
  familyName?: string | null;
  studentId?: string | null;
  studentName?: string | null;
  ratePlanId?: string | null;
  ratePlanName?: string | null;
  tierLabel?: string | null;
  paymentPlanName?: string | null;
};

type EventLike = {
  id: string;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  metadata: Record<string, unknown>;
};

function metadataString(
  metadata: Record<string, unknown>,
  key: string,
): string | null {
  const value = metadata[key];
  if (typeof value !== "string" || !value.trim()) return null;
  return value.trim();
}

function formatPersonName(
  firstName?: string | null,
  lastName?: string | null,
): string | null {
  const name = [firstName?.trim(), lastName?.trim()].filter(Boolean).join(" ");
  return name || null;
}

export type TuitionPaymentDisplayContext = {
  subjectLabel: string | null;
  chargeLabel: string | null;
  familyName: string | null;
  studentName: string | null;
  payerLabel: string | null;
};

export function resolveTuitionPaymentDisplayContext(
  event: EventLike,
  tuitionContextsByChargeId: Map<string, TuitionPaymentDisplayContext>,
): TuitionPaymentDisplayContext | null {
  const chargeId =
    event.entity_type === "tuition_charge" && event.entity_id
      ? event.entity_id
      : metadataString(event.metadata, "tuitionChargeId") ??
        metadataString(event.metadata, "chargeId");

  if (chargeId) {
    const fromCharge = tuitionContextsByChargeId.get(chargeId);
    if (fromCharge) return fromCharge;
  }

  const familyName = metadataString(event.metadata, "familyName");
  const payerLabel =
    metadataString(event.metadata, "payerLabel") ??
    metadataString(event.metadata, "guardianName");
  const chargeLabel = metadataString(event.metadata, "chargeLabel");

  if (familyName || payerLabel || chargeLabel) {
    return {
      subjectLabel: null,
      chargeLabel,
      familyName,
      studentName: null,
      payerLabel,
    };
  }

  return null;
}

export function isTuitionPaymentActivityAction(action: string): boolean {
  return (
    action === ACTIVITY_ACTIONS.TUITION_PAYMENT_COMPLETED ||
    action === ACTIVITY_ACTIONS.TUITION_PAYMENT_MANUAL ||
    action === ACTIVITY_ACTIONS.TUITION_AUTOPAY_SUCCEEDED
  );
}

export function isTuitionAssignmentAction(action: string): boolean {
  return (
    action === ACTIVITY_ACTIONS.TUITION_ASSIGNMENT_CREATED ||
    action === ACTIVITY_ACTIONS.TUITION_ASSIGNMENT_UPDATED ||
    action === ACTIVITY_ACTIONS.TUITION_ASSIGNMENT_UNASSIGNED
  );
}

export function assignmentContextFromMetadata(
  metadata: Record<string, unknown>,
): AssignmentActivityContext {
  return {
    enrollmentId: metadataString(metadata, "enrollmentId"),
    familyId: metadataString(metadata, "familyId"),
    familyName: metadataString(metadata, "familyName"),
    studentId: metadataString(metadata, "studentId"),
    studentName: metadataString(metadata, "studentName"),
    ratePlanId: metadataString(metadata, "ratePlanId"),
    ratePlanName: metadataString(metadata, "ratePlanName"),
    tierLabel: metadataString(metadata, "tierLabel"),
    paymentPlanName: metadataString(metadata, "paymentPlanName"),
  };
}

function mergeAssignmentContext(
  fromMetadata: AssignmentActivityContext,
  fromDb: AssignmentActivityContext | null,
): AssignmentActivityContext {
  if (!fromDb) return fromMetadata;
  return {
    enrollmentId: fromMetadata.enrollmentId ?? fromDb.enrollmentId,
    familyId: fromMetadata.familyId ?? fromDb.familyId,
    familyName: fromMetadata.familyName ?? fromDb.familyName,
    studentId: fromMetadata.studentId ?? fromDb.studentId,
    studentName: fromMetadata.studentName ?? fromDb.studentName,
    ratePlanId: fromMetadata.ratePlanId ?? fromDb.ratePlanId,
    ratePlanName: fromMetadata.ratePlanName ?? fromDb.ratePlanName,
    tierLabel: fromMetadata.tierLabel ?? fromDb.tierLabel,
    paymentPlanName: fromMetadata.paymentPlanName ?? fromDb.paymentPlanName,
  };
}

function resolveAssignmentId(event: EventLike): string | null {
  if (
    event.entity_type === "tuition_enrollment_assignment" &&
    event.entity_id
  ) {
    return event.entity_id;
  }
  return null;
}

export async function fetchAssignmentActivityContexts(
  supabase: SupabaseClient,
  events: EventLike[],
): Promise<Map<string, AssignmentActivityContext>> {
  const results = new Map<string, AssignmentActivityContext>();
  const assignmentIds = new Set<string>();
  const eventsByAssignmentId = new Map<string, EventLike[]>();

  for (const event of events) {
    if (!isTuitionAssignmentAction(event.action)) continue;
    const fromMetadata = assignmentContextFromMetadata(event.metadata);
    const assignmentId = resolveAssignmentId(event);
    if (assignmentId) {
      assignmentIds.add(assignmentId);
      const list = eventsByAssignmentId.get(assignmentId) ?? [];
      list.push(event);
      eventsByAssignmentId.set(assignmentId, list);
    } else {
      results.set(event.id, fromMetadata);
    }
  }

  if (assignmentIds.size === 0) {
    for (const event of events) {
      if (!isTuitionAssignmentAction(event.action)) continue;
      if (!results.has(event.id)) {
        results.set(event.id, assignmentContextFromMetadata(event.metadata));
      }
    }
    return results;
  }

  const { data: assignments, error: assignmentsError } = await supabase
    .from("tuition_enrollment_assignments")
    .select(
      "id, enrollment_id, family_id, rate_plan_id, rate_tier_id, payment_plan_id",
    )
    .in("id", [...assignmentIds]);

  if (assignmentsError) throw assignmentsError;

  const familyIds = [
    ...new Set(
      (assignments ?? [])
        .map((row) => (row.family_id ? String(row.family_id) : null))
        .filter((id): id is string => Boolean(id)),
    ),
  ];
  const enrollmentIds = [
    ...new Set(
      (assignments ?? [])
        .map((row) => (row.enrollment_id ? String(row.enrollment_id) : null))
        .filter((id): id is string => Boolean(id)),
    ),
  ];
  const ratePlanIds = [
    ...new Set(
      (assignments ?? [])
        .map((row) => (row.rate_plan_id ? String(row.rate_plan_id) : null))
        .filter((id): id is string => Boolean(id)),
    ),
  ];

  const familyNameById = new Map<string, string>();
  if (familyIds.length > 0) {
    const { data: families, error: familiesError } = await supabase
      .from("families")
      .select("id, name")
      .in("id", familyIds);
    if (familiesError) throw familiesError;
    for (const family of families ?? []) {
      const name = String(family.name ?? "").trim();
      if (name) familyNameById.set(String(family.id), name);
    }
  }

  const studentNameByEnrollmentId = new Map<string, string>();
  const studentIdByEnrollmentId = new Map<string, string>();
  if (enrollmentIds.length > 0) {
    const { data: enrollments, error: enrollmentsError } = await supabase
      .from("enrollments")
      .select("id, student_id, students(first_name, last_name)")
      .in("id", enrollmentIds);
    if (enrollmentsError) throw enrollmentsError;
    for (const enrollment of enrollments ?? []) {
      const enrollmentId = String(enrollment.id);
      if (enrollment.student_id) {
        studentIdByEnrollmentId.set(
          enrollmentId,
          String(enrollment.student_id),
        );
      }
      const student = enrollment.students as
        | { first_name?: string; last_name?: string }
        | { first_name?: string; last_name?: string }[]
        | null;
      const studentRow = Array.isArray(student) ? student[0] : student;
      const studentName = studentRow
        ? formatPersonName(studentRow.first_name, studentRow.last_name)
        : null;
      if (studentName) {
        studentNameByEnrollmentId.set(enrollmentId, studentName);
      }
    }
  }

  const ratePlanNameById = new Map<string, string>();
  if (ratePlanIds.length > 0) {
    const { data: ratePlans, error: ratePlansError } = await supabase
      .from("tuition_rate_plans")
      .select("id, name")
      .in("id", ratePlanIds);
    if (ratePlansError) throw ratePlansError;
    for (const plan of ratePlans ?? []) {
      const name = String(plan.name ?? "").trim();
      if (name) ratePlanNameById.set(String(plan.id), name);
    }
  }

  const tierIds = new Set<string>();
  const paymentPlanIds = new Set<string>();
  const contextByAssignmentId = new Map<string, AssignmentActivityContext>();

  for (const row of assignments ?? []) {
    const assignmentId = String(row.id);
    const enrollmentId = row.enrollment_id ? String(row.enrollment_id) : null;
    if (row.rate_tier_id) tierIds.add(String(row.rate_tier_id));
    if (row.payment_plan_id) paymentPlanIds.add(String(row.payment_plan_id));

    contextByAssignmentId.set(assignmentId, {
      enrollmentId,
      familyId: row.family_id ? String(row.family_id) : null,
      familyName: row.family_id
        ? familyNameById.get(String(row.family_id)) ?? null
        : null,
      studentId: enrollmentId
        ? studentIdByEnrollmentId.get(enrollmentId) ?? null
        : null,
      studentName: enrollmentId
        ? studentNameByEnrollmentId.get(enrollmentId) ?? null
        : null,
      ratePlanId: row.rate_plan_id ? String(row.rate_plan_id) : null,
      ratePlanName: row.rate_plan_id
        ? ratePlanNameById.get(String(row.rate_plan_id)) ?? null
        : null,
      tierLabel: null,
      paymentPlanName: null,
    });
  }

  const tierLabelById = new Map<string, string>();
  if (tierIds.size > 0) {
    const { data: tiers, error: tiersError } = await supabase
      .from("tuition_rate_tiers")
      .select("id, label")
      .in("id", [...tierIds]);
    if (tiersError) throw tiersError;
    for (const tier of tiers ?? []) {
      const label = String(tier.label ?? "").trim();
      if (label) tierLabelById.set(String(tier.id), label);
    }
  }

  const paymentPlanNameById = new Map<string, string>();
  if (paymentPlanIds.size > 0) {
    const { data: plans, error: plansError } = await supabase
      .from("tuition_payment_plans")
      .select("id, name")
      .in("id", [...paymentPlanIds]);
    if (plansError) throw plansError;
    for (const plan of plans ?? []) {
      const name = String(plan.name ?? "").trim();
      if (name) paymentPlanNameById.set(String(plan.id), name);
    }
  }

  for (const row of assignments ?? []) {
    const assignmentId = String(row.id);
    const existing = contextByAssignmentId.get(assignmentId);
    if (!existing) continue;
    if (row.rate_tier_id) {
      existing.tierLabel =
        tierLabelById.get(String(row.rate_tier_id)) ?? existing.tierLabel;
    }
    if (row.payment_plan_id) {
      existing.paymentPlanName =
        paymentPlanNameById.get(String(row.payment_plan_id)) ??
        existing.paymentPlanName;
    }
    contextByAssignmentId.set(assignmentId, existing);
  }

  for (const event of events) {
    if (!isTuitionAssignmentAction(event.action)) continue;
    const assignmentId = resolveAssignmentId(event);
    const fromMetadata = assignmentContextFromMetadata(event.metadata);
    const fromDb = assignmentId
      ? contextByAssignmentId.get(assignmentId) ?? null
      : null;
    results.set(event.id, mergeAssignmentContext(fromMetadata, fromDb));
  }

  return results;
}

export function metadataStringFromEvent(
  metadata: Record<string, unknown>,
  key: string,
): string | null {
  return metadataString(metadata, key);
}
