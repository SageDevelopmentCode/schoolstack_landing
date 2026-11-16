import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { useSchoolAdminSubmissions } from '@/contexts/school-admin-submissions-context';
import { APPLICATION_STATUSES_EXCLUDED_FROM_DEFAULT_ALL } from '@/lib/admissions/application-status-ui';
import type { AdminApplicationSubmission } from '@/lib/admissions/application-submissions';

/** Filter chips, same ids and labels as the Story `SubmissionStatusFilters`. */
export const ADMISSIONS_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'draft', label: 'Applying' },
  { id: 'enrolling', label: 'Enrolling' },
  { id: 'enrolled', label: 'Enrolled' },
  { id: 'withdrawn', label: 'Withdrawn' },
] as const;

/** Statuses a KPI tile can filter to without a permanent chip ("Ready to review"). */
export const ADMISSIONS_EXTRA_FILTER_LABELS: Record<string, string> = {
  submitted: 'Ready to review',
};

/**
 * Admissions list data and routes (moved verbatim from `submissions-list-screen.tsx`).
 * No UI, no toasts.
 */
export function useAdmissionsListController({
  organizationId,
  slug,
}: {
  organizationId: string;
  slug: string;
}) {
  const router = useRouter();
  const {
    submissions,
    meta,
    isLoading,
    isRefreshing,
    isLoadingMore,
    hasMore,
    error,
    refresh,
    loadMore,
  } = useSchoolAdminSubmissions();
  const [statusFilter, setStatusFilter] = useState('all');
  const [lastUpdatedAt, setLastUpdatedAt] = useState<number | null>(null);
  // "Updated N min ago": stamp whenever a load hands us a new list.
  useEffect(() => {
    if (isLoading && submissions.length === 0) return;
    queueMicrotask(() => setLastUpdatedAt(Date.now()));
  }, [isLoading, submissions]);

  const statusCounts = useMemo(() => meta?.statusCounts ?? {}, [meta]);
  const activeSubmissionsCount = meta?.activeSubmissionsCount ?? 0;
  const draftCount = statusCounts.draft ?? 0;
  const submittedCount = statusCounts.submitted ?? 0;
  const enrolledCount = statusCounts.enrolled ?? 0;
  const latestSubmitted = meta?.latestSubmitted ?? null;

  const filteredSubmissions = useMemo(() => {
    return submissions.filter((submission) => {
      if (statusFilter === 'all') {
        return !APPLICATION_STATUSES_EXCLUDED_FROM_DEFAULT_ALL.some(
          (excluded) => excluded === submission.status,
        );
      }
      return submission.status === statusFilter;
    });
  }, [statusFilter, submissions]);

  const allCount = useMemo(
    () =>
      Object.entries(statusCounts).reduce((total, [status, value]) => {
        if (status === 'withdrawn') return total;
        return total + value;
      }, 0),
    [statusCounts],
  );

  const hasAnyApplications = activeSubmissionsCount + (statusCounts.withdrawn ?? 0) > 0;
  const showEmptyFilteredState =
    filteredSubmissions.length === 0 && hasAnyApplications && statusFilter !== 'all';

  const openSubmission = useCallback(
    (submission: Pick<AdminApplicationSubmission, 'id'>) => {
      router.push(`/school-admin/${slug}/admissions/submissions/${submission.id}`);
    },
    [router, slug],
  );

  const reviewLatestSubmitted = useCallback(() => {
    if (!latestSubmitted) return;
    router.push(`/school-admin/${slug}/admissions/submissions/${latestSubmitted.id}`);
  }, [latestSubmitted, router, slug]);

  const refreshSilently = useCallback(() => refresh({ silent: true }), [refresh]);

  const loadMoreIfAvailable = useCallback(() => {
    if (hasMore) void loadMore();
  }, [hasMore, loadMore]);

  const status: 'loading' | 'error' | 'ready' =
    isLoading && submissions.length === 0
      ? 'loading'
      : error && submissions.length === 0
        ? 'error'
        : 'ready';

  return {
    organizationId,
    slug,
    status,
    submissions,
    filteredSubmissions,
    statusCounts,
    allCount,
    activeSubmissionsCount,
    draftCount,
    submittedCount,
    enrolledCount,
    latestSubmitted,
    hasAnyApplications,
    showEmptyFilteredState,
    statusFilter,
    setStatusFilter,
    isRefreshing,
    isLoadingMore,
    hasMore,
    error,
    lastUpdatedAt,
    refresh: refreshSilently,
    loadMore,
    loadMoreIfAvailable,
    openSubmission,
    reviewLatestSubmitted,
  };
}

export type AdmissionsListController = ReturnType<typeof useAdmissionsListController>;
