import type { SupabaseClient } from "@supabase/supabase-js";
import type { TeacherClassroomOption } from "./types";

export async function loadTeacherClassroomOptions(
  admin: SupabaseClient,
  organizationId: string,
  staffMemberId: string,
): Promise<TeacherClassroomOption[]> {
  const { data: assignments, error: assignmentError } = await admin
    .from("student_teacher_assignments")
    .select("student_id")
    .eq("organization_id", organizationId)
    .eq("staff_member_id", staffMemberId);

  if (assignmentError) throw assignmentError;

  const studentIds = (assignments ?? []).map((row) => String(row.student_id));
  if (studentIds.length === 0) return [];

  const { data: enrollments, error } = await admin
    .from("enrollments")
    .select("classroom_id, student_id, students ( family_id ), classrooms ( id, name )")
    .eq("organization_id", organizationId)
    .eq("status", "enrolled")
    .in("student_id", studentIds)
    .not("classroom_id", "is", null);

  if (error) throw error;

  const byClassroom = new Map<string, { id: string; name: string; familyIds: Set<string> }>();

  for (const row of enrollments ?? []) {
    const classroomId = row.classroom_id ? String(row.classroom_id) : null;
    if (!classroomId) continue;
    const classroom = row.classrooms as
      | { id?: string; name?: string }
      | { id?: string; name?: string }[]
      | null;
    const classroomRow = Array.isArray(classroom) ? classroom[0] : classroom;
    const student = row.students as { family_id?: string } | { family_id?: string }[] | null;
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
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
