import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { GardenMonthGrid } from '@/components/parent/calendar/garden/garden-month-grid';
import { useParentCalendarView } from '@/components/parent/calendar/use-parent-calendar-view';
import {
  EventDetailSheet,
  EventFormSheet,
  type CommitteeEventFormState,
} from '@/components/parent/committees/garden/sheets/event-sheets';
import { closeThen, confirmDestructive, useGardenReadOnlyGate } from '@/components/parent/garden/feedback';
import { useGardenToast } from '@/components/parent/garden/toast';
import { Garden, GardenFonts } from '@/components/parent/garden/tokens';
import {
  DateStamp,
  GCard,
  GDashedRule,
  GHand,
  GOutlineButton,
  GPressable,
  GToyButton,
  gText,
} from '@/components/parent/garden/ui';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { canMemberEditItem } from '@/lib/parent/committees/attribution';
import {
  committeeEventsToOrganizationEvents,
  findCommitteeEventById,
} from '@/lib/parent/committees/committee-events-calendar';
import { createCommitteeEvent, deleteCommitteeEvent, updateCommitteeEvent } from '@/lib/parent/committees/mutations';
import type { ParentCommitteeSectionProps } from '@/lib/parent/committees/section-props';
import { EVENT_TYPE_LABELS, upcomingEvents } from '@/lib/parent/parent-committees-garden';
import type { CommitteeEvent } from '@/lib/parent/parent-committees-types';
import { groupOrganizationEventsByDate } from '@/lib/school-events/events';
import { useMobileErrorReporter } from '@/lib/use-mobile-error-reporter';

const EMPTY_FORM: CommitteeEventFormState = { title: '', date: '', time: '', eventType: 'meeting', location: '' };

function EventTicket({ event, onPress }: { event: CommitteeEvent; onPress: () => void }) {
  const meta = [EVENT_TYPE_LABELS[event.type] ?? event.type, event.time, event.location].filter(Boolean).join(' · ');
  return (
    <GPressable accessibilityLabel={`${event.title}, ${meta}. Open event`} pressedScale={0.99} onPress={onPress} style={styles.ticket}>
      <DateStamp date={event.date} />
      <GDashedRule vertical color={Garden.ink25} style={{ maxHeight: 64 }} />
      <View style={styles.flex}>
        <Text style={gText.itemTitle} numberOfLines={2}>
          {event.title}
        </Text>
        <Text style={gText.meta}>{meta}</Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color={Garden.ink60} />
    </GPressable>
  );
}

