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

/**
 * Optional feedback hooks (Garden screens). When a hook is given it replaces
 * the default `Alert`; without them behaviour is unchanged (teacher calendar).
 */
export type OrganizationEventsManagerFeedback = {
  onValidationError?: (title: string, message: string) => void;
  onSaved?: (info: { mode: 'create' | 'edit'; title: string; date: string }) => void;
  onSaveError?: (error: unknown) => void;
  onDeleted?: (info: { title: string; date: string }) => void;
  onDeleteError?: (error: unknown) => void;
};

type UseOrganizationEventsManagerOptions = {
  organizationId: string;
  events: OrganizationEvent[];
  onAfterMutate: () => Promise<void>;
  reportError: MobileErrorReporter;
  reportErrorPrefix: string;
  feedback?: OrganizationEventsManagerFeedback;
};

export function useOrganizationEventsManager({
  organizationId,
  events,
  onAfterMutate,
  reportError,
  reportErrorPrefix,
  feedback,
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

  /** Resolves `true` when the event was saved. */
  const handleSave = useCallback(async (): Promise<boolean> => {
    if (!form.title.trim() || !form.date) return false;
    if (!form.isAllDay && !form.time) {
      if (feedback?.onValidationError) {
        feedback.onValidationError('Missing time', 'Add a start time or mark the event as all day.');
      } else {
        Alert.alert('Missing time', 'Add a start time or mark the event as all day.');
      }
      return false;
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
      feedback?.onSaved?.({ mode: formMode, title: form.title.trim(), date: form.date });
      return true;
    } catch (error) {
      reportError(`${reportErrorPrefix}_event_save`, error, {
        entityType: 'organization_event',
        entityId: editingEventId ?? undefined,
        metadata: { mode: formMode },
      });
      if (feedback?.onSaveError) feedback.onSaveError(error);
      else Alert.alert('Error', error instanceof Error ? error.message : 'Failed to save event.');
      return false;
    } finally {
      setSaving(false);
    }
  }, [
    editingEventId,
    feedback,
    form,
    formMode,
    onAfterMutate,
    organizationId,
    reportError,
    reportErrorPrefix,
  ]);

  /** Resolves `true` when the event was deleted. */
  const handleDelete = useCallback(async (): Promise<boolean> => {
    if (!selectedEvent) return false;
    const deleted = { title: selectedEvent.title, date: selectedEvent.date };
    setDeleting(true);
    try {
      await deleteOrganizationEventViaApi(organizationId, selectedEvent.id);
      setSelectedEventId(null);
      await onAfterMutate();
      feedback?.onDeleted?.(deleted);
      return true;
    } catch (error) {
      reportError(`${reportErrorPrefix}_event_delete`, error, {
        entityType: 'organization_event',
        entityId: selectedEvent.id,
      });
      if (feedback?.onDeleteError) feedback.onDeleteError(error);
      else Alert.alert('Error', error instanceof Error ? error.message : 'Failed to delete event.');
      return false;
    } finally {
      setDeleting(false);
    }
  }, [feedback, onAfterMutate, organizationId, reportError, reportErrorPrefix, selectedEvent]);

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
