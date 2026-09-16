import { useCallback, useMemo, useState } from 'react';
import { Alert } from 'react-native';

import {
  EMPTY_EVENT_FORM,
  eventFormsEqual,
  type EventFormState,
} from '@/components/school-admin/schedule/school-event-form-sheet';
import {
  addMinutesToTimeInput,
  DEFAULT_EVENT_DURATION_MINUTES,
  toTimeInputValue,
} from '@/lib/school-events/calendar-time';
import {
  createOrganizationEventViaApi,
  deleteOrganizationEventViaApi,
  updateOrganizationEventViaApi,
} from '@/lib/school-events/event-api';
import { getDefaultColorKeyForType } from '@/lib/school-events/event-labels';
import type { OrganizationEvent } from '@/lib/school-events/types';
import type { MobileErrorReporter } from '@/lib/mobile-error-reporter';

type UseOrganizationEventsManagerOptions = {
  organizationId: string;
  events: OrganizationEvent[];
  onAfterMutate: () => Promise<void>;
  reportError: MobileErrorReporter;
  reportErrorPrefix: string;
};

export function useOrganizationEventsManager({
  organizationId,
  events,
  onAfterMutate,
  reportError,
  reportErrorPrefix,
}: UseOrganizationEventsManagerOptions) {
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [form, setForm] = useState<EventFormState>(EMPTY_EVENT_FORM);
  const [initialForm, setInitialForm] = useState<EventFormState>(EMPTY_EVENT_FORM);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const selectedEvent = useMemo(
    () => events.find((event) => event.id === selectedEventId) ?? null,
    [events, selectedEventId],
  );

  const openCreateForm = useCallback((prefillDate?: string) => {
    setSelectedEventId(null);
    setEditingEventId(null);
    setFormMode('create');
    const nextForm = {
      ...EMPTY_EVENT_FORM,
      date: prefillDate ?? '',
      colorKey: getDefaultColorKeyForType(EMPTY_EVENT_FORM.eventType),
    };
    setForm(nextForm);
    setInitialForm(nextForm);
    setFormOpen(true);
  }, []);

  const openEditForm = useCallback((event: OrganizationEvent) => {
    setSelectedEventId(null);
    setEditingEventId(event.id);
    setFormMode('edit');
    const nextForm = {
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
    };
    setForm(nextForm);
    setInitialForm(nextForm);
    setFormOpen(true);
  }, []);

  const handleSave = useCallback(async () => {
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
        await createOrganizationEventViaApi(organizationId, {
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
        await updateOrganizationEventViaApi(organizationId, editingEventId, {
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
      await onAfterMutate();
    } catch (error) {
      reportError(`${reportErrorPrefix}_event_save`, error, {
        entityType: 'organization_event',
        entityId: editingEventId ?? undefined,
        metadata: { mode: formMode },
      });
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to save event.');
    } finally {
      setSaving(false);
    }
  }, [
    editingEventId,
    form,
    formMode,
    onAfterMutate,
    organizationId,
    reportError,
    reportErrorPrefix,
  ]);

  const handleDelete = useCallback(async () => {
    if (!selectedEvent) return;
    setDeleting(true);
    try {
      await deleteOrganizationEventViaApi(organizationId, selectedEvent.id);
      setSelectedEventId(null);
      await onAfterMutate();
    } catch (error) {
      reportError(`${reportErrorPrefix}_event_delete`, error, {
        entityType: 'organization_event',
        entityId: selectedEvent.id,
      });
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to delete event.');
    } finally {
      setDeleting(false);
    }
  }, [onAfterMutate, organizationId, reportError, reportErrorPrefix, selectedEvent]);

  return {
    formOpen,
    formMode,
    form,
    initialForm,
    saving,
    deleting,
    selectedEventId,
    selectedEvent,
    setFormOpen,
    setSelectedEventId,
    setForm,
    openCreateForm,
    openEditForm,
    handleSave,
    handleDelete,
    isFormDirty: !eventFormsEqual(form, initialForm),
  };
}
