"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Plus } from "lucide-react";
import OrganizationEventsCalendar from "@/components/school-events-calendar/OrganizationEventsCalendar";
import type { CalendarViewMode } from "@/components/school-events-calendar/CalendarToolbar";
import SchoolEventDetailPanel from "@/components/school-admin/schedule/SchoolEventDetailPanel";
import SchoolEventFormPanel, {
  EMPTY_EVENT_FORM,
  type EventFormState,
} from "@/components/school-admin/schedule/SchoolEventFormPanel";
import AdminButton from "@/components/school-admin/ui/story/AdminButton";
import { useAdminGardenSkin } from "@/components/school-admin/garden/skin";
import { useAdminConfirm } from "@/components/school-admin/garden/useAdminConfirm";
import { GardenLoadError } from "@/components/school-admin/garden/kit";
import { GCard } from "@/components/school-parent/garden/ui";
import {
  GardenAdminEventsCalendar,
  GardenEventDetailPanel,
  GardenEventFormPanel,
  formatEventDateShort,
  type EventFormErrors,
} from "@/components/school-admin/schedule/garden/GardenSchoolEvents";
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
  createOrganizationEventViaApi,
  deleteOrganizationEventViaApi,
  schoolEventApiErrorStatus,
  updateOrganizationEventViaApi,
} from "@/lib/school-events/event-api";
import { listEventsForOrg } from "@/lib/school-events/events";
import { formatOrganizationEventAudienceLabel } from "@/lib/school-events/event-audience";
import type { OrganizationEvent } from "@/lib/school-events/types";
import { reportPortalOperationalError } from "@/lib/portal-operational-errors";
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

