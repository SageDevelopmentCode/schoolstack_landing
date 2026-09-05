import {
  formatEnrolledStudentName,
  type AdminEnrolledStudentSummary,
} from "@/lib/school-admin/enrolled-students";
import type { AdminChipTone } from "@/components/school-admin/ui/story/AdminChip";

function studentSortKey(student: AdminEnrolledStudentSummary): string {
  return formatEnrolledStudentName(student).toLowerCase();
}

export function primaryProgramLabel(student: AdminEnrolledStudentSummary): string {
  return student.programNames[0] ?? "No program";
}

export function isStudentInClassroomProgram(
  student: AdminEnrolledStudentSummary,
  classroomProgramName: string | null,
): boolean {
  if (!classroomProgramName) return false;
  return student.programNames.includes(classroomProgramName);
}

export function programBadgeTone(
  student: AdminEnrolledStudentSummary,
  classroomProgramName: string | null,
): AdminChipTone {
  if (!classroomProgramName) return "info";
  if (isStudentInClassroomProgram(student, classroomProgramName)) return "success";
  return student.programNames.length > 1 ? "purple" : "info";
}

export function sortStudentsForClassroomPicker(
  students: AdminEnrolledStudentSummary[],
  classroomProgramName: string | null,
): AdminEnrolledStudentSummary[] {
  const sorted = [...students].sort((a, b) =>
    studentSortKey(a).localeCompare(studentSortKey(b)),
  );

  if (!classroomProgramName) return sorted;

  const inProgram: AdminEnrolledStudentSummary[] = [];
  const otherPrograms: AdminEnrolledStudentSummary[] = [];

  for (const student of sorted) {
    if (isStudentInClassroomProgram(student, classroomProgramName)) {
      inProgram.push(student);
    } else {
      otherPrograms.push(student);
    }
  }

  return [...inProgram, ...otherPrograms];
}

export function groupStudentsForClassroomPicker(
  students: AdminEnrolledStudentSummary[],
  classroomProgramName: string | null,
): { label: string | null; students: AdminEnrolledStudentSummary[] }[] {
  const sorted = sortStudentsForClassroomPicker(students, classroomProgramName);

  if (!classroomProgramName) {
    return [{ label: null, students: sorted }];
  }

  const inProgram = sorted.filter((student) =>
    isStudentInClassroomProgram(student, classroomProgramName),
  );
  const otherPrograms = sorted.filter(
    (student) => !isStudentInClassroomProgram(student, classroomProgramName),
  );

  const groups: { label: string | null; students: AdminEnrolledStudentSummary[] }[] = [];

  if (inProgram.length > 0) {
    groups.push({ label: classroomProgramName, students: inProgram });
  }
  if (otherPrograms.length > 0) {
    groups.push({ label: "Other programs", students: otherPrograms });
  }

  return groups;
}
