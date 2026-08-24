import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import { ADMIN_LIST_HORIZONTAL_PADDING } from '@/components/school-admin/admin-list-layout';
import { ScheduleMonthCalendar } from '@/components/school-admin/schedule/schedule-month-calendar';
import { ParentCalendarEventRow } from '@/components/parent/calendar/parent-calendar-event-row';
import { ParentCalendarSkeleton } from '@/components/parent/calendar/parent-calendar-skeleton';
import { ParentCalendarViewToggle } from '@/components/parent/calendar/parent-calendar-view-toggle';
import { ParentCalendarWeekStrip } from '@/components/parent/calendar/parent-calendar-week-strip';
import { ParentEventDetailSheet } from '@/components/parent/calendar/parent-event-detail-sheet';
import { useParentCalendarView } from '@/components/parent/calendar/use-parent-calendar-view';
import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { useAdminTheme } from '@/contexts/admin-theme-context';
import { useParentCalendar } from '@/contexts/parent-calendar-context';
import { Radius, Spacing } from '@/constants/theme';
import { dateKey } from '@/lib/school-events/calendar-utils';
import { groupOrganizationEventsByDate } from '@/lib/school-events/events';
import type { OrganizationEvent } from '@/lib/school-events/types';
import { getSupabaseClient } from '@/lib/supabase';

type ParentCalendarScreenProps = {
  organizationId: string;
};

