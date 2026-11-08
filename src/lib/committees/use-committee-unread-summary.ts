"use client";

import { useCallback, useEffect, useState } from "react";
import { useCommitteeUnreadRefresh } from "@/lib/committees/committee-unread-refresh-context";
import type { CommitteeUnreadSummary } from "@/lib/committees/committee-unread-types";
import { scheduleAfterFirstPaint } from "@/lib/schedule-after-first-paint";

const EMPTY_SUMMARY: CommitteeUnreadSummary = { totalUnread: 0, byCommittee: [] };

export function useCommitteeUnreadSummary(
  apiBase: string,
  organizationId: string,
  enabled = true,
  initialSummary?: CommitteeUnreadSummary,
  options?: {
    deferUntilIdle?: boolean;
    /** Summary started on the server; applied when it resolves (null = fetch instead). */
    seedPromise?: Promise<CommitteeUnreadSummary | null>;
  },
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

  const seedPromise = options?.seedPromise;

  useEffect(() => {
    if (!enabled || !seedPromise) return undefined;
    let cancelled = false;
    void seedPromise.then(
      (value) => {
        if (cancelled) return;
        if (value == null) {
          void refresh();
          return;
        }
        setFetchedSummary(value);
      },
      () => {
        if (!cancelled) void refresh();
      },
    );
    return () => {
      cancelled = true;
    };
  }, [enabled, refresh, seedPromise]);

  useEffect(() => {
    if (!enabled || seedPromise) return;
    if (options?.deferUntilIdle) {
      return scheduleAfterFirstPaint(() => {
        void refresh();
      });
    }
    queueMicrotask(() => {
      void refresh();
    });
  }, [enabled, options?.deferUntilIdle, refresh, seedPromise]);

  useEffect(() => {
    if (!enabled || !committeeUnreadRefresh) return undefined;
    return committeeUnreadRefresh.subscribeCommitteeUnreadChanged(() => {
      void refresh();
    });
  }, [committeeUnreadRefresh, enabled, refresh]);

  return { summary, totalUnread: summary.totalUnread, refreshUnreadSummary: refresh };
}
