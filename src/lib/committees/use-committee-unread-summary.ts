"use client";

import { useCallback, useEffect, useState } from "react";
import type { CommitteeUnreadSummary } from "@/lib/committees/committee-unread-types";

const EMPTY_SUMMARY: CommitteeUnreadSummary = { totalUnread: 0, byCommittee: [] };

export function useCommitteeUnreadSummary(
  apiBase: string,
  organizationId: string,
  enabled = true,
) {
  const [summary, setSummary] = useState<CommitteeUnreadSummary>(EMPTY_SUMMARY);

  const refresh = useCallback(async () => {
    if (!enabled || !organizationId) return;
    try {
      const params = new URLSearchParams({ organizationId });
      const response = await fetch(`${apiBase}/unread-summary?${params}`);
      if (!response.ok) return;
      const payload = (await response.json()) as CommitteeUnreadSummary;
      setSummary(payload);
    } catch {
      // ignore transient errors
    }
  }, [apiBase, enabled, organizationId]);

  useEffect(() => {
    queueMicrotask(() => {
      void refresh();
    });
  }, [refresh]);

  return { summary, totalUnread: summary.totalUnread, refreshUnreadSummary: refresh };
}
