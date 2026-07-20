"use client";

import type { ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CalendarGrid } from "@/components/scheduler/CalendarGrid";
import type { CalendarGridColors } from "@/components/scheduler/CalendarGrid";
import { MONTH_NAMES } from "@/lib/demo-scheduler";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";

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
