import { useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { ScheduleMonthCalendar } from '@/components/school-admin/schedule/schedule-month-calendar';
import { ParentCalendarAgendaPanel } from '@/components/parent/calendar/parent-calendar-agenda-panel';
import { ParentCalendarDayGrid } from '@/components/parent/calendar/parent-calendar-day-grid';
import { ParentCalendarEmptyDaySheet } from '@/components/parent/calendar/parent-calendar-empty-day-sheet';
import { ParentCalendarToolbar } from '@/components/parent/calendar/parent-calendar-toolbar';
import { ParentCalendarWeekStrip } from '@/components/parent/calendar/parent-calendar-week-strip';
import { ParentEventDetailSheet } from '@/components/parent/calendar/parent-event-detail-sheet';
import { useParentCalendarView } from '@/components/parent/calendar/use-parent-calendar-view';
import { StoryCard } from '@/components/story/story-card';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { Story, StoryCardPadding } from '@/constants/story-theme';
import { SCREEN_HORIZONTAL_PADDING } from '@/constants/screen-layout';
import { Spacing } from '@/constants/theme';
import { groupOrganizationEventsByDate } from '@/lib/school-events/events';
import type { OrganizationEvent } from '@/lib/school-events/types';
import { getSupabaseClient } from '@/lib/supabase';

type TeacherCalendarReadonlyViewProps = {
  organizationId: string;
  events: OrganizationEvent[];
  timezone: string;
  isRefreshing: boolean;
  onRefresh: () => Promise<void>;
};

export function TeacherCalendarReadonlyView({
  organizationId,
  events,
  timezone,
  isRefreshing,
  onRefresh,
}: TeacherCalendarReadonlyViewProps) {
  const theme = useParentTheme();
  const supabase = useMemo(() => getSupabaseClient(), []);
  const { eventId, date: dateParam } = useLocalSearchParams<{
    eventId?: string;
    date?: string;
  }>();

  const [selectedEvent, setSelectedEvent] = useState<OrganizationEvent | null>(null);
  const [selectedEmptyDay, setSelectedEmptyDay] = useState<string | null>(null);
  const deepLinkHandledRef = useRef(false);

  const calendar = useParentCalendarView({
    organizationId,
    supabase,
    timezoneProp: timezone,
    theme,
  });
  const { goToDate, setSelectedDate } = calendar;

  const eventsByDate = useMemo(() => groupOrganizationEventsByDate(events), [events]);
  const eventDates = useMemo(() => new Set(eventsByDate.keys()), [eventsByDate]);

  const handleDayPress = useCallback(
    (date: string) => {
      setSelectedDate(date);
      const dayEvents = eventsByDate.get(date) ?? [];
      if (dayEvents.length > 0) {
        setSelectedEmptyDay(null);
        setSelectedEvent(dayEvents[0]);
        return;
      }
      setSelectedEvent(null);
      setSelectedEmptyDay(date);
    },
    [eventsByDate, setSelectedDate],
  );

  const handleEventPress = useCallback(
    (event: OrganizationEvent) => {
      setSelectedEmptyDay(null);
      setSelectedEvent(event);
      setSelectedDate(event.date);
    },
    [setSelectedDate],
  );

  const closeSheets = useCallback(() => {
    setSelectedEvent(null);
    setSelectedEmptyDay(null);
  }, []);

  useEffect(() => {
    if (deepLinkHandledRef.current) return;

    if (eventId) {
      const event = events.find((item) => item.id === eventId);
      if (event) {
        goToDate(event.date);
        setSelectedEvent(event);
        deepLinkHandledRef.current = true;
        return;
      }
    }

    if (dateParam) {
      goToDate(dateParam);
      deepLinkHandledRef.current = true;
    }
  }, [dateParam, eventId, events, goToDate]);

  const emptyHint =
    events.length === 0
      ? 'No events scheduled yet. Your school calendar will appear here when events are added.'
      : null;

  return (
    <>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => void onRefresh()}
            tintColor={theme.primary}
          />
        }>
        <Animated.View entering={FadeIn.duration(280)} style={styles.stack}>
          <StoryCard compact style={styles.calendarCard}>
            <ParentCalendarToolbar
              periodLabel={calendar.periodLabel}
              viewMode={calendar.viewMode}
              onViewModeChange={calendar.setViewMode}
              onPrev={calendar.prevPeriod}
              onNext={calendar.nextPeriod}
              onToday={calendar.goToToday}
            />

            {calendar.viewMode === 'day' && calendar.selectedDate ? (
              <ParentCalendarDayGrid
                date={calendar.selectedDate}
                today={calendar.today}
                events={eventsByDate.get(calendar.selectedDate) ?? []}
                selectedEventId={selectedEvent?.id ?? null}
                onEventPress={handleEventPress}
              />
            ) : calendar.viewMode === 'week' ? (
              <ParentCalendarWeekStrip
                weekDates={calendar.weekDates}
                selectedDate={calendar.selectedDate}
                today={calendar.today}
                eventDates={eventDates}
                onSelectDate={handleDayPress}
                colors={calendar.calendarColors}
              />
            ) : (
              <View style={styles.monthCalendar}>
                <ScheduleMonthCalendar
                  viewYear={calendar.viewYear}
                  viewMonth={calendar.viewMonth}
                  selectedDate={calendar.selectedDate}
                  onSelectDate={handleDayPress}
                  eventDates={eventDates}
                  onPrevMonth={calendar.prevPeriod}
                  onNextMonth={calendar.nextPeriod}
                  colors={calendar.calendarColors}
                />
              </View>
            )}

            {emptyHint ? (
              <Text style={[styles.emptyHint, { color: theme.muted }]}>{emptyHint}</Text>
            ) : null}
          </StoryCard>

          <ParentCalendarAgendaPanel
            events={events}
            selectedEventId={selectedEvent?.id ?? null}
            onEventPress={handleEventPress}
            agendaTitle="School agenda"
          />
        </Animated.View>
      </ScrollView>

      <ParentEventDetailSheet
        visible={Boolean(selectedEvent)}
        event={selectedEvent}
        onClose={closeSheets}
      />

      <ParentCalendarEmptyDaySheet
        visible={Boolean(selectedEmptyDay) && !selectedEvent}
        date={selectedEmptyDay}
        onClose={closeSheets}
      />
    </>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: Story.paper,
  },
  content: {
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.six,
  },
  stack: {
    gap: Spacing.four,
  },
  calendarCard: {
    padding: StoryCardPadding,
  },
  monthCalendar: {
    marginTop: Spacing.two,
  },
  emptyHint: {
    marginTop: Spacing.three,
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
  },
});
