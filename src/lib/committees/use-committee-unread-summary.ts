"use client";

import { useCallback, useEffect, useState } from "react";
import { useCommitteeUnreadRefresh } from "@/lib/committees/committee-unread-refresh-context";
import type { CommitteeUnreadSummary } from "@/lib/committees/committee-unread-types";

const EMPTY_SUMMARY: CommitteeUnreadSummary = { totalUnread: 0, byCommittee: [] };

export function useCommitteeUnreadSummary(
  apiBase: string,
  organizationId: string,
  enabled = true,
  initialSummary?: CommitteeUnreadSummary,
) {
  const [fetchedSummary, setFetchedSummary] = useState<CommitteeUnreadSummary>(
    initialSummary ?? EMPTY_SUMMARY,
  );
  const committeeUnreadRefresh = useCommitteeUnreadRefresh();

  const summary = enabled ? fetchedSummary : (initialSummary ?? EMPTY_SUMMARY);

  const refresh = useCallback(async () => {
    if (!enabled || !organizationId) return;
    try {
      const params = new URLSearchParams({ organizationId });
      const response = await fetch(`${apiBase}/unread-summary?${params}`);
      if (!response.ok) return;
      const payload = (await response.json()) as CommitteeUnreadSummary;
      setFetchedSummary(payload);
    } catch {
      // ignore transient errors
    }
  }, [apiBase, enabled, organizationId]);

  useEffect(() => {
    queueMicrotask(() => {
      void refresh();
    });
  }, [refresh]);

  useEffect(() => {
    if (!enabled || !committeeUnreadRefresh) return undefined;
    return committeeUnreadRefresh.subscribeCommitteeUnreadChanged(() => {
      void refresh();
    });
  }, [committeeUnreadRefresh, enabled, refresh]);

  return { summary, totalUnread: summary.totalUnread, refreshUnreadSummary: refresh };
}
