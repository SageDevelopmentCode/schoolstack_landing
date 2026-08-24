import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import { ADMIN_LIST_HORIZONTAL_PADDING } from '@/components/school-admin/admin-list-layout';
import {
  EMPTY_EVENT_FORM,
  SchoolEventFormSheet,
  type EventFormState,
} from '@/components/school-admin/schedule/school-event-form-sheet';
import { SchoolEventDetailSheet } from '@/components/school-admin/schedule/school-event-detail-sheet';
import { ScheduleMonthCalendar } from '@/components/school-admin/schedule/schedule-month-calendar';
import { useScheduleCalendar } from '@/components/school-admin/schedule/use-schedule-calendar';
import { ThemedText } from '@/components/themed-text';
import { useAdminTheme } from '@/contexts/admin-theme-context';
import { Radius, Spacing } from '@/constants/theme';
import { addMinutesToTimeInput, DEFAULT_EVENT_DURATION_MINUTES, toTimeInputValue } from '@/lib/school-events/calendar-time';
import { getDefaultColorKeyForType } from '@/lib/school-events/event-labels';
import {
  createOrganizationEvent,
  deleteOrganizationEvent,
  groupOrganizationEventsByDate,
  listEventsForOrg,
  updateOrganizationEvent,
} from '@/lib/school-events/events';
import type { OrganizationEvent } from '@/lib/school-events/types';
import { getSupabaseClient } from '@/lib/supabase';

type ScheduleEventsTabProps = {
  organizationId: string;
  refreshing: boolean;
  onRefresh: () => void;
};

