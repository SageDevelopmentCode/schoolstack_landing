"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ADMIN_NAV_COUNT_KEYS,
  EMPTY_ADMIN_NAV_COUNTS,
  adminNavCountFlagsQuery,
  type AdminNavCountFlags,
  type AdminNavCountKey,
  type AdminNavCountValues,
  type AdminNavCountsResult,
} from "@/lib/school-admin/admin-nav-counts";

/*
 * Sidebar "needs you" counts (Staff hours requests, applications to review,
 * committee join requests). Starts from the server-rendered counts, then
 * refreshes on window focus (at most once a minute), every 2 minutes while
 * the tab is visible, and on page changes (at most every 15s) so a badge
 * catches up after the admin acts somewhere. Failures are silent: each badge
 * keeps its last value (load failures never toast).
 */

const FOCUS_REFETCH_MS = 60_000;
const ROUTE_REFETCH_MS = 15_000;
const POLL_MS = 120_000;

function mergeKnown(current: AdminNavCountValues, next: Partial<AdminNavCountsResult>): AdminNavCountValues {
  const merged = { ...current };
  for (const key of ADMIN_NAV_COUNT_KEYS) {
    const value = next[key];
    if (typeof value === "number") merged[key] = Math.max(0, value);
  }
  return merged;
}

export function useAdminNavCountsPolling({
  organizationId,
  flags,
  initialCounts,
  pathname,
  onIncrease,
}: {
  organizationId: string;
  /** Which counts the nav shows; nothing is fetched when all are off. */
  flags: AdminNavCountFlags;
  initialCounts?: Partial<AdminNavCountsResult>;
  pathname: string;
  /** A background refresh found more items than before for `key`. */
  onIncrease?: (key: AdminNavCountKey, added: number, total: number) => void;
}) {
  const query = adminNavCountFlagsQuery(flags);
  const enabled = query.length > 0;
  const [counts, setCounts] = useState<AdminNavCountValues>(() =>
    mergeKnown(EMPTY_ADMIN_NAV_COUNTS, initialCounts ?? {}),
  );
  const countsRef = useRef(counts);
  const knownRef = useRef(initialCounts != null);
  const lastFetchRef = useRef(0);
  const requestIdRef = useRef(0);
  const onIncreaseRef = useRef(onIncrease);
  useEffect(() => {
    onIncreaseRef.current = onIncrease;
  }, [onIncrease]);

  // Server-rendered counts are fresh: don't refetch them on the first focus.
  useEffect(() => {
    if (initialCounts != null && lastFetchRef.current === 0) lastFetchRef.current = Date.now();
  }, [initialCounts]);

  const apply = useCallback((next: AdminNavCountValues) => {
    countsRef.current = next;
    setCounts(next);
  }, []);

  const refresh = useCallback(async () => {
    if (!enabled) return;
    const requestId = ++requestIdRef.current;
    lastFetchRef.current = Date.now();
    try {
      const params = new URLSearchParams({ organizationId });
      const response = await fetch(`/api/school-admin/nav-counts?${params.toString()}&${query}`, {
        credentials: "same-origin",
      });
      if (!response.ok || requestId !== requestIdRef.current) return;
      const payload = (await response.json()) as { counts?: Partial<AdminNavCountsResult> };
      if (requestId !== requestIdRef.current) return;
      const previous = countsRef.current;
      const wasKnown = knownRef.current;
      const next = mergeKnown(previous, payload.counts ?? {});
      knownRef.current = true;
      apply(next);
      if (!wasKnown) return;
      for (const key of ADMIN_NAV_COUNT_KEYS) {
        if (flags[key] && next[key] > previous[key]) {
          onIncreaseRef.current?.(key, next[key] - previous[key], next[key]);
        }
      }
    } catch {
      // Transient network failure: keep the last counts. Intentionally silent.
    }
  }, [apply, enabled, flags, organizationId, query]);

  /** A page with fresher data reports its exact count (no toast). */
  const report = useCallback(
    (key: AdminNavCountKey, value: number) => {
      requestIdRef.current += 1; // an in-flight refresh must not overwrite it
      knownRef.current = true;
      const next = { ...countsRef.current, [key]: Math.max(0, value) };
      apply(next);
    },
    [apply],
  );

  useEffect(() => {
    if (!enabled || initialCounts != null) return;
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) void refresh();
    });
    return () => {
      cancelled = true;
    };
  }, [enabled, initialCounts, refresh]);

  // Page change: catch up after the admin acted on another page.
  const [lastPath, setLastPath] = useState(pathname);
  const [routeToken, setRouteToken] = useState(0);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setRouteToken((token) => token + 1);
  }
  useEffect(() => {
    if (!enabled || routeToken === 0) return;
    if (Date.now() - lastFetchRef.current < ROUTE_REFETCH_MS) return;
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) void refresh();
    });
    return () => {
      cancelled = true;
    };
  }, [enabled, refresh, routeToken]);

  useEffect(() => {
    if (!enabled) return;
    const refreshIfStale = (minAge: number) => {
      if (document.visibilityState !== "visible") return;
      if (Date.now() - lastFetchRef.current < minAge) return;
      void refresh();
    };
    const handleFocus = () => refreshIfStale(FOCUS_REFETCH_MS);
    const interval = window.setInterval(() => refreshIfStale(POLL_MS - 1_000), POLL_MS);
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleFocus);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleFocus);
    };
  }, [enabled, refresh]);

  return { counts: enabled ? counts : EMPTY_ADMIN_NAV_COUNTS, report, refresh };
}
