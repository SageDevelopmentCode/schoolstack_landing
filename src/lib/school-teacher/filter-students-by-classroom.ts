import type { StaffClassroomOption } from "@/lib/school-admin/classrooms";
import type { AdminEnrolledStudentSummary } from "@/lib/school-admin/enrolled-students";

export type TeacherClassroomFilter = "all" | "unassigned" | string;

export function filterStudentsByClassroomName(
  students: AdminEnrolledStudentSummary[],
  classroomName: string,
): AdminEnrolledStudentSummary[] {
  return students.filter((student) => student.classroomNames.includes(classroomName));
}

export function studentMatchesClassroomFilter(
  student: AdminEnrolledStudentSummary,
  filter: TeacherClassroomFilter,
  staffClassrooms: StaffClassroomOption[],
): boolean {
  if (filter === "all") return true;
  if (filter === "unassigned") return student.classroomNames.length === 0;
  const classroom = staffClassrooms.find((entry) => entry.id === filter);
  if (!classroom) return true;
  return student.classroomNames.includes(classroom.name);
}