function sortOrganizationEvents(events: OrganizationEvent[]): OrganizationEvent[] {
  return [...events].sort((a, b) => {
    const dateCompare = a.date.localeCompare(b.date);
    if (dateCompare !== 0) return dateCompare;
    return a.sortOrder - b.sortOrder;
  });
}

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
  // Inside an admin Garden page the calendar, drawers and feedback switch to
  // Garden; the teacher portal (no skin) keeps the story look and copy.
  const skin = useAdminGardenSkin();
  const garden = Boolean(skin) && toastVariant === "admin";
  const { confirm, dialog: confirmDialog } = useAdminConfirm(C);
  const reportingSurface =
    toastVariant === "admin" ? "school_admin" : "teacher_portal";

  const reportCalendarError = useCallback(
    (operation: string, err: unknown) => {
      const status = schoolEventApiErrorStatus(err);
      if (status !== undefined && status >= 500) {
        return;
      }
      void reportPortalOperationalError(
        reportingSurface,
        { organizationId, operation, error: "" },
        err,
        status,
      );
    },
    [organizationId, reportingSurface],
  );
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
  const [loadError, setLoadError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<EventFormErrors>({});
  const [initialForm, setInitialForm] = useState<EventFormState>(EMPTY_EVENT_FORM);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const saveRef = useRef<() => Promise<void>>(async () => {});
  const deleteRef = useRef<(eventId: string) => Promise<void>>(async () => {});

  const programNameById = useMemo(
    () => new Map(programOptions.map((program) => [program.id, program.name])),
    [programOptions],
  );

  const selectedEvent = events.find((e) => e.id === selectedEventId) ?? null;
  const interactionsDisabled = readOnly;

  const fetchEvents = useCallback(async () => {
    return listEventsForOrg(supabase, organizationId);
  }, [organizationId, supabase]);

  const reportReloadError = useCallback(
    (err: unknown) => {
      reportCalendarError("school_events.reload", err);
      toasts.error(
        err,
        "Event saved, but the calendar could not refresh. Reload the page if it looks out of date.",
      );
    },
    [reportCalendarError, toasts],
  );

  const refreshEventsSilently = useCallback(async () => {
    try {
      const rows = await fetchEvents();
      setEvents(rows);
    } catch (err) {
      reportReloadError(err);
    }
  }, [fetchEvents, reportReloadError]);

  const loadEvents = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const rows = await fetchEvents();
      setEvents(rows);
    } catch (err) {
      reportCalendarError("school_events.load", err);
      if (garden) {
        // Garden: load failures show inline with Try again, never a toast.
        setLoadError(formatActionError(err, "Failed to load events."));
      } else {
        toasts.error(err, "Failed to load events.");
      }
    } finally {
      setLoading(false);
    }
  }, [fetchEvents, garden, reportCalendarError, toasts]);

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
      } catch (err) {
        reportCalendarError("calendar.programs.load", err);
        if (!cancelled) setProgramOptions([]);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [organizationId, reportCalendarError, supabase]);

  useEffect(() => {
    onLoadingChange?.(loading);
  }, [loading, onLoadingChange]);

  const openCreateForm = (prefillDate?: string) => {
    if (interactionsDisabled) return;
    setSelectedEventId(null);
    setEditingEventId(null);
    setFormMode("create");
    const next = {
      ...EMPTY_EVENT_FORM,
      date: prefillDate ?? "",
      colorKey: getDefaultColorKeyForType(EMPTY_EVENT_FORM.eventType),
    };
    setForm(next);
    setInitialForm(next);
    setFormErrors({});
    setFormOpen(true);
  };

  const openEditForm = (event: OrganizationEvent) => {
    if (interactionsDisabled) return;
    setSelectedEventId(null);
    setEditingEventId(event.id);
    setFormMode("edit");
    const next: EventFormState = {
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
    };
    setForm(next);
    setInitialForm(next);
    setFormErrors({});
    setFormOpen(true);
  };

  const handleSave = async () => {
    if (interactionsDisabled) return;
    if (garden) {
      const errors: EventFormErrors = {};
      if (!form.title.trim()) errors.title = "Give the event a title.";
      if (!form.date) errors.date = "Pick a date.";
      if (!form.isAllDay && !form.time) errors.time = "Set a start time, or switch to all day.";
      setFormErrors(errors);
      if (Object.keys(errors).length > 0) return;
    }
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

    try {
      if (editingEventId) {
        await updateOrganizationEventViaApi(organizationId, editingEventId, {
          ...payload,
          time: form.isAllDay ? null : form.time || null,
          endTime: form.isAllDay ? null : endTime || null,
          colorKey: form.colorKey,
          location: form.location || null,
          description: form.description || null,
          programId: form.programId,
        });
        setEvents((prev) =>
          sortOrganizationEvents(
            prev.map((event) =>
              event.id === editingEventId
                ? {
                    ...event,
                    title: payload.title,
                    date: payload.date,
                    time: payload.time,
                    endTime: payload.endTime,
                    isAllDay: payload.isAllDay,
                    type: payload.type,
                    colorKey: payload.colorKey,
                    location: payload.location,
                    description: payload.description,
                    programId: payload.programId ?? undefined,
                  }
                : event,
            ),
          ),
        );
        if (garden) {
          adminToast.dismiss("school-event-save-error");
          adminToast.success("Event updated.", {
            id: "school-event-save",
            description: `${payload.title} · ${formatEventDateShort(payload.date)}. Families see the change in the parent portal.`,
          });
        } else {
          toasts.success("Event updated");
        }
      } else {
        const created = await createOrganizationEventViaApi(
          organizationId,
          payload,
        );
        setEvents((prev) => sortOrganizationEvents([...prev, created]));
        if (garden) {
          const program = payload.programId ? programNameById.get(payload.programId) : null;
          adminToast.dismiss("school-event-save-error");
          adminToast.success(`“${payload.title}” added.`, {
            id: "school-event-save",
            description: `${formatEventDateShort(payload.date)} · ${
              program ? `${program} families` : "families"
            } see it in the parent portal.`,
          });
        } else {
          toasts.success("Event added");
        }
      }

      setFormOpen(false);
    } catch (err) {
      reportCalendarError(
        editingEventId ? "school_events.update" : "school_events.create",
        err,
      );
      if (garden) {
        adminToast.error(editingEventId ? "Couldn't update the event." : "Couldn't add the event.", {
          id: "school-event-save-error",
          description: `${formatActionError(err, editingEventId ? "Failed to update event." : "Failed to add event.")} ${
            editingEventId ? "The calendar still shows the old details." : "Nothing was added to the calendar."
          }`,
          action: { label: "Retry", onClick: () => void saveRef.current() },
        });
      } else {
        toasts.error(
          err,
          editingEventId ? "Failed to update event." : "Failed to add event.",
        );
      }
    } finally {
      setSaving(false);
    }

    void refreshEventsSilently();
  };

  const handleDelete = async (eventId: string) => {
    if (interactionsDisabled) return;
    const target = events.find((event) => event.id === eventId);
    if (garden) setDeletingId(eventId);
    try {
      await deleteOrganizationEventViaApi(organizationId, eventId);
      setEvents((prev) => prev.filter((event) => event.id !== eventId));
      setSelectedEventId(null);
      if (garden) {
        adminToast.dismiss("school-event-delete-error");
        adminToast.success(target ? `“${target.title}” deleted.` : "Event deleted.", {
          id: "school-event-delete",
          description: "Families won't see it on their calendar anymore.",
        });
      } else {
        toasts.success("Event deleted");
      }
    } catch (err) {
      reportCalendarError("school_events.delete", err);
      if (garden) {
        adminToast.error("Couldn't delete the event.", {
          id: "school-event-delete-error",
          description: `${formatActionError(err, "Failed to delete event.")} It's still on the calendar.`,
          action: { label: "Retry", onClick: () => void deleteRef.current(eventId) },
        });
      } else {
        toasts.error(err, "Failed to delete event.");
      }
      return;
    } finally {
      if (garden) setDeletingId(null);
    }

    void refreshEventsSilently();
  };

  useEffect(() => {
    saveRef.current = handleSave;
    deleteRef.current = handleDelete;
  });

  /** Garden: ask before deleting (the story view keeps its one-click delete). */
  const confirmDelete = async (event: OrganizationEvent) => {
    const ok = await confirm({
      title: `Delete “${event.title}”?`,
      description: "Families stop seeing it on their calendar. This can't be undone.",
      confirmLabel: "Delete event",
    });
    if (ok) await handleDelete(event.id);
  };

  const formDirty = JSON.stringify(form) !== JSON.stringify(initialForm);
  const closeForm = async () => {
    if (garden && formDirty && !saving) {
      const ok = await confirm({
        title: formMode === "edit" ? "Discard your changes?" : "Discard this event?",
        description: "What you've typed hasn't been saved.",
        confirmLabel: "Discard",
        cancelLabel: "Keep editing",
      });
      if (!ok) return;
    }
    setFormOpen(false);
  };

  if (garden) {
    const audience = selectedEvent
      ? formatOrganizationEventAudienceLabel(selectedEvent, programNameById)
      : undefined;
    return (
      <div className="flex w-full flex-col gap-4">
        {loadError ? (
          <GCard index={1}>
            <GardenLoadError title="Couldn't load school events." description={`${loadError} Nothing has changed.`} onRetry={() => void loadEvents()} />
          </GCard>
        ) : (
          <GardenAdminEventsCalendar
            events={events}
            loading={loading}
            view={view}
            onViewChange={setView}
            selectedEventId={selectedEventId}
            readOnly={interactionsDisabled}
            emptyHint={emptyHint}
            onDayClick={interactionsDisabled ? undefined : openCreateForm}
            onEventClick={(event) => setSelectedEventId(event.id)}
            onAdd={() => openCreateForm()}
          />
        )}
        <GardenEventDetailPanel
          theme={theme}
          event={formOpen ? null : selectedEvent}
          audienceLabel={audience}
          onClose={() => setSelectedEventId(null)}
          onEdit={openEditForm}
          onDelete={(event) => void confirmDelete(event)}
          actionsDisabled={interactionsDisabled}
          deleting={deletingId != null}
        />
        <GardenEventFormPanel
          theme={theme}
          open={formOpen}
          mode={formMode}
          form={form}
          errors={formErrors}
          saving={saving || interactionsDisabled}
          programOptions={programOptions}
          onClose={() => void closeForm()}
          onChange={(next) => {
            setForm(next);
            if (Object.keys(formErrors).length > 0) {
              setFormErrors((current) => ({
                title: next.title.trim() ? undefined : current.title,
                date: next.date ? undefined : current.date,
                time: next.isAllDay || next.time ? undefined : current.time,
              }));
            }
          }}
          onSave={() => void handleSave()}
        />
        {confirmDialog}
      </div>
    );
  }

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
