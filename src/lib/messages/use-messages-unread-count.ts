"use client";

import { useCallback, useEffect, useState } from "react";
import { useMessagesRefresh } from "@/lib/messages/messages-refresh-context";
import { scheduleAfterFirstPaint } from "@/lib/schedule-after-first-paint";

export function useMessagesUnreadCount(
  apiBasePath: string,
  organizationId: string,
  schoolName: string,
  enabled = true,
  options?: {
    initialUnreadCount?: number;
    skipInitialFetch?: boolean;
    deferUntilIdle?: boolean;
    /**
     * Count started on the server (streamed from the layout). While set, the hook applies it when
     * it resolves instead of fetching, and only fetches itself if the server load failed (null).
     */
    seedPromise?: Promise<number | null>;
  },
) {
  const [unreadCount, setUnreadCount] = useState(options?.initialUnreadCount ?? 0);
  const messagesRefresh = useMessagesRefresh();

  const fetchUnreadCount = useCallback(async () => {
    if (!enabled || !organizationId) return;
    try {
      const params = new URLSearchParams({ organizationId, schoolName });
      const response = await fetch(`${apiBasePath}/unread-count?${params}`);
      if (!response.ok) return;
      const payload = (await response.json()) as { unreadCount?: number };
      setUnreadCount(payload.unreadCount ?? 0);
    } catch {
      // ignore transient errors
    }
  }, [apiBasePath, enabled, organizationId, schoolName]);

  const seedPromise = options?.seedPromise;

  useEffect(() => {
    if (!enabled || !seedPromise) return undefined;
    let cancelled = false;
    void seedPromise.then(
      (count) => {
        if (cancelled) return;
        if (count == null) {
          void fetchUnreadCount();
          return;
        }
        setUnreadCount(count);
      },
      () => {
        if (!cancelled) void fetchUnreadCount();
      },
    );
    return () => {
      cancelled = true;
    };
  }, [enabled, fetchUnreadCount, seedPromise]);

  useEffect(() => {
    if (options?.skipInitialFetch || seedPromise || !enabled) return;
    if (options?.deferUntilIdle) {
      return scheduleAfterFirstPaint(() => {
        void fetchUnreadCount();
      });
    }
    queueMicrotask(() => {
      void fetchUnreadCount();
    });
  }, [
    enabled,
    fetchUnreadCount,
    options?.deferUntilIdle,
    options?.skipInitialFetch,
    seedPromise,
  ]);

  useEffect(() => {
    if (!enabled || !messagesRefresh) return undefined;
    return messagesRefresh.subscribeMessagesUpdated(() => {
      void fetchUnreadCount();
    });
  }, [enabled, fetchUnreadCount, messagesRefresh]);

  return { unreadCount, refreshUnreadCount: fetchUnreadCount };
}
