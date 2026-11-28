import type { SupabaseClient } from "@supabase/supabase-js";
import {
  assignmentNeedsPaymentPlanSelection,
  getAssignmentForEnrollment,
} from "./assignments";
import {
  enrollmentsWithIds,
  studentsWithIds,
  type FamilyBillingRows,
  type MaybePromise,
} from "./family-billing-rows";
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
  catalog: SupabaseClient,
  assignment: TuitionEnrollmentAssignment,
): Promise<EnrollmentTuitionSelectionContext | null> {
  if (!assignmentNeedsPaymentPlanSelection(assignment)) {
    return null;
  }

  const ratePlan = await getRatePlanWithDetails(catalog, assignment.ratePlanId);
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

type AssignmentStudentLookup = {
  enrollments: Array<{ id: unknown; student_id: unknown }>;
  students: Array<{ id: unknown; first_name: unknown; last_name: unknown }>;
};

/** Enrollment → student name lookups for assignment rows, from preloaded rows or two reads. */
export async function loadAssignmentStudentLookup(
  supabase: SupabaseClient,
  assignmentRows: Array<Record<string, unknown>>,
  familyRows?: FamilyBillingRows,
): Promise<{
  enrollmentStudentId: Map<string, string | null>;
  studentNameById: Map<string, string>;
}> {
  const enrollmentIds = assignmentRows.map((row) => String(row.enrollment_id));
  const lookup: AssignmentStudentLookup = { enrollments: [], students: [] };

  if (familyRows) {
    lookup.enrollments = enrollmentsWithIds(familyRows, enrollmentIds);
  } else {
    const { data: enrollments, error: enrollmentsError } = await supabase
      .from("enrollments")
      .select("id, student_id")
      .in("id", enrollmentIds);

    if (enrollmentsError) throw enrollmentsError;
    lookup.enrollments = enrollments ?? [];
  }

  const studentIds = [
    ...new Set(
      lookup.enrollments
        .map((enrollment) =>
          enrollment.student_id ? String(enrollment.student_id) : null,
        )
        .filter((id): id is string => Boolean(id)),
    ),
  ];

  if (familyRows) {
    lookup.students = studentsWithIds(familyRows, studentIds);
  } else {
    const { data: students, error: studentError } = await supabase
      .from("students")
      .select("id, first_name, last_name")
      .in("id", studentIds);

    if (studentError) throw studentError;
    lookup.students = students ?? [];
  }

  return {
    enrollmentStudentId: new Map(
      lookup.enrollments.map((enrollment) => [
        String(enrollment.id),
        enrollment.student_id ? String(enrollment.student_id) : null,
      ]),
    ),
    studentNameById: new Map(
      lookup.students.map((student) => [
        String(student.id),
        [student.first_name, student.last_name].filter(Boolean).join(" ").trim() ||
          "Student",
      ]),
    ),
  };
}

export async function getFamilyTuitionSelectionContexts(
  supabase: SupabaseClient,
  input: {
    organizationId: string;
    familyId: string;
  },
  options?: {
    /** Service-role client for rate-plan details. Catalog tables are staff-only. */
    catalogClient?: SupabaseClient;
    /** The family's students, enrollments and active assignments, already loaded. */
    familyRows?: MaybePromise<FamilyBillingRows>;
  },
): Promise<FamilyTuitionSelectionItem[]> {
  const catalog = options?.catalogClient ?? supabase;
  const familyRows = options?.familyRows ? await options.familyRows : undefined;

  let assignmentRows: Array<Record<string, unknown>>;
  if (familyRows) {
    assignmentRows = familyRows.activeAssignmentRows;
  } else {
    const { data, error: assignmentError } = await supabase
      .from("tuition_enrollment_assignments")
      .select("*")
      .eq("organization_id", input.organizationId)
      .eq("family_id", input.familyId)
      .eq("status", "active");

    if (assignmentError) throw assignmentError;
    assignmentRows = data ?? [];
  }
  if (!assignmentRows.length) return [];

  const assignments = assignmentRows.map((row) => rowToAssignment(row));

  // Rate-plan details only depend on the assignment, so they load alongside the
  // name lookups, one plan per assignment in parallel.
  const [{ enrollmentStudentId, studentNameById }, contexts] = await Promise.all([
    loadAssignmentStudentLookup(supabase, assignmentRows, familyRows),
    Promise.all(assignments.map((assignment) => buildSelectionContext(catalog, assignment))),
  ]);

  const items: FamilyTuitionSelectionItem[] = [];

  assignmentRows.forEach((row, index) => {
    const context = contexts[index];
    if (!context) return;

    const studentId = enrollmentStudentId.get(String(row.enrollment_id));
    const studentName = studentId
      ? (studentNameById.get(studentId) ?? "Student")
      : "Student";

    items.push({ studentName, context });
  });

  return items;
}
