import { useCallback, useEffect, useMemo, useState } from 'react';

import type { ParentCalendarScreenController } from '@/components/parent/calendar/garden/use-parent-calendar-screen-controller';
import { closeThen } from '@/components/parent/messages/garden/use-parent-messages-feedback';
import { listUpcomingCalendarEvents } from '@/lib/parent/parent-calendar-agenda-utils';
import {
  calendarLegend,
  calendarSummary,
  dayTapOutcome,
  isCurrentPeriod,
  periodEventCount,
  pickSpotlight,
} from '@/lib/parent/parent-calendar-garden';
import { groupOrganizationEventsByDate } from '@/lib/school-events/events';
import type { OrganizationEvent } from '@/lib/school-events/types';

/**
 * Sheet state + derived data for the Garden Calendar. Selection behaviour is
 * the Story screen's, except a day with 2+ events opens a list of them
 * (instead of only the first event).
 */
export function useParentCalendarModel(
  controller: ParentCalendarScreenController,
  options?: {
    /** Staff who manage events: tapping an empty day goes straight to "Add event" (as before). */
    onEmptyDay?: (date: string) => void;
  },
) {
  const onEmptyDay = options?.onEmptyDay;
  const { calendar, events, deepLinkEvent, clearDeepLinkEvent } = controller;
  const { setSelectedDate } = calendar;

  const [selectedEvent, setSelectedEvent] = useState<OrganizationEvent | null>(null);
  const [daySheetDate, setDaySheetDate] = useState<string | null>(null);

  const eventsByDate = useMemo(() => groupOrganizationEventsByDate(events), [events]);
  const eventDates = useMemo(() => new Set(eventsByDate.keys()), [eventsByDate]);
  const upcoming = useMemo(() => listUpcomingCalendarEvents(events), [events]);

  const selectedDayEvents = useMemo(
    () => (calendar.selectedDate ? (eventsByDate.get(calendar.selectedDate) ?? []) : []),
    [calendar.selectedDate, eventsByDate],
  );
  const daySheetEvents = useMemo(
    () => (daySheetDate ? (eventsByDate.get(daySheetDate) ?? []) : []),
    [daySheetDate, eventsByDate],
  );

  const period = useMemo(
    () => ({
      selectedDate: calendar.selectedDate,
      weekDates: calendar.weekDates,
      year: calendar.viewYear,
      month: calendar.viewMonth,
    }),
    [calendar.selectedDate, calendar.viewMonth, calendar.viewYear, calendar.weekDates],
  );
  const current = isCurrentPeriod(calendar.viewMode, calendar.today, period);
  const count = useMemo(
    () => periodEventCount(events, calendar.viewMode, period),
    [calendar.viewMode, events, period],
  );
  const summary = calendarSummary({
    view: calendar.viewMode,
    count,
    current,
    periodLabel: calendar.periodLabel,
  });
  const legend = useMemo(() => calendarLegend(events), [events]);
  const spotlight = useMemo(() => pickSpotlight(upcoming, calendar.today), [calendar.today, upcoming]);

  // Deep link `?eventId=` → open that event (the controller already moved the calendar).
  useEffect(() => {
    if (!deepLinkEvent) return;
    setDaySheetDate(null);
    setSelectedEvent(deepLinkEvent);
    clearDeepLinkEvent();
  }, [clearDeepLinkEvent, deepLinkEvent]);

  const handleEventPress = useCallback(
    (event: OrganizationEvent) => {
      setDaySheetDate(null);
      setSelectedEvent(event);
      setSelectedDate(event.date);
    },
    [setSelectedDate],
  );

  const handleDayPress = useCallback(
    (date: string) => {
      setSelectedDate(date);
      const dayEvents = eventsByDate.get(date) ?? [];
      const outcome = dayTapOutcome(dayEvents);
      if (outcome === 'empty' && onEmptyDay) {
        setSelectedEvent(null);
        setDaySheetDate(null);
        onEmptyDay(date);
        return;
      }
      if (outcome === 'event') {
        setDaySheetDate(null);
        setSelectedEvent(dayEvents[0]);
        return;
      }
      setSelectedEvent(null);
      setDaySheetDate(date);
    },
    [eventsByDate, onEmptyDay, setSelectedDate],
  );

  /** From the day sheet's list: let the sheet dismiss, then open the event. */
  const openEventFromDaySheet = useCallback(
    (event: OrganizationEvent) => {
      closeThen(
        () => setDaySheetDate(null),
        () => setSelectedEvent(event),
      );
    },
    [],
  );

  const closeSheets = useCallback(() => {
    setSelectedEvent(null);
    setDaySheetDate(null);
  }, []);

  return {
    eventsByDate,
    eventDates,
    upcoming,
    selectedDayEvents,
    selectedEvent,
    daySheetDate,
    daySheetEvents,
    daySheetVisible: Boolean(daySheetDate) && !selectedEvent,
    isCurrentPeriod: current,
    periodEventCount: count,
    summary,
    legend,
    spotlight,
    handleEventPress,
    handleDayPress,
    openEventFromDaySheet,
    closeSheets,
  };
}

export type ParentCalendarModel = ReturnType<typeof useParentCalendarModel>;
