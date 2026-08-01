"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import type { Committee, CommitteeEventType } from "@/lib/committees/types";
import { createEvent, deleteEvent } from "@/lib/committees/events";
import { getCommittee } from "@/lib/committees/committees";
import { adminToast, formatActionError } from "@/lib/school-admin/admin-toast";

export default function CommitteeCalendarSection({
  committee,
  C,
  supabase,
  organizationId,
  onCommitteeChange,
  readOnly = false,
}: {
  committee: Committee;
  C: AdminThemeTokens;
  supabase: SupabaseClient;
  organizationId: string;
  onCommitteeChange: (committee: Committee) => void;
  readOnly?: boolean;
}) {
  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [eventType, setEventType] = useState<CommitteeEventType>("meeting");
  const [location, setLocation] = useState("");
  const [saving, setSaving] = useState(false);

  const refresh = async () => {
    const updated = await getCommittee(supabase, organizationId, committee.id);
    if (updated) onCommitteeChange(updated);
  };

  const handleAdd = async () => {
    if (!title.trim() || !date) return;
    setSaving(true);
    try {
      await createEvent(supabase, committee.id, {
        title: title.trim(),
        date,
        time: time || undefined,
        type: eventType,
        location: location || undefined,
      });
      setTitle("");
      setDate("");
      setTime("");
      setLocation("");
      setShowAdd(false);
      await refresh();
      adminToast.success("Event added");
    } catch (err) {
      adminToast.error(formatActionError(err, "Failed to add event."));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (eventId: string) => {
    try {
      await deleteEvent(supabase, eventId);
      await refresh();
      adminToast.success("Event deleted");
    } catch (err) {
      adminToast.error(formatActionError(err, "Failed to delete event."));
    }
  };

  return (
    <div className="space-y-4 max-w-3xl">
      <div className="flex justify-end">
        {!readOnly && (
        <button
          type="button"
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white rounded-lg cursor-pointer"
          style={{ backgroundColor: C.accent }}
        >
          <Plus className="w-3.5 h-3.5" />
          Add event
        </button>
        )}
      </div>

      <div className="space-y-2">
        {committee.events.length === 0 ? (
          <p className="text-sm" style={{ color: C.textTertiary }}>No events yet.</p>
        ) : (
          committee.events.map((event) => (
            <div
              key={event.id}
              className="flex items-start justify-between gap-4 p-4 rounded-xl border"
              style={{ backgroundColor: C.surface, borderColor: C.border }}
            >
              <div className="flex gap-3">
                <div
                  className="w-10 h-10 rounded-full flex flex-col items-center justify-center text-[10px] font-bold shrink-0"
                  style={{ backgroundColor: C.accentLight, color: C.accent }}
                >
                  <span>
                    {new Date(event.date + "T00:00:00").toLocaleDateString("en-US", {
                      month: "short",
                    }).toUpperCase()}
                  </span>
                  <span>{new Date(event.date + "T00:00:00").getDate()}</span>
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: C.textPrimary }}>
                    {event.title}
                  </p>
                  <p className="text-xs capitalize" style={{ color: C.textTertiary }}>
                    {event.type}
                    {event.time ? ` · ${event.time}` : ""}
                    {event.location ? ` · ${event.location}` : ""}
                  </p>
                </div>
              </div>
              {!readOnly && (
              <button
                type="button"
                onClick={() => handleDelete(event.id)}
                className="text-xs cursor-pointer"
                style={{ color: C.error }}
              >
                Delete
              </button>
              )}
            </div>
          ))
        )}
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="rounded-2xl shadow-xl w-full max-w-md p-6" style={{ backgroundColor: C.surface }}>
            <h3 className="text-lg font-semibold mb-4" style={{ color: C.textPrimary }}>Add event</h3>
            <div className="space-y-3">
              <input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-3 py-2 text-sm rounded-lg border" style={{ borderColor: C.border }} />
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full px-3 py-2 text-sm rounded-lg border" style={{ borderColor: C.border }} />
              <input placeholder="Time (optional)" value={time} onChange={(e) => setTime(e.target.value)} className="w-full px-3 py-2 text-sm rounded-lg border" style={{ borderColor: C.border }} />
              <select value={eventType} onChange={(e) => setEventType(e.target.value as CommitteeEventType)} className="w-full px-3 py-2 text-sm rounded-lg border" style={{ borderColor: C.border }}>
                <option value="meeting">Meeting</option>
                <option value="deadline">Deadline</option>
                <option value="service">Service</option>
                <option value="event">Event</option>
              </select>
              <input placeholder="Location (optional)" value={location} onChange={(e) => setLocation(e.target.value)} className="w-full px-3 py-2 text-sm rounded-lg border" style={{ borderColor: C.border }} />
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 text-sm cursor-pointer">Cancel</button>
              <button type="button" onClick={handleAdd} disabled={saving || !title.trim() || !date} className="px-4 py-2 text-sm font-medium text-white rounded-md cursor-pointer disabled:opacity-50" style={{ backgroundColor: C.accent }}>
                {saving ? "Adding…" : "Add event"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
