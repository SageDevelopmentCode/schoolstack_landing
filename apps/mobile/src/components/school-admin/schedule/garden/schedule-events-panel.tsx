import { useCallback, useEffect, useMemo, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

import { closeThen, confirmDestructive, useGardenPullRefresh, useGardenReadOnlyGate } from '@/components/parent/garden/feedback';
import { GDateField, GInlineBanner, GSwitchRow, GTextField } from '@/components/parent/garden/fields';
import { GSheet } from '@/components/parent/garden/sheet';
import { Garden, GardenFonts, useGardenAccent } from '@/components/parent/garden/tokens';
import { GCard, GLink, GOutlineButton, GPressable, GToyButton } from '@/components/parent/garden/ui';
import { AdminFormSheet, errorText, type AdminSheetNotice } from '@/components/school-admin/garden/admin-sheet';
import { AdminEmptyPanel, AdminInfoRow, AdminToolbarButton } from '@/components/school-admin/garden/admin-ui';
import { useAdminAction } from '@/components/school-admin/garden/use-admin-action';
import { AdminScheduleMonthGrid } from '@/components/school-admin/schedule/garden/schedule-garden-ui';
import type { EventFormState } from '@/components/school-admin/schedule/school-event-form-sheet';
import { useOrganizationEventsManager, type OrganizationEventsManagerFeedback } from '@/components/school-admin/schedule/use-organization-events-manager';
import { useScheduleCalendar } from '@/components/school-admin/schedule/use-schedule-calendar';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { haptic } from '@/lib/haptics';
import { formatDateOnlyLabel } from '@/lib/admissions/admissions-availability';
import { formatEventTimeRange } from '@/lib/school-events/calendar-time';
import {
  getColorStyle,
  getDefaultColorKeyForType,
  getEventDisplayStyle,
  SCHOOL_EVENT_COLOR_KEYS,
  SCHOOL_EVENT_TYPE_LABELS,
} from '@/lib/school-events/event-labels';
import { groupOrganizationEventsByDate, listEventsForOrg } from '@/lib/school-events/events';
import type { OrganizationEvent, SchoolEventType } from '@/lib/school-events/types';
import { getSupabaseClient } from '@/lib/supabase';

const EVENT_TYPES = Object.keys(SCHOOL_EVENT_TYPE_LABELS) as SchoolEventType[];

type Props = { organizationId: string; slug: string; onStatsChanged: () => Promise<void> };

/**
 * Schedule › Events: Garden month grid with event dots, the selected day's
 * events, and Garden add / edit / detail sheets on the shared events manager
 * (same API calls and `school_admin_schedule_event_*` operations).
 */
export function ScheduleEventsPanel({ organizationId, onStatsChanged }: Props) {
  const theme = useParentTheme();
  const supabase = useMemo(() => getSupabaseClient(), []);
  const action = useAdminAction(organizationId);
  const { reportError, toast } = action;
  const { readOnly, notifyReadOnly } = useGardenReadOnlyGate();
  const [events, setEvents] = useState<OrganizationEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [formNotice, setFormNotice] = useState<AdminSheetNotice | null>(null);
  const [detailError, setDetailError] = useState<string | null>(null);

  const calendar = useScheduleCalendar({ organizationId, supabase, theme });
  const eventsByDate = useMemo(() => groupOrganizationEventsByDate(events), [events]);
  const eventDates = useMemo(() => new Set(eventsByDate.keys()), [eventsByDate]);

  const loadEvents = useCallback(async () => {
    setLoadError(null);
    try {
      setEvents(await listEventsForOrg(supabase, organizationId));
    } catch (error) {
      reportError('school_admin_schedule_events_load', error);
      setLoadError(error instanceof Error ? error.message : 'Failed to load events.');
    } finally {
      setLoading(false);
    }
  }, [organizationId, reportError, supabase]);

  useEffect(() => {
    void loadEvents();
  }, [loadEvents]);

  const onAfterMutate = useCallback(async () => {
    await loadEvents();
    void onStatsChanged();
  }, [loadEvents, onStatsChanged]);

  const feedback = useMemo<OrganizationEventsManagerFeedback>(
    () => ({
      onValidationError: (title, message) => {
        haptic.warning();
        setFormNotice({ tone: 'info', title, description: message });
      },
      onSaved: ({ mode, title, date }) => {
        haptic.success();
        action.flash('schedule-event-saved');
        setTimeout(
          () =>
            toast.success(mode === 'create' ? 'Event added' : 'Event updated', {
              id: 'schedule-event-saved',
              description: `${title} · ${formatDateOnlyLabel(date)}. Families see it in the parent portal.`,
            }),
          220,
        );
      },
      onSaveError: (error) => {
        haptic.error();
        setFormNotice({ tone: 'error', title: "The event wasn't saved", description: `${errorText(error, 'Failed to save event.')} Your details are still here.` });
      },
      onDeleted: ({ title }) => {
        haptic.success();
        setTimeout(() => toast.success('Event deleted', { id: 'schedule-event-deleted', description: `${title} is off the calendar.` }), 220);
      },
      onDeleteError: (error) => {
        haptic.error();
        setDetailError(`${errorText(error, 'Failed to delete event.')} The event is still on the calendar.`);
      },
    }),
    [action, toast],
  );

  const manager = useOrganizationEventsManager({
    organizationId,
    events,
    onAfterMutate,
    reportError,
    reportErrorPrefix: 'school_admin_schedule',
    feedback,
  });

  const refreshPull = useCallback(async () => {
    await Promise.all([onStatsChanged(), loadEvents()]);
  }, [loadEvents, onStatsChanged]);
  const { pullRefreshing, onPullRefresh } = useGardenPullRefresh({ refresh: refreshPull, error: loadError, label: 'Events', id: 'admin-schedule-events-refresh' });

  const openCreate = (date?: string) => {
    if (readOnly) return notifyReadOnly();
    setFormNotice(null);
    manager.openCreateForm(date);
  };

  const openDetail = (id: string) => {
    setDetailError(null);
    manager.setSelectedEventId(id);
  };

  const deleteSelected = async () => {
    if (readOnly) return notifyReadOnly();
    const event = manager.selectedEvent;
    if (!event) return;
    const ok = await confirmDestructive({ title: 'Delete event?', message: `${event.title} will be removed from the parent calendar.` });
    if (!ok) return;
    setDetailError(null);
    await manager.handleDelete();
  };

  const selected = calendar.selectedDate;
  const dayEvents = selected ? eventsByDate.get(selected) ?? [] : [];
  const upcoming = useMemo(
    () => events.filter((event) => event.date >= calendar.today).slice(0, 6),
    [calendar.today, events],
  );

  return (
    <>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={pullRefreshing} onRefresh={() => void onPullRefresh()} tintColor={Garden.soft} />}>
        <View style={styles.introRow}>
          <Text style={styles.helper}>Manage the calendar families see in the parent portal.</Text>
          <AdminToolbarButton icon="add" label="Add event" accessibilityLabel="Add event" onPress={() => openCreate(selected ?? undefined)} />
        </View>
        {loadError ? (
          <GInlineBanner
            tone="error"
            title="Couldn't load events"
            description={loadError}
            action={<GLink label="Try again" icon="refresh" onPress={() => void loadEvents()} />}
          />
        ) : null}
        <AdminScheduleMonthGrid
          viewYear={calendar.viewYear}
          viewMonth={calendar.viewMonth}
          selectedDate={selected}
          onSelectDate={calendar.setSelectedDate}
          eventDates={eventDates}
          minDate={calendar.today}
          today={calendar.today}
          onPrevMonth={calendar.prevMonth}
          onNextMonth={calendar.nextMonth}
          onToday={calendar.goToToday}
          loading={loading}
        />

        {selected ? (
          <GCard index={0} title={formatDateOnlyLabel(selected)} action={<GLink label="Add" icon="add" onPress={() => openCreate(selected)} />}>
            {dayEvents.length === 0 ? (
              <AdminEmptyPanel icon="calendar-clear-outline" title="No events on this day." actionLabel="Add event on this day" onAction={() => openCreate(selected)} />
            ) : (
              dayEvents.map((event, index) => <EventRow key={event.id} event={event} divider={index > 0} onPress={() => openDetail(event.id)} />)
            )}
          </GCard>
        ) : (
          <GCard index={0} title="Coming up">
            {loading ? null : upcoming.length === 0 ? (
              <AdminEmptyPanel
                icon="calendar-outline"
                title="No school events yet."
                body="Add field trips, no-school days, and community events."
                actionLabel="Add event"
                onAction={() => openCreate()}
              />
            ) : (
              <>
                <Text style={styles.helper}>Tap a day above to see or add its events.</Text>
                {upcoming.map((event, index) => (
                  <EventRow key={event.id} event={event} showDate divider={index > 0} onPress={() => openDetail(event.id)} />
                ))}
              </>
            )}
          </GCard>
        )}
      </ScrollView>

      <EventFormSheet
        visible={manager.formOpen}
        mode={manager.formMode}
        form={manager.form}
        isDirty={manager.isFormDirty}
        saving={manager.saving}
        notice={formNotice}
        onClose={() => {
          setFormNotice(null);
          manager.setFormOpen(false);
        }}
        onChange={(next) => {
          if (formNotice?.tone === 'info') setFormNotice(null);
          manager.setForm(next);
        }}
        onSave={() => {
          if (readOnly) return notifyReadOnly();
          setFormNotice(null);
          void manager.handleSave();
        }}
      />

      <EventDetailSheet
        event={manager.selectedEvent}
        deleting={manager.deleting}
        error={detailError}
        onClose={() => manager.setSelectedEventId(null)}
        onEdit={() => {
          const event = manager.selectedEvent;
          if (!event) return;
          if (readOnly) return notifyReadOnly();
          setFormNotice(null);
          closeThen(() => manager.setSelectedEventId(null), () => manager.openEditForm(event));
        }}
        onDelete={() => void deleteSelected()}
      />
    </>
  );
}

