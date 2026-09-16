import type { AdminEnrolledStudentSummary } from '@/lib/school-admin/enrolled-students';
import type { StaffClassroomOption } from '@/lib/teacher/teacher-portal-api';

export type TeacherRosterScope = 'assigned' | 'school';

export type TeacherClassroomFilter = 'all' | 'unassigned' | string;

export const STUDENTS_PAGE_SIZE = 50;

export function studentMatchesClassroomFilter(
  student: AdminEnrolledStudentSummary,
  filter: TeacherClassroomFilter,
  staffClassrooms: StaffClassroomOption[],
): boolean {
  if (filter === 'all') return true;
  if (filter === 'unassigned') return student.classroomNames.length === 0;
  const classroom = staffClassrooms.find((entry) => entry.id === filter);
  if (!classroom) return true;
  return student.classroomNames.includes(classroom.name);
}

export function countUnassignedClassroomStudents(
  students: AdminEnrolledStudentSummary[],
): number {
  return students.filter((student) => student.classroomNames.length === 0).length;
}
