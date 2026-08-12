"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MapPin, X } from "lucide-react";
import OrganizationEventsCalendar from "@/components/school-events-calendar/OrganizationEventsCalendar";
import type { CalendarViewMode } from "@/components/school-events-calendar/CalendarToolbar";
import { parseEventDate } from "@/lib/committees/calendar-utils";
import {
  getEventDisplayStyle,
  SCHOOL_EVENT_TYPE_LABELS,
} from "@/lib/school-events/event-labels";
import { formatEventTimeRange } from "@/lib/school-events/calendar-time";
import type { OrganizationEvent, ParentCalendarInitialData } from "@/lib/school-events/types";
import {
  buildAdminThemeTokens,
  type AdminThemeTokens,
} from "@/lib/organization-settings/theme";
import type { OrganizationBranding } from "@/lib/organization-settings/types";

type ParentCalendarPageProps = {
  branding: OrganizationBranding;
  initialData: ParentCalendarInitialData;
  previewMode?: boolean;
};

function formatEventDate(date: string) {
  return parseEventDate(date).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function EventSidebar({
  event,
  C,
  onClose,
}: {
  event: OrganizationEvent;
  C: AdminThemeTokens;
  onClose: () => void;
}) {
  const typeStyle = getEventDisplayStyle(event);

  return (
    <>
      <motion.div
        key="event-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="absolute inset-0 z-40 bg-black/20"
        onClick={onClose}
      />
      <motion.div
        key="event-panel"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 280 }}
        className="absolute inset-y-0 right-0 z-50 flex w-full max-w-[320px] flex-col overflow-y-auto border-l bg-white shadow-2xl sm:max-w-[360px]"
        style={{ borderColor: C.border }}
      >
        <div
          className="px-5 pb-4 pt-5"
          style={{
            backgroundColor: `${typeStyle.text}12`,
            borderBottom: `2px solid ${typeStyle.text}30`,
          }}
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <span
                className="mb-2 inline-block rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
                style={{ backgroundColor: typeStyle.bg, color: typeStyle.text }}
              >
                {SCHOOL_EVENT_TYPE_LABELS[event.type]}
              </span>
              <h2
                className="font-serif text-lg font-semibold leading-snug"
                style={{ color: C.textPrimary }}
              >
                {event.title}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer rounded-full p-1.5 transition-colors hover:bg-black/5"
              aria-label="Close"
            >
              <X className="h-4 w-4" style={{ color: C.textTertiary }} />
            </button>
          </div>
        </div>

        <div className="space-y-4 px-5 py-5">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wide" style={{ color: C.textTertiary }}>
              Date
            </p>
            <p className="mt-1 text-sm font-medium" style={{ color: C.textPrimary }}>
              {formatEventDate(event.date)}
            </p>
          </div>

          <div>
            <p className="text-[11px] font-medium uppercase tracking-wide" style={{ color: C.textTertiary }}>
              Time
            </p>
            <p className="mt-1 text-sm" style={{ color: C.textPrimary }}>
              {formatEventTimeRange(event)}
            </p>
          </div>

          {event.location ? (
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide" style={{ color: C.textTertiary }}>
                Location
              </p>
              <p className="mt-1 flex items-start gap-1.5 text-sm" style={{ color: C.textPrimary }}>
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: C.textTertiary }} />
                {event.location}
              </p>
            </div>
          ) : null}

          {event.description ? (
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide" style={{ color: C.textTertiary }}>
                Details
              </p>
              <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed" style={{ color: C.textSecondary }}>
                {event.description}
              </p>
            </div>
          ) : null}
        </div>
      </motion.div>
    </>
  );
}

function EmptyDaySidebar({
  date,
  C,
  onClose,
}: {
  date: string;
  C: AdminThemeTokens;
  onClose: () => void;
}) {
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 z-40 bg-black/20"
        onClick={onClose}
      />
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 280 }}
        className="absolute inset-y-0 right-0 z-50 flex w-full max-w-[300px] flex-col border-l bg-white px-5 py-6 shadow-2xl sm:max-w-[320px]"
        style={{ borderColor: C.border }}
      >
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wide" style={{ color: C.textTertiary }}>
              Selected day
            </p>
            <h2 className="mt-1 font-serif text-lg font-semibold" style={{ color: C.textPrimary }}>
              {formatEventDate(date)}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-full p-1.5 hover:bg-black/5"
            aria-label="Close"
          >
            <X className="h-4 w-4" style={{ color: C.textTertiary }} />
          </button>
        </div>
        <p className="mt-6 text-sm leading-relaxed" style={{ color: C.textSecondary }}>
          Nothing scheduled for this day.
        </p>
      </motion.div>
    </>
  );
}