function EventRow({ event, onPress, divider, showDate = false }: { event: OrganizationEvent; onPress: () => void; divider?: boolean; showDate?: boolean }) {
  const colors = getEventDisplayStyle(event);
  const when = event.isAllDay ? 'All day' : event.time;
  return (
    <GPressable
      accessibilityLabel={`${event.title}. ${showDate ? `${event.date}, ` : ''}${when ?? ''}. ${SCHOOL_EVENT_TYPE_LABELS[event.type]}`}
      onPress={onPress}
      style={[styles.eventRow, divider && styles.divider]}>
      <View style={[styles.eventBar, { backgroundColor: colors.text }]} />
      <View style={styles.eventCopy}>
        <Text numberOfLines={1} style={styles.eventTitle}>
          {event.title}
        </Text>
        <Text style={styles.eventMeta}>{showDate ? `${event.date} · ${when ?? ''}` : when}</Text>
      </View>
      <View style={[styles.badge, { backgroundColor: colors.bg }]}>
        <Text style={[styles.badgeText, { color: colors.text }]}>{SCHOOL_EVENT_TYPE_LABELS[event.type]}</Text>
      </View>
    </GPressable>
  );
}

/** Garden add / edit event form (also used by the teacher Calendar when staff can manage events). */
export function EventFormSheet({
  visible,
  mode,
  form,
  isDirty,
  saving,
  notice,
  onClose,
  onChange,
  onSave,
  subtitle,
}: {
  visible: boolean;
  mode: 'create' | 'edit';
  form: EventFormState;
  isDirty: boolean;
  saving: boolean;
  notice: AdminSheetNotice | null;
  onClose: () => void;
  onChange: (form: EventFormState) => void;
  onSave: () => void;
  /** Defaults to "Families see it in the parent portal." when adding. */
  subtitle?: string;
}) {
  const accent = useGardenAccent();
  const isValid = Boolean(form.title.trim() && form.date && (form.isAllDay || form.time.trim()));
  const missing = [!form.title.trim() && 'title', !form.date && 'date', !form.isAllDay && !form.time.trim() && 'start time'].filter(Boolean);
  const statusLine = saving ? 'Saving event…' : missing.length > 0 ? `Still needed: ${missing.join(', ')}` : isDirty ? 'Ready to save' : 'No changes yet';

  return (
    <AdminFormSheet
      visible={visible}
      onClose={onClose}
      title={mode === 'create' ? 'Add event' : 'Edit event'}
      subtitle={subtitle ?? (mode === 'create' ? 'Families see it in the parent portal.' : form.title || null)}
      isDirty={isDirty}
      saving={saving}
      canSave={isDirty && isValid}
      saveLabel="Save"
      statusLine={statusLine}
      notice={notice}
      onSave={onSave}>
      <GTextField label="Title" value={form.title} onChangeText={(title) => onChange({ ...form, title })} placeholder="Event title" />
      <GDateField label="Date" value={form.date} onChange={(date) => onChange({ ...form, date })} />
      <GSwitchRow label="All day" value={form.isAllDay} onValueChange={(isAllDay) => onChange({ ...form, isAllDay })} />
      {!form.isAllDay ? (
        <View style={styles.timeRow}>
          <GTextField
            style={styles.timeField}
            label="Start time (HH:MM)"
            value={form.time}
            onChangeText={(time) => onChange({ ...form, time })}
            placeholder="09:00"
            autoCapitalize="none"
            keyboardType="numbers-and-punctuation"
          />
          <GTextField
            style={styles.timeField}
            label="End time (HH:MM)"
            optional
            value={form.endTime}
            onChangeText={(endTime) => onChange({ ...form, endTime })}
            placeholder="10:00"
            autoCapitalize="none"
            keyboardType="numbers-and-punctuation"
            helper="Defaults to 1 hour"
          />
        </View>
      ) : null}
      <View style={styles.field}>
        <Text style={styles.fieldLabel}>Type</Text>
        <View style={styles.chips}>
          {EVENT_TYPES.map((type) => {
            const active = form.eventType === type;
            return (
              <GPressable
                key={type}
                accessibilityRole="radio"
                accessibilityLabel={SCHOOL_EVENT_TYPE_LABELS[type]}
                accessibilityState={{ selected: active }}
                haptic="select"
                onPress={() =>
                  onChange({ ...form, eventType: type, colorKey: form.colorManuallySet ? form.colorKey : getDefaultColorKeyForType(type) })
                }
                style={[styles.chip, active ? { backgroundColor: accent.clay, borderColor: accent.clay } : null]}>
                <Text style={[styles.chipLabel, active && { color: Garden.white }]}>{SCHOOL_EVENT_TYPE_LABELS[type]}</Text>
              </GPressable>
            );
          })}
        </View>
      </View>
      <View style={styles.field}>
        <Text style={styles.fieldLabel}>Color</Text>
        <View style={styles.chips}>
          {SCHOOL_EVENT_COLOR_KEYS.map((colorKey) => {
            const active = form.colorKey === colorKey;
            const color = getColorStyle(colorKey);
            return (
              <GPressable
                key={colorKey}
                accessibilityRole="radio"
                accessibilityLabel={`Color ${colorKey}`}
                accessibilityState={{ selected: active }}
                haptic="select"
                onPress={() => onChange({ ...form, colorKey, colorManuallySet: true })}
                style={[styles.swatch, { backgroundColor: color.bg, borderColor: active ? Garden.ink : 'transparent' }]}>
                {active ? <View style={[styles.swatchDot, { backgroundColor: color.text }]} /> : null}
              </GPressable>
            );
          })}
        </View>
      </View>
      <GTextField label="Location" optional value={form.location} onChangeText={(location) => onChange({ ...form, location })} placeholder="Optional" />
      <GTextField
        label="Description"
        optional
        value={form.description}
        onChangeText={(description) => onChange({ ...form, description })}
        placeholder="Optional details"
        multiline
      />
    </AdminFormSheet>
  );
}

