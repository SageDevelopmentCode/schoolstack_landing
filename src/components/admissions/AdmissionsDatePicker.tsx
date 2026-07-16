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
import { listConsecutiveDates } from "@/lib/admissions/admissions-observation-availability";
import { MONTH_NAMES } from "@/lib/demo-scheduler";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";

type AdmissionsDatePickerProps = {
  C: AdminThemeTokens;
  applicationId: string;
  actionId: string;
  timezone: string;
  timezoneLabel: string;
  visitDayCount: number;
  selectedDate: string | null;
  onDateChange: (date: string | null) => void;
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
  visitDayCount,
  selectedDate,
  onDateChange,
}: AdmissionsDatePickerProps) {
  const initial = todayMonthYearInTimezone(timezone);
  const [viewYear, setViewYear] = useState(initial.year);
  const [viewMonth, setViewMonth] = useState(initial.month);
  const [bookableStartDates, setBookableStartDates] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const today = todayKeyInTimezone(timezone);

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

    setBookableStartDates(new Set(payload.bookableStartDates));
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

  const visitSummary = useMemo(() => {
    if (!selectedDate) return null;
    const dates = listConsecutiveDates(selectedDate, visitDayCount);
    const endDate = dates[dates.length - 1];
    if (!endDate) return null;

    if (visitDayCount === 1) {
      return `Your child will visit on ${formatDateOnlyLabel(selectedDate)}.`;
    }

    return `Your child will visit ${formatDateOnlyLabel(selectedDate)} – ${formatDateOnlyLabel(endDate)} (${visitDayCount} school days).`;
  }, [selectedDate, visitDayCount]);

  function prevMonth() {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((year) => year - 1);
    } else {
      setViewMonth((month) => month - 1);
    }
    onDateChange(null);
  }

  function nextMonth() {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((year) => year + 1);
    } else {
      setViewMonth((month) => month + 1);
    }
    onDateChange(null);
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

        <CalendarGrid
          year={viewYear}
          month={viewMonth}
          selected={selectedDate}
          onSelect={onDateChange}
          availableDates={bookableStartDates}
          minDate={today}
          colors={calendarColors}
          largeCells
        />
      </div>

      {visitSummary ? (
        <p
          className="rounded-sm px-3 py-2 text-sm leading-relaxed"
          style={{ backgroundColor: C.accentLight, color: C.accentDark }}
        >
          {visitSummary}
        </p>
      ) : (
        <p className="text-xs leading-relaxed" style={{ color: C.textTertiary }}>
          Choose a start day with {visitDayCount} consecutive open school days available.
        </p>
      )}
    </div>
  );
}
