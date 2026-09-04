"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import OrganizationEventsCalendar from "@/components/school-events-calendar/OrganizationEventsCalendar";
import type { CalendarViewMode } from "@/components/school-events-calendar/CalendarToolbar";
import SchoolEventDetailPanel from "@/components/school-admin/schedule/SchoolEventDetailPanel";
import SchoolEventFormPanel, {
  EMPTY_EVENT_FORM,
  type EventFormState,
} from "@/components/school-admin/schedule/SchoolEventFormPanel";
import AdminButton from "@/components/school-admin/ui/story/AdminButton";
import { adminToast, formatActionError } from "@/lib/school-admin/admin-toast";
import {
  formatParentActionError,
  parentToast,
} from "@/lib/school-parent/parent-toast";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import {
  addMinutesToTimeInput,
  DEFAULT_EVENT_DURATION_MINUTES,
  toTimeInputValue,
} from "@/lib/school-events/calendar-time";
import { getDefaultColorKeyForType } from "@/lib/school-events/event-labels";
import {
  createOrganizationEvent,
  deleteOrganizationEvent,
  listEventsForOrg,
  updateOrganizationEvent,
} from "@/lib/school-events/events";
import { formatOrganizationEventAudienceLabel } from "@/lib/school-events/event-audience";
import type { OrganizationEvent } from "@/lib/school-events/types";
import { listPrograms, type ProgramOption } from "@/lib/admissions/programs";
import { createClient } from "@/utils/supabase/client";

type ToastVariant = "admin" | "parent";

type OrganizationEventsCalendarManagerProps = {
  theme: ParentThemeTokens;
  C: AdminThemeTokens;
  organizationId: string;
  onLoadingChange?: (loading: boolean) => void;
  readOnly?: boolean;
  toastVariant?: ToastVariant;
  emptyHint?: string;
};

function useEventToasts(variant: ToastVariant) {
  return useMemo(
    () =>
      variant === "admin"
        ? {
            success: adminToast.success,
            error: (err: unknown, fallback: string) =>
              adminToast.error(formatActionError(err, fallback)),
          }
        : {
            success: parentToast.success,
            error: (err: unknown, fallback: string) =>
              parentToast.error(formatParentActionError(err, fallback)),
          },
    [variant],
  );
}

