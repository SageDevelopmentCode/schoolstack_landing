"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import CommitteeModalShell from "@/components/school-admin/committees/CommitteeModalShell";
import OrganizationEventsCalendar from "@/components/school-events-calendar/OrganizationEventsCalendar";
import type { CalendarViewMode } from "@/components/school-events-calendar/CalendarToolbar";
import SchoolEventDetailPanel from "@/components/school-admin/schedule/SchoolEventDetailPanel";
import { adminToast, formatActionError } from "@/lib/school-admin/admin-toast";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import { SCHOOL_EVENT_TYPE_LABELS } from "@/lib/school-events/event-labels";
import {
  createOrganizationEvent,
  deleteOrganizationEvent,
  listEventsForOrg,
  updateOrganizationEvent,
} from "@/lib/school-events/events";
import type { OrganizationEvent, SchoolEventType } from "@/lib/school-events/types";
import { createClient } from "@/utils/supabase/client";

type EventFormState = {
  title: string;
  date: string;
  time: string;
  isAllDay: boolean;
  eventType: SchoolEventType;
  location: string;
  description: string;
};

const EMPTY_FORM: EventFormState = {
  title: "",
  date: "",
  time: "",
  isAllDay: true,
  eventType: "other",
  location: "",
  description: "",
};

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
  const [showModal, setShowModal] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [form, setForm] = useState<EventFormState>(EMPTY_FORM);
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
    void loadEvents();
  }, [loadEvents]);

  const openCreateModal = (prefillDate?: string) => {
    setEditingEventId(null);
    setForm({
      ...EMPTY_FORM,
      date: prefillDate ?? "",
    });
    setShowModal(true);
  };

  const openEditModal = (event: OrganizationEvent) => {
    setEditingEventId(event.id);
    setSelectedEventId(null);
    setForm({
      title: event.title,
      date: event.date,
      time: event.time ?? "",
      isAllDay: event.isAllDay,
      eventType: event.type,
      location: event.location ?? "",
      description: event.description ?? "",
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.date) return;
    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        date: form.date,
        time: form.isAllDay ? undefined : form.time || undefined,
        isAllDay: form.isAllDay,
        type: form.eventType,
        location: form.location || undefined,
        description: form.description || undefined,
      };

      if (editingEventId) {
        await updateOrganizationEvent(supabase, editingEventId, {
          ...payload,
          time: form.isAllDay ? null : form.time || null,
          location: form.location || null,
          description: form.description || null,
        });
        adminToast.success("Event updated");
      } else {
        await createOrganizationEvent(supabase, organizationId, payload);
        adminToast.success("Event added");
      }

      setShowModal(false);
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
        onDayClick={openCreateModal}
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
            onClick={() => openCreateModal()}
            className="flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-white"
            style={{ backgroundColor: C.accent }}
          >
            <Plus className="h-3.5 w-3.5" />
            Add event
          </button>
        }
      />

      <SchoolEventDetailPanel
        event={selectedEvent}
        C={C}
        onClose={() => setSelectedEventId(null)}
        onDelete={handleDelete}
        onEdit={openEditModal}
      />

      <AnimatePresence>
        {showModal && (
          <CommitteeModalShell
            C={C}
            title={editingEventId ? "Edit event" : "Add event"}
            onClose={() => setShowModal(false)}
            footer={
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="cursor-pointer px-4 py-2 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving || !form.title.trim() || !form.date}
                  className="cursor-pointer rounded-md px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                  style={{ backgroundColor: C.accent }}
                >
                  {saving ? "Saving…" : editingEventId ? "Save changes" : "Add event"}
                </button>
              </div>
            }
          >
            <div className="space-y-3">
              <input
                placeholder="Title"
                value={form.title}
                onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                className="w-full rounded-lg border px-3 py-2 text-sm"
                style={{ borderColor: C.border }}
              />
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))}
                className="w-full rounded-lg border px-3 py-2 text-sm"
                style={{ borderColor: C.border }}
              />
              <label className="flex items-center gap-2 text-sm" style={{ color: C.textSecondary }}>
                <input
                  type="checkbox"
                  checked={form.isAllDay}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, isAllDay: e.target.checked }))
                  }
                />
                All day
              </label>
              {!form.isAllDay ? (
                <input
                  placeholder="Time (e.g. 9:00 AM)"
                  value={form.time}
                  onChange={(e) => setForm((prev) => ({ ...prev, time: e.target.value }))}
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                  style={{ borderColor: C.border }}
                />
              ) : null}
              <select
                value={form.eventType}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    eventType: e.target.value as SchoolEventType,
                  }))
                }
                className="w-full rounded-lg border px-3 py-2 text-sm"
                style={{ borderColor: C.border }}
              >
                {(Object.keys(SCHOOL_EVENT_TYPE_LABELS) as SchoolEventType[]).map((type) => (
                  <option key={type} value={type}>
                    {SCHOOL_EVENT_TYPE_LABELS[type]}
                  </option>
                ))}
              </select>
              <input
                placeholder="Location (optional)"
                value={form.location}
                onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))}
                className="w-full rounded-lg border px-3 py-2 text-sm"
                style={{ borderColor: C.border }}
              />
              <textarea
                placeholder="Description (optional)"
                value={form.description}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, description: e.target.value }))
                }
                rows={3}
                className="w-full resize-none rounded-lg border px-3 py-2 text-sm"
                style={{ borderColor: C.border }}
              />
            </div>
          </CommitteeModalShell>
        )}
      </AnimatePresence>
    </div>
  );
}