export function ScheduleEventsTab({ organizationId, refreshing, onRefresh }: ScheduleEventsTabProps) {
  const theme = useAdminTheme();
  const supabase = useMemo(() => getSupabaseClient(), []);

  const [events, setEvents] = useState<OrganizationEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [form, setForm] = useState<EventFormState>(EMPTY_EVENT_FORM);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const calendar = useScheduleCalendar({ organizationId, supabase, theme });
  const selectedEvent = events.find((event) => event.id === selectedEventId) ?? null;
  const eventsByDate = useMemo(() => groupOrganizationEventsByDate(events), [events]);
  const eventDates = useMemo(() => new Set(eventsByDate.keys()), [eventsByDate]);

  const loadEvents = useCallback(async () => {
    setLoading(true);
    try {
      const rows = await listEventsForOrg(supabase, organizationId);
      setEvents(rows);
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to load events.');
    } finally {
      setLoading(false);
    }
  }, [organizationId, supabase]);

  useEffect(() => {
    void loadEvents();
  }, [loadEvents]);

  const openCreateForm = (prefillDate?: string) => {
    setSelectedEventId(null);
    setEditingEventId(null);
    setFormMode('create');
    setForm({
      ...EMPTY_EVENT_FORM,
      date: prefillDate ?? calendar.selectedDate ?? '',
      colorKey: getDefaultColorKeyForType(EMPTY_EVENT_FORM.eventType),
    });
    setFormOpen(true);
  };

  const openEditForm = (event: OrganizationEvent) => {
    setSelectedEventId(null);
    setEditingEventId(event.id);
    setFormMode('edit');
    setForm({
      title: event.title,
      date: event.date,
      time: toTimeInputValue(event.time),
      endTime: toTimeInputValue(event.endTime),
      isAllDay: event.isAllDay,
      eventType: event.type,
      colorKey: event.colorKey ?? getDefaultColorKeyForType(event.type),
      colorManuallySet: Boolean(event.colorKey),
      location: event.location ?? '',
      description: event.description ?? '',
    });
    setFormOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.date) return;
    if (!form.isAllDay && !form.time) {
      Alert.alert('Missing time', 'Add a start time or mark the event as all day.');
      return;
    }

    setSaving(true);
    try {
      const endTime =
        !form.isAllDay && form.time && !form.endTime
          ? addMinutesToTimeInput(form.time, DEFAULT_EVENT_DURATION_MINUTES)
          : form.endTime;

      if (formMode === 'create') {
        await createOrganizationEvent(supabase, organizationId, {
          title: form.title,
          date: form.date,
          time: form.isAllDay ? undefined : form.time,
          endTime: form.isAllDay ? undefined : endTime,
          isAllDay: form.isAllDay,
          type: form.eventType,
          colorKey: form.colorKey,
          location: form.location,
          description: form.description,
        });
      } else if (editingEventId) {
        await updateOrganizationEvent(supabase, editingEventId, {
          title: form.title,
          date: form.date,
          time: form.isAllDay ? null : form.time,
          endTime: form.isAllDay ? null : endTime,
          isAllDay: form.isAllDay,
          type: form.eventType,
          colorKey: form.colorKey,
          location: form.location,
          description: form.description,
        });
      }

      setFormOpen(false);
      await loadEvents();
      onRefresh();
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to save event.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedEvent) return;
    setDeleting(true);
    try {
      await deleteOrganizationEvent(supabase, selectedEvent.id);
      setSelectedEventId(null);
      await loadEvents();
      onRefresh();
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to delete event.');
    } finally {
      setDeleting(false);
    }
  };

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
            tintColor={theme.accent}
          />
        }>
        <View style={styles.headerRow}>
          <ThemedText type="smallBold" style={{ color: theme.textPrimary }}>
            School calendar
          </ThemedText>
          <Pressable
            accessibilityRole="button"
            onPress={() => openCreateForm()}
            style={[styles.addButton, { backgroundColor: theme.accent }]}>
            <ThemedText type="smallBold" style={{ color: '#FFFFFF' }}>
              Add event
            </ThemedText>
          </Pressable>
        </View>

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

        {calendar.selectedDate ? (
          <View style={styles.daySection}>
            <ThemedText type="smallBold" style={{ color: theme.textPrimary }}>
              {calendar.selectedDate}
            </ThemedText>
            {dayEvents.length === 0 ? (
              <ThemedText type="small" style={{ color: theme.textTertiary }}>
                No events on this day.
              </ThemedText>
            ) : (
              dayEvents.map((event) => (
                <Pressable
                  key={event.id}
                  accessibilityRole="button"
                  onPress={() => setSelectedEventId(event.id)}
                  style={[styles.eventRow, { borderColor: theme.border, backgroundColor: theme.surface }]}>
                  <ThemedText type="smallBold" style={{ color: theme.textPrimary }}>
                    {event.title}
                  </ThemedText>
                  <ThemedText type="small" style={{ color: theme.textSecondary }}>
                    {event.isAllDay ? 'All day' : event.time}
                  </ThemedText>
                </Pressable>
              ))
            )}
            <Pressable accessibilityRole="button" onPress={() => openCreateForm(calendar.selectedDate ?? undefined)}>
              <ThemedText type="smallBold" style={{ color: theme.accent }}>
                Add event on this day
              </ThemedText>
            </Pressable>
          </View>
        ) : null}
      </ScrollView>

      <SchoolEventFormSheet
        visible={formOpen}
        mode={formMode}
        form={form}
        saving={saving}
        onClose={() => setFormOpen(false)}
        onChange={setForm}
        onSave={() => void handleSave()}
      />

      <SchoolEventDetailSheet
        visible={Boolean(selectedEvent)}
        event={selectedEvent}
        deleting={deleting}
        onClose={() => setSelectedEventId(null)}
        onEdit={() => {
          if (selectedEvent) openEditForm(selectedEvent);
        }}
        onDelete={() => void handleDelete()}
      />
    </>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: ADMIN_LIST_HORIZONTAL_PADDING,
    paddingBottom: Spacing.six,
    gap: Spacing.four,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
  },
  addButton: {
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  daySection: {
    gap: Spacing.two,
  },
  eventRow: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.md,
    padding: Spacing.three,
    gap: 2,
  },
});
