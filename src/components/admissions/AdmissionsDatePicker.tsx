"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import AdmissionsDateTimePickerSkeleton from "@/components/admissions/AdmissionsDateTimePickerSkeleton";
import { CalendarGrid } from "@/components/scheduler/CalendarGrid";
import type { BookableAvailabilityResult } from "@/lib/admissions/admissions-booking";
import {
  formatDateOnlyLabel,
  todayKeyInTimezone,
  todayMonthYearInTimezone,
} from "@/lib/admissions/admissions-availability";
import { MONTH_NAMES } from "@/lib/demo-scheduler";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";

type AdmissionsDatePickerProps = {
  C: AdminThemeTokens;
  applicationId: string;
  actionId: string;
  timezone: string;
  timezoneLabel: string;
  maxVisitDays: number;
  selectedDates: string[];
  onDatesChange: (dates: string[]) => void;
};

function monthDateRange(year: number, month: number): { start: string; end: string } {
  const start = `${year}-${String(month + 1).padStart(2, "0")}-01`;
  const endMonth = month === 11 ? 0 : month + 1;
  const endYear = month === 11 ? year + 1 : year;
  const endDay = new Date(endYear, endMonth + 1, 0).getDate();
  const end = `${endYear}-${String(endMonth + 1).padStart(2, "0")}-${String(endDay).padStart(2, "0")}`;
  return { start, end };
}

export default function AdmissionsDatePicker({
  C,
  applicationId,
  actionId,
  timezone,
  timezoneLabel,
  maxVisitDays,
  selectedDates,
  onDatesChange,
}: AdmissionsDatePickerProps) {
  const initial = todayMonthYearInTimezone(timezone);
  const [viewYear, setViewYear] = useState(initial.year);
  const [viewMonth, setViewMonth] = useState(initial.month);
  const [bookableDates, setBookableDates] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const today = todayKeyInTimezone(timezone);
  const selectedSet = useMemo(() => new Set(selectedDates), [selectedDates]);
  const atMaxSelection = selectedDates.length >= maxVisitDays;

  const loadAvailability = useCallback(async () => {
    const { start, end } = monthDateRange(viewYear, viewMonth);
    const params = new URLSearchParams({
      actionId,
      start,
      end,
    });

    const response = await fetch(
      `/api/admissions/applications/${applicationId}/post-submit/availability?${params.toString()}`,
    );
    const payload = (await response.json()) as BookableAvailabilityResult & {
      error?: string;
    };

    if (!response.ok) {
      throw new Error(payload.error ?? "Failed to load availability.");
    }

    if (payload.mode !== "whole_day") {
      throw new Error("Unexpected availability mode.");
    }

    setBookableDates(new Set(payload.bookableDates));
  }, [actionId, applicationId, viewMonth, viewYear]);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      setLoading(true);
      setError(null);
      try {
        await loadAvailability();
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load availability.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void init();

    return () => {
      cancelled = true;
    };
  }, [loadAvailability]);

  const calendarColors = useMemo(
    () => ({
      accent: C.accent,
      accentLight: C.accentLight,
      text: C.textPrimary,
      textFaint: C.textTertiary,
    }),
    [C.accent, C.accentLight, C.textPrimary, C.textTertiary],
  );

  function toggleDate(date: string) {
    if (!bookableDates.has(date)) return;

    if (selectedSet.has(date)) {
      onDatesChange(selectedDates.filter((entry) => entry !== date));
      return;
    }

    if (atMaxSelection) return;
    onDatesChange([...selectedDates, date].sort());
  }

  function prevMonth() {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((year) => year - 1);
    } else {
      setViewMonth((month) => month - 1);
    }
  }

  function nextMonth() {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((year) => year + 1);
    } else {
      setViewMonth((month) => month + 1);
    }
  }

  if (loading) {
    return <AdmissionsDateTimePickerSkeleton C={C} />;
  }

  return (
    <div className="space-y-4">
      {error ? (
        <p
          className="rounded-sm px-3 py-2 text-xs"
          style={{ backgroundColor: C.errorBg, color: C.error }}
        >
          {error}
        </p>
      ) : null}

      <div
        className="rounded-sm border p-4"
        style={{ borderColor: C.border, backgroundColor: C.surface }}
      >
        <div className="mb-4 flex items-center justify-between">
          <button
            type="button"
            onClick={prevMonth}
            className="flex h-8 w-8 items-center justify-center rounded-sm transition-colors"
            style={{ color: C.textSecondary }}
            aria-label="Previous month"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="text-center">
            <p className="text-sm font-medium" style={{ color: C.textPrimary }}>
              {MONTH_NAMES[viewMonth]} {viewYear}
            </p>
            <p className="mt-0.5 text-[11px]" style={{ color: C.textTertiary }}>
              {timezoneLabel}
            </p>
          </div>
          <button
            type="button"
            onClick={nextMonth}
            className="flex h-8 w-8 items-center justify-center rounded-sm transition-colors"
            style={{ color: C.textSecondary }}
            aria-label="Next month"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <p className="mb-3 text-xs font-medium" style={{ color: C.textSecondary }}>
          {selectedDates.length} of {maxVisitDays} day{maxVisitDays === 1 ? "" : "s"} selected
        </p>

        <CalendarGrid
          year={viewYear}
          month={viewMonth}
          selected={selectedDates[0] ?? null}
          selectedDates={selectedSet}
          onSelect={toggleDate}
          availableDates={bookableDates}
          minDate={today}
          colors={calendarColors}
          largeCells
        />

        {selectedDates.length > 0 ? (
          <ul className="mt-4 space-y-1 text-xs" style={{ color: C.textSecondary }}>
            {selectedDates.map((date) => (
              <li key={date} className="flex items-center justify-between gap-2">
                <span>{formatDateOnlyLabel(date)}</span>
                <button
                  type="button"
                  onClick={() => toggleDate(date)}
                  className="text-[11px] font-medium"
                  style={{ color: C.accent }}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <p className="text-xs leading-relaxed" style={{ color: C.textTertiary }}>
        Select 1 to {maxVisitDays} open school day{maxVisitDays === 1 ? "" : "s"}. Days do not
        need to be consecutive.
        {atMaxSelection ? " You have reached the maximum for this visit." : null}
      </p>
    </div>
  );
}
