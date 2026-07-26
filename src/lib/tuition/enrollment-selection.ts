import type { SupabaseClient } from "@supabase/supabase-js";
import {
  assignmentNeedsPaymentPlanSelection,
  getAssignmentForEnrollment,
} from "./assignments";
import { rowToAssignment } from "./row-mappers";
import { getDefaultRatePlanForProgram, getRatePlanWithDetails } from "./rate-plans";
import type { RatePlanWithDetails, TuitionEnrollmentAssignment } from "./types";

export type EnrollmentTuitionSelectionContext = {
  assignment: TuitionEnrollmentAssignment;
  ratePlan: RatePlanWithDetails;
};

export type FamilyTuitionSelectionItem = {
  studentName: string;
  context: EnrollmentTuitionSelectionContext;
};

async function buildSelectionContext(
  supabase: SupabaseClient,
  assignment: TuitionEnrollmentAssignment,
): Promise<EnrollmentTuitionSelectionContext | null> {
  if (!assignmentNeedsPaymentPlanSelection(assignment)) {
    return null;
  }

  const ratePlan = await getRatePlanWithDetails(supabase, assignment.ratePlanId);
  if (!ratePlan || ratePlan.paymentPlans.length <= 1) {
    return null;
  }

  return { assignment, ratePlan };
}

export async function getEnrollmentTuitionSelectionContext(
  supabase: SupabaseClient,
  input: {
    organizationId: string;
    enrollmentId: string;
    programId: string;
  },
): Promise<EnrollmentTuitionSelectionContext | null> {
  const assignment = await getAssignmentForEnrollment(supabase, input.enrollmentId);

  if (!assignment) {
    const ratePlan = await getDefaultRatePlanForProgram(
      supabase,
      input.organizationId,
      input.programId,
    );
    if (!ratePlan || ratePlan.paymentPlans.length <= 1) {
      return null;
    }
    return null;
  }

  return buildSelectionContext(supabase, assignment);
}

export async function getFamilyTuitionSelectionContexts(
  supabase: SupabaseClient,
  input: {
    organizationId: string;
    familyId: string;
  },
): Promise<FamilyTuitionSelectionItem[]> {
  const { data: assignmentRows, error: assignmentError } = await supabase
    .from("tuition_enrollment_assignments")
    .select("*")
    .eq("organization_id", input.organizationId)
    .eq("family_id", input.familyId)
    .eq("status", "active");

  if (assignmentError) throw assignmentError;
  if (!assignmentRows?.length) return [];

  const enrollmentIds = assignmentRows.map((row) => String(row.enrollment_id));

  const { data: enrollments, error: enrollmentsError } = await supabase
    .from("enrollments")
    .select("id, student_id")
    .in("id", enrollmentIds);

  if (enrollmentsError) throw enrollmentsError;

  const studentIds = [
    ...new Set(
      (enrollments ?? [])
        .map((enrollment) =>
          enrollment.student_id ? String(enrollment.student_id) : null,
        )
        .filter((id): id is string => Boolean(id)),
    ),
  ];

  const { data: students, error: studentError } = await supabase
    .from("students")
    .select("id, first_name, last_name")
    .in("id", studentIds);

  if (studentError) throw studentError;

  const enrollmentStudentId = new Map(
    (enrollments ?? []).map((enrollment) => [
      String(enrollment.id),
      enrollment.student_id ? String(enrollment.student_id) : null,
    ]),
  );
  const studentNameById = new Map(
    (students ?? []).map((student) => [
      String(student.id),
      [student.first_name, student.last_name].filter(Boolean).join(" ").trim() || "Student",
    ]),
  );

  const items: FamilyTuitionSelectionItem[] = [];

  for (const row of assignmentRows) {
    const assignment = rowToAssignment(row);
    const context = await buildSelectionContext(supabase, assignment);
    if (!context) continue;

    const studentId = enrollmentStudentId.get(String(row.enrollment_id));
    const studentName = studentId
      ? (studentNameById.get(studentId) ?? "Student")
      : "Student";

    items.push({ studentName, context });
  }

  return items;
}
