import { useCallback, useEffect, useMemo, useState } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';

import {
  formatOrganizationTimezoneLabel,
  getOrganizationTimezone,
  todayKeyInTimezone,
  todayMonthYearInTimezone,
} from '@/lib/admissions/admissions-availability';
import type { MobileAdminTheme } from '@/lib/organization-settings/build-admin-theme';
import {
  addMonths,
  addWeeks,
  formatMonthLabel,
  formatWeekRangeLabel,
  getWeekDates,
  parseEventDate,
} from '@/lib/school-events/calendar-utils';

export type ParentCalendarViewMode = 'week' | 'month';

type UseParentCalendarViewOptions = {
  organizationId: string;
  supabase: SupabaseClient;
  timezoneProp?: string;
  theme: MobileAdminTheme;
};

export function useParentCalendarView({
  organizationId,
  supabase,
  timezoneProp,
  theme,
}: UseParentCalendarViewOptions) {
  const [timezone, setTimezone] = useState(timezoneProp ?? 'America/Chicago');
  const [viewMode, setViewMode] = useState<ParentCalendarViewMode>('week');

  const initialToday = todayKeyInTimezone(timezone);
  const initialMonthYear = todayMonthYearInTimezone(timezone);

  const [viewYear, setViewYear] = useState(initialMonthYear.year);
  const [viewMonth, setViewMonth] = useState(initialMonthYear.month);
  const [weekAnchor, setWeekAnchor] = useState(() => parseEventDate(initialToday));
  const [selectedDate, setSelectedDate] = useState<string | null>(initialToday);

  const today = todayKeyInTimezone(timezone);
  const timezoneLabel = formatOrganizationTimezoneLabel(timezone);

  const weekDates = useMemo(() => getWeekDates(weekAnchor), [weekAnchor]);

  const periodLabel =
    viewMode === 'week' ? formatWeekRangeLabel(weekDates) : formatMonthLabel(viewYear, viewMonth);

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
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [organizationId, supabase, timezoneProp]);

  const syncFromSelectedDate = useCallback((dateKeyValue: string) => {
    const parsed = parseEventDate(dateKeyValue);
    setViewYear(parsed.getFullYear());
    setViewMonth(parsed.getMonth());
    setWeekAnchor(parsed);
    setSelectedDate(dateKeyValue);
  }, []);

  const handleSetViewMode = useCallback(
    (mode: ParentCalendarViewMode) => {
      setViewMode(mode);
      if (selectedDate) {
        const parsed = parseEventDate(selectedDate);
        setWeekAnchor(parsed);
        setViewYear(parsed.getFullYear());
        setViewMonth(parsed.getMonth());
      }
    },
    [selectedDate],
  );

  const prevPeriod = useCallback(() => {
    if (viewMode === 'week') {
      setWeekAnchor((current) => addWeeks(current, -1));
      return;
    }
    const next = addMonths(viewYear, viewMonth, -1);
    setViewYear(next.year);
    setViewMonth(next.month);
  }, [viewMode, viewMonth, viewYear]);

  const nextPeriod = useCallback(() => {
    if (viewMode === 'week') {
      setWeekAnchor((current) => addWeeks(current, 1));
      return;
    }
    const next = addMonths(viewYear, viewMonth, 1);
    setViewYear(next.year);
    setViewMonth(next.month);
  }, [viewMode, viewMonth, viewYear]);

  const goToToday = useCallback(() => {
    const nextToday = todayKeyInTimezone(timezone);
    const { year, month } = todayMonthYearInTimezone(timezone);
    setViewYear(year);
    setViewMonth(month);
    setWeekAnchor(parseEventDate(nextToday));
    setSelectedDate(nextToday);
  }, [timezone]);

  const goToDate = useCallback(
    (dateKeyValue: string) => {
      syncFromSelectedDate(dateKeyValue);
      setViewMode('week');
    },
    [syncFromSelectedDate],
  );

  return {
    viewMode,
    setViewMode: handleSetViewMode,
    weekDates,
    weekAnchor,
    periodLabel,
    prevPeriod,
    nextPeriod,
    goToToday,
    goToDate,
    selectedDate,
    setSelectedDate: syncFromSelectedDate,
    viewYear,
    viewMonth,
    today,
    timezone,
    timezoneLabel,
    calendarColors,
  };
}
