import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

import { SchoolEventDetailSheet } from '@/components/school-admin/schedule/school-event-detail-sheet';
import { SchoolEventFormSheet } from '@/components/school-admin/schedule/school-event-form-sheet';
import { ScheduleMonthCalendar } from '@/components/school-admin/schedule/schedule-month-calendar';
import { useOrganizationEventsManager } from '@/components/school-admin/schedule/use-organization-events-manager';
import { useScheduleCalendar } from '@/components/school-admin/schedule/use-schedule-calendar';
import { StoryCard } from '@/components/story/story-card';
import { StorySectionKicker } from '@/components/story/story-section-kicker';
import { StoryTextLink } from '@/components/story/story-text-link';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { StoryCardPadding, StoryFonts } from '@/constants/story-theme';
import { SCREEN_HORIZONTAL_PADDING } from '@/constants/screen-layout';
import { Radius, Spacing } from '@/constants/theme';
import { groupOrganizationEventsByDate, listEventsForOrg } from '@/lib/school-events/events';
import type { OrganizationEvent } from '@/lib/school-events/types';
import { getSupabaseClient } from '@/lib/supabase';
import { useMobileErrorReporter } from '@/lib/use-mobile-error-reporter';

type ScheduleEventsTabProps = {
  organizationId: string;
  refreshing: boolean;
  onRefresh: () => void;
};

export function ScheduleEventsTab({ organizationId, refreshing, onRefresh }: ScheduleEventsTabProps) {
  const theme = useParentTheme();
  const supabase = useMemo(() => getSupabaseClient(), []);
  const { reportError } = useMobileErrorReporter(organizationId);

  const [events, setEvents] = useState<OrganizationEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const calendar = useScheduleCalendar({ organizationId, supabase, theme });
  const eventsByDate = useMemo(() => groupOrganizationEventsByDate(events), [events]);
  const eventDates = useMemo(() => new Set(eventsByDate.keys()), [eventsByDate]);

  const loadEvents = useCallback(async () => {
    setLoading(true);
    try {
      const rows = await listEventsForOrg(supabase, organizationId);
      setEvents(rows);
    } catch (error) {
      reportError('school_admin_schedule_events_load', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to load events.');
    } finally {
      setLoading(false);
    }
  }, [organizationId, reportError, supabase]);

  const onAfterMutate = useCallback(async () => {
    await loadEvents();
    onRefresh();
  }, [loadEvents, onRefresh]);

  const manager = useOrganizationEventsManager({
    organizationId,
    events,
    onAfterMutate,
    reportError,
    reportErrorPrefix: 'school_admin_schedule',
  });

  useEffect(() => {
    void loadEvents();
  }, [loadEvents]);

  const dayEvents =
    calendar.selectedDate && eventsByDate.has(calendar.selectedDate)
      ? eventsByDate.get(calendar.selectedDate) ?? []
      : [];

  return (
    <>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing || loading}
            onRefresh={() => {
              onRefresh();
              void loadEvents();
            }}
            tintColor={theme.primary}
          />
        }>
        <View style={styles.headerRow}>
          <View style={styles.headerCopy}>
            <StorySectionKicker style={styles.kicker}>School events</StorySectionKicker>
            <Text style={[styles.helperCopy, { color: theme.muted }]}>
              Manage the calendar families see in the parent portal.
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

        <StoryCard style={styles.calendarCard}>
          <ScheduleMonthCalendar
            viewYear={calendar.viewYear}
            viewMonth={calendar.viewMonth}
            selectedDate={calendar.selectedDate}
            onSelectDate={calendar.setSelectedDate}
            eventDates={eventDates}
            minDate={calendar.today}
            onPrevMonth={calendar.prevMonth}
            onNextMonth={calendar.nextMonth}
            colors={calendar.calendarColors}
          />
        </StoryCard>

        {calendar.selectedDate ? (
          <StoryCard style={styles.daySection}>
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
                    index > 0 && { borderTopColor: theme.line, borderTopWidth: StyleSheet.hairlineWidth },
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
  content: {
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingBottom: Spacing.six,
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
