"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, LayoutGrid, Plus } from "lucide-react";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import type { Committee, CommitteeEvent, CommitteeEventType } from "@/lib/committees/types";
import { createEvent, deleteEvent } from "@/lib/committees/events";
import { getCommittee } from "@/lib/committees/committees";
import {
  addMonths,
  addWeeks,
  dateKey,
  DAY_NAMES,
  formatMonthLabel,
  formatWeekRangeLabel,
  getMonthCells,
  getWeekDates,
  groupEventsByDate,
  initialCalendarAnchor,
} from "@/lib/committees/calendar-utils";
import CommitteeEventDetailPanel from "./CommitteeEventDetailPanel";
import { adminToast, formatActionError } from "@/lib/school-admin/admin-toast";

type CalendarView = "month" | "week";

const CALENDAR_LINE = "rgba(0, 0, 0, 0.06)";

const TYPE_CHIP_STYLE: Record<CommitteeEventType, { bg: string; text: string }> = {
  meeting: { bg: "rgba(130, 112, 150, 0.15)", text: "#827096" },
  deadline: { bg: "rgba(245, 158, 11, 0.15)", text: "#b45309" },
  service: { bg: "rgba(16, 185, 129, 0.15)", text: "#047857" },
  event: { bg: "rgba(179, 180, 98, 0.25)", text: "#5C5A30" },
};

function DayNumber({
  day,
  C,
  align = "right",
  size = "sm",
}: {
  day: Date;
  C: AdminThemeTokens;
  align?: "right" | "center";
  size?: "sm" | "lg";
}) {
  const isToday = dateKey(new Date()) === dateKey(day);
  const sizeClass = size === "lg" ? "w-8 h-8 text-base" : "w-7 h-7 text-sm";

  return (
    <div className={`flex mb-1.5 ${align === "right" ? "justify-end" : "justify-center"}`}>
      <span
        className={`inline-flex items-center justify-center font-semibold rounded-full ${sizeClass}`}
        style={
          isToday
            ? { backgroundColor: C.accent, color: "#FFFFFF" }
            : { color: C.textTertiary }
        }
      >
        {day.getDate()}
      </span>
    </div>
  );
}