export default function ParentCalendarPage({
  branding,
  initialData,
}: ParentCalendarPageProps) {
  const C = useMemo(() => buildAdminThemeTokens(branding), [branding]);
  const [events] = useState(initialData.events);
  const [view, setView] = useState<CalendarViewMode>("month");
  const [selectedEvent, setSelectedEvent] = useState<OrganizationEvent | null>(null);
  const [selectedEmptyDay, setSelectedEmptyDay] = useState<string | null>(null);
  const [viewedYear, setViewedYear] = useState(() => new Date().getFullYear());
  const [viewedMonth, setViewedMonth] = useState(() => new Date().getMonth());

  const eventsThisMonth = useMemo(
    () =>
      events.filter((event) => {
        const d = parseEventDate(event.date);
        return d.getFullYear() === viewedYear && d.getMonth() === viewedMonth;
      }),
    [events, viewedMonth, viewedYear],
  );

  const handleDayClick = (date: string) => {
    const dayEvents = events.filter((e) => e.date === date);
    setSelectedEvent(null);
    if (dayEvents.length > 0) {
      setSelectedEmptyDay(null);
      setSelectedEvent(dayEvents[0]);
    } else {
      setSelectedEmptyDay(date);
    }
  };

  const handleEventClick = (event: OrganizationEvent) => {
    setSelectedEmptyDay(null);
    setSelectedEvent(event);
  };

  const closeSidebar = () => {
    setSelectedEvent(null);
    setSelectedEmptyDay(null);
  };

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-8 sm:py-8">
        <div className="mx-auto w-full max-w-7xl">
          <OrganizationEventsCalendar
            C={C}
            events={events}
            view={view}
            onViewChange={setView}
            readOnly
            emptyHint="No events scheduled yet. Your school calendar will appear here when events are added."
            onDayClick={handleDayClick}
            onEventClick={handleEventClick}
            onPeriodChange={(y, m) => {
              setViewedYear(y);
              setViewedMonth(m);
            }}
            header={
              <div className="mb-1">
                <h1 className="font-serif text-xl font-semibold" style={{ color: C.textPrimary }}>
                  Calendar / events
                </h1>
                <p className="mt-1 text-sm" style={{ color: C.textTertiary }}>
                  Field trips, events, and key dates
                </p>
              </div>
            }
          />

          {view === "month" ? (
            <div className="mt-6">
              <h2 className="text-sm font-semibold" style={{ color: C.textPrimary }}>
                This month
              </h2>
              {eventsThisMonth.length === 0 ? (
                <p className="mt-2 text-xs" style={{ color: C.textTertiary }}>
                  No events this month.
                </p>
              ) : (
                <ul className="mt-3 space-y-2">
                  {eventsThisMonth.map((event) => {
                    const colors = getEventDisplayStyle(event);
                    return (
                      <li key={event.id}>
                        <button
                          type="button"
                          onClick={() => handleEventClick(event)}
                          className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left transition-colors hover:bg-black/[0.02]"
                          style={{ borderColor: C.border, backgroundColor: C.surface }}
                        >
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium" style={{ color: C.textPrimary }}>
                              {event.title}
                            </p>
                            <p className="mt-0.5 text-xs" style={{ color: C.textTertiary }}>
                              {formatEventDate(event.date)}
                              {!event.isAllDay ? ` · ${formatEventTimeRange(event)}` : ""}
                            </p>
                          </div>
                          <span
                            className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase"
                            style={{ backgroundColor: colors.bg, color: colors.text }}
                          >
                            {SCHOOL_EVENT_TYPE_LABELS[event.type]}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          ) : null}
        </div>
      </div>

      <AnimatePresence>
        {selectedEvent ? (
          <EventSidebar event={selectedEvent} C={C} onClose={closeSidebar} />
        ) : null}
        {selectedEmptyDay && !selectedEvent ? (
          <EmptyDaySidebar date={selectedEmptyDay} C={C} onClose={closeSidebar} />
        ) : null}
      </AnimatePresence>
    </div>
  );
}
