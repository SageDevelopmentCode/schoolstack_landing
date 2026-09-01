"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { committeeTransition, viewSwap } from "@/components/school-admin/committees/committee-motion";
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
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import { groupOrganizationEventsByDate } from "@/lib/school-events/events";
import type { OrganizationEvent } from "@/lib/school-events/types";
import CalendarSkeleton from "./CalendarSkeleton";
import CalendarToolbar, {
  type CalendarToolbarVariant,
  type CalendarViewMode,
} from "./CalendarToolbar";
import MonthGrid from "./MonthGrid";
import WeekGrid from "./WeekGrid";

export type OrganizationEventsCalendarProps = {
  C: AdminThemeTokens;
  events: OrganizationEvent[];
  loading?: boolean;
  view: CalendarViewMode;
  onViewChange: (view: CalendarViewMode) => void;
  readOnly?: boolean;
  compact?: boolean;
  emptyHint?: string;
  selectedEventId?: string | null;
  onDayClick?: (date: string) => void;
  onEventClick?: (event: OrganizationEvent) => void;
  toolbarExtra?: ReactNode;
  header?: ReactNode;
  onPeriodChange?: (year: number, month: number) => void;
  onPeriodMetaChange?: (meta: {
    periodLabel: string;
    isCurrentPeriod: boolean;
  }) => void;
  variant?: CalendarToolbarVariant;
  parentTheme?: ParentThemeTokens;
  toolbarDetached?: boolean;
  loadingBehavior?: "full" | "grid-only";
};

export default function OrganizationEventsCalendar({
  C,
  events,
  loading = false,
  view,
  onViewChange,
  readOnly = false,
  compact = false,
  emptyHint,
  selectedEventId = null,
  onDayClick,
  onEventClick,
  toolbarExtra,
  header,
  onPeriodChange,
  onPeriodMetaChange,
  variant = "default",
  parentTheme,
  toolbarDetached: _toolbarDetached = false,
  loadingBehavior = "full",
}: OrganizationEventsCalendarProps) {
  const reducedMotion = useReducedMotion() ?? false;
  const viewDirection = view === "month" ? 1 : -1;

  const now = useMemo(() => new Date(), []);
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [weekAnchor, setWeekAnchor] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(dateKey(now));

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

  const handleDayClick = useCallback(
    (date: string) => {
      setSelectedDate(date);
      const d = parseEventDate(date);
      setYear(d.getFullYear());
      setMonth(d.getMonth());
      setWeekAnchor(d);
      onDayClick?.(date);
    },
    [onDayClick],
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

  if (loading && loadingBehavior === "full") {
    return (
      <div className="space-y-4">
        {header}
        <CalendarSkeleton C={C} />
      </div>
    );
  }

  const gridContent =
    loading && loadingBehavior === "grid-only" ? (
      <CalendarSkeleton C={C} />
    ) : (
      <AnimatePresence mode="wait" initial={false}>
        {view === "month" ? (
          <motion.div
            key="month"
            variants={viewSwap(reducedMotion, viewDirection)}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={committeeTransition}
          >
            <MonthGrid
              C={C}
              year={year}
              month={month}
              eventsByDate={eventsByDate}
              selectedDate={selectedDate}
              selectedEventId={selectedEventId}
              compact={compact}
              onDayClick={handleDayClick}
              onEventClick={onEventClick}
            />
          </motion.div>
        ) : (
          <motion.div
            key="week"
            variants={viewSwap(reducedMotion, -viewDirection)}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={committeeTransition}
          >
            <WeekGrid
              C={C}
              weekAnchor={weekAnchor}
              eventsByDate={eventsByDate}
              selectedDate={selectedDate}
              selectedEventId={selectedEventId}
              onDayClick={handleDayClick}
              onEventClick={onEventClick}
            />
          </motion.div>
        )}
      </AnimatePresence>
    );

  return (
    <div className="space-y-4">
      {header}

      <CalendarToolbar
        C={C}
        view={view}
        onViewChange={handleViewChange}
        periodLabel={periodLabel}
        onPrev={goPrev}
        onNext={goNext}
        onToday={goToday}
        toolbarExtra={toolbarExtra}
        compact={compact}
        variant={variant}
        theme={parentTheme}
      />

      {emptyHint && events.length === 0 && !loading ? (
        <p className="text-xs" style={{ color: C.textTertiary }}>
          {emptyHint}
        </p>
      ) : null}

      {gridContent}
    </div>
  );
}
