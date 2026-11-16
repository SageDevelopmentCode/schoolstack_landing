"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { CalendarViewMode } from "@/components/school-events-calendar/CalendarToolbar";
import { useEventsCalendarNavigation } from "@/components/school-events-calendar/useEventsCalendarNavigation";
import { listUpcomingCalendarEvents } from "@/components/school-parent/calendar/parent-calendar-agenda-utils";
import { dateKey, formatMonthLabel, parseEventDate } from "@/lib/committees/calendar-utils";
import { reportPortalOperationalError } from "@/lib/portal-operational-errors";
import { calendarEventWindowForMonth } from "@/lib/school-events/calendar-window";
import type { OrganizationEvent } from "@/lib/school-events/types";
import { parentToast } from "@/lib/school-parent/parent-toast";

/** Below the `lg` breakpoint the rail sits under the grid, so a tapped day opens as a sheet. */
const STACKED_LAYOUT_QUERY = "(max-width: 1023px)";

export type ParentCalendarModelInput = {
  organizationId: string;
  events: OrganizationEvent[];
  eventsDeferred: boolean;
  previewMode: boolean;
  programId?: string;
  initialView?: CalendarViewMode;
  previewAnchorDate?: string;
  previewAgendaAsOf?: string;
};

/**
 * View-model for the parent Calendar tab (pattern: `useParentHomeModel`).
 * Owns event merging + month-window fetching, deep links, selection and
 * feedback; the Garden components only render what this returns.
 */
