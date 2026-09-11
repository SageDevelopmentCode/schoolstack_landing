import type { SupabaseClient } from "@supabase/supabase-js";
import { listStaffClassroomsForTeacher } from "@/lib/school-admin/classrooms";
import type { TeacherClassroomOption } from "./types";

export async function loadTeacherClassroomOptions(
  admin: SupabaseClient,
  organizationId: string,
  staffMemberId: string,
): Promise<TeacherClassroomOption[]> {
  const staffClassrooms = await listStaffClassroomsForTeacher(
    admin,
    organizationId,
    staffMemberId,
  );

  if (staffClassrooms.length > 0) {
    return staffClassrooms.map((classroom) => ({
      id: classroom.id,
      name: classroom.name,
      familyCount: classroom.studentCount,
      role: classroom.role ?? null,
    }));
  }

  const { data: assignments, error: assignmentError } = await admin
    .from("student_teacher_assignments")
    .select("student_id")
    .eq("organization_id", organizationId)
    .eq("staff_member_id", staffMemberId);

  if (assignmentError) throw assignmentError;

  const studentIds = (assignments ?? []).map((row) => String(row.student_id));
  if (studentIds.length === 0) return [];

  const { data: junctionRows, error } = await admin
    .from("enrollment_classrooms")
    .select(
      "classroom_id, classrooms ( id, name ), enrollments!inner ( student_id, status, students ( family_id ) )",
    )
    .eq("organization_id", organizationId)
    .eq("enrollments.status", "enrolled")
    .in("enrollments.student_id", studentIds);

  if (error) throw error;

  const byClassroom = new Map<string, { id: string; name: string; familyIds: Set<string> }>();

  for (const row of junctionRows ?? []) {
    const classroomId = row.classroom_id ? String(row.classroom_id) : null;
    if (!classroomId) continue;
    const classroom = row.classrooms as
      | { id?: string; name?: string }
      | { id?: string; name?: string }[]
      | null;
    const classroomRow = Array.isArray(classroom) ? classroom[0] : classroom;
    const enrollment = row.enrollments as
      | { students?: { family_id?: string } | { family_id?: string }[] | null }
      | { students?: { family_id?: string } | { family_id?: string }[] | null }[]
      | null;
    const enrollmentRow = Array.isArray(enrollment) ? enrollment[0] : enrollment;
    const student = enrollmentRow?.students;
    const studentRow = Array.isArray(student) ? student[0] : student;
    const familyId = studentRow?.family_id ? String(studentRow.family_id) : null;
    if (!familyId) continue;

    const existing = byClassroom.get(classroomId) ?? {
      id: classroomId,
      name: classroomRow?.name ? String(classroomRow.name) : "Classroom",
      familyIds: new Set<string>(),
    };
    existing.familyIds.add(familyId);
    byClassroom.set(classroomId, existing);
  }

  return [...byClassroom.values()]
    .map((entry) => ({
      id: entry.id,
      name: entry.name,
      familyCount: entry.familyIds.size,
      role: null,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
