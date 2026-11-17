import { useCallback, useState } from 'react';

import { useGardenReadOnlyGate } from '@/components/parent/garden/feedback';
import { useAdminAction } from '@/components/school-admin/garden/use-admin-action';
import { formatHoursMinutes, formatWallClockTime } from '@/lib/teacher/my-hours/format-duration';
import {
  postTeacherMyHoursClockIn,
  postTeacherMyHoursClockOut,
} from '@/lib/teacher/my-hours/teacher-my-hours-api';
import type { ClockActionPending, TeacherMyHoursPageData } from '@/lib/teacher/my-hours/types';

export const TEACHER_CLOCK_KEY = 'teacher-home-clock';

function errorDetail(err: unknown, fallback: string): string {
  return err instanceof Error && err.message ? err.message : fallback;
}

export function teacherWeekLine(data: TeacherMyHoursPageData): string {
  const week = data.sidebar.week;
  return `This week: ${formatHoursMinutes(week.loggedMinutes)} of ${formatHoursMinutes(week.goalMinutes)}.`;
}

/**
 * Clock in / clock out with Garden feedback, shared by the Home time clock and
 * My Hours: the same API calls and `my_hours.clock_in` / `my_hours.clock_out`
 * operations, toasts with Retry instead of `Alert.alert`, haptics, and the
 * read-only toast in preview. `onPageData` receives the server's new payload.
 */
export function useTeacherClockActions({
  organizationId,
  slug,
  clockedIn,
  onPageData,
}: {
  organizationId: string;
  slug: string;
  clockedIn: boolean;
  onPageData: (next: TeacherMyHoursPageData) => void;
}) {
  const action = useAdminAction(organizationId);
  const { readOnly, notifyReadOnly } = useGardenReadOnlyGate();
  const [clockActionPending, setClockActionPending] = useState<ClockActionPending>(null);

  const clockIn = useCallback(async () => {
    if (readOnly) {
      notifyReadOnly();
      return;
    }
    if (clockedIn || clockActionPending) return;
    setClockActionPending('in');
    try {
      await action.run(() => postTeacherMyHoursClockIn(organizationId, slug), {
        key: TEACHER_CLOCK_KEY,
        operation: 'my_hours.clock_in',
        retry: true,
        success: (next) => {
          onPageData(next);
          const clockInAt = next.activeSession?.clockInAt;
          return {
            title: clockInAt
              ? `Clocked in at ${formatWallClockTime(new Date(clockInAt))}`
              : 'Clocked in',
            description: 'Your session is running. Clock out here when you leave.',
          };
        },
        error: (err) => ({
          title: "Couldn't clock you in",
          description: `${errorDetail(err, 'Could not clock in.')} You are not clocked in yet.`,
        }),
      });
    } finally {
      setClockActionPending(null);
    }
  }, [action, clockActionPending, clockedIn, notifyReadOnly, onPageData, organizationId, readOnly, slug]);

  const clockOut = useCallback(async () => {
    if (readOnly) {
      notifyReadOnly();
      return;
    }
    if (!clockedIn || clockActionPending) return;
    setClockActionPending('out');
    try {
      await action.run(() => postTeacherMyHoursClockOut(organizationId, slug), {
        key: TEACHER_CLOCK_KEY,
        operation: 'my_hours.clock_out',
        retry: true,
        success: ({ pageData: next, sessionMinutes }) => {
          onPageData(next);
          return {
            title: `Session saved · ${formatHoursMinutes(Math.max(1, sessionMinutes))} logged`,
            description: teacherWeekLine(next),
          };
        },
        error: (err) => ({
          title: "Couldn't clock you out",
          description: `${errorDetail(err, 'Could not clock out.')} Your session is still running.`,
        }),
      });
    } finally {
      setClockActionPending(null);
    }
  }, [action, clockActionPending, clockedIn, notifyReadOnly, onPageData, organizationId, readOnly, slug]);

  return {
    readOnly,
    clockActionPending,
    flash: action.flashKey === TEACHER_CLOCK_KEY,
    clockIn,
    clockOut,
  };
}