function formatSelectedDayHeader(dateKeyValue: string): string {
  const [year, month, day] = dateKeyValue.split('-').map(Number);
  const parsed = new Date(year, (month ?? 1) - 1, day ?? 1);
  return parsed.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

function parseEventMonthYear(date: string): { year: number; month: number } {
  const [year, month] = date.split('-').map(Number);
  return { year, month: (month ?? 1) - 1 };
}

function sortEvents(events: OrganizationEvent[]): OrganizationEvent[] {
  return [...events].sort((a, b) => {
    const dateCompare = a.date.localeCompare(b.date);
    if (dateCompare !== 0) return dateCompare;
    return a.sortOrder - b.sortOrder;
  });
}

export function ParentCalendarScreen({ organizationId }: ParentCalendarScreenProps) {
  const theme = useAdminTheme();
  const supabase = useMemo(() => getSupabaseClient(), []);
  const { data, isLoading, isRefreshing, error, refresh } = useParentCalendar();
  const { eventId, date: dateParam } = useLocalSearchParams<{
    eventId?: string;
    date?: string;
  }>();

  const [selectedEvent, setSelectedEvent] = useState<OrganizationEvent | null>(null);
  const deepLinkHandledRef = useRef(false);

  const calendar = useParentCalendarView({
    organizationId,
    supabase,
    timezoneProp: data?.timezone,
    theme,
  });
  const { goToDate } = calendar;

  const events = data?.events ?? [];
  const eventsByDate = useMemo(() => groupOrganizationEventsByDate(events), [events]);
  const eventDates = useMemo(() => new Set(eventsByDate.keys()), [eventsByDate]);

  const weekDateKeys = useMemo(
    () => new Set(calendar.weekDates.map((day) => dateKey(day))),
    [calendar.weekDates],
  );

  const dayEvents =
    calendar.selectedDate && eventsByDate.has(calendar.selectedDate)
      ? eventsByDate.get(calendar.selectedDate) ?? []
      : [];

  const eventsThisWeek = useMemo(() => {
    return sortEvents(events.filter((event) => weekDateKeys.has(event.date)));
  }, [events, weekDateKeys]);

  const eventsThisMonth = useMemo(() => {
    return sortEvents(
      events.filter((event) => {
        const { year, month } = parseEventMonthYear(event.date);
        return year === calendar.viewYear && month === calendar.viewMonth;
      }),
    );
  }, [calendar.viewMonth, calendar.viewYear, events]);

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
        <ThemedText type="small" style={{ color: theme.textSecondary, textAlign: 'center' }}>
          {error}
        </ThemedText>
        <PrimaryButton label="Try again" onPress={() => void refresh()} style={styles.retry} />
      </View>
    );
  }

  return (
    <>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => void refresh()}
            tintColor={theme.accent}
          />
        }>
        <View style={styles.controls}>
          <View style={styles.periodNav}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Previous period"
              onPress={calendar.prevPeriod}
              style={styles.navButton}>
              <Ionicons name="chevron-back" size={18} color={theme.textSecondary} />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Next period"
              onPress={calendar.nextPeriod}
              style={styles.navButton}>
              <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />
            </Pressable>
            <ThemedText type="smallBold" style={{ color: theme.textPrimary, flex: 1 }}>
              {calendar.periodLabel}
            </ThemedText>
          </View>

          <View style={styles.toggleRow}>
            <ParentCalendarViewToggle
              viewMode={calendar.viewMode}
              onViewModeChange={calendar.setViewMode}
            />
            <Pressable
              accessibilityRole="button"
              onPress={calendar.goToToday}
              style={[styles.todayButton, { backgroundColor: theme.accentLight }]}>
              <ThemedText type="smallBold" style={{ color: theme.accent }}>
                Today
              </ThemedText>
            </Pressable>
          </View>
        </View>

        {calendar.viewMode === 'week' ? (
          <ParentCalendarWeekStrip
            weekDates={calendar.weekDates}
            selectedDate={calendar.selectedDate}
            today={calendar.today}
            eventDates={eventDates}
            onSelectDate={calendar.setSelectedDate}
            colors={calendar.calendarColors}
          />
        ) : (
          <ScheduleMonthCalendar
            viewYear={calendar.viewYear}
            viewMonth={calendar.viewMonth}
            selectedDate={calendar.selectedDate}
            onSelectDate={calendar.setSelectedDate}
            eventDates={eventDates}
            onPrevMonth={calendar.prevPeriod}
            onNextMonth={calendar.nextPeriod}
            colors={calendar.calendarColors}
          />
        )}

        {calendar.selectedDate ? (
          <View style={styles.section}>
            <ThemedText type="smallBold" style={{ color: theme.textPrimary }}>
              {formatSelectedDayHeader(calendar.selectedDate)}
            </ThemedText>
            {dayEvents.length === 0 ? (
              <ThemedText type="small" style={{ color: theme.textTertiary }}>
                Nothing scheduled for this day.
              </ThemedText>
            ) : (
              <View style={styles.eventList}>
                {dayEvents.map((event) => (
                  <ParentCalendarEventRow
                    key={event.id}
                    event={event}
                    variant="full"
                    onPress={() => setSelectedEvent(event)}
                  />
                ))}
              </View>
            )}
          </View>
        ) : null}

        {calendar.viewMode === 'week' ? (
          <View style={styles.section}>
            <ThemedText type="smallBold" style={{ color: theme.textPrimary }}>
              This week
            </ThemedText>
            {eventsThisWeek.length === 0 ? (
              <ThemedText type="small" style={{ color: theme.textTertiary }}>
                No events this week.
              </ThemedText>
            ) : (
              <View style={styles.eventList}>
                {eventsThisWeek.map((event) => (
                  <ParentCalendarEventRow
                    key={event.id}
                    event={event}
                    variant="full"
                    onPress={() => setSelectedEvent(event)}
                  />
                ))}
              </View>
            )}
          </View>
        ) : (
          <View style={styles.section}>
            <ThemedText type="smallBold" style={{ color: theme.textPrimary }}>
              This month
            </ThemedText>
            {eventsThisMonth.length === 0 ? (
              <ThemedText type="small" style={{ color: theme.textTertiary }}>
                No events this month.
              </ThemedText>
            ) : (
              <View style={styles.eventList}>
                {eventsThisMonth.map((event) => (
                  <ParentCalendarEventRow
                    key={event.id}
                    event={event}
                    variant="full"
                    onPress={() => setSelectedEvent(event)}
                  />
                ))}
              </View>
            )}
          </View>
        )}

        {events.length === 0 ? (
          <ThemedText type="small" style={{ color: theme.textTertiary, textAlign: 'center' }}>
            Your school calendar will appear here when events are added.
          </ThemedText>
        ) : null}
      </ScrollView>

      <ParentEventDetailSheet
        visible={Boolean(selectedEvent)}
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
    gap: Spacing.three,
  },
  retry: {
    minWidth: 140,
  },
  content: {
    paddingHorizontal: ADMIN_LIST_HORIZONTAL_PADDING,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.six,
    gap: Spacing.four,
  },
  controls: {
    gap: Spacing.three,
  },
  periodNav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  navButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayButton: {
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  section: {
    gap: Spacing.two,
  },
  eventList: {
    gap: Spacing.two,
  },
});
