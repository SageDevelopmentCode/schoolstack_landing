"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { reportPortalOperationalError } from "@/lib/portal-operational-errors";
import { adminToast } from "@/lib/school-admin/admin-toast";
import type { SchoolAdminActivityNotification } from "@/lib/school-admin/activity-notifications";

export const ACTIVITY_PAGE_SIZE = 20;

const REFRESH_ERROR_TOAST_ID = "activity-refresh-error";

type FetchMode = "initial" | "more" | "refresh";

type ActivityPage = {
  notifications: SchoolAdminActivityNotification[];
  nextCursor: string | null;
  hasMore: boolean;
};

async function requestActivityPage(
  organizationId: string,
  cursor: string | null,
): Promise<ActivityPage> {
  const params = new URLSearchParams({
    organizationId,
    limit: String(ACTIVITY_PAGE_SIZE),
  });
  if (cursor) params.set("cursor", cursor);

  const response = await fetch(
    `/api/school-admin/activity-notifications?${params.toString()}`,
  );

  if (!response.ok) {
    let message = "Failed to load activity.";
    try {
      const payload = (await response.json()) as { error?: string };
      if (payload.error?.trim()) message = payload.error.trim();
    } catch {
      // ignore JSON parse errors
    }
    throw new Error(message);
  }

  const payload = (await response.json()) as {
    notifications?: SchoolAdminActivityNotification[];
    nextCursor?: string | null;
    hasMore?: boolean;
  };
  return {
    notifications: payload.notifications ?? [],
    nextCursor: payload.nextCursor ?? null,
    hasMore: Boolean(payload.hasMore),
  };
}

/**
 * State + fetching for the admin Activity drawer.
 * - Marks activity read once per open (POST mark-read, then `onMarkedRead`).
 * - Loads the first page on open, more pages through `loadMore` (wired to an
 *   IntersectionObserver by `useInfiniteScroll`).
 * - A failed first page sets `loadError` (shown inline, never toasted).
 *   A failed later page sets `loadMoreError` and keeps the loaded list.
 * - `refresh()` reloads page 1 and toasts its result.
 */
