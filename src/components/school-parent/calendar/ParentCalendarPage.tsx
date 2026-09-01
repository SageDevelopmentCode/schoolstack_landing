"use client";

import { useCallback, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MapPin, X } from "lucide-react";
import OrganizationEventsCalendar from "@/components/school-events-calendar/OrganizationEventsCalendar";
import type { CalendarViewMode } from "@/components/school-events-calendar/CalendarToolbar";
import ParentCalendarAgendaPanel from "@/components/school-parent/calendar/ParentCalendarAgendaPanel";
import { useParentTheme } from "@/components/school-parent/ParentThemeContext";
import ParentCard from "@/components/school-parent/ui/ParentCard";
import ParentChip from "@/components/school-parent/ui/ParentChip";
import ParentDisplayHeading from "@/components/school-parent/ui/ParentDisplayHeading";
import {
  eventTypeChipTone,
  SCHOOL_EVENT_TYPE_LABELS,
} from "@/components/school-parent/calendar/parent-calendar-agenda-utils";
import { parseEventDate } from "@/lib/committees/calendar-utils";
import { formatEventTimeRange } from "@/lib/school-events/calendar-time";
import type { OrganizationEvent, ParentCalendarInitialData } from "@/lib/school-events/types";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import type { OrganizationBranding } from "@/lib/organization-settings/types";

type ParentCalendarPageProps = {
  branding: OrganizationBranding;
  initialData: ParentCalendarInitialData;
  previewMode?: boolean;
  agendaTitle?: string;
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
  theme,
  onClose,
}: {
  event: OrganizationEvent;
  theme: ParentThemeTokens;
  onClose: () => void;
}) {
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
        className="absolute inset-y-0 right-0 z-50 flex w-full max-w-full flex-col overflow-y-auto border-l bg-white shadow-2xl sm:max-w-[360px]"
        style={{ borderColor: theme.line }}
      >
        <div
          className="px-5 pb-4 pt-5"
          style={{
            backgroundColor: theme.primarySoft,
            borderBottom: `1px solid ${theme.line}`,
          }}
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <ParentChip
                theme={theme}
                tone={eventTypeChipTone(event.type)}
                className="mb-2 !text-[10px]"
              >
                {SCHOOL_EVENT_TYPE_LABELS[event.type]}
              </ParentChip>
              <ParentDisplayHeading
                theme={theme}
                as="h2"
                size="section"
                className="!text-lg !leading-snug"
              >
                {event.title}
              </ParentDisplayHeading>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer rounded-full p-1.5 transition-colors hover:bg-black/5"
              aria-label="Close"
            >
              <X className="h-4 w-4" style={{ color: theme.muted }} />
            </button>
          </div>
        </div>

        <div className="space-y-4 px-5 py-5">
          <div>
            <p
              className="text-[11px] font-bold uppercase tracking-wide"
              style={{ color: theme.muted }}
            >
              Date
            </p>
            <p className="mt-1 text-sm font-medium" style={{ color: theme.ink }}>
              {formatEventDate(event.date)}
            </p>
          </div>

          <div>
            <p
              className="text-[11px] font-bold uppercase tracking-wide"
              style={{ color: theme.muted }}
            >
              Time
            </p>
            <p className="mt-1 text-sm" style={{ color: theme.ink }}>
              {formatEventTimeRange(event)}
            </p>
          </div>

          {event.location ? (
            <div>
              <p
                className="text-[11px] font-bold uppercase tracking-wide"
                style={{ color: theme.muted }}
              >
                Location
              </p>
              <p className="mt-1 flex items-start gap-1.5 text-sm" style={{ color: theme.ink }}>
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: theme.muted }} />
                {event.location}
              </p>
            </div>
          ) : null}

          {event.description ? (
            <div>
              <p
                className="text-[11px] font-bold uppercase tracking-wide"
                style={{ color: theme.muted }}
              >
                Details
              </p>
              <p
                className="mt-1 whitespace-pre-wrap text-sm leading-relaxed"
                style={{ color: theme.muted }}
              >
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
  theme,
  onClose,
}: {
  date: string;
  theme: ParentThemeTokens;
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
        className="absolute inset-y-0 right-0 z-50 flex w-full max-w-full flex-col border-l bg-white px-5 py-6 shadow-2xl sm:max-w-[320px]"
        style={{ borderColor: theme.line }}
      >
        <div className="flex items-start justify-between gap-2">
          <div>
            <p
              className="text-[11px] font-bold uppercase tracking-wide"
              style={{ color: theme.muted }}
            >
              Selected day
            </p>
            <ParentDisplayHeading
              theme={theme}
              as="h2"
              size="section"
              className="mt-1 !text-lg"
            >
              {formatEventDate(date)}
            </ParentDisplayHeading>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-full p-1.5 hover:bg-black/5"
            aria-label="Close"
          >
            <X className="h-4 w-4" style={{ color: theme.muted }} />
          </button>
        </div>
        <p className="mt-6 text-sm leading-relaxed" style={{ color: theme.muted }}>
          Nothing scheduled for this day.
        </p>
      </motion.div>
    </>
  );
}

export default function ParentCalendarPage({
  initialData,
  agendaTitle,
}: ParentCalendarPageProps) {
  const { theme, adminCompat: C } = useParentTheme();
  const [events] = useState(initialData.events);
  const [view, setView] = useState<CalendarViewMode>("week");
  const [selectedEvent, setSelectedEvent] = useState<OrganizationEvent | null>(null);
  const [selectedEmptyDay, setSelectedEmptyDay] = useState<string | null>(null);
  const [periodKey, setPeriodKey] = useState("initial");

  const handlePeriodMetaChange = useCallback(
    (meta: { periodLabel: string; isCurrentPeriod: boolean }) => {
      setPeriodKey(`${view}-${meta.periodLabel}`);
    },
    [view],
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
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-3 px-2 py-2 sm:px-3 sm:py-3 lg:gap-4">
          <h1 className="sr-only">Calendar</h1>

          <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1.25fr_0.75fr] lg:gap-4">
            <ParentCard theme={theme} className="!p-3 sm:!p-4">
              <OrganizationEventsCalendar
                C={C}
                events={events}
                view={view}
                onViewChange={setView}
                readOnly
                variant="parent-story"
                parentTheme={theme}
                emptyHint="No events scheduled yet. Your school calendar will appear here when events are added."
                selectedEventId={selectedEvent?.id ?? null}
                onDayClick={handleDayClick}
                onEventClick={handleEventClick}
                onPeriodMetaChange={handlePeriodMetaChange}
              />
            </ParentCard>

            <ParentCalendarAgendaPanel
              theme={theme}
              events={events}
              periodKey={periodKey}
              selectedEventId={selectedEvent?.id ?? null}
              onEventClick={handleEventClick}
              agendaTitle={agendaTitle}
            />
          </div>
        </div>
      </div>

      <AnimatePresence>
        {selectedEvent ? (
          <EventSidebar event={selectedEvent} theme={theme} onClose={closeSidebar} />
        ) : null}
        {selectedEmptyDay && !selectedEvent ? (
          <EmptyDaySidebar date={selectedEmptyDay} theme={theme} onClose={closeSidebar} />
        ) : null}
      </AnimatePresence>
    </div>
  );
}
