import type { SupabaseClient } from "@supabase/supabase-js";

export async function getStudentNamesByChargeIds(
  supabase: SupabaseClient,
  chargeIds: string[],
): Promise<Map<string, string>> {
  const uniqueChargeIds = [...new Set(chargeIds.filter(Boolean))];
  if (uniqueChargeIds.length === 0) return new Map();

  const { data: charges, error: chargesError } = await supabase
    .from("tuition_charges")
    .select("id, assignment_id")
    .in("id", uniqueChargeIds);

  if (chargesError) throw chargesError;

  const assignmentIds = [
    ...new Set(
      (charges ?? [])
        .map((charge) =>
          charge.assignment_id ? String(charge.assignment_id) : null,
        )
        .filter((id): id is string => Boolean(id)),
    ),
  ];

  if (assignmentIds.length === 0) return new Map();

  const { data: assignments, error: assignmentsError } = await supabase
    .from("tuition_enrollment_assignments")
    .select("id, enrollment_id")
    .in("id", assignmentIds);

  if (assignmentsError) throw assignmentsError;

  const enrollmentIds = [
    ...new Set(
      (assignments ?? [])
        .map((assignment) =>
          assignment.enrollment_id ? String(assignment.enrollment_id) : null,
        )
        .filter((id): id is string => Boolean(id)),
    ),
  ];

  if (enrollmentIds.length === 0) return new Map();

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

  const studentNameById = new Map<string, string>();
  if (studentIds.length > 0) {
    const { data: students, error: studentsError } = await supabase
      .from("students")
      .select("id, first_name, last_name")
      .in("id", studentIds);

    if (studentsError) throw studentsError;

    for (const student of students ?? []) {
      const firstName =
        typeof student.first_name === "string" ? student.first_name.trim() : "";
      const lastName =
        typeof student.last_name === "string" ? student.last_name.trim() : "";
      const fullName = [firstName, lastName].filter(Boolean).join(" ");
      studentNameById.set(String(student.id), fullName || "Student");
    }
  }

  const enrollmentIdByAssignmentId = new Map(
    (assignments ?? []).map((assignment) => [
      String(assignment.id),
      assignment.enrollment_id ? String(assignment.enrollment_id) : null,
    ]),
  );
  const studentIdByEnrollmentId = new Map(
    (enrollments ?? []).map((enrollment) => [
      String(enrollment.id),
      enrollment.student_id ? String(enrollment.student_id) : null,
    ]),
  );
  const assignmentIdByChargeId = new Map(
    (charges ?? []).map((charge) => [
      String(charge.id),
      charge.assignment_id ? String(charge.assignment_id) : null,
    ]),
  );

  const result = new Map<string, string>();
  for (const chargeId of uniqueChargeIds) {
    const assignmentId = assignmentIdByChargeId.get(chargeId);
    const enrollmentId = assignmentId
      ? enrollmentIdByAssignmentId.get(assignmentId)
      : null;
    const studentId = enrollmentId
      ? studentIdByEnrollmentId.get(enrollmentId)
      : null;
    const studentName = studentId ? studentNameById.get(studentId) : null;
    if (studentName) {
      result.set(chargeId, studentName);
    }
  }

  return result;
}

export async function getStudentNameForCharge(
  supabase: SupabaseClient,
  chargeId: string,
): Promise<string | null> {
  const namesByChargeId = await getStudentNamesByChargeIds(supabase, [chargeId]);
  return namesByChargeId.get(chargeId) ?? null;
}
