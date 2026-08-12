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
import { adminToast, formatActionError } from "@/lib/school-admin/admin-toast";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
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
import type { OrganizationEvent } from "@/lib/school-events/types";
import { createClient } from "@/utils/supabase/client";

export default function SchoolEventsTab({
  C,
  organizationId,
}: {
  C: AdminThemeTokens;
  organizationId: string;
}) {
  const supabase = useMemo(() => createClient(), []);
  const [events, setEvents] = useState<OrganizationEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<CalendarViewMode>("month");
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [form, setForm] = useState<EventFormState>(EMPTY_EVENT_FORM);
  const [saving, setSaving] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const selectedEvent = events.find((e) => e.id === selectedEventId) ?? null;

  const loadEvents = useCallback(async () => {
    setLoading(true);
    try {
      const rows = await listEventsForOrg(supabase, organizationId);
      setEvents(rows);
    } catch (err) {
      adminToast.error(formatActionError(err, "Failed to load events."));
    } finally {
      setLoading(false);
    }
  }, [organizationId, supabase]);

  useEffect(() => {
    queueMicrotask(() => {
      void loadEvents();
    });
  }, [loadEvents]);

  const openCreateForm = (prefillDate?: string) => {
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
    });
    setFormOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.date) return;
    if (!form.isAllDay && !form.time) {
      adminToast.error("Please set a start time for timed events.");
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
      };

      if (editingEventId) {
        await updateOrganizationEvent(supabase, editingEventId, {
          ...payload,
          time: form.isAllDay ? null : form.time || null,
          endTime: form.isAllDay ? null : endTime || null,
          colorKey: form.colorKey,
          location: form.location || null,
          description: form.description || null,
        });
        adminToast.success("Event updated");
      } else {
        await createOrganizationEvent(supabase, organizationId, payload);
        adminToast.success("Event added");
      }

      setFormOpen(false);
      await loadEvents();
    } catch (err) {
      adminToast.error(
        formatActionError(err, editingEventId ? "Failed to update event." : "Failed to add event."),
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (eventId: string) => {
    try {
      await deleteOrganizationEvent(supabase, eventId);
      setSelectedEventId(null);
      await loadEvents();
      adminToast.success("Event deleted");
    } catch (err) {
      adminToast.error(formatActionError(err, "Failed to delete event."));
    }
  };

  return (
    <div className="w-full">
      <OrganizationEventsCalendar
        C={C}
        events={events}
        loading={loading}
        view={view}
        onViewChange={setView}
        selectedEventId={selectedEventId}
        emptyHint="No events yet — click a day to add one, or use Add event."
        onDayClick={openCreateForm}
        onEventClick={(event) => setSelectedEventId(event.id)}
        header={
          <div className="mb-1">
            <h2 className="text-sm font-semibold" style={{ color: C.textPrimary }}>
              School calendar
            </h2>
            <p className="mt-1 text-xs" style={{ color: C.textTertiary }}>
              Field trips, no-school days, and community events families see in the parent portal.
            </p>
          </div>
        }
        toolbarExtra={
          <button
            type="button"
            onClick={() => openCreateForm()}
            className="flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-white"
            style={{ backgroundColor: C.accent }}
          >
            <Plus className="h-3.5 w-3.5" />
            Add event
          </button>
        }
      />

      <SchoolEventDetailPanel
        event={formOpen ? null : selectedEvent}
        C={C}
        onClose={() => setSelectedEventId(null)}
        onDelete={handleDelete}
        onEdit={openEditForm}
      />

      <SchoolEventFormPanel
        C={C}
        open={formOpen}
        mode={formMode}
        form={form}
        saving={saving}
        onClose={() => setFormOpen(false)}
        onChange={setForm}
        onSave={handleSave}
      />
    </div>
  );
}
