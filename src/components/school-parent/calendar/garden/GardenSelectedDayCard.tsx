"use client";

import { useId } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { CalendarX2 } from "lucide-react";
import { GDialog } from "@/components/school-parent/garden/GDialog";
import { PORTAL_EASE } from "@/components/school-parent/garden/motion";
import { GCard, GChip, GIcon, GKicker } from "@/components/school-parent/garden/ui";
import { isToday, parseEventDate } from "@/lib/committees/calendar-utils";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import type { OrganizationEvent } from "@/lib/school-events/types";
import { EventRow, formatDayHeading, pluralEvents } from "./calendar-garden-shared";

/** The selected day's events, or a calm empty state. Shared by the rail card and the phone sheet. */
export function DayEventList({
  date,
  events,
  selectedEventId,
  onOpen,
}: {
  date: string;
  events: OrganizationEvent[];
  selectedEventId: string | null;
  onOpen: (event: OrganizationEvent) => void;
}) {
  const reduce = useReducedMotion() === true;
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={date}
        initial={reduce ? false : { opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={reduce ? undefined : { opacity: 0, y: -4 }}
        transition={{ duration: 0.22, ease: PORTAL_EASE }}
      >
        {events.length === 0 ? (
          <div className="flex items-center gap-3 rounded-2xl border-[1.5px] border-dashed border-[var(--sf-ink)]/15 bg-[var(--sf-paper)] px-4 py-4">
            <GIcon size="sm">
              <CalendarX2 />
            </GIcon>
            <div className="min-w-0">
              <p className="m-0 text-[15px] font-extrabold text-[var(--sf-ink)]">Nothing scheduled for this day.</p>
              <p className="m-0 mt-0.5 text-[13px] font-semibold text-[var(--sf-soft)]">
                Pick another day on the calendar, or check what&apos;s next up.
              </p>
            </div>
          </div>
        ) : (
          <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
            {events.map((event) => (
              <li key={event.id}>
                <EventRow
                  event={event}
                  onOpen={onOpen}
                  selected={selectedEventId === event.id}
                  data-testid="parent-calendar-day-event"
                />
              </li>
            ))}
          </ul>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

function dayKicker(date: string): string {
  return isToday(parseEventDate(date)) ? "Today" : "Selected day";
}

/**
 * The day picked on the calendar (follows clicks and arrow keys).
 * `variant="rail"` is a flat section for the full-bleed page rail; `card` is a GCard.
 */
export default function GardenSelectedDayCard({
  date,
  events,
  selectedEventId,
  onOpen,
  index = 0,
  variant = "card",
}: {
  date: string;
  events: OrganizationEvent[];
  selectedEventId: string | null;
  onOpen: (event: OrganizationEvent) => void;
  index?: number;
  variant?: "card" | "rail";
}) {
  const titleId = useId();
  const count = events.length > 0 ? <GChip tone="neutral">{pluralEvents(events.length)}</GChip> : null;
  const list = <DayEventList date={date} events={events} selectedEventId={selectedEventId} onOpen={onOpen} />;

  if (variant === "rail") {
    return (
      <section aria-labelledby={titleId} data-testid="parent-calendar-selected-day" className="px-5 py-5 sm:px-6">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-x-3 gap-y-2">
          <div className="min-w-0">
            <GKicker>{dayKicker(date)}</GKicker>
            <h2 id={titleId} aria-live="polite" className="sf-display m-0 mt-1 text-[1.4rem] leading-[1.05] text-[var(--sf-ink)]">
              {formatDayHeading(date)}
            </h2>
          </div>
          {count}
        </div>
        {list}
      </section>
    );
  }

  return (
    <GCard
      index={index}
      kicker={dayKicker(date)}
      title={<span aria-live="polite">{formatDayHeading(date)}</span>}
      action={count}
      data-testid="parent-calendar-selected-day"
    >
      {list}
    </GCard>
  );
}

/** Phones/tablets: the tapped day as a bottom sheet (the rail sits below the grid there). */
export function GardenDaySheet({
  theme,
  open,
  date,
  events,
  selectedEventId,
  onOpen,
  onClose,
}: {
  theme: ParentThemeTokens;
  open: boolean;
  date: string;
  events: OrganizationEvent[];
  selectedEventId: string | null;
  onOpen: (event: OrganizationEvent) => void;
  onClose: () => void;
}) {
  return (
    <GDialog
      theme={theme}
      open={open}
      onClose={onClose}
      title={formatDayHeading(date)}
      description={events.length > 0 ? `${pluralEvents(events.length)} · tap one for details` : dayKicker(date)}
      data-testid="parent-calendar-day-sheet"
    >
      <DayEventList date={date} events={events} selectedEventId={selectedEventId} onOpen={onOpen} />
    </GDialog>
  );
}
