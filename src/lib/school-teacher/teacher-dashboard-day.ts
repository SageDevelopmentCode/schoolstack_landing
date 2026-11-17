import type {
  AttendanceRosterStatus,
  AttendanceRosterSummary,
} from "@/lib/school-admin/attendance/attendance-types";

/*
 * Pure helpers for the staff Dashboard (web). Copy matches the teacher
 * mobile Home (`apps/mobile/.../teacher-home-status.ts`) minus the time clock.
 */

/** One line under the greeting, built only from today's data (no invented claims). */
export function teacherDashboardStatusLine({
  focusCount,
  attendance,
  unreadMessages,
}: {
  focusCount: number;
  /** `null` when attendance is off or today's roster didn't load. */
  attendance: AttendanceRosterSummary | null;
  /** `null` when Messages is off. */
  unreadMessages: number | null;
}): string {
  const parts: string[] = [];
  parts.push(
    focusCount > 0
      ? `${focusCount} thing${focusCount === 1 ? " needs" : "s need"} you today`
      : "Nothing urgent today",
  );
  if (attendance && attendance.totalStudents > 0) {
    parts.push(
      attendance.notMarkedCount > 0
        ? `${attendance.notMarkedCount} of ${attendance.totalStudents} not marked yet`
        : `${attendance.presentCount + attendance.pickedUpCount} of ${attendance.totalStudents} present`,
    );
  }
  if (unreadMessages != null && unreadMessages > 0) {
    parts.push(`${unreadMessages} unread message${unreadMessages === 1 ? "" : "s"}`);
  }
  return parts.join(" · ");
}

export type TeacherDayStepKey = "roll_call" | "in_class" | "pickup";

/** One step of the day rhythm: Roll call → In class → Pickup. */
export type TeacherDayStep = {
  key: TeacherDayStepKey;
  label: string;
  detail: string;
  done: boolean;
  current: boolean;
  /** Roster status filter the step opens. */
  filter: "all" | AttendanceRosterStatus;
};

/** Roll call → In class → Pickup, built only from today's attendance numbers. */
export function buildTeacherDaySteps(s: AttendanceRosterSummary): TeacherDayStep[] {
  const rollDone = s.totalStudents > 0 && s.notMarkedCount === 0;
  const allHome = rollDone && s.presentCount === 0;
  const inClassDone = rollDone && (s.pickedUpCount > 0 || s.presentCount === 0);
  const cameIn = s.presentCount + s.pickedUpCount;
  const steps: Omit<TeacherDayStep, "current">[] = [
    {
      key: "roll_call",
      label: "Roll call",
      detail: `${s.totalStudents - s.notMarkedCount} of ${s.totalStudents} marked`,
      done: rollDone,
      filter: s.notMarkedCount > 0 ? "not_marked" : "all",
    },
    {
      key: "in_class",
      label: "In class",
      detail: `${s.presentCount} in class · ${s.absentCount} absent`,
      done: inClassDone,
      filter: s.presentCount > 0 ? "present" : "all",
    },
    {
      key: "pickup",
      label: "Pickup",
      detail: cameIn > 0 ? `${s.pickedUpCount} of ${cameIn} picked up` : "No pickups yet",
      done: allHome,
      filter: s.presentCount > 0 ? "present" : s.pickedUpCount > 0 ? "picked_up" : "all",
    },
  ];
  const currentIndex = steps.findIndex((step) => !step.done);
  return steps.map((step, index) => ({ ...step, current: index === currentIndex }));
}
