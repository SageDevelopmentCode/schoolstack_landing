import type { AdminEnrolledStudentSummary } from "@/lib/school-admin/enrolled-students";

export type StudentRosterFilter = "all" | "unassigned" | string;

export type StudentRosterMetrics = {
  totalCount: number;
  unassignedCount: number;
  programCount: number;
  newEnrollmentCount: number;
  programOptions: [string, string][];
};

const NEW_ENROLLMENT_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;

export function isStudentUnassigned(
  student: Pick<
    AdminEnrolledStudentSummary,
    "assignedTeachers" | "classroomNames"
  >,
): boolean {
  return (
    student.classroomNames.length === 0 || student.assignedTeachers.length === 0
  );
}

export function isRecentEnrollment(
  enrolledAt: string,
  nowMs: number = Date.now(),
): boolean {
  if (!enrolledAt) return false;
  const enrolledMs = Date.parse(enrolledAt);
  if (Number.isNaN(enrolledMs)) return false;
  return nowMs - enrolledMs <= NEW_ENROLLMENT_WINDOW_MS;
}

export function deriveStudentRosterMetrics(
  students: AdminEnrolledStudentSummary[],
  nowMs: number = Date.now(),
): StudentRosterMetrics {
  const programNames = new Set<string>();

  let unassignedCount = 0;
  let newEnrollmentCount = 0;

  for (const student of students) {
    if (isStudentUnassigned(student)) {
      unassignedCount += 1;
    }
    if (isRecentEnrollment(student.enrolledAt, nowMs)) {
      newEnrollmentCount += 1;
    }
    for (const programName of student.programNames) {
      programNames.add(programName);
    }
  }

  const programOptions = [...programNames]
    .sort((a, b) => a.localeCompare(b))
    .map((name) => [name, name] as [string, string]);

  return {
    totalCount: students.length,
    unassignedCount,
    programCount: programNames.size,
    newEnrollmentCount,
    programOptions,
  };
}

export function filterStudentsByRosterFilter(
  students: AdminEnrolledStudentSummary[],
  filter: StudentRosterFilter,
): AdminEnrolledStudentSummary[] {
  if (filter === "all") return students;
  if (filter === "unassigned") {
    return students.filter(isStudentUnassigned);
  }
  return students.filter((student) => student.programNames.includes(filter));
}

export function matchesStudentSearch(
  student: AdminEnrolledStudentSummary,
  query: string,
  formatStudentGrade: (grade: string | null) => string | null,
  formatStudentName: (student: AdminEnrolledStudentSummary) => string,
): boolean {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return true;

  const haystack = [
    formatStudentName(student),
    student.grade ?? "",
    formatStudentGrade(student.grade) ?? "",
    student.familyName ?? "",
    student.assignedTeacherNames ?? "",
    student.primaryContactName ?? "",
    student.primaryContactEmail ?? "",
    student.programNames.join(" "),
    student.classroomNames.join(" "),
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(normalized);
}