function EventChip({
  event,
  C,
  selected,
  onClick,
}: {
  event: CommitteeEvent;
  C: AdminThemeTokens;
  selected: boolean;
  onClick: () => void;
}) {
  const colors = TYPE_CHIP_STYLE[event.type];
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className="w-full text-left text-[11px] font-medium px-2 py-1 rounded-md truncate cursor-pointer hover:brightness-95 transition-all"
      style={{
        backgroundColor: colors.bg,
        color: colors.text,
        borderLeft: `3px solid ${colors.text}`,
        outline: selected ? `1px solid ${C.accent}` : undefined,
      }}
    >
      {event.title}
    </button>
  );
}

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
  const [view, setView] = useState<CalendarView>("month");
  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [eventType, setEventType] = useState<CommitteeEventType>("meeting");
  const [location, setLocation] = useState("");
  const [saving, setSaving] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const initial = useMemo(() => initialCalendarAnchor(committee.events), [committee.events]);
  const [year, setYear] = useState(initial.year);
  const [month, setMonth] = useState(initial.month);
  const [weekAnchor, setWeekAnchor] = useState(() => new Date());

  const eventsByDate = useMemo(
    () => groupEventsByDate(committee.events),
    [committee.events],
  );
  const monthCells = useMemo(() => getMonthCells(year, month), [year, month]);
  const weekDates = useMemo(() => getWeekDates(weekAnchor), [weekAnchor]);
  const selectedEvent = committee.events.find((e) => e.id === selectedEventId) ?? null;

  const refresh = async () => {
    const updated = await getCommittee(supabase, organizationId, committee.id);
    if (updated) onCommitteeChange(updated);
  };

  const openAddModal = (prefillDate?: string) => {
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
      });
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
      setSelectedEventId(null);
      await refresh();
      adminToast.success("Event deleted");
    } catch (err) {
      adminToast.error(formatActionError(err, "Failed to delete event."));
    }
  };

  const prevMonth = () => {
    const next = addMonths(year, month, -1);
    setYear(next.year);
    setMonth(next.month);
  };

  const nextMonth = () => {
    const next = addMonths(year, month, 1);
    setYear(next.year);
    setMonth(next.month);
  };

  const prevWeek = () => setWeekAnchor((d) => addWeeks(d, -1));
  const nextWeek = () => setWeekAnchor((d) => addWeeks(d, 1));

  const switchView = (next: CalendarView) => {
    setSelectedEventId(null);
    setView(next);
  };

  const segmentButtonStyle = (active: boolean) => ({
    backgroundColor: active ? C.surface : "transparent",
    color: active ? C.textPrimary : C.textTertiary,
    boxShadow: active ? "0 1px 2px rgba(0,0,0,0.06)" : undefined,
  });

  return (
    <div className="space-y-4 w-full">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div
          className="flex items-center gap-1 rounded-md p-1"
          style={{ backgroundColor: C.accentLight }}
        >
          <button
            type="button"
            onClick={() => switchView("month")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer"
            style={segmentButtonStyle(view === "month")}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            Month
          </button>
          <button
            type="button"
            onClick={() => switchView("week")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer"
            style={segmentButtonStyle(view === "week")}
          >
            Week
          </button>
        </div>
        {!readOnly && (
          <button
            type="button"
            onClick={() => openAddModal()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white rounded-lg cursor-pointer"
            style={{ backgroundColor: C.accent }}
          >
            <Plus className="w-3.5 h-3.5" />
            Add event
          </button>
        )}
      </div>

      {view === "month" ? (
        <div className="space-y-4">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={prevMonth}
              className="p-2 rounded-full transition-colors cursor-pointer hover:bg-black/5"
              style={{ color: C.textTertiary }}
              aria-label="Previous month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <h3
              className="text-base font-semibold min-w-[180px] text-center"
              style={{ color: C.textPrimary }}
            >
              {formatMonthLabel(year, month)}
            </h3>
            <button
              type="button"
              onClick={nextMonth}
              className="p-2 rounded-full transition-colors cursor-pointer hover:bg-black/5"
              style={{ color: C.textTertiary }}
              aria-label="Next month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div
            className="rounded-2xl overflow-hidden shadow-sm"
            style={{
              backgroundColor: C.surface,
              border: `1px solid ${CALENDAR_LINE}`,
            }}
          >
            <div className="grid grid-cols-7">
              {DAY_NAMES.map((d) => (
                <div
                  key={d}
                  className="text-center text-xs font-medium tracking-wide py-3"
                  style={{ color: C.textTertiary }}
                >
                  {d}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {monthCells.map((day, idx) => {
                const col = idx % 7;
                const row = Math.floor(idx / 7);
                const totalRows = Math.ceil(monthCells.length / 7);
                const isLastCol = col === 6;
                const isLastRow = row === totalRows - 1;
                const cellBorder = {
                  borderRight: isLastCol ? undefined : `1px solid ${CALENDAR_LINE}`,
                  borderBottom: isLastRow ? undefined : `1px solid ${CALENDAR_LINE}`,
                };

                if (!day) {
                  return (
                    <div
                      key={`empty-${idx}`}
                      className="min-h-[128px] bg-gray-50/50"
                      style={cellBorder}
                    />
                  );
                }
                const key = dateKey(day);
                const dayEvents = eventsByDate.get(key) ?? [];
                return (
                  <div
                    key={key}
                    role={readOnly ? undefined : "button"}
                    tabIndex={readOnly ? undefined : 0}
                    onClick={readOnly ? undefined : () => openAddModal(key)}
                    onKeyDown={
                      readOnly
                        ? undefined
                        : (e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              openAddModal(key);
                            }
                          }
                    }
                    className={`min-h-[128px] p-3 flex flex-col ${readOnly ? "" : "cursor-pointer hover:bg-black/[0.02] transition-colors"}`}
                    style={{
                      backgroundColor: C.surface,
                      ...cellBorder,
                    }}
                  >
                    <DayNumber day={day} C={C} align="right" />
                    <div className="flex flex-col gap-1 flex-1 min-h-0">
                      {dayEvents.slice(0, 3).map((event) => (
                        <EventChip
                          key={event.id}
                          event={event}
                          C={C}
                          selected={selectedEventId === event.id}
                          onClick={() => setSelectedEventId(event.id)}
                        />
                      ))}
                      {dayEvents.length > 3 && (
                        <span className="text-[11px] px-2" style={{ color: C.textTertiary }}>
                          +{dayEvents.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={prevWeek}
              className="p-2 rounded-full transition-colors cursor-pointer hover:bg-black/5"
              style={{ color: C.textTertiary }}
              aria-label="Previous week"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <h3
              className="text-base font-semibold min-w-[220px] text-center"
              style={{ color: C.textPrimary }}
            >
              {formatWeekRangeLabel(weekDates)}
            </h3>
            <button
              type="button"
              onClick={nextWeek}
              className="p-2 rounded-full transition-colors cursor-pointer hover:bg-black/5"
              style={{ color: C.textTertiary }}
              aria-label="Next week"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div
            className="grid grid-cols-7 gap-px rounded-2xl overflow-hidden shadow-sm min-h-[360px]"
            style={{ backgroundColor: CALENDAR_LINE }}
          >
            {weekDates.map((day) => {
              const key = dateKey(day);
              const dayEvents = eventsByDate.get(key) ?? [];
              return (
                <div
                  key={key}
                  role={readOnly ? undefined : "button"}
                  tabIndex={readOnly ? undefined : 0}
                  onClick={readOnly ? undefined : () => openAddModal(key)}
                  onKeyDown={
                    readOnly
                      ? undefined
                      : (e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            openAddModal(key);
                          }
                        }
                  }
                  className={`flex flex-col min-h-[360px] p-3 ${readOnly ? "" : "cursor-pointer hover:bg-black/[0.02] transition-colors"}`}
                  style={{ backgroundColor: C.surface }}
                >
                  <div className="text-center mb-3">
                    <p
                      className="text-[10px] font-medium uppercase tracking-wide"
                      style={{ color: C.textTertiary }}
                    >
                      {DAY_NAMES[day.getDay()]}
                    </p>
                    <div className="mt-1">
                      <DayNumber day={day} C={C} align="center" size="lg" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 flex-1">
                    {dayEvents.map((event) => (
                      <div key={event.id}>
                        <EventChip
                          event={event}
                          C={C}
                          selected={selectedEventId === event.id}
                          onClick={() => setSelectedEventId(event.id)}
                        />
                        {event.time && (
                          <p className="text-[10px] px-2 mt-0.5" style={{ color: C.textTertiary }}>
                            {event.time}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <CommitteeEventDetailPanel
        event={selectedEvent}
        C={C}
        readOnly={readOnly}
        onClose={() => setSelectedEventId(null)}
        onDelete={readOnly ? undefined : handleDelete}
      />

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div
            className="rounded-2xl shadow-xl w-full max-w-md p-6"
            style={{ backgroundColor: C.surface }}
          >
            <h3 className="text-lg font-semibold mb-4" style={{ color: C.textPrimary }}>
              Add event
            </h3>
            <div className="space-y-3">
              <input
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border"
                style={{ borderColor: C.border }}
              />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border"
                style={{ borderColor: C.border }}
              />
              <input
                placeholder="Time (optional)"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border"
                style={{ borderColor: C.border }}
              />
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value as CommitteeEventType)}
                className="w-full px-3 py-2 text-sm rounded-lg border"
                style={{ borderColor: C.border }}
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
                style={{ borderColor: C.border }}
              />
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                type="button"
                onClick={() => setShowAdd(false)}
                className="px-4 py-2 text-sm cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAdd}
                disabled={saving || !title.trim() || !date}
                className="px-4 py-2 text-sm font-medium text-white rounded-md cursor-pointer disabled:opacity-50"
                style={{ backgroundColor: C.accent }}
              >
                {saving ? "Adding…" : "Add event"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
