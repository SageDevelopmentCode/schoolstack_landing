import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { useTeacherClockActions } from '@/components/teacher/home/garden/use-teacher-clock-actions';
import { fetchTeacherMyHoursPageData } from '@/lib/teacher/my-hours/teacher-my-hours-api';
import type { TeacherMyHoursPageData } from '@/lib/teacher/my-hours/types';
import { registerPortalMemoryClear } from '@/lib/portal-cache';
import { useMobileErrorReporter } from '@/lib/use-mobile-error-reporter';

/** Last My Hours payload per school, so coming back to Home doesn't flash the skeleton. */
const lastPageData = new Map<string, TeacherMyHoursPageData>();
registerPortalMemoryClear(() => lastPageData.clear());

/** My Hours writes here after a clock or adjust action so Home is current on return. */
export function rememberTeacherMyHoursPageData(
  organizationId: string,
  slug: string,
  data: TeacherMyHoursPageData,
) {
  lastPageData.set(`${organizationId}:${slug}`, data);
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

  const { readOnly, clockActionPending, flash, clockIn, clockOut } = useTeacherClockActions({
    organizationId,
    slug,
    clockedIn,
    onPageData: setPageData,
  });

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
    flash,
    clockIn,
    clockOut,
  };
}

export type TeacherTimeClock = ReturnType<typeof useTeacherTimeClock>;