export default function OrganizationEventsCalendarManager({
  theme,
  C,
  organizationId,
  onLoadingChange,
  readOnly = false,
  toastVariant = "admin",
  emptyHint = "No events yet — click a day to add one, or use Add event.",
}: OrganizationEventsCalendarManagerProps) {
  const supabase = useMemo(() => createClient(), []);
  const toasts = useEventToasts(toastVariant);
  const [events, setEvents] = useState<OrganizationEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<CalendarViewMode>("month");
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [form, setForm] = useState<EventFormState>(EMPTY_EVENT_FORM);
  const [saving, setSaving] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [programOptions, setProgramOptions] = useState<ProgramOption[]>([]);

  const programNameById = useMemo(
    () => new Map(programOptions.map((program) => [program.id, program.name])),
    [programOptions],
  );

  const selectedEvent = events.find((e) => e.id === selectedEventId) ?? null;
  const interactionsDisabled = readOnly;

  const loadEvents = useCallback(async () => {
    setLoading(true);
    try {
      const rows = await listEventsForOrg(supabase, organizationId);
      setEvents(rows);
    } catch (err) {
      toasts.error(err, "Failed to load events.");
    } finally {
      setLoading(false);
    }
  }, [organizationId, supabase, toasts]);

  useEffect(() => {
    queueMicrotask(() => {
      void loadEvents();
    });
  }, [loadEvents]);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(async () => {
      try {
        const rows = await listPrograms(supabase, organizationId);
        if (!cancelled) setProgramOptions(rows);
      } catch {
        if (!cancelled) setProgramOptions([]);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [organizationId, supabase]);

  useEffect(() => {
    onLoadingChange?.(loading);
  }, [loading, onLoadingChange]);

  const openCreateForm = (prefillDate?: string) => {
    if (interactionsDisabled) return;
    setSelectedEventId(null);
    setEditingEventId(null);
    setFormMode("create");
    setForm({
      ...EMPTY_EVENT_FORM,
      date: prefillDate ?? "",
      colorKey: getDefaultColorKeyForType(EMPTY_EVENT_FORM.eventType),
    });
    setFormOpen(true);
  };

  const openEditForm = (event: OrganizationEvent) => {
    if (interactionsDisabled) return;
    setSelectedEventId(null);
    setEditingEventId(event.id);
    setFormMode("edit");
    setForm({
      title: event.title,
      date: event.date,
      time: toTimeInputValue(event.time),
      endTime: toTimeInputValue(event.endTime),
      isAllDay: event.isAllDay,
      eventType: event.type,
      colorKey: event.colorKey ?? getDefaultColorKeyForType(event.type),
      colorManuallySet: Boolean(event.colorKey),
      location: event.location ?? "",
      description: event.description ?? "",
      programId: event.programId ?? null,
    });
    setFormOpen(true);
  };

  const handleSave = async () => {
    if (interactionsDisabled) return;
    if (!form.title.trim() || !form.date) return;
    if (!form.isAllDay && !form.time) {
      toasts.error(null, "Please set a start time for timed events.");
      return;
    }

    let endTime = form.endTime;
    if (!form.isAllDay && form.time && !endTime) {
      endTime = addMinutesToTimeInput(form.time, DEFAULT_EVENT_DURATION_MINUTES);
    }

    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        date: form.date,
        time: form.isAllDay ? undefined : form.time || undefined,
        endTime: form.isAllDay ? undefined : endTime || undefined,
        isAllDay: form.isAllDay,
        type: form.eventType,
        colorKey: form.colorKey,
        location: form.location || undefined,
        description: form.description || undefined,
        programId: form.programId,
      };

      if (editingEventId) {
        await updateOrganizationEvent(supabase, editingEventId, {
          ...payload,
          time: form.isAllDay ? null : form.time || null,
          endTime: form.isAllDay ? null : endTime || null,
          colorKey: form.colorKey,
          location: form.location || null,
          description: form.description || null,
          programId: form.programId,
        });
        toasts.success("Event updated");
      } else {
        await createOrganizationEvent(supabase, organizationId, payload);
        toasts.success("Event added");
      }

      setFormOpen(false);
      await loadEvents();
    } catch (err) {
      toasts.error(
        err,
        editingEventId ? "Failed to update event." : "Failed to add event.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (eventId: string) => {
    if (interactionsDisabled) return;
    try {
      await deleteOrganizationEvent(supabase, eventId);
      setSelectedEventId(null);
      await loadEvents();
      toasts.success("Event deleted");
    } catch (err) {
      toasts.error(err, "Failed to delete event.");
    }
  };

  return (
    <div className="flex w-full flex-col gap-4">
      <OrganizationEventsCalendar
        C={C}
        events={events}
        loading={loading}
        loadingBehavior="grid-only"
        toolbarDetached
        view={view}
        onViewChange={setView}
        selectedEventId={selectedEventId}
        emptyHint={emptyHint}
        onDayClick={interactionsDisabled ? undefined : openCreateForm}
        onEventClick={(event) => setSelectedEventId(event.id)}
        variant="parent-story"
        parentTheme={theme}
        toolbarExtra={
          <AdminButton
            theme={theme}
            variant="primary"
            size="compact"
            onClick={() => openCreateForm()}
            disabled={interactionsDisabled}
          >
            <Plus className="h-3.5 w-3.5" />
            Add event
          </AdminButton>
        }
      />

      <SchoolEventDetailPanel
        event={formOpen ? null : selectedEvent}
        C={C}
        audienceLabel={
          selectedEvent
            ? formatOrganizationEventAudienceLabel(selectedEvent, programNameById)
            : undefined
        }
        onClose={() => setSelectedEventId(null)}
        onDelete={handleDelete}
        onEdit={openEditForm}
        actionsDisabled={interactionsDisabled}
      />

      <SchoolEventFormPanel
        theme={theme}
        C={C}
        open={formOpen}
        mode={formMode}
        form={form}
        saving={saving || interactionsDisabled}
        programOptions={programOptions}
        onClose={() => setFormOpen(false)}
        onChange={setForm}
        onSave={handleSave}
      />
    </div>
  );
}