function EventDetailSheet({
  event,
  deleting,
  error,
  onClose,
  onEdit,
  onDelete,
}: {
  event: OrganizationEvent | null;
  deleting: boolean;
  error: string | null;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const colors = event ? getEventDisplayStyle(event) : null;
  return (
    <GSheet
      visible={event != null}
      onClose={onClose}
      title={event?.title ?? 'Event'}
      subtitle={event ? SCHOOL_EVENT_TYPE_LABELS[event.type] : undefined}
      headerAside={colors ? <View style={[styles.detailSwatch, { backgroundColor: colors.bg, borderColor: colors.text }]} /> : null}
      footer={
        <View style={styles.detailFooter}>
          <GOutlineButton label={deleting ? 'Deleting…' : 'Delete event'} icon="trash-outline" onPress={onDelete} accessibilityLabel="Delete event" />
          <GToyButton label="Edit" icon="create-outline" onPress={onEdit} disabled={deleting} />
        </View>
      }>
      {event ? (
        <View>
          {error ? <GInlineBanner tone="error" title="Couldn't delete the event" description={error} /> : null}
          <AdminInfoRow label="Date" value={formatDateOnlyLabel(event.date)} />
          <AdminInfoRow label="Time" value={formatEventTimeRange(event)} divider />
          {event.location ? <AdminInfoRow label="Location" value={event.location} divider /> : null}
          {event.description ? <AdminInfoRow label="Description" value={event.description} divider /> : null}
        </View>
      ) : null}
    </GSheet>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 16, paddingTop: 6, paddingBottom: 40, gap: 14 },
  introRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  helper: { flex: 1, fontFamily: GardenFonts.bodySemi, fontSize: 13.5, lineHeight: 19, color: Garden.soft },
  divider: { borderTopWidth: 1, borderTopColor: Garden.ink06 },
  eventRow: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 56, paddingVertical: 8 },
  eventBar: { width: 4, alignSelf: 'stretch', borderRadius: 2 },
  eventCopy: { flex: 1, minWidth: 0, gap: 2 },
  eventTitle: { fontFamily: GardenFonts.bodyExtra, fontSize: 15, color: Garden.ink },
  eventMeta: { fontFamily: GardenFonts.bodySemi, fontSize: 13, color: Garden.soft, fontVariant: ['tabular-nums'] },
  badge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { fontFamily: GardenFonts.bodyExtra, fontSize: 12 },
  timeRow: { flexDirection: 'row', gap: 10 },
  timeField: { flex: 1 },
  field: { gap: 8 },
  fieldLabel: { fontFamily: GardenFonts.bodyExtra, fontSize: 14, color: Garden.ink },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    minHeight: 40,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: Garden.ink15,
    backgroundColor: Garden.white,
    justifyContent: 'center',
  },
  chipLabel: { fontFamily: GardenFonts.bodyExtra, fontSize: 14, color: Garden.ink },
  swatch: { width: 40, height: 40, borderRadius: 20, borderWidth: 2.5, alignItems: 'center', justifyContent: 'center' },
  swatchDot: { width: 12, height: 12, borderRadius: 6 },
  detailSwatch: { width: 22, height: 22, borderRadius: 11, borderWidth: 2 },
  detailFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
});
