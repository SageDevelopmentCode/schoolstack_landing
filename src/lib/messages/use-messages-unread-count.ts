"use client";

import { useCallback, useEffect, useState } from "react";

export function useMessagesUnreadCount(
  apiBasePath: string,
  organizationId: string,
  schoolName: string,
  enabled = true,
) {
  const [unreadCount, setUnreadCount] = useState(0);

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
    void fetchUnreadCount();
  }, [fetchUnreadCount]);

  useEffect(() => {
    if (!enabled) return undefined;
    const handleFocus = () => void fetchUnreadCount();
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [enabled, fetchUnreadCount]);

  return { unreadCount, refreshUnreadCount: fetchUnreadCount };
}
