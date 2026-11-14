"use client";

import { useMemo } from "react";
import { SCHOOL_EVENT_TYPE_LABELS } from "@/components/school-parent/calendar/parent-calendar-agenda-utils";
import { getEventDisplayStyle } from "@/lib/school-events/event-labels";
import type { OrganizationEvent } from "@/lib/school-events/types";

const KBD =
  "inline-flex h-5 min-w-5 items-center justify-center rounded-md border-[1.5px] border-[var(--sf-ink)]/20 bg-white px-1 text-[10px] font-extrabold text-[var(--sf-ink)]/70";

/**
 * What the colours mean (built from the events actually on the calendar, so
 * a school's custom colours are described truthfully) + a keyboard tip on
 * desktop for the calendar's existing arrow / Enter shortcuts.
 */
export default function GardenCalendarLegend({ events }: { events: OrganizationEvent[] }) {
  const entries = useMemo(() => {
    // One entry per type; a type the school shows in several colours gets several dots.
    const byLabel = new Map<string, Set<string>>();
    for (const event of events) {
      const label = SCHOOL_EVENT_TYPE_LABELS[event.type];
      const colors = byLabel.get(label) ?? new Set<string>();
      colors.add(getEventDisplayStyle(event).text);
      byLabel.set(label, colors);
    }
    return [...byLabel.entries()]
      .map(([label, colors]) => ({ label, colors: [...colors] }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [events]);

  return (
    <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2" data-testid="parent-calendar-legend">
      {entries.length > 0 ? (
        <ul className="m-0 flex list-none flex-wrap items-center gap-x-4 gap-y-1.5 p-0" aria-label="Event colours">
          {entries.map((entry) => (
            <li key={entry.label} className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--sf-soft)]">
              <span aria-hidden="true" className="inline-flex items-center -space-x-0.5">
                {entry.colors.map((color) => (
                  <span key={color} className="h-2.5 w-2.5 rounded-full ring-2 ring-white" style={{ backgroundColor: color }} />
                ))}
              </span>
              {entry.label}
            </li>
          ))}
        </ul>
      ) : (
        <span />
      )}
      <p className="m-0 hidden items-center gap-1.5 text-[12px] font-semibold text-[var(--sf-soft)] lg:inline-flex">
        <span className="sr-only">Keyboard: arrow keys move between days, Enter opens the day&apos;s first event.</span>
        <span aria-hidden="true" className="inline-flex items-center gap-1">
          <kbd className={KBD}>←</kbd>
          <kbd className={KBD}>→</kbd>
          <kbd className={KBD}>↑</kbd>
          <kbd className={KBD}>↓</kbd>
          <span className="ml-0.5">move days</span>
          <kbd className={`${KBD} ml-2`}>Enter</kbd>
          <span className="ml-0.5">opens</span>
        </span>
      </p>
    </div>
  );
}
