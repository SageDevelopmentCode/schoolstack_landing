import type { SupabaseClient } from "@supabase/supabase-js";
import { getRatePlanWithDetails } from "./rate-plans";
import { getTierById } from "./rate-tiers";
import type { TuitionEnrollmentAssignment } from "./types";

export type AssignmentActivityLabels = {
  studentId?: string | null;
  studentName?: string | null;
  familyName?: string | null;
  ratePlanName?: string | null;
  tierLabel?: string | null;
  paymentPlanName?: string | null;
};

function formatPersonName(
  firstName?: string | null,
  lastName?: string | null,
): string | null {
  const name = [firstName?.trim(), lastName?.trim()].filter(Boolean).join(" ");
  return name || null;
}

export async function loadAssignmentActivityLabels(
  supabase: SupabaseClient,
  assignment: Pick<
    TuitionEnrollmentAssignment,
    | "enrollmentId"
    | "familyId"
    | "ratePlanId"
    | "rateTierId"
    | "paymentPlanId"
  >,
): Promise<AssignmentActivityLabels> {
  const labels: AssignmentActivityLabels = {};

  const [{ data: enrollment }, { data: family }] = await Promise.all([
    supabase
      .from("enrollments")
      .select("student_id, students(first_name, last_name)")
      .eq("id", assignment.enrollmentId)
      .maybeSingle(),
    supabase
      .from("families")
      .select("name")
      .eq("id", assignment.familyId)
      .maybeSingle(),
  ]);

  if (family?.name?.trim()) {
    labels.familyName = family.name.trim();
  }

  const student = enrollment?.students as
    | { first_name?: string; last_name?: string }
    | { first_name?: string; last_name?: string }[]
    | null;
  const studentRow = Array.isArray(student) ? student[0] : student;
  if (enrollment?.student_id) {
    labels.studentId = String(enrollment.student_id);
  }
  const studentName = studentRow
    ? formatPersonName(studentRow.first_name, studentRow.last_name)
    : null;
  if (studentName) {
    labels.studentName = studentName;
  }

  const ratePlan = await getRatePlanWithDetails(supabase, assignment.ratePlanId);
  if (ratePlan?.name?.trim()) {
    labels.ratePlanName = ratePlan.name.trim();
  }

  if (assignment.rateTierId) {
    const tier = await getTierById(supabase, assignment.rateTierId);
    if (tier?.label?.trim()) {
      labels.tierLabel = tier.label.trim();
    }
  }

  const paymentPlan = ratePlan?.paymentPlans.find(
    (plan) => plan.id === assignment.paymentPlanId,
  );
  if (paymentPlan?.name?.trim()) {
    labels.paymentPlanName = paymentPlan.name.trim();
  }

  return labels;
}

export function buildAssignmentActivityMetadata(
  assignment: Pick<
    TuitionEnrollmentAssignment,
    "enrollmentId" | "familyId" | "ratePlanId"
  >,
  labels: AssignmentActivityLabels,
): Record<string, unknown> {
  const metadata: Record<string, unknown> = {
    enrollmentId: assignment.enrollmentId,
    familyId: assignment.familyId,
    ratePlanId: assignment.ratePlanId,
  };

  if (labels.studentId) metadata.studentId = labels.studentId;
  if (labels.studentName) metadata.studentName = labels.studentName;
  if (labels.familyName) metadata.familyName = labels.familyName;
  if (labels.ratePlanName) metadata.ratePlanName = labels.ratePlanName;
  if (labels.tierLabel) metadata.tierLabel = labels.tierLabel;
  if (labels.paymentPlanName) metadata.paymentPlanName = labels.paymentPlanName;

  return metadata;
}

export function summarizeLabelsForAssignmentChanges(
  labels: AssignmentActivityLabels,
): {
  ratePlanName?: string;
  tierLabel?: string;
  paymentPlanName?: string;
  familyName?: string;
  studentName?: string;
} {
  return {
    ratePlanName: labels.ratePlanName ?? undefined,
    tierLabel: labels.tierLabel ?? undefined,
    paymentPlanName: labels.paymentPlanName ?? undefined,
    familyName: labels.familyName ?? undefined,
    studentName: labels.studentName ?? undefined,
  };
}

export function summarizeAssignmentUnassigned(
  labels: AssignmentActivityLabels,
): { changedFields: string[]; changes: string[] } {
  const subject =
    labels.studentName ?? labels.familyName ?? "this enrollment";
  const planPart = labels.ratePlanName ? ` (${labels.ratePlanName})` : "";
  return {
    changedFields: ["status"],
    changes: [
      `Unassigned tuition for ${subject}${planPart} and voided open charges`,
    ],
  };
}
