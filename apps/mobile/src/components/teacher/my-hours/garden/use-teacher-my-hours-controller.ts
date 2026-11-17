import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useTeacherHome } from '@/contexts/teacher-home-context';
import { goBackOrReplace } from '@/lib/navigation';
import {
  isCommitteeWorkspaceLoadTimeoutError,
  withCommitteeWorkspaceLoadTimeout,
} from '@/lib/school-admin/committees/committee-workspace-load';
import {
  addDays,
  formatCompactNavDate,
  formatMonthYear,
  isSameDay,
  parseDateKey,
  startOfWeekMonday,
  toDateKey,
} from '@/lib/teacher/my-hours/format-duration';
import {
  mergeTeacherMyHoursPageData,
  nextLoadedAdjustWeekToken,
  weekRangeNeedsFetch,
} from '@/lib/teacher/my-hours/my-hours-range-merge';
import {
  activeSessionCountsInFocusDaySessionTotal,
  activeSessionStartedAtForFocusDay,
  getDayLogForDateKey,
  referenceDateFromKey,
} from '@/lib/teacher/my-hours/my-hours-page-utils';
import {
  fetchTeacherMyHoursPageData,
  postTeacherMyHoursAdjustment,
} from '@/lib/teacher/my-hours/teacher-my-hours-api';
import type {
  MyHoursAdjustmentSession,
  MyHoursView,
  TeacherMyHoursPageData,
} from '@/lib/teacher/my-hours/types';
import { isTeacherFeatureEnabled } from '@/lib/teacher/teacher-features';
import { teacherTabRoute } from '@/lib/teacher/teacher-nav';
import { useMobileErrorReporter } from '@/lib/use-mobile-error-reporter';

export type MyHoursAdjustInput = {
  dateKey: string;
  note: string;
  sessions: MyHoursAdjustmentSession[];
};

export type MyHoursAdjustResult = {
  requireApproval: boolean;
  /** The save worked but re-reading the week failed (already reported). */
  weekReloadFailed: boolean;
};

/**
 * My Hours data + navigation, moved verbatim from the Story screen: the same
 * load (with timeout), adjust-week range fetch / merge / stale-drop, and the
 * same `my_hours.*` operations. No UI, no toasts: the feedback hook and the
 * Garden screen add those.
 */
