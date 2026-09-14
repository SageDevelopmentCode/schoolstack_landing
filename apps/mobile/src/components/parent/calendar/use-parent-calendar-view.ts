import { useCallback, useEffect, useMemo, useState } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';

import {
  formatOrganizationTimezoneLabel,
  getOrganizationTimezone,
  todayKeyInTimezone,
  todayMonthYearInTimezone,
} from '@/lib/admissions/admissions-availability';
import type { MobileParentTheme } from '@/lib/organization-settings/parent-theme';
import {
  addDays,
  addMonths,
  addWeeks,
  dateKey,
  formatDayLabel,
  formatMonthLabel,
  formatWeekRangeLabel,
  getWeekDates,
  parseEventDate,
} from '@/lib/school-events/calendar-utils';

export type ParentCalendarViewMode = 'day' | 'week' | 'month';

type UseParentCalendarViewOptions = {
  organizationId: string;
  supabase: SupabaseClient;
  timezoneProp?: string;
  theme: MobileParentTheme;
};

export function useParentCalendarView({
  organizationId,
  supabase,
  timezoneProp,
  theme,
}: UseParentCalendarViewOptions) {
  const [timezone, setTimezone] = useState(timezoneProp ?? 'America/Chicago');
  const [viewMode, setViewMode] = useState<ParentCalendarViewMode>('day');

  const initialToday = todayKeyInTimezone(timezone);
  const initialMonthYear = todayMonthYearInTimezone(timezone);

  const [viewYear, setViewYear] = useState(initialMonthYear.year);
  const [viewMonth, setViewMonth] = useState(initialMonthYear.month);
  const [weekAnchor, setWeekAnchor] = useState(() => parseEventDate(initialToday));
  const [selectedDate, setSelectedDate] = useState<string | null>(initialToday);

  const today = todayKeyInTimezone(timezone);
  const timezoneLabel = formatOrganizationTimezoneLabel(timezone);

  const weekDates = useMemo(() => getWeekDates(weekAnchor), [weekAnchor]);

  const periodLabel = useMemo(() => {
    if (viewMode === 'day' && selectedDate) {
      return formatDayLabel(selectedDate);
    }
    if (viewMode === 'week') {
      return formatWeekRangeLabel(weekDates);
    }
    return formatMonthLabel(viewYear, viewMonth);
  }, [selectedDate, viewMode, viewMonth, viewYear, weekDates]);

  const calendarColors = useMemo(
    () => ({
      accent: theme.primary,
      accentLight: theme.primarySoft,
      text: theme.ink,
      textFaint: theme.muted,
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

  const shiftSelectedDate = useCallback(
    (deltaDays: number) => {
      const anchor = selectedDate ? parseEventDate(selectedDate) : parseEventDate(today);
      const next = addDays(anchor, deltaDays);
      syncFromSelectedDate(dateKey(next));
    },
    [selectedDate, syncFromSelectedDate, today],
  );

  const prevPeriod = useCallback(() => {
    if (viewMode === 'day') {
      shiftSelectedDate(-1);
      return;
    }
    if (viewMode === 'week') {
      setWeekAnchor((current) => addWeeks(current, -1));
      return;
    }
    const next = addMonths(viewYear, viewMonth, -1);
    setViewYear(next.year);
    setViewMonth(next.month);
  }, [shiftSelectedDate, viewMode, viewMonth, viewYear]);

  const nextPeriod = useCallback(() => {
    if (viewMode === 'day') {
      shiftSelectedDate(1);
      return;
    }
    if (viewMode === 'week') {
      setWeekAnchor((current) => addWeeks(current, 1));
      return;
    }
    const next = addMonths(viewYear, viewMonth, 1);
    setViewYear(next.year);
    setViewMonth(next.month);
  }, [shiftSelectedDate, viewMode, viewMonth, viewYear]);

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
      setViewMode('day');
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
