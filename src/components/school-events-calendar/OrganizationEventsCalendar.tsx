"use client";

import type { ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { committeeTransition, viewSwap } from "@/components/school-admin/committees/committee-motion";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import type { OrganizationEvent } from "@/lib/school-events/types";
import CalendarSkeleton from "./CalendarSkeleton";
import CalendarToolbar, {
  type CalendarToolbarVariant,
  type CalendarViewMode,
} from "./CalendarToolbar";
import MonthGrid from "./MonthGrid";
import WeekGrid from "./WeekGrid";
import { useEventsCalendarNavigation } from "./useEventsCalendarNavigation";

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
  initialDate?: Date;
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
  initialDate,
}: OrganizationEventsCalendarProps) {
  const reducedMotion = useReducedMotion() ?? false;
  const viewDirection = view === "month" ? 1 : -1;

  const {
    year,
    month,
    weekAnchor,
    selectedDate,
    eventsByDate,
    periodLabel,
    goToday,
    goPrev,
    goNext,
    handleDayClick,
    handleViewChange,
  } = useEventsCalendarNavigation({
    events,
    view,
    onViewChange,
    readOnly,
    initialDate,
    onDayClick,
    onEventClick,
    onPeriodChange,
    onPeriodMetaChange,
  });

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
