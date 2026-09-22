"use client";

import { useCallback, useMemo, useState } from "react";
import { CalendarDays, Plus } from "lucide-react";
import type { SupabaseClient } from "@supabase/supabase-js";
import OrganizationEventsCalendar from "@/components/school-events-calendar/OrganizationEventsCalendar";
import type { CalendarViewMode } from "@/components/school-events-calendar/CalendarToolbar";
import AdminButton from "@/components/school-admin/ui/story/AdminButton";
import ParentCard from "@/components/school-parent/ui/ParentCard";
import { committeeOperationalSurface } from "@/components/school-admin/committees/CommitteeAttributionLabel";
import CommitteeWorkspaceSectionFrame from "@/components/school-admin/committees/CommitteeWorkspaceSectionFrame";
import CommitteeAddEventPanel, {
  type CommitteeAddEventFormState,
} from "@/components/school-admin/committees/sections/CommitteeAddEventPanel";
import CommitteeCalendarAgendaSidebar from "@/components/school-admin/committees/sections/CommitteeCalendarAgendaSidebar";
import CommitteeEventDetailPanel from "@/components/school-admin/committees/sections/CommitteeEventDetailPanel";
import { canMemberEditItem } from "@/lib/committees/attribution";
import {
  committeeEventsToOrganizationEvents,
  findCommitteeEventById,
} from "@/lib/committees/committee-events-calendar";
import { createEvent, deleteEvent } from "@/lib/committees/events";
import { getCommittee } from "@/lib/committees/committees";
import type { Committee } from "@/lib/committees/types";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import { parentThemeToAdminCompat } from "@/lib/organization-settings/parent-theme";
import { adminToast, formatActionError } from "@/lib/school-admin/admin-toast";
import { reportPortalOperationalError } from "@/lib/portal-operational-errors";

const EMPTY_ADD_EVENT_FORM: CommitteeAddEventFormState = {
  title: "",
  date: "",
  time: "",
  eventType: "meeting",
  location: "",
};

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
  const [view, setView] = useState<CalendarViewMode>("week");
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [periodKey, setPeriodKey] = useState("initial");
  const [showAdd, setShowAdd] = useState(false);
  const [showAgendaSidebar, setShowAgendaSidebar] = useState(false);
  const [addForm, setAddForm] = useState<CommitteeAddEventFormState>(EMPTY_ADD_EVENT_FORM);
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

  const openAddPanel = (prefillDate?: string) => {
    if (readOnly) return;
    setAddForm({
      ...EMPTY_ADD_EVENT_FORM,
      date: prefillDate ?? "",
    });
    setShowAdd(true);
  };

  const handleAdd = async () => {
    if (!addForm.title.trim() || !addForm.date) return;
    setSaving(true);
    try {
      await createEvent(supabase, committee.id, {
        title: addForm.title.trim(),
        date: addForm.date,
        time: addForm.time || undefined,
        type: addForm.eventType,
        location: addForm.location || undefined,
        createdByMemberId: currentMemberId,
      });
      setShowAdd(false);
      setAddForm(EMPTY_ADD_EVENT_FORM);
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
          onDayClick={readOnly ? undefined : (nextDate) => openAddPanel(nextDate)}
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
                  onClick={() => openAddPanel()}
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

      <CommitteeAddEventPanel
        open={showAdd}
        theme={theme}
        saving={saving}
        form={addForm}
        onChange={setAddForm}
        onClose={() => setShowAdd(false)}
        onSubmit={handleAdd}
      />
    </div>
    </CommitteeWorkspaceSectionFrame>
  );
}
