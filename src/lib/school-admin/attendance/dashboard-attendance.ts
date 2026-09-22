import type {
  AttendanceRosterStudent,
  AttendanceRosterSummary,
} from "@/lib/school-admin/attendance/attendance-types";

export function formatDashboardAttendanceSubcopy(
  summary: AttendanceRosterSummary,
): string {
  const presentOrPickedUp = summary.presentCount + summary.pickedUpCount;
  const learnerLabel = summary.totalStudents === 1 ? "student" : "students";

  if (summary.totalStudents === 0) {
    return "No attendance-enabled students on today's roster.";
  }

  return `${presentOrPickedUp} of ${summary.totalStudents} ${learnerLabel} present`;
}

export function shouldShowDashboardAttendanceSnapshot(
  featureEnabled: boolean,
  attendanceToday: {
    date: string;
    summary: AttendanceRosterSummary;
    students: AttendanceRosterStudent[];
  } | null,
): boolean {
  return featureEnabled && attendanceToday !== null;
}
