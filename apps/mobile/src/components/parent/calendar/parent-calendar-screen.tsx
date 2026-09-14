import { useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { ScheduleMonthCalendar } from '@/components/school-admin/schedule/schedule-month-calendar';
import { ParentCalendarAgendaPanel } from '@/components/parent/calendar/parent-calendar-agenda-panel';
import { ParentCalendarDayGrid } from '@/components/parent/calendar/parent-calendar-day-grid';
import { ParentCalendarEmptyDaySheet } from '@/components/parent/calendar/parent-calendar-empty-day-sheet';
import { ParentCalendarSkeleton } from '@/components/parent/calendar/parent-calendar-skeleton';
import { ParentCalendarToolbar } from '@/components/parent/calendar/parent-calendar-toolbar';
import { ParentCalendarWeekStrip } from '@/components/parent/calendar/parent-calendar-week-strip';
import { ParentEventDetailSheet } from '@/components/parent/calendar/parent-event-detail-sheet';
import { useParentCalendarView } from '@/components/parent/calendar/use-parent-calendar-view';
import { StoryButton } from '@/components/story/story-button';
import { StoryCard } from '@/components/story/story-card';
import { StoryErrorBanner } from '@/components/story/story-error-banner';
import { useParentCalendar } from '@/contexts/parent-calendar-context';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { Story, StoryCardPadding } from '@/constants/story-theme';
import { SCREEN_HORIZONTAL_PADDING } from '@/constants/screen-layout';
import { Spacing } from '@/constants/theme';
import { groupOrganizationEventsByDate } from '@/lib/school-events/events';
import type { OrganizationEvent } from '@/lib/school-events/types';
import { getSupabaseClient } from '@/lib/supabase';

type ParentCalendarScreenProps = {
  organizationId: string;
};

export function ParentCalendarScreen({ organizationId }: ParentCalendarScreenProps) {
  const theme = useParentTheme();
  const supabase = useMemo(() => getSupabaseClient(), []);
  const { data, isLoading, isRefreshing, error, refresh } = useParentCalendar();
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
    timezoneProp: data?.timezone,
    theme,
  });
  const { goToDate, setSelectedDate } = calendar;

  const events = data?.events ?? [];
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

  const handleEventPress = useCallback((event: OrganizationEvent) => {
    setSelectedEmptyDay(null);
    setSelectedEvent(event);
    setSelectedDate(event.date);
  }, [setSelectedDate]);

  const closeSheets = useCallback(() => {
    setSelectedEvent(null);
    setSelectedEmptyDay(null);
  }, []);

  useEffect(() => {
    if (!data || deepLinkHandledRef.current) return;

    if (eventId) {
      const event = data.events.find((item) => item.id === eventId);
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
  }, [data, dateParam, eventId, goToDate]);

  if (isLoading && !data) {
    return <ParentCalendarSkeleton />;
  }

  if (error && !data) {
    return (
      <View style={styles.centered}>
        <StoryErrorBanner message={error} />
        <StoryButton label="Try again" onPress={() => void refresh()} style={styles.retry} />
      </View>
    );
  }

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
            onRefresh={() => void refresh()}
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
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    gap: Spacing.three,
    backgroundColor: Story.paper,
  },
  retry: {
    minWidth: 160,
  },
});
