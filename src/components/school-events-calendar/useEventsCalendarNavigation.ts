"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  addDays,
  addMonths,
  addWeeks,
  dateKey,
  formatMonthLabel,
  formatWeekRangeLabel,
  getWeekDates,
  isToday,
  parseEventDate,
} from "@/lib/committees/calendar-utils";
import { groupOrganizationEventsByDate } from "@/lib/school-events/events";
import type { OrganizationEvent } from "@/lib/school-events/types";
import type { CalendarViewMode } from "./CalendarToolbar";

export type EventsCalendarNavigationOptions = {
  events: OrganizationEvent[];
  view: CalendarViewMode;
  onViewChange: (view: CalendarViewMode) => void;
  readOnly?: boolean;
  initialDate?: Date;
  onDayClick?: (date: string) => void;
  onEventClick?: (event: OrganizationEvent) => void;
  onPeriodChange?: (year: number, month: number) => void;
  onPeriodMetaChange?: (meta: { periodLabel: string; isCurrentPeriod: boolean }) => void;
};

/**
 * Period, selection and keyboard state shared by every events calendar view
 * (the admin/teacher/committee `OrganizationEventsCalendar` and the parent
 * Garden calendar). Presentation lives in the views; behaviour lives here.
 */
export function useEventsCalendarNavigation({
  events,
  view,
  onViewChange,
  readOnly = false,
  initialDate,
  onDayClick,
  onEventClick,
  onPeriodChange,
  onPeriodMetaChange,
}: EventsCalendarNavigationOptions) {
  const [year, setYear] = useState(() => (initialDate ?? new Date()).getFullYear());
  const [month, setMonth] = useState(() => (initialDate ?? new Date()).getMonth());
  const [weekAnchor, setWeekAnchor] = useState(() => initialDate ?? new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(() =>
    dateKey(initialDate ?? new Date()),
  );

  const eventsByDate = useMemo(() => groupOrganizationEventsByDate(events), [events]);
  const weekDates = useMemo(() => getWeekDates(weekAnchor), [weekAnchor]);

  useEffect(() => {
    onPeriodChange?.(year, month);
  }, [month, onPeriodChange, year]);

  const periodLabel =
    view === "month" ? formatMonthLabel(year, month) : formatWeekRangeLabel(weekDates);

  const isCurrentPeriod = useMemo(() => {
    const today = new Date();
    if (view === "month") {
      return year === today.getFullYear() && month === today.getMonth();
    }
    return weekDates.some((day) => isToday(day));
  }, [month, view, weekDates, year]);

  useEffect(() => {
    onPeriodMetaChange?.({ periodLabel, isCurrentPeriod });
  }, [isCurrentPeriod, onPeriodMetaChange, periodLabel]);

  const goToday = useCallback(() => {
    const today = new Date();
    setYear(today.getFullYear());
    setMonth(today.getMonth());
    setWeekAnchor(today);
    setSelectedDate(dateKey(today));
  }, []);

  const goPrev = useCallback(() => {
    if (view === "month") {
      const next = addMonths(year, month, -1);
      setYear(next.year);
      setMonth(next.month);
    } else {
      setWeekAnchor((d) => addWeeks(d, -1));
    }
  }, [month, view, year]);

  const goNext = useCallback(() => {
    if (view === "month") {
      const next = addMonths(year, month, 1);
      setYear(next.year);
      setMonth(next.month);
    } else {
      setWeekAnchor((d) => addWeeks(d, 1));
    }
  }, [month, view, year]);

  /** Select a day and bring its week/month into view (no click side effects). */
  const selectDate = useCallback((date: string) => {
    setSelectedDate(date);
    const d = parseEventDate(date);
    setYear(d.getFullYear());
    setMonth(d.getMonth());
    setWeekAnchor(d);
  }, []);

  const handleDayClick = useCallback(
    (date: string) => {
      selectDate(date);
      onDayClick?.(date);
    },
    [onDayClick, selectDate],
  );

  const handleViewChange = useCallback(
    (next: CalendarViewMode) => {
      onViewChange(next);
      if (selectedDate) {
        const d = parseEventDate(selectedDate);
        setWeekAnchor(d);
        setYear(d.getFullYear());
        setMonth(d.getMonth());
      }
    },
    [onViewChange, selectedDate],
  );

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (!selectedDate) return;
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable
      ) {
        return;
      }

      const current = parseEventDate(selectedDate);
      let next: Date | null = null;

      switch (e.key) {
        case "ArrowLeft":
          next = addDays(current, -1);
          break;
        case "ArrowRight":
          next = addDays(current, 1);
          break;
        case "ArrowUp":
          next = addDays(current, -7);
          break;
        case "ArrowDown":
          next = addDays(current, 7);
          break;
        case "Enter":
          e.preventDefault();
          if (!readOnly && onDayClick) {
            onDayClick(selectedDate);
          } else {
            const dayEvents = eventsByDate.get(selectedDate) ?? [];
            if (dayEvents[0]) onEventClick?.(dayEvents[0]);
          }
          return;
        default:
          return;
      }

      if (!next) return;
      e.preventDefault();
      const key = dateKey(next);
      setSelectedDate(key);
      setYear(next.getFullYear());
      setMonth(next.getMonth());
      setWeekAnchor(next);
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [eventsByDate, onDayClick, onEventClick, readOnly, selectedDate]);

  return {
    year,
    month,
    weekAnchor,
    weekDates,
    selectedDate,
    eventsByDate,
    periodLabel,
    isCurrentPeriod,
    goToday,
    goPrev,
    goNext,
    selectDate,
    handleDayClick,
    handleViewChange,
  };
}
