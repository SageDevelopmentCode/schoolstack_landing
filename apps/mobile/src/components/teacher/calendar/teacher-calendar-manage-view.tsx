import { useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { SchoolEventDetailSheet } from '@/components/school-admin/schedule/school-event-detail-sheet';
import { SchoolEventFormSheet } from '@/components/school-admin/schedule/school-event-form-sheet';
import { ScheduleMonthCalendar } from '@/components/school-admin/schedule/schedule-month-calendar';
import { useOrganizationEventsManager } from '@/components/school-admin/schedule/use-organization-events-manager';
import { useScheduleCalendar } from '@/components/school-admin/schedule/use-schedule-calendar';
import { StoryCard } from '@/components/story/story-card';
import { StorySectionKicker } from '@/components/story/story-section-kicker';
import { StoryTextLink } from '@/components/story/story-text-link';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { Story, StoryCardPadding, StoryFonts } from '@/constants/story-theme';
import { SCREEN_HORIZONTAL_PADDING } from '@/constants/screen-layout';
import { Radius, Spacing } from '@/constants/theme';
import { groupOrganizationEventsByDate } from '@/lib/school-events/events';
import type { OrganizationEvent } from '@/lib/school-events/types';
import { getSupabaseClient } from '@/lib/supabase';
import { useMobileErrorReporter } from '@/lib/use-mobile-error-reporter';

type TeacherCalendarManageViewProps = {
  organizationId: string;
  events: OrganizationEvent[];
  isRefreshing: boolean;
  onRefresh: () => Promise<void>;
};

export function TeacherCalendarManageView({
  organizationId,
  events,
  isRefreshing,
  onRefresh,
}: TeacherCalendarManageViewProps) {
  const theme = useParentTheme();
  const supabase = useMemo(() => getSupabaseClient(), []);
  const { reportError } = useMobileErrorReporter(organizationId);
  const { eventId, date: dateParam } = useLocalSearchParams<{
    eventId?: string;
    date?: string;
  }>();
  const deepLinkHandledRef = useRef(false);

  const calendar = useScheduleCalendar({ organizationId, supabase, theme });
  const eventsByDate = useMemo(() => groupOrganizationEventsByDate(events), [events]);
  const eventDates = useMemo(() => new Set(eventsByDate.keys()), [eventsByDate]);

  const onAfterMutate = useCallback(async () => {
    await onRefresh();
  }, [onRefresh]);

  const manager = useOrganizationEventsManager({
    organizationId,
    events,
    onAfterMutate,
    reportError,
    reportErrorPrefix: 'teacher_calendar',
  });

  const handleDayPress = useCallback(
    (date: string) => {
      calendar.setSelectedDate(date);
      const dayEvents = eventsByDate.get(date) ?? [];
      if (dayEvents.length > 0) {
        manager.setSelectedEventId(dayEvents[0].id);
        return;
      }
      manager.openCreateForm(date);
    },
    [calendar, eventsByDate, manager],
  );

  useEffect(() => {
    if (deepLinkHandledRef.current) return;

    if (eventId) {
      const event = events.find((item) => item.id === eventId);
      if (event) {
        calendar.setSelectedDate(event.date);
        manager.setSelectedEventId(event.id);
        deepLinkHandledRef.current = true;
        return;
      }
    }

    if (dateParam) {
      calendar.setSelectedDate(dateParam);
      deepLinkHandledRef.current = true;
    }
  }, [calendar, dateParam, eventId, events, manager]);

  const dayEvents =
    calendar.selectedDate && eventsByDate.has(calendar.selectedDate)
      ? eventsByDate.get(calendar.selectedDate) ?? []
      : [];

  const emptyHint =
    events.length === 0
      ? 'No events yet — tap a day to add one, or use Add event.'
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
          <View style={styles.headerRow}>
            <View style={styles.headerCopy}>
              <StorySectionKicker style={styles.kicker}>School calendar</StorySectionKicker>
              <Text style={[styles.helperCopy, { color: theme.muted }]}>
                Add and manage events families see in the parent portal.
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              onPress={() => manager.openCreateForm(calendar.selectedDate ?? undefined)}
              style={({ pressed }) => [
                styles.addButton,
                { backgroundColor: theme.primary, opacity: pressed ? 0.9 : 1 },
              ]}>
              <Text style={styles.addButtonLabel}>Add event</Text>
            </Pressable>
          </View>

          <StoryCard compact style={styles.calendarCard}>
            <ScheduleMonthCalendar
              viewYear={calendar.viewYear}
              viewMonth={calendar.viewMonth}
              selectedDate={calendar.selectedDate}
              onSelectDate={handleDayPress}
              eventDates={eventDates}
              onPrevMonth={calendar.prevMonth}
              onNextMonth={calendar.nextMonth}
              colors={calendar.calendarColors}
            />
            {emptyHint ? (
              <Text style={[styles.emptyHint, { color: theme.muted }]}>{emptyHint}</Text>
            ) : null}
          </StoryCard>

          {calendar.selectedDate ? (
            <StoryCard compact style={styles.daySection}>
              <Text style={[styles.dayTitle, { color: theme.ink }]}>{calendar.selectedDate}</Text>
              {dayEvents.length === 0 ? (
                <Text style={[styles.helperCopy, { color: theme.muted }]}>No events on this day.</Text>
              ) : (
                dayEvents.map((event, index) => (
                  <Pressable
                    key={event.id}
                    accessibilityRole="button"
                    onPress={() => manager.setSelectedEventId(event.id)}
                    style={[
                      styles.eventRow,
                      index > 0 && {
                        borderTopColor: theme.line,
                        borderTopWidth: StyleSheet.hairlineWidth,
                      },
                    ]}>
                    <Text style={[styles.eventTitle, { color: theme.ink }]}>{event.title}</Text>
                    <Text style={[styles.eventMeta, { color: theme.muted }]}>
                      {event.isAllDay ? 'All day' : event.time}
                    </Text>
                  </Pressable>
                ))
              )}
              <StoryTextLink
                label="Add event on this day"
                onPress={() => manager.openCreateForm(calendar.selectedDate ?? undefined)}
              />
            </StoryCard>
          ) : null}
        </Animated.View>
      </ScrollView>

      <SchoolEventFormSheet
        visible={manager.formOpen}
        mode={manager.formMode}
        form={manager.form}
        isDirty={manager.isFormDirty}
        saving={manager.saving}
        onClose={() => manager.setFormOpen(false)}
        onChange={manager.setForm}
        onSave={() => void manager.handleSave()}
      />

      <SchoolEventDetailSheet
        visible={Boolean(manager.selectedEvent)}
        event={manager.selectedEvent}
        deleting={manager.deleting}
        onClose={() => manager.setSelectedEventId(null)}
        onEdit={() => {
          if (manager.selectedEvent) manager.openEditForm(manager.selectedEvent);
        }}
        onDelete={() => void manager.handleDelete()}
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.three,
  },
  headerCopy: {
    flex: 1,
    minWidth: 0,
    gap: Spacing.one,
  },
  kicker: {
    marginBottom: 0,
  },
  helperCopy: {
    fontFamily: StoryFonts.body,
    fontSize: 13,
    lineHeight: 18,
  },
  addButton: {
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.three,
    paddingVertical: 8,
  },
  addButtonLabel: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  calendarCard: {
    padding: StoryCardPadding,
  },
  emptyHint: {
    marginTop: Spacing.three,
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
  },
  daySection: {
    padding: StoryCardPadding,
    gap: Spacing.two,
  },
  dayTitle: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
  },
  eventRow: {
    paddingVertical: Spacing.two,
    gap: 2,
  },
  eventTitle: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
  },
  eventMeta: {
    fontFamily: StoryFonts.body,
    fontSize: 12,
    lineHeight: 16,
  },
});
