import type { AttendanceRosterStatus } from "@/lib/school-admin/attendance/attendance-types";

export function shouldSendAttendancePresentPush(
  priorStatus: AttendanceRosterStatus,
): boolean {
  return priorStatus !== "present" && priorStatus !== "picked_up";
}

export function shouldSendAttendancePickupPush(
  action: "present" | "absent" | "pickup",
): boolean {
  return action === "pickup";
}
