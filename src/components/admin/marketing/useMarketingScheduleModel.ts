"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import type { SchedulePostStatus } from "@/lib/marketing/schedule-post-status";
import {
  SCHEDULE_AD_OPTIONS,
  SCHEDULE_ITEMS,
  SOCIAL_SCHEDULE,
  type ScheduleItem,
  type ScheduleStatus,
} from "@/lib/marketing/social-schedule";
import { adminToast, formatActionError } from "@/lib/school-admin/admin-toast";
import { SCHEDULE_STATUS_LABEL } from "@/components/admin/marketing/garden/marketing-ui";

/*
 * State for the posting schedule (/admin/marketing/schedule): post statuses
 * (load, optimistic save with rollback), today's week, the status filter.
 * The Garden view (MarketingSchedule) only renders what this returns.
 */

/** Anything with a status row: an organic post or a paid ad option. */
export type Schedulable = { id: string; label: string; carouselId: ScheduleItem["carouselId"]; slideId?: string };

export type ScheduleFilter = ScheduleStatus | "all";

function localToday() {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

export function addDays(iso: string, days: number) {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d + days);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function subscribeNever() {
  return () => {};
}

const FLASH_MS = 1600;
const ALL_SCHEDULABLE = [...SCHEDULE_ITEMS, ...SCHEDULE_AD_OPTIONS];

async function fetchStatuses(): Promise<Record<string, ScheduleStatus>> {
  const response = await fetch("/api/admin/marketing-schedule/status");
  const payload = (await response.json().catch(() => null)) as {
    statuses?: Record<string, SchedulePostStatus>;
    error?: string;
  } | null;
  if (!response.ok) throw new Error(payload?.error ?? "Could not load post statuses.");
  const next: Record<string, ScheduleStatus> = {};
  for (const [id, value] of Object.entries(payload?.statuses ?? {})) next[id] = value.status;
  return next;
}

export function useMarketingScheduleModel() {
  const [statuses, setStatuses] = useState<Record<string, ScheduleStatus>>({});
  const statusesRef = useRef(statuses);
  useEffect(() => {
    statusesRef.current = statuses;
  }, [statuses]);
  const [loading, setLoading] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdatedAt, setLastUpdatedAt] = useState(() => Date.now());
  const inFlightRef = useRef(new Set<string>());
  const [savingIds, setSavingIds] = useState<Set<string>>(() => new Set());
  const [flashId, setFlashId] = useState<string | null>(null);
  const flashTimer = useRef<number | null>(null);
  const [filter, setFilter] = useState<ScheduleFilter>("all");
  const today = useSyncExternalStore(subscribeNever, localToday, () => null);

  useEffect(
    () => () => {
      if (flashTimer.current) window.clearTimeout(flashTimer.current);
    },
    [],
  );

  const syncSavingIds = useCallback(() => setSavingIds(new Set(inFlightRef.current)), []);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      setStatuses(await fetchStatuses());
      setLoaded(true);
      setLastUpdatedAt(Date.now());
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Could not load post statuses.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => void load());
  }, [load]);

  /** Manual refresh: keeps the list on screen and toasts the result. */
  const refresh = useCallback(async () => {
    if (!loaded) {
      await load();
      return;
    }
    setRefreshing(true);
    try {
      setStatuses(await fetchStatuses());
      setLastUpdatedAt(Date.now());
      adminToast.dismiss("marketing-schedule-refresh-error");
      adminToast.success("Statuses refreshed.", { id: "marketing-schedule-refresh" });
    } catch (error) {
      adminToast.error("Couldn't refresh statuses.", {
        id: "marketing-schedule-refresh-error",
        description: `${formatActionError(error, "Could not load post statuses.")} You're still seeing the previous statuses.`,
        action: { label: "Retry", onClick: () => void refresh() },
      });
    } finally {
      setRefreshing(false);
    }
  }, [load, loaded]);

  const statusOf = useCallback((id: string): ScheduleStatus => statuses[id] ?? "planned", [statuses]);

  const setStatus = useCallback(
    async function save(item: Schedulable, status: ScheduleStatus): Promise<void> {
      const previous = statusesRef.current[item.id] ?? "planned";
      if (previous === status) return;
      if (inFlightRef.current.has(item.id)) return;
      const errorId = `marketing-schedule-${item.id}-error`;
      inFlightRef.current.add(item.id);
      syncSavingIds();
      setStatuses((current) => ({ ...current, [item.id]: status }));
      try {
        const response = await fetch(`/api/admin/marketing-schedule/${encodeURIComponent(item.id)}/status`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        });
        if (!response.ok) {
          const payload = (await response.json().catch(() => null)) as { error?: string } | null;
          throw new Error(payload?.error ?? "Could not save the status.");
        }
        const next = { ...statusesRef.current, [item.id]: status };
        const posted = ALL_SCHEDULABLE.filter((entry) => (next[entry.id] ?? "planned") === "posted").length;
        adminToast.dismiss(errorId);
        adminToast.success(`${SCHEDULE_STATUS_LABEL[status]}: ${item.label}`, {
          id: `marketing-schedule-${item.id}`,
          description: `${posted} of ${ALL_SCHEDULABLE.length} posts and ads posted.`,
        });
        setFlashId(item.id);
        if (flashTimer.current) window.clearTimeout(flashTimer.current);
        flashTimer.current = window.setTimeout(() => setFlashId(null), FLASH_MS);
      } catch (error) {
        setStatuses((current) => ({ ...current, [item.id]: previous }));
        adminToast.error("Couldn't save the status.", {
          id: errorId,
          description: `${formatActionError(error, "Could not save the status.")} ${item.label} is still ${SCHEDULE_STATUS_LABEL[previous]}.`,
          action: { label: "Retry", onClick: () => void save(item, status) },
        });
      } finally {
        inFlightRef.current.delete(item.id);
        syncSavingIds();
      }
    },
    [syncSavingIds],
  );

  const counts = useMemo(() => {
    const result: Record<ScheduleStatus, number> = { planned: 0, scheduled: 0, posted: 0 };
    for (const item of ALL_SCHEDULABLE) result[statusOf(item.id)] += 1;
    return result;
  }, [statusOf]);

  const currentWeek = useMemo(() => {
    if (!today) return null;
    return SOCIAL_SCHEDULE.find((week) => today >= week.start && today <= addDays(week.start, 6)) ?? null;
  }, [today]);
  const jumpTarget =
    currentWeek ?? (today ? SOCIAL_SCHEDULE.find((week) => week.start >= today) : null) ?? SOCIAL_SCHEDULE[0];

  /** Weeks with their rows narrowed to the status filter (weeks with nothing left drop out). */
  const weeks = useMemo(
    () =>
      SOCIAL_SCHEDULE.map((week) => ({
        week,
        items: filter === "all" ? week.items : week.items.filter((item) => statusOf(item.id) === filter),
        adOptions: (week.adOptions ?? []).filter((item) => filter === "all" || statusOf(item.id) === filter),
      })).filter((entry) => filter === "all" || entry.items.length > 0 || entry.adOptions.length > 0),
    [filter, statusOf],
  );

  const thisWeekPlanned = currentWeek
    ? [...currentWeek.items, ...(currentWeek.adOptions ?? [])].filter((item) => statusOf(item.id) === "planned").length
    : null;

  return {
    weeks,
    statusOf,
    setStatus,
    savingIds,
    flashId,
    counts,
    total: ALL_SCHEDULABLE.length,
    loading,
    loaded,
    loadError,
    retryLoad: () => void load(),
    refresh: () => void refresh(),
    refreshing,
    lastUpdatedAt,
    today,
    currentWeek,
    jumpTarget,
    thisWeekPlanned,
    filter,
    setFilter,
  };
}
