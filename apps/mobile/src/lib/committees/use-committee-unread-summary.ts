import { useCallback, useEffect, useState } from 'react';

import { useCommitteeUnreadRefresh } from '@/contexts/committee-unread-refresh-context';
import type { CommitteeUnreadSummary } from '@/lib/committees/committee-unread-types';
import type { CommitteesPortal } from '@/lib/committees/committees-portal-config';
import { fetchParentCommitteeUnreadSummary } from '@/lib/parent/parent-portal-api';
import { fetchTeacherCommitteeUnreadSummary } from '@/lib/teacher/teacher-portal-api';

const EMPTY_SUMMARY: CommitteeUnreadSummary = { totalUnread: 0, byCommittee: [] };

async function fetchUnreadSummary(
  portal: CommitteesPortal,
  organizationId: string,
): Promise<CommitteeUnreadSummary> {
  if (portal === 'teacher') {
    return fetchTeacherCommitteeUnreadSummary(organizationId);
  }
  return fetchParentCommitteeUnreadSummary(organizationId);
}

export function useCommitteeUnreadSummary(
  portal: CommitteesPortal,
  organizationId: string,
  enabled = true,
) {
  const [summary, setSummary] = useState<CommitteeUnreadSummary>(EMPTY_SUMMARY);
  const committeeUnreadRefresh = useCommitteeUnreadRefresh();

  const refreshUnreadSummary = useCallback(async () => {
    if (!enabled || !organizationId) return;
    try {
      const next = await fetchUnreadSummary(portal, organizationId);
      setSummary(next);
    } catch {
      // ignore transient errors
    }
  }, [enabled, organizationId, portal]);

  useEffect(() => {
    void refreshUnreadSummary();
  }, [refreshUnreadSummary]);

  useEffect(() => {
    if (!enabled || !committeeUnreadRefresh) return undefined;
    return committeeUnreadRefresh.subscribeCommitteeUnreadChanged(() => {
      void refreshUnreadSummary();
    });
  }, [committeeUnreadRefresh, enabled, refreshUnreadSummary]);

  return { summary, totalUnread: summary.totalUnread, refreshUnreadSummary };
}
