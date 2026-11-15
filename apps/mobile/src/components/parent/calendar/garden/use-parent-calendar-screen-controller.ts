import { useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useParentCalendarView } from '@/components/parent/calendar/use-parent-calendar-view';
import { useAuth } from '@/contexts/auth-context';
import { useParentCalendar } from '@/contexts/parent-calendar-context';
import { useParentTheme } from '@/contexts/parent-theme-context';
import type { OrganizationEvent } from '@/lib/school-events/types';
import { getSupabaseClient } from '@/lib/supabase';
import { useMobileErrorReporter } from '@/lib/use-mobile-error-reporter';

/**
 * Data + calendar navigation for the parent Calendar tab. No UI: the Garden
 * screen renders whatever this returns. Deep-link handling is unchanged from
 * the Story screen; it only adds `deepLinkMissing` so the UI can say so.
 */
export function useParentCalendarScreenController(organizationId: string) {
  const theme = useParentTheme();
  const supabase = useMemo(() => getSupabaseClient(), []);
  const { reportError } = useMobileErrorReporter(organizationId);
  const { selectedSchool } = useAuth();
  const { data, isLoading, isRefreshing, error, refresh } = useParentCalendar();
  const { eventId, date: dateParam } = useLocalSearchParams<{
    eventId?: string;
    date?: string;
  }>();

  const calendar = useParentCalendarView({
    organizationId,
    supabase,
    timezoneProp: data?.timezone,
    theme,
    reportError,
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
        setDeepLinkEvent(event);
        deepLinkHandledRef.current = true;
        return;
      }
    }

    if (dateParam) {
      goToDate(dateParam);
      deepLinkHandledRef.current = true;
    }

    if (eventId && !isRefreshing) {
      // The linked event isn't in the (fresh) calendar data.
      deepLinkHandledRef.current = true;
      setDeepLinkMissing(true);
    }
  }, [data, dateParam, eventId, goToDate, isRefreshing]);

  return {
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
}

export type ParentCalendarScreenController = ReturnType<typeof useParentCalendarScreenController>;
