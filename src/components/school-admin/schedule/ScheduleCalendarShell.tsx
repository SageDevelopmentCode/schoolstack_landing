"use client";

import type { ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CalendarGrid } from "@/components/scheduler/CalendarGrid";
import type { CalendarGridColors } from "@/components/scheduler/CalendarGrid";
import { MONTH_NAMES } from "@/lib/demo-scheduler";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import { useAdminGardenSkin } from "@/components/school-admin/garden/skin";
import { gIconBtn } from "@/components/school-admin/garden/kit";
import { GARDEN_CALENDAR_COLORS } from "@/components/school-admin/schedule/garden/availability-garden";

type ScheduleCalendarShellProps = {
  C: AdminThemeTokens;
  viewYear: number;
  viewMonth: number;
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
  availableDates: Set<string>;
  bookedDates?: Set<string>;
  minDate: string;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  calendarColors: CalendarGridColors;
  legend?: ReactNode;
};

export default function ScheduleCalendarShell({
  C,
  viewYear,
  viewMonth,
  selectedDate,
  onSelectDate,
  availableDates,
  bookedDates,
  minDate,
  onPrevMonth,
  onNextMonth,
  calendarColors,
  legend,
}: ScheduleCalendarShellProps) {
  const skin = useAdminGardenSkin();
  if (skin) {
    return (
      <div className="rounded-[20px] border-[1.5px] border-[var(--sf-ink)]/12 bg-white p-4 sm:p-5" data-testid="schedule-calendar">
        <div className="mb-4 flex items-center justify-between gap-2">
          <button type="button" onClick={onPrevMonth} className={gIconBtn} aria-label="Previous month">
            <ChevronLeft className="h-4 w-4" aria-hidden />
          </button>
          <span className="text-[16px] font-extrabold text-[var(--sf-ink)]" aria-live="polite">
            {MONTH_NAMES[viewMonth]} {viewYear}
          </span>
          <button type="button" onClick={onNextMonth} className={gIconBtn} aria-label="Next month">
            <ChevronRight className="h-4 w-4" aria-hidden />
          </button>
        </div>
        <CalendarGrid
          year={viewYear}
          month={viewMonth}
          selected={selectedDate}
          onSelect={onSelectDate}
          availableDates={availableDates}
          bookedDates={bookedDates}
          minDate={minDate}
          editable
          colors={GARDEN_CALENDAR_COLORS}
          variant="garden"
        />
        {legend ? <div className="mt-4 border-t-[1.5px] border-[var(--sf-ink)]/[0.08] pt-3">{legend}</div> : null}
      </div>
    );
  }
  return (
    <div
      className="rounded-sm border p-4"
      style={{ borderColor: C.border, backgroundColor: C.surface }}
    >
        <div className="mb-4 flex items-center justify-between">
          <button
            type="button"
            onClick={onPrevMonth}
            className="flex h-8 w-8 items-center justify-center rounded-sm transition-colors"
            style={{ color: C.textSecondary }}
            aria-label="Previous month"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-sm font-medium" style={{ color: C.textPrimary }}>
            {MONTH_NAMES[viewMonth]} {viewYear}
          </span>
          <button
            type="button"
            onClick={onNextMonth}
            className="flex h-8 w-8 items-center justify-center rounded-sm transition-colors"
            style={{ color: C.textSecondary }}
            aria-label="Next month"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <CalendarGrid
          year={viewYear}
          month={viewMonth}
          selected={selectedDate}
          onSelect={onSelectDate}
          availableDates={availableDates}
          bookedDates={bookedDates}
          minDate={minDate}
          editable
          colors={calendarColors}
        />

        {legend ? <div className="mt-4">{legend}</div> : null}
    </div>
  );
}
