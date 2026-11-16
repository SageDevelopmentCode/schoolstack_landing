import type { AttendanceRosterSummary } from '@/lib/attendance/attendance-types';
import { formatWallClockTime } from '@/lib/teacher/my-hours/format-duration';

/** One line under the greeting, built only from today's data (no invented claims). */
export function teacherStatusLine({
  focusCount,
  attendance,
  clock,
}: {
  focusCount: number;
  /** `null` when attendance is off or today's roster hasn't loaded. */
  attendance: AttendanceRosterSummary | null;
  /** `null` when My Hours is off or hasn't loaded. */
  clock: { clockedIn: boolean; activeSessionStartedAt: Date | null } | null;
}): string {
  const parts: string[] = [];
  parts.push(
    focusCount > 0
      ? `${focusCount} thing${focusCount === 1 ? ' needs' : 's need'} you today`
      : 'Nothing urgent today',
  );
  if (attendance && attendance.totalStudents > 0) {
    parts.push(
      attendance.notMarkedCount > 0
        ? `${attendance.notMarkedCount} of ${attendance.totalStudents} not marked yet`
        : `${attendance.presentCount + attendance.pickedUpCount} of ${attendance.totalStudents} present`,
    );
  }
  if (clock) {
    parts.push(
      clock.clockedIn && clock.activeSessionStartedAt
        ? `On the clock since ${formatWallClockTime(clock.activeSessionStartedAt)}`
        : 'Not clocked in',
    );
  }
  return parts.join(' · ');
}
