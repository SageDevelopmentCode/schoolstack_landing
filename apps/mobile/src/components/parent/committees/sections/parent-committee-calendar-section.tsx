import { useCallback, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { ScheduleMonthCalendar } from '@/components/school-admin/schedule/schedule-month-calendar';
import {
  ParentCommitteeEventDetailSheet,
} from '@/components/parent/committees/parent-committee-event-detail-sheet';
import {
  ParentCommitteeEventFormSheet,
  type CommitteeEventFormState,
} from '@/components/parent/committees/parent-committee-event-form-sheet';
import { ParentCalendarAgendaPanel } from '@/components/parent/calendar/parent-calendar-agenda-panel';
import { ParentCalendarDayGrid } from '@/components/parent/calendar/parent-calendar-day-grid';
import { ParentCalendarToolbar } from '@/components/parent/calendar/parent-calendar-toolbar';
import { ParentCalendarWeekStrip } from '@/components/parent/calendar/parent-calendar-week-strip';
import { useParentCalendarView } from '@/components/parent/calendar/use-parent-calendar-view';
import { StoryButton } from '@/components/story/story-button';
import { StoryCard } from '@/components/story/story-card';
import { StoryDetailSection } from '@/components/school-admin/admissions/story-detail-section';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { canMemberEditItem } from '@/lib/parent/committees/attribution';
import {
  committeeEventsToOrganizationEvents,
  findCommitteeEventById,
} from '@/lib/parent/committees/committee-events-calendar';
import {
  createCommitteeEvent,
  deleteCommitteeEvent,
  updateCommitteeEvent,
} from '@/lib/parent/committees/mutations';
import type { ParentCommitteeSectionProps } from '@/lib/parent/committees/section-props';
import type { CommitteeEvent } from '@/lib/parent/parent-committees-types';
import { StoryCardPadding, StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';
import { groupOrganizationEventsByDate } from '@/lib/school-events/events';
import type { OrganizationEvent } from '@/lib/school-events/types';
import { useMobileErrorReporter } from '@/lib/use-mobile-error-reporter';

const EMPTY_EVENT_FORM: CommitteeEventFormState = {
  title: '',
  date: '',
  time: '',
  eventType: 'meeting',
  location: '',
};

export function ParentCommitteeCalendarSection({
  committee,
  organizationId,
  supabase,
  currentMemberId,
  readOnly = false,
  isAdmin = false,
  onRefresh,
}: ParentCommitteeSectionProps) {
  const theme = useParentTheme();
  const { reportError } = useMobileErrorReporter(organizationId);

  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [eventForm, setEventForm] = useState<CommitteeEventFormState>(EMPTY_EVENT_FORM);
  const [saving, setSaving] = useState(false);

  const calendar = useParentCalendarView({
    organizationId,
    supabase,
    theme,
  });

  const calendarEvents = useMemo(
    () => committeeEventsToOrganizationEvents(committee.events, organizationId),
    [committee.events, organizationId],
  );
  const eventsByDate = useMemo(() => groupOrganizationEventsByDate(calendarEvents), [calendarEvents]);
  const eventDates = useMemo(() => new Set(eventsByDate.keys()), [eventsByDate]);

  const selectedCommitteeEvent = findCommitteeEventById(committee.events, selectedEventId);
  const canManageSelected =
    selectedCommitteeEvent != null &&
    canMemberEditItem(selectedCommitteeEvent.createdByMemberId, currentMemberId, isAdmin);

  const openAddForm = useCallback((prefillDate?: string) => {
    if (readOnly) return;
    setEventForm({
      ...EMPTY_EVENT_FORM,
      date: prefillDate ?? calendar.selectedDate ?? '',
    });
    setAddOpen(true);
  }, [calendar.selectedDate, readOnly]);

  const handleDayPress = useCallback(
    (date: string) => {
      calendar.setSelectedDate(date);
      const dayEvents = eventsByDate.get(date) ?? [];
      if (dayEvents.length > 0) {
        setSelectedEventId(dayEvents[0].id);
        return;
      }
      if (!readOnly) {
        openAddForm(date);
      }
    },
    [calendar, eventsByDate, openAddForm, readOnly],
  );

  const handleEventPress = useCallback((event: OrganizationEvent) => {
    setSelectedEventId(event.id);
    calendar.setSelectedDate(event.date);
  }, [calendar]);

  const handleAdd = useCallback(async (form: CommitteeEventFormState) => {
    if (!form.title.trim() || !form.date) return;
    setSaving(true);
    try {
      await createCommitteeEvent(supabase, committee.id, {
        title: form.title.trim(),
        date: form.date,
        time: form.time || undefined,
        type: form.eventType,
        location: form.location || undefined,
        createdByMemberId: currentMemberId,
      });
      setAddOpen(false);
      setEventForm(EMPTY_EVENT_FORM);
      await onRefresh();
    } catch (error) {
      reportError('committees.calendar.add_event', error, {
        entityType: 'committee',
        entityId: committee.id,
      });
    } finally {
      setSaving(false);
    }
  }, [committee.id, currentMemberId, onRefresh, reportError, supabase]);

  const handleEdit = useCallback(async (form: CommitteeEventFormState) => {
    if (!selectedCommitteeEvent || !form.title.trim() || !form.date) return;
    setSaving(true);
    try {
      await updateCommitteeEvent(supabase, selectedCommitteeEvent.id, {
        title: form.title.trim(),
        date: form.date,
        time: form.time || null,
        type: form.eventType,
        location: form.location || null,
      });
      setEditOpen(false);
      setSelectedEventId(null);
      await onRefresh();
    } catch (error) {
      reportError('committees.calendar.edit_event', error, {
        entityType: 'committee_event',
        entityId: selectedCommitteeEvent.id,
      });
    } finally {
      setSaving(false);
    }
  }, [onRefresh, reportError, selectedCommitteeEvent, supabase]);

  const handleDelete = useCallback(async () => {
    if (!selectedCommitteeEvent) return;
    setSaving(true);
    try {
      await deleteCommitteeEvent(supabase, selectedCommitteeEvent.id);
      setSelectedEventId(null);
      await onRefresh();
    } catch (error) {
      reportError('committees.calendar.delete_event', error, {
        entityType: 'committee_event',
        entityId: selectedCommitteeEvent.id,
      });
    } finally {
      setSaving(false);
    }
  }, [onRefresh, reportError, selectedCommitteeEvent, supabase]);

  const openEditForm = useCallback(() => {
    if (!selectedCommitteeEvent) return;
    setEventForm({
      title: selectedCommitteeEvent.title,
      date: selectedCommitteeEvent.date,
      time: selectedCommitteeEvent.time ?? '',
      eventType: selectedCommitteeEvent.type,
      location: selectedCommitteeEvent.location ?? '',
    });
    setEditOpen(true);
  }, [selectedCommitteeEvent]);

  return (
    <View style={styles.container}>
      <StoryDetailSection title="Calendar">
        {!readOnly ? (
          <StoryButton
            label="Add event"
            previewSafe
            onPress={() => openAddForm()}
            style={styles.addButton}
          />
        ) : null}

        <Animated.View entering={FadeIn.duration(220)}>
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
                selectedEventId={selectedEventId}
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

            {calendarEvents.length === 0 ? (
              <Text style={[styles.emptyHint, { color: theme.muted }]}>
                No events yet. Tap a day to add one.
              </Text>
            ) : null}
          </StoryCard>
        </Animated.View>

        <ParentCalendarAgendaPanel
          events={calendarEvents}
          selectedEventId={selectedEventId}
          onEventPress={handleEventPress}
        />
      </StoryDetailSection>

      <ParentCommitteeEventDetailSheet
        visible={Boolean(selectedCommitteeEvent) && !editOpen}
        event={selectedCommitteeEvent}
        canEdit={canManageSelected}
        canDelete={canManageSelected}
        onClose={() => setSelectedEventId(null)}
        onEdit={canManageSelected ? openEditForm : undefined}
        onDelete={canManageSelected ? () => void handleDelete() : undefined}
      />

      <ParentCommitteeEventFormSheet
        visible={addOpen}
        title="Add event"
        submitLabel={saving ? 'Saving…' : 'Add event'}
        initialForm={eventForm}
        saving={saving}
        onClose={() => setAddOpen(false)}
        onSubmit={handleAdd}
      />

      <ParentCommitteeEventFormSheet
        visible={editOpen}
        title="Edit event"
        submitLabel={saving ? 'Saving…' : 'Save changes'}
        initialForm={eventForm}
        saving={saving}
        onClose={() => setEditOpen(false)}
        onSubmit={handleEdit}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.two,
  },
  addButton: {
    alignSelf: 'flex-start',
    marginBottom: Spacing.two,
  },
  calendarCard: {
    padding: StoryCardPadding,
  },
  monthCalendar: {
    marginTop: Spacing.two,
  },
  emptyHint: {
    marginTop: Spacing.three,
    fontFamily: StoryFonts.body,
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
  },
});
