export type AttendanceEnrollmentRef = {
  programId: string;
  status: string;
};

export function studentHasAttendanceEnabledEnrollment(
  enrollments: AttendanceEnrollmentRef[],
  programAttendanceEnabled: Map<string, boolean>,
): boolean {
  return enrollments.some(
    (enrollment) =>
      enrollment.status === "enrolled" &&
      programAttendanceEnabled.get(enrollment.programId) === true,
  );
}

export function filterStudentsForAttendanceRoster<
  T extends { studentId: string; enrollments: AttendanceEnrollmentRef[] },
>(
  students: T[],
  programAttendanceEnabled: Map<string, boolean>,
): T[] {
  return students.filter((student) =>
    studentHasAttendanceEnabledEnrollment(
      student.enrollments,
      programAttendanceEnabled,
    ),
  );
}
