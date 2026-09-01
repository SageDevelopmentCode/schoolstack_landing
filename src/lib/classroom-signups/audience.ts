import type { SupabaseClient } from "@supabase/supabase-js";
import type { ClassroomSignup } from "./types";

type FamilyStudentRow = {
  family_id: string;
  student_id: string;
};

async function assignedFamilyStudents(
  admin: SupabaseClient,
  organizationId: string,
  staffMemberId: string,
): Promise<FamilyStudentRow[]> {
  const { data: assignments, error: assignmentError } = await admin
    .from("student_teacher_assignments")
    .select("student_id")
    .eq("organization_id", organizationId)
    .eq("staff_member_id", staffMemberId);

  if (assignmentError) throw assignmentError;

  const studentIds = (assignments ?? []).map((row) => String(row.student_id));
  if (studentIds.length === 0) return [];

  const { data: students, error: studentsError } = await admin
    .from("students")
    .select("id, family_id")
    .eq("organization_id", organizationId)
    .in("id", studentIds);

  if (studentsError) throw studentsError;

  const enrolledStudentIds = new Set<string>();
  const { data: enrollments, error: enrollmentsError } = await admin
    .from("enrollments")
    .select("student_id")
    .eq("organization_id", organizationId)
    .eq("status", "enrolled")
    .in("student_id", studentIds);

  if (enrollmentsError) throw enrollmentsError;
  for (const row of enrollments ?? []) {
    enrolledStudentIds.add(String(row.student_id));
  }

  return (students ?? [])
    .filter((row) => enrolledStudentIds.has(String(row.id)))
    .map((row) => ({
      family_id: String(row.family_id),
      student_id: String(row.id),
    }));
}

async function classroomFamilyStudents(
  admin: SupabaseClient,
  organizationId: string,
  classroomId: string,
): Promise<FamilyStudentRow[]> {
  const { data: enrollments, error } = await admin
    .from("enrollments")
    .select("student_id, students ( family_id )")
    .eq("organization_id", organizationId)
    .eq("classroom_id", classroomId)
    .eq("status", "enrolled");

  if (error) throw error;

  const rows: FamilyStudentRow[] = [];
  for (const enrollment of enrollments ?? []) {
    const student = enrollment.students as
      | { family_id?: string }
      | { family_id?: string }[]
      | null;
    const studentRow = Array.isArray(student) ? student[0] : student;
    if (!studentRow?.family_id) continue;
    rows.push({
      family_id: String(studentRow.family_id),
      student_id: String(enrollment.student_id),
    });
  }
  return rows;
}

export async function countAssignedFamiliesForTeacher(
  admin: SupabaseClient,
  organizationId: string,
  staffMemberId: string,
): Promise<number> {
  const rows = await assignedFamilyStudents(admin, organizationId, staffMemberId);
  return new Set(rows.map((row) => row.family_id)).size;
}

export async function resolveAudienceFamilyIds(
  admin: SupabaseClient,
  signup: Pick<ClassroomSignup, "organizationId" | "audience" | "classroomId" | "createdByStaffMemberId">,
): Promise<string[]> {
  if (signup.audience === "classroom") {
    if (!signup.classroomId) return [];
    const rows = await classroomFamilyStudents(
      admin,
      signup.organizationId,
      signup.classroomId,
    );
    return [...new Set(rows.map((row) => row.family_id))];
  }

  const rows = await assignedFamilyStudents(
    admin,
    signup.organizationId,
    signup.createdByStaffMemberId,
  );
  return [...new Set(rows.map((row) => row.family_id))];
}

export async function isFamilyInSignupAudience(
  admin: SupabaseClient,
  signup: Pick<
    ClassroomSignup,
    "organizationId" | "audience" | "classroomId" | "createdByStaffMemberId"
  >,
  familyId: string,
): Promise<boolean> {
  const familyIds = await resolveAudienceFamilyIds(admin, signup);
  return familyIds.includes(familyId);
}

export async function familyHasAssignedStudentWithTeacher(
  admin: SupabaseClient,
  organizationId: string,
  familyId: string,
  staffMemberId: string,
): Promise<boolean> {
  const rows = await assignedFamilyStudents(admin, organizationId, staffMemberId);
  return rows.some((row) => row.family_id === familyId);
}

export async function familyHasStudentInClassroom(
  admin: SupabaseClient,
  organizationId: string,
  familyId: string,
  classroomId: string,
): Promise<boolean> {
  const rows = await classroomFamilyStudents(admin, organizationId, classroomId);
  return rows.some((row) => row.family_id === familyId);
}
