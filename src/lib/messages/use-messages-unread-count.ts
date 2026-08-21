"use client";

import { useCallback, useEffect, useState } from "react";
import { useMessagesRefresh } from "@/lib/messages/messages-refresh-context";

export function useMessagesUnreadCount(
  apiBasePath: string,
  organizationId: string,
  schoolName: string,
  enabled = true,
) {
  const [unreadCount, setUnreadCount] = useState(0);
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

  useEffect(() => {
    queueMicrotask(() => {
      void fetchUnreadCount();
    });
  }, [fetchUnreadCount]);

  useEffect(() => {
    if (!enabled || !messagesRefresh) return undefined;
    return messagesRefresh.subscribeMessagesUpdated(() => {
      void fetchUnreadCount();
    });
  }, [enabled, fetchUnreadCount, messagesRefresh]);

  return { unreadCount, refreshUnreadCount: fetchUnreadCount };
}
