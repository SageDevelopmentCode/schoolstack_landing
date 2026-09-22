import {
  formatDashboardAttendanceSubcopy,
  shouldShowDashboardAttendanceSnapshot,
} from "@/lib/school-admin/attendance/dashboard-attendance";
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

export const formatTeacherDashboardAttendanceSubcopy = formatDashboardAttendanceSubcopy;

export function shouldShowTeacherDashboardAttendanceSection(
  attendanceEnabled: boolean,
  attendanceToday: {
    date: string;
    summary: AttendanceRosterSummary;
    students: AttendanceRosterStudent[];
  } | null,
): boolean {
  return shouldShowDashboardAttendanceSnapshot(attendanceEnabled, attendanceToday);
}
