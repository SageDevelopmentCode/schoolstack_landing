import type {
  AttendanceRosterStudent,
  AttendanceRosterSummary,
} from "@/lib/school-admin/attendance/attendance-types";

export function recomputeAttendanceSummary(
  students: AttendanceRosterStudent[],
): AttendanceRosterSummary {
  let presentCount = 0;
  let absentCount = 0;
  let pickedUpCount = 0;
  let notMarkedCount = 0;

  for (const student of students) {
    switch (student.attendanceStatus) {
      case "present":
        presentCount += 1;
        break;
      case "absent":
        absentCount += 1;
        break;
      case "picked_up":
        pickedUpCount += 1;
        break;
      default:
        notMarkedCount += 1;
        break;
    }
  }

  return {
    totalStudents: students.length,
    presentCount,
    absentCount,
    pickedUpCount,
    notMarkedCount,
  };
}

export function formatTeacherDashboardAttendanceSubcopy(
  summary: AttendanceRosterSummary,
): string {
  const presentOrPickedUp = summary.presentCount + summary.pickedUpCount;
  const learnerLabel = summary.totalStudents === 1 ? "student" : "students";

  if (summary.totalStudents === 0) {
    return "No attendance-enabled students on today's roster.";
  }

  return `${presentOrPickedUp} of ${summary.totalStudents} ${learnerLabel} present`;
}

export function shouldShowTeacherDashboardAttendanceSection(
  attendanceEnabled: boolean,
  attendanceToday: {
    date: string;
    summary: AttendanceRosterSummary;
    students: AttendanceRosterStudent[];
  } | null,
): boolean {
  return attendanceEnabled && attendanceToday !== null;
}