/** Committee calendar: month grid, the selected day and what's coming up. Same mutations and rules. */
export function WorkspaceCalendarSection({
  committee,
  organizationId,
  supabase,
  currentMemberId,
  readOnly = false,
  isAdmin = false,
  portalApiNamespace = 'parent-portal',
  onRefresh,
  initialEventId,
}: ParentCommitteeSectionProps) {
  const theme = useParentTheme();
  const toast = useGardenToast();
  const gate = useGardenReadOnlyGate();
  const { reportError } = useMobileErrorReporter(organizationId);
  const deepLinkHandled = useRef(false);

  const calendar = useParentCalendarView({ organizationId, supabase, theme, reportError });
  const { goToDate, setViewMode } = calendar;
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [formMode, setFormMode] = useState<'add' | 'edit' | null>(null);
  const [form, setForm] = useState<CommitteeEventFormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setViewMode('month');
  }, [setViewMode]);

  const orgEvents = useMemo(
    () => committeeEventsToOrganizationEvents(committee.events, organizationId),
    [committee.events, organizationId],
  );
  const eventsByDate = useMemo(() => groupOrganizationEventsByDate(orgEvents), [orgEvents]);
  const upcoming = useMemo(() => upcomingEvents(committee.events, calendar.today), [calendar.today, committee.events]);
  const dayEvents = useMemo(
    () => committee.events.filter((event) => event.date === calendar.selectedDate),
    [calendar.selectedDate, committee.events],
  );

  useEffect(() => {
    if (!initialEventId || deepLinkHandled.current) return;
    const match = findCommitteeEventById(committee.events, initialEventId);
    if (!match) return;
    goToDate(match.date);
    setSelectedEventId(initialEventId);
    deepLinkHandled.current = true;
  }, [committee.events, goToDate, initialEventId]);

  const selected = findCommitteeEventById(committee.events, selectedEventId);
  const canManage =
    !readOnly && selected != null && canMemberEditItem(selected.createdByMemberId, currentMemberId, isAdmin);

  const blocked = useCallback(() => {
    if (gate.readOnly) return gate.notifyReadOnly();
    toast.info('Only committee members can add events', { id: 'committee-calendar-readonly' });
  }, [gate, toast]);

  const openAdd = useCallback(
    (date?: string) => {
      if (readOnly) return blocked();
      setForm({ ...EMPTY_FORM, date: date ?? calendar.selectedDate ?? '' });
      setError(null);
      setFormMode('add');
    },
    [blocked, calendar.selectedDate, readOnly],
  );

  const onDayPress = useCallback(
    (date: string) => {
      calendar.setSelectedDate(date);
      const events = eventsByDate.get(date) ?? [];
      if (events.length > 0) {
        setSelectedEventId(events[0].id);
        return;
      }
      if (!readOnly) openAdd(date);
    },
    [calendar, eventsByDate, openAdd, readOnly],
  );

  const openEvent = (event: CommitteeEvent) => {
    calendar.setSelectedDate(event.date);
    setSelectedEventId(event.id);
  };

  const submit = useCallback(
    async (next: CommitteeEventFormState) => {
      setSaving(true);
      setError(null);
      const editing = formMode === 'edit' && selected;
      try {
        if (editing) {
          await updateCommitteeEvent(supabase, selected.id, {
            title: next.title.trim(),
            date: next.date,
            time: next.time || null,
            type: next.eventType,
            location: next.location || null,
          });
        } else {
          await createCommitteeEvent(supabase, committee.id, {
            title: next.title.trim(),
            date: next.date,
            time: next.time || undefined,
            type: next.eventType,
            location: next.location || undefined,
            createdByMemberId: currentMemberId,
            workspaceRecord: { organizationId, portalApiNamespace: isAdmin ? 'school-admin' : portalApiNamespace },
          });
        }
        closeThen(
          () => {
            setFormMode(null);
            if (editing) setSelectedEventId(null);
          },
          () =>
            toast.success(editing ? 'Event updated' : 'Event added', {
              description: `${next.title.trim()} · ${new Date(`${next.date}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
            }),
        );
        calendar.goToDate(next.date);
        await onRefresh();
      } catch (saveError) {
        reportError(editing ? 'committees.calendar.edit_event' : 'committees.calendar.add_event', saveError, {
          entityType: editing ? 'committee_event' : 'committee',
          entityId: editing ? selected.id : committee.id,
        });
        setError(saveError instanceof Error ? saveError.message : 'Failed to save event.');
      } finally {
        setSaving(false);
      }
    },
    [calendar, committee.id, currentMemberId, formMode, isAdmin, onRefresh, organizationId, portalApiNamespace, reportError, selected, supabase, toast],
  );

  const remove = useCallback(async () => {
    if (!selected) return;
    const confirmed = await confirmDestructive({
      title: 'Delete event?',
      message: `"${selected.title}" will be removed from the committee calendar.`,
    });
    if (!confirmed) return;
    const title = selected.title;
    try {
      await deleteCommitteeEvent(supabase, selected.id);
      closeThen(() => setSelectedEventId(null), () => toast.success('Event deleted', { description: `${title} is off the calendar.` }));
      await onRefresh();
    } catch (deleteError) {
      reportError('committees.calendar.delete_event', deleteError, { entityType: 'committee_event', entityId: selected.id });
      closeThen(() => setSelectedEventId(null), () =>
        toast.error("Couldn't delete the event", { description: 'Check your connection, then try again.' }),
      );
    }
  }, [onRefresh, reportError, selected, supabase, toast]);

  const openEdit = () => {
    if (!selected) return;
    setForm({
      title: selected.title,
      date: selected.date,
      time: selected.time ?? '',
      eventType: selected.type,
      location: selected.location ?? '',
    });
    setError(null);
    setFormMode('edit');
  };

  const selectedLabel = calendar.selectedDate
    ? new Date(`${calendar.selectedDate}T00:00:00`).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
    : null;

  return (
    <View style={styles.container}>
      <GCard index={0}>
        <View style={styles.toolbar}>
          <GPressable accessibilityLabel="Previous month" haptic="select" onPress={calendar.prevPeriod} style={styles.navButton}>
            <Ionicons name="chevron-back" size={20} color={Garden.ink} />
          </GPressable>
          <Text style={styles.period} accessibilityRole="header">
            {calendar.periodLabel}
          </Text>
          <GPressable accessibilityLabel="Next month" haptic="select" onPress={calendar.nextPeriod} style={styles.navButton}>
            <Ionicons name="chevron-forward" size={20} color={Garden.ink} />
          </GPressable>
        </View>
        <GardenMonthGrid
          year={calendar.viewYear}
          month={calendar.viewMonth}
          selectedDate={calendar.selectedDate}
          today={calendar.today}
          eventsByDate={eventsByDate}
          onSelectDate={onDayPress}
        />
        <View style={styles.toolbarFoot}>
          <GOutlineButton label="Today" icon="today-outline" onPress={calendar.goToToday} />
          {currentMemberId ? <GToyButton label="Add event" icon="add" onPress={() => openAdd()} /> : null}
        </View>
        {committee.events.length === 0 ? (
          <Text style={[gText.meta, styles.hint]}>No events yet. Tap a day to add one.</Text>
        ) : null}
      </GCard>

      {selectedLabel ? (
        <GCard title={selectedLabel} tone="paper" index={1}>
          {dayEvents.length === 0 ? (
            <Text style={gText.meta}>Nothing on this day.</Text>
          ) : (
            <View style={styles.list}>
              {dayEvents.map((event) => (
                <EventTicket key={event.id} event={event} onPress={() => openEvent(event)} />
              ))}
            </View>
          )}
        </GCard>
      ) : null}

      <GCard title="Coming up" index={2}>
        {upcoming.length === 0 ? (
          <View style={styles.list}>
            <Text style={gText.meta}>No upcoming dates.</Text>
            <GHand>A quiet stretch.</GHand>
          </View>
        ) : (
          <View style={styles.list}>
            {upcoming.slice(0, 8).map((event) => (
              <EventTicket key={event.id} event={event} onPress={() => openEvent(event)} />
            ))}
          </View>
        )}
      </GCard>

      <EventDetailSheet
        visible={Boolean(selected) && formMode !== 'edit'}
        event={selected}
        canManage={canManage}
        onClose={() => setSelectedEventId(null)}
        onEdit={openEdit}
        onDelete={() => void remove()}
      />
      <EventFormSheet
        visible={formMode !== null}
        title={formMode === 'edit' ? 'Edit event' : 'Add event'}
        submitLabel={saving ? 'Saving…' : formMode === 'edit' ? 'Save changes' : 'Add event'}
        initialForm={form}
        saving={saving}
        error={error}
        onClose={() => setFormMode(null)}
        onSubmit={(next) => void submit(next)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 16 },
  flex: { flex: 1, gap: 2 },
  toolbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  navButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: Garden.ink12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Garden.white,
  },
  period: { fontFamily: GardenFonts.display, fontSize: 20, color: Garden.ink },
  toolbarFoot: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 14 },
  hint: { marginTop: 10, textAlign: 'center' },
  list: { gap: 10 },
  ticket: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 16,
    backgroundColor: Garden.white,
    borderWidth: 1,
    borderColor: Garden.ink10,
  },
});
