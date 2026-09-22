import type { FamilyChildOverview } from "@/lib/admissions/parent-portal-access";
import { studentHasAttendanceEnabledEnrollment } from "@/lib/school-admin/attendance/attendance-roster-filter";

export function filterAttendanceChildren(
  children: FamilyChildOverview[],
  programAttendanceEnabled: Map<string, boolean>,
): FamilyChildOverview[] {
  return children.filter((child) => {
    if (!child.isEnrolled || !child.studentId) return false;

    const enrollments = child.enrolledPrograms.map((program) => ({
      programId: program.programId,
      status: "enrolled",
    }));

    return studentHasAttendanceEnabledEnrollment(
      enrollments,
      programAttendanceEnabled,
    );
  });
}
