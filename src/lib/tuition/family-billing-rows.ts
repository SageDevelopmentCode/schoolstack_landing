import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * The family's students, enrollments and active tuition assignments, read once
 * for the parent billing page. Readiness, the billing summary, the payment-plan
 * selection contexts and the tax-credit banner each used to re-read these.
 *
 * Rows are kept as PostgREST returns them so each consumer applies exactly the
 * filters its own query used to.
 */

export type FamilyBillingStudentRow = {
  id: string;
  first_name: string | null;
  last_name: string | null;
};

export type FamilyBillingEnrollmentRow = {
  id: string;
  student_id: string | null;
  program_id: string | null;
  status: string;
  enrolled_at: string | null;
  organization_id: string;
};

export type FamilyBillingRows = {
  /** `students` where `family_id` is the family. */
  familyStudents: FamilyBillingStudentRow[];
  /** Family students plus any other student an enrollment below points at. */
  students: FamilyBillingStudentRow[];
  /**
   * Every enrollment of the family's students (any status or org), plus any
   * enrollment an active assignment points at.
   */
  enrollments: FamilyBillingEnrollmentRow[];
  /** `tuition_enrollment_assignments` (all columns), org + family, status active. */
  activeAssignmentRows: Record<string, unknown>[];
};

export type MaybePromise<T> = T | Promise<T>;

const STUDENT_COLUMNS = "id, first_name, last_name";
const ENROLLMENT_COLUMNS = "id, student_id, program_id, status, enrolled_at, organization_id";

function uniqueStrings(values: Array<unknown>): string[] {
  return [
    ...new Set(
      values
        .filter((value) => value !== null && value !== undefined && value !== "")
        .map(String),
    ),
  ];
}

export async function loadFamilyBillingRows(
  supabase: SupabaseClient,
  input: { organizationId: string; familyId: string },
): Promise<FamilyBillingRows> {
  const [studentsResult, assignmentsResult] = await Promise.all([
    supabase.from("students").select(STUDENT_COLUMNS).eq("family_id", input.familyId),
    supabase
      .from("tuition_enrollment_assignments")
      .select("*")
      .eq("organization_id", input.organizationId)
      .eq("family_id", input.familyId)
      .eq("status", "active"),
  ]);

  if (studentsResult.error) throw studentsResult.error;
  if (assignmentsResult.error) throw assignmentsResult.error;

  const familyStudents = (studentsResult.data ?? []) as FamilyBillingStudentRow[];
  const activeAssignmentRows = (assignmentsResult.data ?? []) as Record<string, unknown>[];
  const familyStudentIds = familyStudents.map((student) => String(student.id));

  let enrollments: FamilyBillingEnrollmentRow[] = [];
  if (familyStudentIds.length > 0) {
    const { data, error } = await supabase
      .from("enrollments")
      .select(ENROLLMENT_COLUMNS)
      .in("student_id", familyStudentIds);
    if (error) throw error;
    enrollments = (data ?? []) as FamilyBillingEnrollmentRow[];
  }

  // Normally every assigned enrollment belongs to a family student; fetch any that don't.
  const knownEnrollmentIds = new Set(enrollments.map((enrollment) => String(enrollment.id)));
  const missingEnrollmentIds = uniqueStrings(
    activeAssignmentRows.map((row) => row.enrollment_id),
  ).filter((id) => !knownEnrollmentIds.has(id));
  if (missingEnrollmentIds.length > 0) {
    const { data, error } = await supabase
      .from("enrollments")
      .select(ENROLLMENT_COLUMNS)
      .in("id", missingEnrollmentIds);
    if (error) throw error;
    enrollments = [...enrollments, ...((data ?? []) as FamilyBillingEnrollmentRow[])];
  }

  const knownStudentIds = new Set(familyStudentIds);
  const missingStudentIds = uniqueStrings(
    enrollments.map((enrollment) => enrollment.student_id),
  ).filter((id) => !knownStudentIds.has(id));
  let students = familyStudents;
  if (missingStudentIds.length > 0) {
    const { data, error } = await supabase
      .from("students")
      .select(STUDENT_COLUMNS)
      .in("id", missingStudentIds);
    if (error) throw error;
    students = [...familyStudents, ...((data ?? []) as FamilyBillingStudentRow[])];
  }

  return { familyStudents, students, enrollments, activeAssignmentRows };
}

function familyStudentIdSet(rows: FamilyBillingRows): Set<string> {
  return new Set(rows.familyStudents.map((student) => String(student.id)));
}

/** Enrollments of the family's students, any status or org (tax-credit check). */
export function familyStudentEnrollments(rows: FamilyBillingRows): FamilyBillingEnrollmentRow[] {
  const studentIds = familyStudentIdSet(rows);
  return rows.enrollments.filter((enrollment) =>
    studentIds.has(String(enrollment.student_id)),
  );
}

/** Enrollments of the family's students in the org with status `enrolled` (readiness). */
export function enrolledFamilyEnrollments(
  rows: FamilyBillingRows,
  organizationId: string,
): FamilyBillingEnrollmentRow[] {
  return familyStudentEnrollments(rows).filter(
    (enrollment) =>
      enrollment.organization_id === organizationId && enrollment.status === "enrolled",
  );
}

export function enrollmentsWithIds(
  rows: FamilyBillingRows,
  enrollmentIds: string[],
): FamilyBillingEnrollmentRow[] {
  const wanted = new Set(enrollmentIds);
  return rows.enrollments.filter((enrollment) => wanted.has(String(enrollment.id)));
}

export function studentsWithIds(
  rows: FamilyBillingRows,
  studentIds: string[],
): FamilyBillingStudentRow[] {
  const wanted = new Set(studentIds);
  return rows.students.filter((student) => wanted.has(String(student.id)));
}