export function useActivityNotifications({
  organizationId,
  open,
  onMarkedRead,
}: {
  organizationId: string;
  open: boolean;
  onMarkedRead?: () => void;
}) {
  const [notifications, setNotifications] = useState<SchoolAdminActivityNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [lastLoadedAt, setLastLoadedAt] = useState<number | null>(null);

  // Inline callbacks from the shell change identity every render; hold them in
  // a ref so mark-read runs once per open instead of on every parent render.
  const onMarkedReadRef = useRef(onMarkedRead);
  useEffect(() => {
    onMarkedReadRef.current = onMarkedRead;
  }, [onMarkedRead]);

  // Newest request wins (refresh while a page is in flight).
  const requestIdRef = useRef(0);

  const fetchPage = useCallback(
    async (cursor: string | null, mode: FetchMode): Promise<boolean> => {
      const requestId = ++requestIdRef.current;
      if (mode === "more") {
        setLoadingMore(true);
        setLoadMoreError(null);
      } else if (mode === "refresh") {
        setRefreshing(true);
      } else {
        setLoading(true);
        setLoadError(null);
        setLoadMoreError(null);
      }

      try {
        const page = await requestActivityPage(organizationId, cursor);
        if (requestId !== requestIdRef.current) return false;
        setNotifications((current) =>
          mode === "more" ? [...current, ...page.notifications] : page.notifications,
        );
        setNextCursor(page.nextCursor);
        setHasMore(page.hasMore);
        setLoadError(null);
        if (mode !== "more") {
          setLoadMoreError(null);
          setLastLoadedAt(Date.now());
        }
        return true;
      } catch (err) {
        void reportPortalOperationalError(
          "school_admin",
          { organizationId, operation: "activity_notifications.load", error: "" },
          err,
        );
        if (requestId !== requestIdRef.current) return false;
        const message = err instanceof Error ? err.message : "Failed to load activity.";
        if (mode === "more") {
          setLoadMoreError(message);
        } else if (mode === "initial") {
          setLoadError(message);
          setNotifications([]);
          setNextCursor(null);
          setHasMore(false);
        }
        return false;
      } finally {
        if (requestId === requestIdRef.current) {
          if (mode === "more") setLoadingMore(false);
          else if (mode === "refresh") setRefreshing(false);
          else setLoading(false);
        }
      }
    },
    [organizationId],
  );

  const reload = useCallback(async () => {
    await fetchPage(null, "initial");
  }, [fetchPage]);

  const loadMore = useCallback(async () => {
    if (!hasMore || loadingMore || loading || refreshing || !nextCursor || loadMoreError) return;
    await fetchPage(nextCursor, "more");
  }, [fetchPage, hasMore, loading, loadingMore, refreshing, nextCursor, loadMoreError]);

  const retryLoadMore = useCallback(async () => {
    if (!nextCursor) return;
    await fetchPage(nextCursor, "more");
  }, [fetchPage, nextCursor]);

  const refreshRef = useRef<() => Promise<void>>(async () => {});

  const refresh = useCallback(async () => {
    if (loading || refreshing) return;
    // With nothing loaded (first load failed), a refresh is just a reload.
    if (notifications.length === 0) {
      await fetchPage(null, "initial");
      return;
    }
    const ok = await fetchPage(null, "refresh");
    if (ok) {
      adminToast.dismiss(REFRESH_ERROR_TOAST_ID);
      adminToast.success("Activity is up to date.", {
        description: "Showing the latest updates first.",
        id: "activity-refresh",
      });
    } else {
      adminToast.dismiss("activity-refresh");
      adminToast.error("Couldn't refresh activity.", {
        description: "The list below hasn't changed. Try again in a moment.",
        id: REFRESH_ERROR_TOAST_ID,
        action: { label: "Retry", onClick: () => void refreshRef.current() },
      });
    }
  }, [fetchPage, loading, notifications.length, refreshing]);

  useEffect(() => {
    refreshRef.current = refresh;
  }, [refresh]);

  // Mark everything read once per open.
  useEffect(() => {
    if (!open) return;
    void (async () => {
      try {
        const response = await fetch("/api/school-admin/activity-notifications/mark-read", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ organizationId }),
        });
        if (response.ok) onMarkedReadRef.current?.();
      } catch {
        // ignore transient mark-read errors
      }
    })();
  }, [open, organizationId]);

  // Fresh first page on every open.
  useEffect(() => {
    if (!open) return;
    queueMicrotask(() => {
      setNotifications([]);
      setNextCursor(null);
      setHasMore(false);
      void reload();
    });
  }, [open, reload]);

  return {
    notifications,
    loading,
    loadingMore,
    refreshing,
    loadError,
    loadMoreError,
    hasMore,
    lastLoadedAt,
    reload,
    loadMore,
    retryLoadMore,
    refresh,
  };
}

export type ActivityNotificationsModel = ReturnType<typeof useActivityNotifications>;

/**
 * Calls `onReachEnd` when `sentinelRef` scrolls within 120px of the bottom of
 * `rootRef`. Re-observes when `deps` change (list length, loading flags).
 */
export function useInfiniteScroll({
  enabled,
  rootRef,
  sentinelRef,
  onReachEnd,
  watch,
}: {
  enabled: boolean;
  rootRef: React.RefObject<HTMLElement | null>;
  sentinelRef: React.RefObject<HTMLElement | null>;
  onReachEnd: () => void;
  watch: unknown;
}) {
  const onReachEndRef = useRef(onReachEnd);
  useEffect(() => {
    onReachEndRef.current = onReachEnd;
  }, [onReachEnd]);

  useEffect(() => {
    if (!enabled) return;
    const root = rootRef.current;
    const sentinel = sentinelRef.current;
    if (!root || !sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) onReachEndRef.current();
      },
      { root, rootMargin: "120px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [enabled, rootRef, sentinelRef, watch]);
}
