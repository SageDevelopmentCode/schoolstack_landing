import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  isCommitteeWorkspaceLoadTimeoutError,
  withCommitteeWorkspaceLoadTimeout,
} from '@/lib/school-admin/committees/committee-workspace-load';
import {
  fetchStaffHoursPageData,
  patchStaffHoursAdjustmentSettings,
  postStaffHoursAdjustmentReview,
} from '@/lib/school-admin/staff-hours/staff-hours-api';
import type { AdminStaffHoursPageData } from '@/lib/school-admin/staff-hours/staff-hours-types';
import { useMobileErrorReporter } from '@/lib/use-mobile-error-reporter';

export type StaffHoursView = 'live' | 'summary' | 'requests' | 'settings';

/**
 * Data for School admin › More › Staff hours (no UI, no toasts). Same
 * timeout-wrapped load, summary range seeding, reviews, settings and
 * `reportError` operations as the Story screen. Mutations report, then rethrow.
 */
export function useStaffHoursController({ organizationId, slug }: { organizationId: string; slug: string }) {
  const { reportError } = useMobileErrorReporter(organizationId);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const [view, setViewState] = useState<StaffHoursView>('live');
  const [pageData, setPageData] = useState<AdminStaffHoursPageData | null>(null);
  const [summaryFrom, setSummaryFrom] = useState('');
  const [summaryTo, setSummaryTo] = useState('');
  const [staffFilter, setStaffFilter] = useState('');
  const [expandedStaffId, setExpandedStaffId] = useState<string | null>(null);
  const [staffPickerOpen, setStaffPickerOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<number | null>(null);
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [savingSettings, setSavingSettings] = useState(false);

  const fetchPage = useCallback(
    async (options: { from?: string; to?: string; staffMemberId?: string | null; seedSummaryRange?: boolean }) => {
      const next = await withCommitteeWorkspaceLoadTimeout(
        fetchStaffHoursPageData(organizationId, {
          from: options.from || undefined,
          to: options.to || undefined,
          staffMemberId: options.staffMemberId ?? null,
          view: 'all',
        }),
      );
      if (!mounted.current) return next;
      setPageData(next);
      setLastUpdatedAt(Date.now());
      if (options.seedSummaryRange) {
        setSummaryFrom(next.summaryFrom);
        setSummaryTo(next.summaryTo);
      }
      return next;
    },
    [organizationId],
  );

  const reportLoad = useCallback(
    (err: unknown) => {
      if (mounted.current) setError(err instanceof Error ? err.message : 'Failed to load staff hours.');
      void reportError(isCommitteeWorkspaceLoadTimeoutError(err) ? 'staff_hours.load_timeout' : 'staff_hours.load', err);
    },
    [reportError],
  );

  /** Refresh with the current filters (pull, Live tab, Apply). */
  const reload = useCallback(async () => {
    try {
      await fetchPage({ from: summaryFrom, to: summaryTo, staffMemberId: staffFilter || null });
      if (mounted.current) setError(null);
    } catch (err) {
      reportLoad(err);
    }
  }, [fetchPage, reportLoad, staffFilter, summaryFrom, summaryTo]);

  const initialLoad = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await fetchPage({ seedSummaryRange: true });
    } catch (err) {
      reportLoad(err);
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, [fetchPage, reportLoad]);

  useEffect(() => {
    void initialLoad();
  }, [initialLoad]);

  const setView = useCallback(
    (next: StaffHoursView) => {
      setViewState(next);
      if (next === 'live') void reload();
    },
    [reload],
  );

  const applySummary = useCallback(async () => {
    setExpandedStaffId(null);
    setApplying(true);
    try {
      await reload();
    } finally {
      if (mounted.current) setApplying(false);
    }
    setViewState('summary');
  }, [reload]);

  const review = useCallback(
    async (requestId: string, decision: 'approved' | 'denied') => {
      setReviewingId(requestId);
      try {
        const next = await postStaffHoursAdjustmentReview({ organizationId, requestId, decision });
        if (mounted.current) setPageData(next);
      } catch (err) {
        void reportError('staff_hours.review_adjustment', err);
        throw err instanceof Error ? err : new Error('Could not review the adjustment.');
      } finally {
        if (mounted.current) setReviewingId(null);
      }
    },
    [organizationId, reportError],
  );

  /** Optimistic like the Story switch: flips now, reverts on failure. */
  const setRequireApproval = useCallback(
    async (next: boolean) => {
      setSavingSettings(true);
      setPageData((current) => (current ? { ...current, adjustmentsRequireApproval: next } : current));
      try {
        await patchStaffHoursAdjustmentSettings({ organizationId, adjustmentsRequireApproval: next });
      } catch (err) {
        if (mounted.current) {
          setPageData((current) => (current ? { ...current, adjustmentsRequireApproval: !next } : current));
        }
        void reportError('staff_hours.adjustment_settings', err);
        throw err instanceof Error ? err : new Error('Could not save staff hours settings.');
      } finally {
        if (mounted.current) setSavingSettings(false);
      }
    },
    [organizationId, reportError],
  );

  const requests = useMemo(() => pageData?.adjustmentRequests ?? [], [pageData?.adjustmentRequests]);
  const pendingRequests = useMemo(() => requests.filter((request) => request.status === 'pending'), [requests]);
  const historyRequests = useMemo(() => requests.filter((request) => request.status !== 'pending'), [requests]);

  const sessionsForStaff = useCallback(
    (staffMemberId: string) => pageData?.sessions.filter((session) => session.staffMemberId === staffMemberId) ?? [],
    [pageData?.sessions],
  );

  const staffFilterLabel = useMemo(() => {
    if (!staffFilter) return 'All staff';
    return pageData?.staffOptions.find((option) => option.id === staffFilter)?.name ?? 'All staff';
  }, [pageData?.staffOptions, staffFilter]);

  return {
    organizationId,
    slug,
    status: (loading && !pageData ? 'loading' : !pageData ? 'error' : 'ready') as 'loading' | 'error' | 'ready',
    view,
    setView,
    pageData,
    error,
    lastUpdatedAt,
    refresh: reload,
    retryInitial: initialLoad,
    summaryFrom,
    setSummaryFrom,
    summaryTo,
    setSummaryTo,
    staffFilter,
    setStaffFilter,
    staffFilterLabel,
    staffPickerOpen,
    openStaffPicker: useCallback(() => setStaffPickerOpen(true), []),
    closeStaffPicker: useCallback(() => setStaffPickerOpen(false), []),
    expandedStaffId,
    setExpandedStaffId,
    applying,
    applySummary,
    sessionsForStaff,
    pendingRequests,
    historyRequests,
    reviewingId,
    review,
    savingSettings,
    setRequireApproval,
  };
}

export type StaffHoursController = ReturnType<typeof useStaffHoursController>;
