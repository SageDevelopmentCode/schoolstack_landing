"use client";

import { ChevronRight, MapPin } from "lucide-react";
import { eventTypeChipTone, SCHOOL_EVENT_TYPE_LABELS } from "@/components/school-parent/calendar/parent-calendar-agenda-utils";
import { GChip, G_FOCUS, SPRINGY } from "@/components/school-parent/garden/ui";
import { isToday, parseEventDate } from "@/lib/committees/calendar-utils";
import { formatEventTimeRange } from "@/lib/school-events/calendar-time";
import { getEventDisplayStyle } from "@/lib/school-events/event-labels";
import type { OrganizationEvent } from "@/lib/school-events/types";

/*
 * Small pieces shared by the Garden calendar views. Event colours come from
 * the school's own event settings (`getEventDisplayStyle`), never hard-coded.
 */

export const WEEKDAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

/** "Tuesday, Nov 18" */
export function formatDayHeading(date: string): string {
  return parseEventDate(date).toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

/** Screen-reader name for a day cell: "Tuesday, November 18, 2 events, today". */
export function dayAriaLabel(day: Date, count: number): string {
  const label = day.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  const events = count === 0 ? "no events" : count === 1 ? "1 event" : `${count} events`;
  return `${label}, ${events}${isToday(day) ? ", today" : ""}`;
}

export function pluralEvents(count: number): string {
  return count === 1 ? "1 event" : `${count} events`;
}

/** Event-type chip (Field trip, No school, …). */
export function EventTypeChip({ event, className = "" }: { event: OrganizationEvent; className?: string }) {
  return (
    <GChip tone={eventTypeChipTone(event.type)} className={className}>
      {SCHOOL_EVENT_TYPE_LABELS[event.type]}
    </GChip>
  );
}

/** Colour dot in the event's own colour (decorative). */
export function EventSwatch({ event, className = "h-2 w-2" }: { event: Pick<OrganizationEvent, "type" | "colorKey">; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block shrink-0 rounded-full ${className}`}
      style={{ backgroundColor: getEventDisplayStyle(event).text }}
    />
  );
}

/**
 * One event as a full-width row button: colour bar, title, time + place,
 * type chip, chevron. Used in the Selected day card, the phone sheet and the
 * phone week list.
 */
export function EventRow({
  event,
  onOpen,
  selected = false,
  "data-testid": testId,
}: {
  event: OrganizationEvent;
  onOpen: (event: OrganizationEvent) => void;
  selected?: boolean;
  "data-testid"?: string;
}) {
  const colors = getEventDisplayStyle(event);
  return (
    <button
      type="button"
      onClick={() => onOpen(event)}
      data-testid={testId}
      aria-current={selected ? "true" : undefined}
      className={`group relative flex w-full items-center gap-3 overflow-hidden rounded-2xl border-[1.5px] bg-white py-3 pl-4 pr-3 text-left hover:-translate-y-0.5 hover:border-[var(--sf-ink)]/30 ${
        selected ? "border-[var(--sf-ink)] shadow-[0_3px_0_0_var(--sf-ink)]" : "border-[var(--sf-ink)]/12"
      } ${SPRINGY} ${G_FOCUS}`}
    >
      <span aria-hidden="true" className="absolute inset-y-0 left-0 w-1.5" style={{ backgroundColor: colors.text }} />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[15px] font-extrabold text-[var(--sf-ink)]">{event.title}</span>
        <span className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[13px] font-semibold text-[var(--sf-soft)]">
          <span>{formatEventTimeRange(event)}</span>
          {event.location ? (
            <span className="inline-flex min-w-0 items-center gap-1">
              <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span className="truncate">{event.location}</span>
            </span>
          ) : null}
        </span>
      </span>
      <span className="hidden shrink-0 sm:inline-flex">
        <EventTypeChip event={event} />
      </span>
      <ChevronRight
        className="h-4 w-4 shrink-0 text-[var(--sf-ink)]/50 transition-transform duration-300 group-hover:translate-x-0.5"
        aria-hidden="true"
      />
    </button>
  );
}
