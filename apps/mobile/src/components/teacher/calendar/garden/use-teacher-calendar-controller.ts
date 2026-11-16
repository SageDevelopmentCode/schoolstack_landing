import { useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { ParentCalendarScreenController } from '@/components/parent/calendar/garden/use-parent-calendar-screen-controller';
import { useParentCalendarView } from '@/components/parent/calendar/use-parent-calendar-view';
import { useAuth } from '@/contexts/auth-context';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { useTeacherCalendar } from '@/contexts/teacher-calendar-context';
import { useTeacherHome } from '@/contexts/teacher-home-context';
import type { OrganizationEvent } from '@/lib/school-events/types';
import { getSupabaseClient } from '@/lib/supabase';
import { isTeacherFeatureEnabled } from '@/lib/teacher/teacher-features';
import { useMobileErrorReporter } from '@/lib/use-mobile-error-reporter';

/**
 * Teacher Calendar data + navigation in the shape the Garden calendar screen
 * takes (`ParentCalendarScreenController`), from the teacher calendar context.
 * Same data, flags and `reportError` operations as the Story screen. Deep links
 * (`?eventId=` / `?date=`) now move the grid to the linked day in every mode.
 */
export function useTeacherCalendarController(organizationId: string) {
  const theme = useParentTheme();
  const supabase = useMemo(() => getSupabaseClient(), []);
  const { reportError } = useMobileErrorReporter(organizationId);
  const { selectedSchool } = useAuth();
  const { data: homeData, ensureLoaded: ensureHomeLoaded } = useTeacherHome();
  const { data, isLoading, isRefreshing, error, ensureLoaded, refresh } = useTeacherCalendar();
  const { eventId, date: dateParam } = useLocalSearchParams<{ eventId?: string; date?: string }>();

  useEffect(() => {
    ensureHomeLoaded();
    ensureLoaded();
  }, [ensureHomeLoaded, ensureLoaded]);

  const calendar = useParentCalendarView({
    organizationId,
    supabase,
    timezoneProp: data?.timezone,
    theme,
    reportError,
    timezoneResolveFailedOperation: 'teacher.calendar.timezone_resolve_failed',
  });
  const { goToDate } = calendar;

  const [deepLinkEvent, setDeepLinkEvent] = useState<OrganizationEvent | null>(null);
  const [deepLinkMissing, setDeepLinkMissing] = useState(false);
  const deepLinkHandledRef = useRef(false);
  const clearDeepLinkEvent = useCallback(() => setDeepLinkEvent(null), []);

  useEffect(() => {
    if (!data || deepLinkHandledRef.current) return;

    if (eventId) {
      const event = data.events.find((item) => item.id === eventId);
      if (event) {
        goToDate(event.date);
        queueMicrotask(() => setDeepLinkEvent(event));
        deepLinkHandledRef.current = true;
        return;
      }
    }

    if (dateParam) {
      goToDate(dateParam);
      deepLinkHandledRef.current = true;
    }

    if (eventId && !isRefreshing) {
      deepLinkHandledRef.current = true;
      queueMicrotask(() => setDeepLinkMissing(true));
    }
  }, [data, dateParam, eventId, goToDate, isRefreshing]);

  const screen: ParentCalendarScreenController = {
    organizationId,
    schoolName: selectedSchool?.name ?? null,
    events: data?.events ?? [],
    hasData: Boolean(data),
    isLoading,
    isRefreshing,
    error,
    refresh,
    reportError,
    calendar,
    deepLinkEvent,
    clearDeepLinkEvent,
    deepLinkMissing,
  };

  return {
    screen,
    /** Wait for home features before deciding the calendar is off. */
    calendarEnabled: !homeData || isTeacherFeatureEnabled(homeData.features, 'calendar'),
    canManageEvents: Boolean(data?.canManageEvents),
    reportError,
  };
}

export type TeacherCalendarController = ReturnType<typeof useTeacherCalendarController>;
