import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';

import type { AttendanceHistoryEntry } from '@/lib/attendance/attendance-types';
import { goBackOrReplace } from '@/lib/navigation';
import { parentTabRoute } from '@/lib/parent/parent-nav';
import {
  fetchParentAttendanceEligibleChildren,
  fetchParentStudentAttendanceHistory,
  type ParentAttendanceEligibleChild,
} from '@/lib/parent/parent-portal-api';
import { useMobileErrorReporter } from '@/lib/use-mobile-error-reporter';

export const ATTENDANCE_PAGE_SIZE = 20;

type StudentHistoryCache = {
  entries: AttendanceHistoryEntry[];
  totalCount: number;
  hasMore: boolean;
  error: string | null;
};

/**
 * Attendance data + callbacks (no UI). Same requests, per-student cache and
 * paging as the Story screen; failures report through `useMobileErrorReporter`
 * with the original operation names.
 */
export function useParentAttendanceScreenController({
  slug,
  organizationId,
}: {
  slug: string;
  organizationId: string;
}) {
  const router = useRouter();
  const { reportError } = useMobileErrorReporter(organizationId);

  const [eligibleChildren, setEligibleChildren] = useState<ParentAttendanceEligibleChild[]>([]);
  const [childrenLoading, setChildrenLoading] = useState(true);
  const [childrenRefreshing, setChildrenRefreshing] = useState(false);
  const [childrenError, setChildrenError] = useState<string | null>(null);
  const [hasLoadedChildren, setHasLoadedChildren] = useState(false);

  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null);
  const [historyCache, setHistoryCache] = useState<Record<string, StudentHistoryCache>>({});
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyLoadingMore, setHistoryLoadingMore] = useState(false);
  const [loadMoreFailedTick, setLoadMoreFailedTick] = useState(0);

  const selectedChild = useMemo(
    () =>
      eligibleChildren.find((child) => child.applicationId === selectedApplicationId) ??
      eligibleChildren[0] ??
      null,
    [eligibleChildren, selectedApplicationId],
  );

  const selectedStudentId = selectedChild?.studentId ?? null;
  const cachedHistory = selectedStudentId ? historyCache[selectedStudentId] : undefined;

  const onBack = useCallback(() => {
    goBackOrReplace(router, parentTabRoute(slug, 'home'));
  }, [router, slug]);

  const updateHistoryCache = useCallback(
    (
      studentId: string,
      updater: (current: StudentHistoryCache | undefined) => StudentHistoryCache,
    ) => {
      setHistoryCache((current) => ({ ...current, [studentId]: updater(current[studentId]) }));
    },
    [],
  );

  const loadEligibleChildren = useCallback(
    async (refresh = false) => {
      if (refresh) setChildrenRefreshing(true);
      else setChildrenLoading(true);
      setChildrenError(null);

      try {
        const payload = await fetchParentAttendanceEligibleChildren(organizationId);
        setEligibleChildren(payload.eligibleChildren);
        setHasLoadedChildren(true);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load attendance children.';
        setChildrenError(message);
        reportError('attendance.load_eligible_children', err);
      } finally {
        setChildrenLoading(false);
        setChildrenRefreshing(false);
      }
    },
    [organizationId, reportError],
  );

  const loadHistory = useCallback(
    async (studentId: string, offset: number, append: boolean) => {
      if (append) setHistoryLoadingMore(true);
      else setHistoryLoading(true);

      if (!append) {
        updateHistoryCache(studentId, (current) => ({
          entries: current?.entries ?? [],
          totalCount: current?.totalCount ?? 0,
          hasMore: current?.hasMore ?? false,
          error: null,
        }));
      }

      try {
        const payload = await fetchParentStudentAttendanceHistory(organizationId, studentId, {
          limit: ATTENDANCE_PAGE_SIZE,
          offset,
        });
        const nextEntries = payload.entries ?? [];
        updateHistoryCache(studentId, (current) => ({
          entries: append ? [...(current?.entries ?? []), ...nextEntries] : nextEntries,
          totalCount: payload.totalCount ?? 0,
          hasMore: payload.hasMore ?? false,
          error: null,
        }));
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load attendance history.';
        updateHistoryCache(studentId, (current) => ({
          entries: append ? (current?.entries ?? []) : [],
          totalCount: append ? (current?.totalCount ?? 0) : 0,
          hasMore: append ? (current?.hasMore ?? false) : false,
          // A failed "load more" keeps the loaded page on screen; the screen toasts instead.
          error: append ? null : message,
        }));
        if (append) setLoadMoreFailedTick((tick) => tick + 1);
        reportError('attendance.load_history', err, {
          entityType: 'student',
          entityId: studentId,
        });
      } finally {
        setHistoryLoading(false);
        setHistoryLoadingMore(false);
      }
    },
    [organizationId, reportError, updateHistoryCache],
  );

  useEffect(() => {
    void loadEligibleChildren();
  }, [loadEligibleChildren]);

  useEffect(() => {
    if (eligibleChildren.length === 0) {
      setSelectedApplicationId(null);
      return;
    }
    if (
      !selectedApplicationId ||
      !eligibleChildren.some((child) => child.applicationId === selectedApplicationId)
    ) {
      setSelectedApplicationId(eligibleChildren[0].applicationId);
    }
  }, [eligibleChildren, selectedApplicationId]);

  useEffect(() => {
    if (!selectedStudentId) return;
    if (historyCache[selectedStudentId]) return;
    void loadHistory(selectedStudentId, 0, false);
    // Only re-run when the selected child changes; cache updates should not refetch.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- historyCache read on student switch only
  }, [loadHistory, selectedStudentId]);

  /** Pull to refresh: reload children, drop this child's cache, reload page one. */
  const refresh = useCallback(async () => {
    await loadEligibleChildren(true);
    if (!selectedStudentId) return;
    setHistoryCache((current) => {
      const next = { ...current };
      delete next[selectedStudentId];
      return next;
    });
    await loadHistory(selectedStudentId, 0, false);
  }, [loadEligibleChildren, loadHistory, selectedStudentId]);

  const entries = useMemo(() => cachedHistory?.entries ?? [], [cachedHistory]);
  const hasMore = cachedHistory?.hasMore ?? false;

  const loadMore = useCallback(() => {
    if (!selectedStudentId || historyLoadingMore || !hasMore) return;
    void loadHistory(selectedStudentId, entries.length, true);
  }, [entries.length, hasMore, historyLoadingMore, loadHistory, selectedStudentId]);

  const retryHistory = useCallback(() => {
    if (!selectedStudentId) return;
    void loadHistory(selectedStudentId, 0, false);
  }, [loadHistory, selectedStudentId]);

  const retryChildren = useCallback(() => {
    void loadEligibleChildren();
  }, [loadEligibleChildren]);

  return {
    slug,
    organizationId,
    isInitialLoading: childrenLoading && !hasLoadedChildren,
    hasLoadedChildren,
    isRefreshing: childrenRefreshing,
    childrenError,
    eligibleChildren,
    selectedChild,
    selectChild: setSelectedApplicationId,
    entries,
    totalCount: cachedHistory?.totalCount ?? 0,
    hasMore,
    historyError: cachedHistory?.error ?? null,
    showHistorySkeleton: historyLoading && !cachedHistory?.entries.length,
    historyLoadingMore,
    loadMoreFailedTick,
    refresh,
    loadMore,
    retryHistory,
    retryChildren,
    onBack,
  };
}

export type ParentAttendanceScreenController = ReturnType<
  typeof useParentAttendanceScreenController
>;
