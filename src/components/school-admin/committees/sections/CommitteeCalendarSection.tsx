"use client";

import { useCallback, useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { CalendarDays, Plus } from "lucide-react";
import type { SupabaseClient } from "@supabase/supabase-js";
import OrganizationEventsCalendar from "@/components/school-events-calendar/OrganizationEventsCalendar";
import type { CalendarViewMode } from "@/components/school-events-calendar/CalendarToolbar";
import AdminButton from "@/components/school-admin/ui/story/AdminButton";
import ParentCard from "@/components/school-parent/ui/ParentCard";
import { committeeOperationalSurface } from "@/components/school-admin/committees/CommitteeAttributionLabel";
import CommitteeModalShell from "@/components/school-admin/committees/CommitteeModalShell";
import CommitteeWorkspaceSectionFrame from "@/components/school-admin/committees/CommitteeWorkspaceSectionFrame";
import CommitteeCalendarAgendaSidebar from "@/components/school-admin/committees/sections/CommitteeCalendarAgendaSidebar";
import CommitteeEventDetailPanel from "@/components/school-admin/committees/sections/CommitteeEventDetailPanel";
import { committeeStoryInputStyle } from "@/components/school-admin/committees/committee-story-input-style";
import { canMemberEditItem } from "@/lib/committees/attribution";
import {
  committeeEventsToOrganizationEvents,
  findCommitteeEventById,
} from "@/lib/committees/committee-events-calendar";
import { createEvent, deleteEvent } from "@/lib/committees/events";
import { getCommittee } from "@/lib/committees/committees";
import type { Committee, CommitteeEventType } from "@/lib/committees/types";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import { parentThemeToAdminCompat } from "@/lib/organization-settings/parent-theme";
import { adminToast, formatActionError } from "@/lib/school-admin/admin-toast";
import { reportPortalOperationalError } from "@/lib/portal-operational-errors";

export default function CommitteeCalendarSection({
  committee,
  theme,
  supabase,
  organizationId,
  onCommitteeChange,
  readOnly = false,
  currentMemberId,
  isAdmin = true,
}: {
  committee: Committee;
  theme: ParentThemeTokens;
  supabase: SupabaseClient;
  organizationId: string;
  onCommitteeChange: (committee: Committee) => void;
  readOnly?: boolean;
  currentMemberId?: string;
  isAdmin?: boolean;
}) {
  const C = useMemo(() => parentThemeToAdminCompat(theme), [theme]);
  const inputStyle = useMemo(() => committeeStoryInputStyle(theme), [theme]);
  const [view, setView] = useState<CalendarViewMode>("week");
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [periodKey, setPeriodKey] = useState("initial");
  const [showAdd, setShowAdd] = useState(false);
  const [showAgendaSidebar, setShowAgendaSidebar] = useState(false);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [eventType, setEventType] = useState<CommitteeEventType>("meeting");
  const [location, setLocation] = useState("");
  const [saving, setSaving] = useState(false);

  const calendarEvents = useMemo(
    () => committeeEventsToOrganizationEvents(committee.events, organizationId),
    [committee.events, organizationId],
  );
  const selectedCommitteeEvent = findCommitteeEventById(committee.events, selectedEventId);
  const canDeleteSelected =
    selectedCommitteeEvent != null &&
    canMemberEditItem(
      selectedCommitteeEvent.createdByMemberId,
      currentMemberId,
      isAdmin,
    );

  const refresh = async () => {
    const updated = await getCommittee(supabase, organizationId, committee.id);
    if (updated) onCommitteeChange(updated);
  };

  const openAddModal = (prefillDate?: string) => {
    if (readOnly) return;
    setDate(prefillDate ?? "");
    setTitle("");
    setTime("");
    setLocation("");
    setEventType("meeting");
    setShowAdd(true);
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
        createdByMemberId: currentMemberId,
      });
      setShowAdd(false);
      await refresh();
      adminToast.success("Event added");
    } catch (err) {
      void reportPortalOperationalError(committeeOperationalSurface(isAdmin), {
        organizationId,
        operation: "committees.calendar.add_event",
        error: "",
      }, err);
      adminToast.error(formatActionError(err, "Failed to add event."));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (eventId: string) => {
    try {
      await deleteEvent(supabase, eventId);
      setSelectedEventId(null);
      await refresh();
      adminToast.success("Event deleted");
    } catch (err) {
      void reportPortalOperationalError(committeeOperationalSurface(isAdmin), {
        organizationId,
        operation: "committees.calendar.delete_event",
        error: "",
      }, err);
      adminToast.error(formatActionError(err, "Failed to delete event."));
    }
  };

  const handlePeriodMetaChange = useCallback(
    (meta: { periodLabel: string; isCurrentPeriod: boolean }) => {
      setPeriodKey(`${view}-${meta.periodLabel}`);
    },
    [view],
  );

  return (
    <CommitteeWorkspaceSectionFrame width="full">
    <div className="space-y-4">
      <ParentCard theme={theme} className="!p-3 sm:!p-4">
        <OrganizationEventsCalendar
          C={C}
          events={calendarEvents}
          view={view}
          onViewChange={setView}
          readOnly={readOnly}
          variant="parent-story"
          parentTheme={theme}
          selectedEventId={selectedEventId}
          onDayClick={readOnly ? undefined : (nextDate) => openAddModal(nextDate)}
          onEventClick={(event) => setSelectedEventId(event.id)}
          onPeriodMetaChange={handlePeriodMetaChange}
          toolbarExtra={
            <div className="flex items-center gap-2">
              <AdminButton
                theme={theme}
                variant="soft"
                size="compact"
                onClick={() => setShowAgendaSidebar(true)}
              >
                <CalendarDays className="h-3.5 w-3.5" />
                Upcoming events
              </AdminButton>
              {!readOnly ? (
                <AdminButton
                  theme={theme}
                  variant="primary"
                  size="compact"
                  onClick={() => openAddModal()}
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add event
                </AdminButton>
              ) : null}
            </div>
          }
        />
      </ParentCard>

      <CommitteeCalendarAgendaSidebar
        open={showAgendaSidebar}
        theme={theme}
        events={calendarEvents}
        periodKey={periodKey}
        selectedEventId={selectedEventId}
        onEventClick={(event) => {
          setSelectedEventId(event.id);
          setShowAgendaSidebar(false);
        }}
        onClose={() => setShowAgendaSidebar(false)}
      />

      <CommitteeEventDetailPanel
        event={selectedCommitteeEvent}
        theme={theme}
        readOnly={readOnly || !canDeleteSelected}
        members={committee.members}
        onClose={() => setSelectedEventId(null)}
        onDelete={
          readOnly || !canDeleteSelected
            ? undefined
            : (eventId) => void handleDelete(eventId)
        }
      />

      <AnimatePresence>
        {showAdd && (
          <CommitteeModalShell
            theme={theme}
            title="Add event"
            onClose={() => setShowAdd(false)}
            footer={
              <div className="flex justify-end gap-2">
                <AdminButton theme={theme} variant="soft" onClick={() => setShowAdd(false)}>
                  Cancel
                </AdminButton>
                <AdminButton
                  theme={theme}
                  variant="primary"
                  onClick={() => void handleAdd()}
                  disabled={saving || !title.trim() || !date}
                >
                  {saving ? "Adding…" : "Add event"}
                </AdminButton>
              </div>
            }
          >
            <div className="space-y-3">
              <input
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border"
                style={inputStyle}
              />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border"
                style={inputStyle}
              />
              <input
                placeholder="Time (optional)"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border"
                style={inputStyle}
              />
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value as CommitteeEventType)}
                className="w-full px-3 py-2 text-sm rounded-lg border"
                style={inputStyle}
              >
                <option value="meeting">Meeting</option>
                <option value="deadline">Deadline</option>
                <option value="service">Service</option>
                <option value="event">Event</option>
              </select>
              <input
                placeholder="Location (optional)"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border"
                style={inputStyle}
              />
            </div>
          </CommitteeModalShell>
        )}
      </AnimatePresence>
    </div>
    </CommitteeWorkspaceSectionFrame>
  );
}
