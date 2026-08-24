import { useCallback, useEffect, useMemo, useState } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';

import {
  formatOrganizationTimezoneLabel,
  getOrganizationTimezone,
  todayKeyInTimezone,
  todayMonthYearInTimezone,
} from '@/lib/admissions/admissions-availability';
import type { MobileAdminTheme } from '@/lib/organization-settings/build-admin-theme';

type UseScheduleCalendarOptions = {
  organizationId: string;
  supabase: SupabaseClient;
  timezoneProp?: string;
  theme: MobileAdminTheme;
  onMonthChange?: (year: number, month: number) => void;
};

export function useScheduleCalendar({
  organizationId,
  supabase,
  timezoneProp,
  theme,
  onMonthChange,
}: UseScheduleCalendarOptions) {
  const [timezone, setTimezone] = useState(timezoneProp ?? 'America/Chicago');
  const initial = todayMonthYearInTimezone(timezone);
  const [viewYear, setViewYear] = useState(initial.year);
  const [viewMonth, setViewMonth] = useState(initial.month);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [timezoneError, setTimezoneError] = useState<string | null>(null);

  const today = todayKeyInTimezone(timezone);
  const timezoneLabel = formatOrganizationTimezoneLabel(timezone);

  const monthRange = useMemo(() => {
    const start = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-01`;
    const endMonth = viewMonth === 11 ? 0 : viewMonth + 1;
    const endYear = viewMonth === 11 ? viewYear + 1 : viewYear;
    const endDay = new Date(endYear, endMonth + 1, 0).getDate();
    const end = `${endYear}-${String(endMonth + 1).padStart(2, '0')}-${String(endDay).padStart(2, '0')}`;
    return { start, end };
  }, [viewMonth, viewYear]);

  const calendarColors = useMemo(
    () => ({
      accent: theme.accent,
      accentLight: theme.accentLight,
      text: theme.textPrimary,
      textFaint: theme.textTertiary,
      warning: theme.warning,
      warningBg: theme.warningBg,
    }),
    [theme],
  );

  useEffect(() => {
    if (timezoneProp) {
      setTimezone(timezoneProp);
      return;
    }

    let cancelled = false;
    void getOrganizationTimezone(supabase, organizationId)
      .then((value) => {
        if (!cancelled) setTimezone(value);
      })
      .catch((err) => {
        if (!cancelled) {
          setTimezoneError(err instanceof Error ? err.message : 'Failed to load timezone.');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [organizationId, supabase, timezoneProp]);

  useEffect(() => {
    setSelectedDate(null);
    onMonthChange?.(viewYear, viewMonth);
  }, [onMonthChange, viewMonth, viewYear]);

  const prevMonth = useCallback(() => {
    setViewMonth((month) => {
      if (month === 0) {
        setViewYear((year) => year - 1);
        return 11;
      }
      return month - 1;
    });
  }, []);

  const nextMonth = useCallback(() => {
    setViewMonth((month) => {
      if (month === 11) {
        setViewYear((year) => year + 1);
        return 0;
      }
      return month + 1;
    });
  }, []);

  const goToToday = useCallback(() => {
    const { year, month } = todayMonthYearInTimezone(timezone);
    setViewYear(year);
    setViewMonth(month);
    setSelectedDate(todayKeyInTimezone(timezone));
  }, [timezone]);

  const goToDate = useCallback((dateKey: string) => {
    const [year, month] = dateKey.split('-').map(Number);
    if (!year || !month) return;
    setViewYear(year);
    setViewMonth(month - 1);
    setSelectedDate(dateKey);
  }, []);

  return {
    today,
    timezone,
    timezoneLabel,
    timezoneError,
    viewYear,
    viewMonth,
    selectedDate,
    setSelectedDate,
    prevMonth,
    nextMonth,
    goToToday,
    goToDate,
    monthRange,
    calendarColors,
  };
}
