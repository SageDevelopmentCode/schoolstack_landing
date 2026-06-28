"use client";

import { useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, LayoutGrid, List, MapPin, Plus } from "lucide-react";
import type { Committee, CommitteeEvent } from "./types";
import AddEventModal from "./AddEventModal";
import CommitteeEventDetailSidebar from "./CommitteeEventDetailSidebar";

type CalendarView = "list" | "month";

const TYPE_COLORS: Record<CommitteeEvent["type"], string> = {
  meeting: "bg-[#827096]/10 text-[#827096]",
  deadline: "bg-amber-100 text-amber-700",
  service: "bg-emerald-100 text-emerald-700",
  event: "bg-[#b3b462]/20 text-[#5C5A30]",
};

const TYPE_CHIP_COLORS: Record<CommitteeEvent["type"], string> = {
  meeting: "bg-[#827096]/15 text-[#827096]",
  deadline: "bg-amber-100 text-amber-700",
  service: "bg-emerald-100 text-emerald-700",
  event: "bg-[#b3b462]/25 text-[#5C5A30]",
};

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function parseEventDate(date: string) {
  return new Date(date + "T00:00:00");
}

function monthKeyFromDate(date: string) {
  const d = parseEventDate(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function formatMonthLabel(monthKey: string) {
  const [year, month] = monthKey.split("-").map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

function groupEventsByMonth(events: CommitteeEvent[]) {
  const sorted = [...events].sort(
    (a, b) => parseEventDate(a.date).getTime() - parseEventDate(b.date).getTime(),
  );
  const groups = new Map<string, CommitteeEvent[]>();
  for (const event of sorted) {
    const key = monthKeyFromDate(event.date);
    const list = groups.get(key) ?? [];
    list.push(event);
    groups.set(key, list);
  }
  return groups;
}

function getMonthCells(year: number, month: number): (Date | null)[] {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1)),
  ];
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function dateKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function initialMonthYear(events: CommitteeEvent[]) {
  if (events.length === 0) return { year: 2026, month: 3 };
  const first = parseEventDate(
    [...events].sort(
      (a, b) => parseEventDate(a.date).getTime() - parseEventDate(b.date).getTime(),
    )[0].date,
  );
  return { year: first.getFullYear(), month: first.getMonth() };
}

function EventCard({
  event,
  onClick,
  isSelected = false,
}: {
  event: CommitteeEvent;
  onClick?: () => void;
  isSelected?: boolean;
}) {
  const d = parseEventDate(event.date);
  const className = `flex items-start gap-4 p-4 w-full text-left bg-white border rounded-xl transition-all ${
    isSelected
      ? "border-[#827096]/30 ring-2 ring-[#827096]/25"
      : "border-gray-100 hover:border-gray-200 hover:shadow-sm"
  } ${onClick ? "cursor-pointer" : ""}`;

  const content = (
    <>
      <div className="w-12 h-12 rounded-xl bg-gray-50 flex flex-col items-center justify-center flex-shrink-0">
        <span className="text-[10px] font-bold text-gray-400 uppercase">
          {d.toLocaleString("en-US", { month: "short" })}
        </span>
        <span className="text-lg font-bold text-gray-800 leading-none">{d.getDate()}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-semibold text-gray-800">{event.title}</p>
          <span
            className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${TYPE_COLORS[event.type]}`}
          >
            {event.type}
          </span>
        </div>
        {event.time && <p className="text-xs text-gray-500 mt-1">{event.time}</p>}
        {event.location && (
          <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
            <MapPin className="w-3 h-3 shrink-0" />
            {event.location}
          </p>
        )}
      </div>
    </>
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={className}>
        {content}
      </button>
    );
  }

  return <div className={className}>{content}</div>;
}

export default function CommitteeCalendarSection({
  committee,
  isAdminView = false,
  onCommitteeUpdate,
}: {
  committee: Committee;
  isAdminView?: boolean;
  onCommitteeUpdate?: (updated: Committee) => void;
}) {
  const [showAdd, setShowAdd] = useState(false);
  const [view, setView] = useState<CalendarView>("list");
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const initial = useMemo(() => initialMonthYear(committee.events), [committee.events]);
  const [year, setYear] = useState(initial.year);
  const [month, setMonth] = useState(initial.month);

  const canManage = Boolean(isAdminView && committee.status === "active" && onCommitteeUpdate);
  const grouped = useMemo(() => groupEventsByMonth(committee.events), [committee.events]);
  const eventsByDate = useMemo(() => {
    const map = new Map<string, CommitteeEvent[]>();
    for (const event of committee.events) {
      const list = map.get(event.date) ?? [];
      list.push(event);
      map.set(event.date, list);
    }
    return map;
  }, [committee.events]);

  const monthLabel = new Date(year, month, 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
  const cells = getMonthCells(year, month);
  const selectedEvent =
    committee.events.find((e) => e.id === selectedEventId) ?? null;

  const handleAdd = (event: CommitteeEvent) => {
    onCommitteeUpdate?.({ ...committee, events: [...committee.events, event] });
  };

  const switchView = (next: CalendarView) => {
    setSelectedEventId(null);
    setView(next);
  };

  const prevMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear((y) => y - 1);
    } else {
      setMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear((y) => y + 1);
    } else {
      setMonth((m) => m + 1);
    }
  };

  return (
    <div className="space-y-4 w-full">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1 bg-gray-100 rounded-md p-1">
          <button
            type="button"
            onClick={() => switchView("list")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
              view === "list"
                ? "bg-white text-gray-800 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <List className="w-3.5 h-3.5" />
            List
          </button>
          <button
            type="button"
            onClick={() => switchView("month")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
              view === "month"
                ? "bg-white text-gray-800 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            Calendar
          </button>
        </div>
        {canManage && (
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#827096] hover:bg-[#5A4D68] rounded-md cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add event
          </button>
        )}
      </div>

      {view === "list" ? (
        committee.events.length === 0 ? (
          <p className="text-sm text-gray-400 py-8 text-center">No events scheduled yet.</p>
        ) : (
          <div className="space-y-8 w-full">
            {Array.from(grouped.entries()).map(([key, events]) => (
              <section key={key} className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                  {formatMonthLabel(key)}
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  {events.map((event) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      onClick={() => setSelectedEventId(event.id)}
                      isSelected={selectedEventId === event.id}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={prevMonth}
              className="p-1.5 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              aria-label="Previous month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <h3 className="text-sm font-semibold text-gray-800 min-w-[160px] text-center">
              {monthLabel}
            </h3>
            <button
              type="button"
              onClick={nextMonth}
              className="p-1.5 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              aria-label="Next month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="border border-gray-100 rounded-xl overflow-hidden bg-white">
            <div className="grid grid-cols-7 border-b border-gray-100 bg-gray-50/80">
              {DAY_NAMES.map((d) => (
                <div
                  key={d}
                  className="text-center text-[11px] font-semibold text-gray-400 py-2"
                >
                  {d}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 divide-x divide-y divide-gray-100">
              {cells.map((day, idx) => {
                if (!day) {
                  return (
                    <div
                      key={`empty-${idx}`}
                      className="min-h-[88px] bg-gray-50/40"
                    />
                  );
                }
                const key = dateKey(day);
                const dayEvents = eventsByDate.get(key) ?? [];
                const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                return (
                  <div
                    key={key}
                    className={`min-h-[88px] p-1.5 ${isWeekend ? "bg-gray-50/60" : "bg-white"}`}
                  >
                    <div className="text-xs font-semibold text-gray-500 mb-1 w-6 h-6 flex items-center justify-center">
                      {day.getDate()}
                    </div>
                    <div className="flex flex-col gap-0.5">
                      {dayEvents.slice(0, 3).map((event) => (
                        <button
                          key={event.id}
                          type="button"
                          onClick={() => setSelectedEventId(event.id)}
                          className={`w-full text-left text-[10px] font-semibold px-1.5 py-0.5 rounded truncate cursor-pointer hover:opacity-80 transition-opacity ${TYPE_CHIP_COLORS[event.type]} ${
                            selectedEventId === event.id ? "ring-1 ring-[#827096]/40" : ""
                          }`}
                        >
                          {event.title}
                        </button>
                      ))}
                      {dayEvents.length > 3 && (
                        <span className="text-[10px] text-gray-400 px-1.5">
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
      )}

      <CommitteeEventDetailSidebar
        event={selectedEvent}
        onClose={() => setSelectedEventId(null)}
      />

      <AnimatePresence>
        {showAdd && (
          <AddEventModal onClose={() => setShowAdd(false)} onSave={handleAdd} />
        )}
      </AnimatePresence>
    </div>
  );
}