export function useTeacherMyHoursController({
  organizationId,
  slug,
}: {
  organizationId: string;
  slug: string;
}) {
  const router = useRouter();
  const { reportError } = useMobileErrorReporter(organizationId);
  const { data: homeData, ensureLoaded: ensureHomeLoaded } = useTeacherHome();

  const [pageData, setPageData] = useState<TeacherMyHoursPageData | null>(null);
  const [view, setViewState] = useState<MyHoursView>('day');
  const [focusDate, setFocusDate] = useState(() => new Date());
  const [monthDate, setMonthDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingEditorDateKey, setPendingEditorDateKey] = useState<string | null>(null);
  const adjustWeekFetchRef = useRef(0);
  const [loadedAdjustWeekToken, setLoadedAdjustWeekToken] = useState<string | null>(null);
  const loadedAdjustWeekStartKeyRef = useRef<string | null>(null);
  const loadedAdjustWeekEndKeyRef = useRef<string | null>(null);

  useEffect(() => {
    void ensureHomeLoaded();
  }, [ensureHomeLoaded]);

  const myHoursEnabled = isTeacherFeatureEnabled(homeData?.features, 'my_hours');

  const load = useCallback(
    async (mode: 'initial' | 'refresh' = 'initial') => {
      if (mode === 'initial') {
        setLoading(true);
      } else {
        setRefreshing(true);
      }
      setError(null);
      try {
        const next = await withCommitteeWorkspaceLoadTimeout(
          fetchTeacherMyHoursPageData(organizationId, slug),
        );
        setPageData(next);
        setLoadedAdjustWeekToken(
          nextLoadedAdjustWeekToken(
            loadedAdjustWeekStartKeyRef.current,
            loadedAdjustWeekEndKeyRef.current,
            next,
          ),
        );
        const ref = referenceDateFromKey(next.referenceDateKey);
        setFocusDate(ref);
        setMonthDate(new Date(ref.getFullYear(), ref.getMonth(), 1));
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load My Hours.';
        setError(message);
        void reportError(
          isCommitteeWorkspaceLoadTimeoutError(err) ? 'my_hours.load_timeout' : 'my_hours.load',
          err,
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [organizationId, slug, reportError],
  );

  useEffect(() => {
    if (!myHoursEnabled && homeData) {
      setLoading(false);
      return;
    }
    if (myHoursEnabled || !homeData) {
      void load('initial');
    }
  }, [homeData, load, myHoursEnabled]);

  const referenceDate = useMemo(
    () => (pageData ? referenceDateFromKey(pageData.referenceDateKey) : new Date()),
    [pageData],
  );

  const activeSessionStartedAt = useMemo(() => {
    if (!pageData?.activeSession) return null;
    return new Date(pageData.activeSession.clockInAt);
  }, [pageData?.activeSession]);

  const focusDateKey = toDateKey(focusDate);

  const adjustWeekStartKey = useMemo(() => {
    if (view !== 'adjust') return null;
    return toDateKey(startOfWeekMonday(focusDate));
  }, [view, focusDate]);

  const adjustWeekEndKey = useMemo(() => {
    if (adjustWeekStartKey == null) return null;
    return toDateKey(addDays(parseDateKey(adjustWeekStartKey), 6));
  }, [adjustWeekStartKey]);

  const adjustWeekToken =
    adjustWeekStartKey != null && adjustWeekEndKey != null
      ? `${adjustWeekStartKey}:${adjustWeekEndKey}`
      : null;

  loadedAdjustWeekStartKeyRef.current = adjustWeekStartKey;
  loadedAdjustWeekEndKeyRef.current = adjustWeekEndKey;

  const needsAdjustWeekFetch =
    pageData != null &&
    view === 'adjust' &&
    adjustWeekStartKey != null &&
    adjustWeekEndKey != null &&
    weekRangeNeedsFetch(adjustWeekStartKey, adjustWeekEndKey, pageData.rangeFrom, pageData.rangeTo);

  const adjustWeekLoading =
    needsAdjustWeekFetch && adjustWeekToken != null && loadedAdjustWeekToken !== adjustWeekToken;

  const loadAdjustWeekIntoPageData = useCallback(
    async (
      base: TeacherMyHoursPageData,
      weekStartKey: string,
      weekEndKey: string,
    ): Promise<TeacherMyHoursPageData> => {
      if (!weekRangeNeedsFetch(weekStartKey, weekEndKey, base.rangeFrom, base.rangeTo)) {
        return base;
      }
      const patch = await fetchTeacherMyHoursPageData(organizationId, slug, {
        from: weekStartKey,
        to: weekEndKey,
      });
      return mergeTeacherMyHoursPageData(base, patch);
    },
    [organizationId, slug],
  );

  useEffect(() => {
    if (
      !needsAdjustWeekFetch ||
      adjustWeekStartKey == null ||
      adjustWeekEndKey == null ||
      adjustWeekToken == null ||
      loadedAdjustWeekToken === adjustWeekToken
    ) {
      return;
    }

    const fetchId = ++adjustWeekFetchRef.current;

    void (async () => {
      try {
        const patch = await fetchTeacherMyHoursPageData(organizationId, slug, {
          from: adjustWeekStartKey,
          to: adjustWeekEndKey,
        });
        if (fetchId !== adjustWeekFetchRef.current) return;
        setPageData((current) => (current ? mergeTeacherMyHoursPageData(current, patch) : current));
        setLoadedAdjustWeekToken(adjustWeekToken);
      } catch (err) {
        if (fetchId !== adjustWeekFetchRef.current) return;
        void reportError('my_hours.adjust_week_load', err);
      }
    })();
  }, [
    needsAdjustWeekFetch,
    adjustWeekStartKey,
    adjustWeekEndKey,
    adjustWeekToken,
    loadedAdjustWeekToken,
    organizationId,
    slug,
    reportError,
  ]);

  const dayLog = useMemo(
    () => (pageData ? getDayLogForDateKey(pageData.entriesByDateKey, focusDate) : null),
    [pageData, focusDate],
  );

  const closedSessionsForFocusDay = useMemo(() => {
    if (!pageData) return [];
    const sessions = pageData.sessionsByDateKey[focusDateKey] ?? [];
    return sessions.filter((session) => session.clockOutAt != null);
  }, [pageData, focusDateKey]);

  const activeOnFocusDay = pageData
    ? activeSessionStartedAtForFocusDay(
        pageData.activeSession,
        focusDateKey,
        pageData.referenceDateKey,
      )
    : null;

  const activeCountsOnFocusDay = pageData
    ? activeSessionCountsInFocusDaySessionTotal(
        pageData.activeSession,
        focusDateKey,
        pageData.referenceDateKey,
      )
    : false;

  /** Today's closed sessions (the clock card adds the live session). */
  const today = useMemo(() => {
    if (!pageData) return null;
    const todayKey = pageData.referenceDateKey;
    const closed = (pageData.sessionsByDateKey[todayKey] ?? []).filter(
      (session) => session.clockOutAt != null,
    );
    return {
      closedMinutes: closed.reduce((sum, s) => sum + s.minutes, 0),
      closedSessions: closed.length,
      activeCountsToday: pageData.activeSession?.workDate === todayKey,
    };
  }, [pageData]);

  /** New payload from clock in / out: same token bookkeeping as the old handlers. */
  const applyPageData = useCallback(
    (next: TeacherMyHoursPageData) => {
      setPageData(next);
      setLoadedAdjustWeekToken(nextLoadedAdjustWeekToken(adjustWeekStartKey, adjustWeekEndKey, next));
    },
    [adjustWeekEndKey, adjustWeekStartKey],
  );

  const setView = useCallback(
    (nextView: MyHoursView) => {
      setViewState(nextView);
      if (nextView === 'month') {
        setMonthDate(new Date(focusDate.getFullYear(), focusDate.getMonth(), 1));
      }
    },
    [focusDate],
  );

  const shiftFocusDate = useCallback(
    (delta: number) => {
      setFocusDate((current) => {
        const next = addDays(current, delta);
        if (view === 'month') {
          setMonthDate(next);
        }
        return next;
      });
    },
    [view],
  );

  const shiftMonth = useCallback((deltaMonths: number) => {
    setMonthDate((current) => {
      const next = new Date(current.getFullYear(), current.getMonth() + deltaMonths, 1);
      setFocusDate(next);
      return next;
    });
  }, []);

  const openDayDetail = useCallback((date: Date) => {
    setFocusDate(date);
    setViewState('day');
  }, []);

  const goPrevious = useCallback(() => {
    if (view === 'month') {
      shiftMonth(-1);
    } else {
      shiftFocusDate(view === 'week' || view === 'adjust' ? -7 : -1);
    }
  }, [shiftFocusDate, shiftMonth, view]);

  const goNext = useCallback(() => {
    if (view === 'month') {
      shiftMonth(1);
    } else {
      shiftFocusDate(view === 'week' || view === 'adjust' ? 7 : 1);
    }
  }, [shiftFocusDate, shiftMonth, view]);

  /** Jump the pager back to the school's today (keeps the current view). */
  const goToToday = useCallback(() => {
    setFocusDate(referenceDate);
    setMonthDate(new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 1));
  }, [referenceDate]);

  /** Day view "Add hours for this day" / "Fix this day": open Adjust on that week, then its editor. */
  const startAdjustFor = useCallback((dateKey: string) => {
    setFocusDate(parseDateKey(dateKey));
    setViewState('adjust');
    setPendingEditorDateKey(dateKey);
  }, []);

  const clearPendingEditor = useCallback(() => setPendingEditorDateKey(null), []);

  const submitAdjustment = useCallback(
    async (input: MyHoursAdjustInput): Promise<MyHoursAdjustResult> => {
      try {
        const result = await postTeacherMyHoursAdjustment({
          organizationId,
          dateKey: input.dateKey,
          note: input.note,
          sessions: input.sessions,
        });
        const weekStartKey = toDateKey(startOfWeekMonday(focusDate));
        const weekEndKey = toDateKey(addDays(parseDateKey(weekStartKey), 6));
        let nextPageData = result.pageData;
        let weekReloadFailed = false;
        try {
          nextPageData = await loadAdjustWeekIntoPageData(result.pageData, weekStartKey, weekEndKey);
        } catch (reloadError) {
          weekReloadFailed = true;
          void reportError('my_hours.adjust_week_load', reloadError);
        }
        setPageData(nextPageData);
        setLoadedAdjustWeekToken(
          nextLoadedAdjustWeekToken(adjustWeekStartKey, adjustWeekEndKey, nextPageData),
        );
        return { requireApproval: result.requireApproval, weekReloadFailed };
      } catch (err) {
        // Reported as `my_hours.adjust` by the editor, which shows the failure in the sheet.
        throw err;
      }
    },
    [
      organizationId,
      focusDate,
      loadAdjustWeekIntoPageData,
      reportError,
      adjustWeekStartKey,
      adjustWeekEndKey,
    ],
  );

  const onBack = useCallback(() => {
    goBackOrReplace(router, teacherTabRoute(slug, 'home'));
  }, [router, slug]);

  const status: 'disabled' | 'loading' | 'error' | 'ready' =
    !myHoursEnabled && homeData
      ? 'disabled'
      : loading && !pageData
        ? 'loading'
        : error && !pageData
          ? 'error'
          : pageData
            ? 'ready'
            : 'loading';

  const week = pageData?.sidebar.week ?? null;

  return {
    status,
    error,
    pageData,
    reportError,
    refreshing,
    retry: useCallback(() => load('initial'), [load]),
    refresh: useCallback(() => load('refresh'), [load]),
    onBack,

    view,
    setView,
    focusDate,
    focusDateKey,
    monthDate,
    referenceDate,
    navLabel: view === 'month' ? formatMonthYear(monthDate) : formatCompactNavDate(focusDate),
    /** The pager already shows the school's today (day / week / month that contains it). */
    showingToday:
      view === 'month'
        ? monthDate.getFullYear() === referenceDate.getFullYear() &&
          monthDate.getMonth() === referenceDate.getMonth()
        : view === 'day'
          ? isSameDay(focusDate, referenceDate)
          : isSameDay(startOfWeekMonday(focusDate), startOfWeekMonday(referenceDate)),
    goPrevious,
    goNext,
    goToToday,
    openDayDetail,

    week,
    weekProgress: week && week.goalMinutes ? Math.min(1, week.loggedMinutes / week.goalMinutes) : 0,
    clockedIn: activeSessionStartedAt != null,
    activeSessionStartedAt,
    today,
    dayLog,
    closedSessionsForFocusDay,
    activeOnFocusDay,
    activeCountsOnFocusDay,
    applyPageData,

    adjustWeekLoading,
    pendingEditorDateKey,
    startAdjustFor,
    clearPendingEditor,
    submitAdjustment,
  };
}

export type TeacherMyHoursController = ReturnType<typeof useTeacherMyHoursController>;
