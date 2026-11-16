import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { useGardenReadOnlyGate } from '@/components/parent/garden/feedback';
import { useAdminAction } from '@/components/school-admin/garden/use-admin-action';
import { formatHoursMinutes, formatWallClockTime } from '@/lib/teacher/my-hours/format-duration';
import {
  fetchTeacherMyHoursPageData,
  postTeacherMyHoursClockIn,
  postTeacherMyHoursClockOut,
} from '@/lib/teacher/my-hours/teacher-my-hours-api';
import type { ClockActionPending, TeacherMyHoursPageData } from '@/lib/teacher/my-hours/types';
import { registerPortalMemoryClear } from '@/lib/portal-cache';
import { useMobileErrorReporter } from '@/lib/use-mobile-error-reporter';

const CLOCK_KEY = 'teacher-home-clock';

/** Last My Hours payload per school, so coming back to Home doesn't flash the skeleton. */
const lastPageData = new Map<string, TeacherMyHoursPageData>();
registerPortalMemoryClear(() => lastPageData.clear());

function errorDetail(err: unknown, fallback: string): string {
  return err instanceof Error && err.message ? err.message : fallback;
}

function weekLine(data: TeacherMyHoursPageData): string {
  const week = data.sidebar.week;
  return `This week: ${formatHoursMinutes(week.loggedMinutes)} of ${formatHoursMinutes(week.goalMinutes)}.`;
}

/**
 * Home time clock: the same load / clock-in / clock-out calls and `reportError`
 * operations as the old My Hours quick card, with Garden feedback (toasts with
 * Retry instead of `Alert.alert`, haptics, read-only toast in preview).
 */
export function useTeacherTimeClock({
  organizationId,
  slug,
  refreshKey,
  enabled,
}: {
  organizationId: string;
  slug: string;
  refreshKey: number;
  enabled: boolean;
}) {
  const { reportError } = useMobileErrorReporter(organizationId);
  const action = useAdminAction(organizationId);
  const { readOnly, notifyReadOnly } = useGardenReadOnlyGate();

  const cacheKey = `${organizationId}:${slug}`;
  const [pageData, setPageDataState] = useState<TeacherMyHoursPageData | null>(
    () => lastPageData.get(cacheKey) ?? null,
  );
  const setPageData = useCallback(
    (next: TeacherMyHoursPageData) => {
      lastPageData.set(cacheKey, next);
      setPageDataState(next);
    },
    [cacheKey],
  );
  const [loading, setLoading] = useState(() => !lastPageData.has(cacheKey));
  const [loadFailed, setLoadFailed] = useState(false);
  const [clockActionPending, setClockActionPending] = useState<ClockActionPending>(null);

  const load = useCallback(async () => {
    if (!enabled) return;
    try {
      const next = await fetchTeacherMyHoursPageData(organizationId, slug);
      setPageData(next);
      setLoadFailed(false);
    } catch (err) {
      void reportError('my_hours.home_quick_card_load', err);
      setLoadFailed(true);
    } finally {
      setLoading(false);
    }
  }, [enabled, organizationId, slug, reportError, setPageData]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  useEffect(() => {
    if (refreshKey > 0) {
      void load();
    }
  }, [refreshKey, load]);

  const activeSessionStartedAt = useMemo(() => {
    if (!pageData?.activeSession) return null;
    return new Date(pageData.activeSession.clockInAt);
  }, [pageData?.activeSession]);

  const clockedIn = activeSessionStartedAt != null;
  const week = pageData?.sidebar.week ?? null;
  const weekProgress = week && week.goalMinutes ? Math.min(1, week.loggedMinutes / week.goalMinutes) : 0;

  const clockIn = useCallback(async () => {
    if (readOnly) {
      notifyReadOnly();
      return;
    }
    if (clockedIn || clockActionPending) return;
    setClockActionPending('in');
    try {
      await action.run(() => postTeacherMyHoursClockIn(organizationId, slug), {
        key: CLOCK_KEY,
        operation: 'my_hours.clock_in',
        retry: true,
        success: (next) => {
          setPageData(next);
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
  }, [action, clockActionPending, clockedIn, notifyReadOnly, organizationId, readOnly, setPageData, slug]);

  const clockOut = useCallback(async () => {
    if (readOnly) {
      notifyReadOnly();
      return;
    }
    if (!clockedIn || clockActionPending) return;
    setClockActionPending('out');
    try {
      await action.run(() => postTeacherMyHoursClockOut(organizationId, slug), {
        key: CLOCK_KEY,
        operation: 'my_hours.clock_out',
        retry: true,
        success: ({ pageData: next, sessionMinutes }) => {
          setPageData(next);
          return {
            title: `Session saved · ${formatHoursMinutes(Math.max(1, sessionMinutes))} logged`,
            description: weekLine(next),
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
  }, [action, clockActionPending, clockedIn, notifyReadOnly, organizationId, readOnly, setPageData, slug]);

  return {
    loading: loading && !pageData,
    loadFailed: loadFailed && !pageData,
    retryLoad: load,
    pageData,
    week,
    weekProgress,
    clockedIn,
    activeSessionStartedAt,
    clockActionPending,
    readOnly,
    flash: action.flashKey === CLOCK_KEY,
    clockIn,
    clockOut,
  };
}

export type TeacherTimeClock = ReturnType<typeof useTeacherTimeClock>;