export function useParentCalendarModel({
  organizationId,
  events,
  eventsDeferred,
  previewMode,
  programId,
  initialView,
  previewAnchorDate,
  previewAgendaAsOf,
}: ParentCalendarModelInput) {
  const searchParams = useSearchParams();
  const deepLinkEventId = searchParams.get("eventId")?.trim() ?? "";
  const deepLinkDate = searchParams.get("date")?.trim() ?? "";
  const deepLinkHandledRef = useRef(false);
  const deepLinkFetchStartedRef = useRef(false);
  const [deepLinkFetchResult, setDeepLinkFetchResult] = useState<"pending" | "ok" | "failed">("pending");

  const [fetchedEvents, setFetchedEvents] = useState<OrganizationEvent[]>([]);
  const loadedWindowsRef = useRef<Set<string>>(new Set());
  const inFlightWindowsRef = useRef<Set<string>>(new Set());
  const [loadingWindowCount, setLoadingWindowCount] = useState(0);

  const [view, setView] = useState<CalendarViewMode>(initialView ?? "week");
  const [selectedEvent, setSelectedEvent] = useState<OrganizationEvent | null>(null);
  const [daySheetOpen, setDaySheetOpen] = useState(false);

  // Initial anchor only: later moves (deep links) go through `selectDate`.
  const [initialDate] = useState<Date | undefined>(() => {
    if (deepLinkDate) return parseEventDate(deepLinkDate);
    return previewAnchorDate ? parseEventDate(previewAnchorDate) : undefined;
  });

  const agendaAsOfDate = useMemo(
    () => (previewAgendaAsOf ? parseEventDate(previewAgendaAsOf) : undefined),
    [previewAgendaAsOf],
  );

  const calendarEvents = useMemo(() => {
    const byId = new Map(events.map((event) => [event.id, event]));
    for (const event of fetchedEvents) {
      byId.set(event.id, event);
    }
    return Array.from(byId.values()).sort((left, right) => {
      if (left.date !== right.date) return left.date.localeCompare(right.date);
      return left.sortOrder - right.sortOrder;
    });
  }, [events, fetchedEvents]);

  /** Loads the window around a month once. Resolves true when the window is (or already was) loaded. */
  const fetchEventsForMonth = useCallback(
    async function load(year: number, month: number): Promise<boolean> {
      if (previewMode) return true;

      const { startDate, endDate } = calendarEventWindowForMonth(year, month);
      const windowKey = `${startDate}:${endDate}`;
      if (loadedWindowsRef.current.has(windowKey)) return true;
      if (inFlightWindowsRef.current.has(windowKey)) return true;

      inFlightWindowsRef.current.add(windowKey);
      setLoadingWindowCount((count) => count + 1);
      const toastId = `parent-calendar-load-${windowKey}`;
      const fail = () => {
        parentToast.error(`Couldn't load events for ${formatMonthLabel(year, month)}`, {
          id: toastId,
          description: "Showing what we already have. Check your connection and try again.",
          action: { label: "Retry", onClick: () => void load(year, month) },
        });
        return false;
      };

      try {
        const params = new URLSearchParams({
          organizationId,
          start: startDate,
          end: endDate,
        });
        if (programId) {
          params.set("programId", programId);
        }
        const res = await fetch(`/api/parent-portal/calendar/events?${params}`);
        const data = await res.json().catch(() => ({}));
        if (!res.ok) return fail();

        loadedWindowsRef.current.add(windowKey);
        const nextEvents = (data.events ?? []) as OrganizationEvent[];
        setFetchedEvents((prev) => {
          const byId = new Map(prev.map((event) => [event.id, event]));
          for (const event of nextEvents) {
            byId.set(event.id, event);
          }
          return Array.from(byId.values());
        });
        return true;
      } catch (err) {
        // Keep showing the current window if a refetch fails.
        void reportPortalOperationalError(
          "parent_portal",
          {
            organizationId,
            operation: "calendar.load_events",
            error: "",
          },
          err,
        );
        return fail();
      } finally {
        inFlightWindowsRef.current.delete(windowKey);
        setLoadingWindowCount((count) => Math.max(0, count - 1));
      }
    },
    [organizationId, previewMode, programId],
  );

  const handlePeriodChange = useCallback(
    (year: number, month: number) => {
      void fetchEventsForMonth(year, month);
    },
    [fetchEventsForMonth],
  );

  const openEvent = useCallback((event: OrganizationEvent) => {
    setDaySheetOpen(false);
    setSelectedEvent(event);
  }, []);

  const closeEvent = useCallback(() => setSelectedEvent(null), []);
  const closeDaySheet = useCallback(() => setDaySheetOpen(false), []);

  const handleDayClick = useCallback(() => {
    setSelectedEvent(null);
    if (typeof window !== "undefined" && window.matchMedia(STACKED_LAYOUT_QUERY).matches) {
      setDaySheetOpen(true);
    }
  }, []);

  const nav = useEventsCalendarNavigation({
    events: calendarEvents,
    view,
    onViewChange: setView,
    readOnly: true,
    initialDate,
    onDayClick: handleDayClick,
    onEventClick: openEvent,
    onPeriodChange: handlePeriodChange,
  });
  const { selectDate } = nav;

  // Deep link (?eventId=&date=): make sure the event's window is loaded…
  useEffect(() => {
    if (previewMode || !deepLinkEventId || deepLinkFetchStartedRef.current) return;
    deepLinkFetchStartedRef.current = true;
    queueMicrotask(() => {
      const now = new Date();
      const loads = [fetchEventsForMonth(now.getFullYear(), now.getMonth())];
      if (deepLinkDate) {
        const anchor = parseEventDate(deepLinkDate);
        loads.push(fetchEventsForMonth(anchor.getFullYear(), anchor.getMonth()));
      }
      void Promise.all(loads).then((results) =>
        setDeepLinkFetchResult(results.every(Boolean) ? "ok" : "failed"),
      );
    });
  }, [deepLinkDate, deepLinkEventId, fetchEventsForMonth, previewMode]);

  // …then open it and bring its day into view.
  useEffect(() => {
    if (previewMode || !deepLinkEventId || deepLinkHandledRef.current) return;

    const match = calendarEvents.find((entry) => entry.id === deepLinkEventId);
    if (!match) return;

    deepLinkHandledRef.current = true;
    queueMicrotask(() => {
      setSelectedEvent(match);
      selectDate(match.date);
    });
  }, [calendarEvents, deepLinkEventId, previewMode, selectDate]);

  // A link to an event that no longer exists: say so instead of doing nothing.
  useEffect(() => {
    if (previewMode || !deepLinkEventId || deepLinkHandledRef.current) return;
    if (eventsDeferred || deepLinkFetchResult !== "ok" || loadingWindowCount > 0) return;
    deepLinkHandledRef.current = true;
    parentToast.info("That event isn't on the calendar anymore", {
      id: "parent-calendar-missing-event",
      description: "It may have been moved or cancelled. Here's the rest of the calendar.",
    });
  }, [deepLinkEventId, deepLinkFetchResult, eventsDeferred, loadingWindowCount, previewMode]);

  const selectedDayEvents = useMemo(
    () => (nav.selectedDate ? (nav.eventsByDate.get(nav.selectedDate) ?? []) : []),
    [nav.eventsByDate, nav.selectedDate],
  );

  const upcoming = useMemo(
    () => listUpcomingCalendarEvents(calendarEvents, undefined, agendaAsOfDate),
    [agendaAsOfDate, calendarEvents],
  );

  /** Events in the visible week or month (for the header summary). */
  const periodEventCount = useMemo(() => {
    if (view === "month") {
      const prefix = `${nav.year}-${String(nav.month + 1).padStart(2, "0")}-`;
      return calendarEvents.filter((event) => event.date.startsWith(prefix)).length;
    }
    const keys = new Set(nav.weekDates.map(dateKey));
    return calendarEvents.filter((event) => keys.has(event.date)).length;
  }, [calendarEvents, nav.month, nav.weekDates, nav.year, view]);

  return {
    view,
    nav,
    events: calendarEvents,
    eventsDeferred,
    previewMode,
    loadingPeriod: loadingWindowCount > 0,
    selectedEvent,
    openEvent,
    closeEvent,
    daySheetOpen,
    closeDaySheet,
    selectedDayEvents,
    upcoming,
    periodEventCount,
  };
}

export type ParentCalendarModel = ReturnType<typeof useParentCalendarModel>;
