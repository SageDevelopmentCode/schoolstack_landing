import { useCallback } from 'react';

import { useGardenPullRefresh } from '@/components/parent/garden/feedback';
import type { AdmissionsListController } from '@/components/school-admin/admissions/garden/use-admissions-list-controller';
import { haptic } from '@/lib/haptics';

/**
 * Wraps the Admissions list controller with feedback (pull-to-refresh toast,
 * haptics) without changing what it does. The submissions context reports load
 * failures itself, so nothing here reports again.
 */
export function useAdmissionsListFeedback(controller: AdmissionsListController) {
  const { pullRefreshing, onPullRefresh } = useGardenPullRefresh({
    refresh: controller.refresh,
    error: controller.error,
    label: 'Admissions',
    id: 'admin-admissions-refresh',
  });

  const { setStatusFilter, loadMore, refresh } = controller;

  /** KPI tile / lead strip → filter, with the same select haptic as a chip. */
  const applyFilter = useCallback(
    (id: string) => {
      haptic.select();
      setStatusFilter(id);
    },
    [setStatusFilter],
  );

  /** Inline footer retry after a failed "load more" (or refresh) with rows on screen. */
  const retryList = useCallback(() => {
    if (controller.hasMore) void loadMore();
    else void refresh();
  }, [controller.hasMore, loadMore, refresh]);

  return { pullRefreshing, onPullRefresh, applyFilter, retryList };
}
