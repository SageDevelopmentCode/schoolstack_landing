"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  formatOrganizationTimezoneLabel,
  getOrganizationTimezone,
  todayKeyInTimezone,
  todayMonthYearInTimezone,
} from "@/lib/admissions/admissions-availability";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import type { SupabaseClient } from "@supabase/supabase-js";

type UseScheduleCalendarOptions = {
  organizationId: string;
  supabase: SupabaseClient;
  timezoneProp?: string;
  C: AdminThemeTokens;
  onMonthChange?: (year: number, month: number) => void;
};

export function useScheduleCalendar({
  organizationId,
  supabase,
  timezoneProp,
  C,
  onMonthChange,
}: UseScheduleCalendarOptions) {
  const [timezone, setTimezone] = useState(timezoneProp ?? "America/Chicago");
  const initial = todayMonthYearInTimezone(timezone);
  const [viewYear, setViewYear] = useState(initial.year);
  const [viewMonth, setViewMonth] = useState(initial.month);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [timezoneError, setTimezoneError] = useState<string | null>(null);

  const today = todayKeyInTimezone(timezone);
  const timezoneLabel = formatOrganizationTimezoneLabel(timezone);

  const monthRange = useMemo(() => {
    const start = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-01`;
    const endMonth = viewMonth === 11 ? 0 : viewMonth + 1;
    const endYear = viewMonth === 11 ? viewYear + 1 : viewYear;
    const endDay = new Date(endYear, endMonth + 1, 0).getDate();
    const end = `${endYear}-${String(endMonth + 1).padStart(2, "0")}-${String(endDay).padStart(2, "0")}`;
    return { start, end };
  }, [viewMonth, viewYear]);

  const calendarColors = useMemo(
    () => ({
      accent: C.accent,
      accentLight: C.accentLight,
      text: C.textPrimary,
      textFaint: C.textTertiary,
      warning: C.warning,
      warningBg: C.warningBg,
    }),
    [C.accent, C.accentLight, C.textPrimary, C.textTertiary, C.warning, C.warningBg],
  );

  useEffect(() => {
    if (timezoneProp) {
      queueMicrotask(() => setTimezone(timezoneProp));
      return;
    }

    let cancelled = false;
    void getOrganizationTimezone(supabase, organizationId)
      .then((value) => {
        if (!cancelled) setTimezone(value);
      })
      .catch((err) => {
        if (!cancelled) {
          setTimezoneError(
            err instanceof Error ? err.message : "Failed to load timezone.",
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, [organizationId, supabase, timezoneProp]);

  useEffect(() => {
    const next = todayMonthYearInTimezone(timezone);
    queueMicrotask(() => {
      setViewYear(next.year);
      setViewMonth(next.month);
      setSelectedDate(null);
    });
  }, [timezone]);

  useEffect(() => {
    onMonthChange?.(viewYear, viewMonth);
  }, [onMonthChange, viewMonth, viewYear]);

  const clearSelectedDate = useCallback(() => {
    setSelectedDate(null);
  }, []);

  const prevMonth = useCallback(() => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((year) => year - 1);
    } else {
      setViewMonth((month) => month - 1);
    }
    setSelectedDate(null);
  }, [viewMonth]);

  const nextMonth = useCallback(() => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((year) => year + 1);
    } else {
      setViewMonth((month) => month + 1);
    }
    setSelectedDate(null);
  }, [viewMonth]);

  return {
    timezone,
    today,
    timezoneLabel,
    timezoneError,
    viewYear,
    viewMonth,
    selectedDate,
    setSelectedDate,
    clearSelectedDate,
    prevMonth,
    nextMonth,
    monthRange,
    calendarColors,
  };
}
