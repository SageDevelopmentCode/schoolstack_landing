"use client";

import { useId, useState, type ReactNode } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { formatAgendaEventMeta } from "@/components/school-parent/calendar/parent-calendar-agenda-utils";
import { DateStamp, GCard, GKicker, G_FOCUS, SPRINGY, gBtnButterSm } from "@/components/school-parent/garden/ui";
import { formatEventTimeRange } from "@/lib/school-events/calendar-time";
import type { OrganizationEvent } from "@/lib/school-events/types";
import { EventSwatch } from "./calendar-garden-shared";

const INITIAL_VISIBLE = 4;

/**
 * "Next up" on the page's one dark card: upcoming events as ticket rows
 * (Home's events recipe). Each ticket opens the event drawer.
 */
export default function GardenAgendaCard({
  title,
  events,
  selectedEventId,
  onOpen,
  index = 0,
  variant = "card",
}: {
  title: string;
  events: OrganizationEvent[];
  selectedEventId: string | null;
  onOpen: (event: OrganizationEvent) => void;
  index?: number;
  /** `rail`: the dark block inset in the full-bleed page rail (still the page's one dark element). */
  variant?: "card" | "rail";
}) {
  const titleId = useId();
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? events : events.slice(0, INITIAL_VISIBLE);
  const hiddenCount = events.length - visible.length;

  const body: ReactNode = (
    <>
      {events.length === 0 ? (
        <div>
          <p className="m-0 text-[15px] text-white/80">
            No upcoming events — your school calendar will appear here when events are added.
          </p>
          <p aria-hidden="true" className="sf-hand m-0 mt-3 text-[1.35rem] text-[var(--sf-butter)]">
            enjoy the quiet ✿
          </p>
        </div>
      ) : (
        <>
          <ul className="m-0 flex list-none flex-col gap-3 p-0">
            {visible.map((event) => {
              const selected = selectedEventId === event.id;
              return (
                <li key={event.id}>
                  <button
                    type="button"
                    onClick={() => onOpen(event)}
                    aria-current={selected ? "true" : undefined}
                    data-testid="parent-calendar-agenda-event"
                    className={`sf-ticket group flex w-full items-stretch rounded-2xl bg-[var(--sf-paper)] text-left text-[var(--sf-ink)] hover:-translate-y-0.5 ${SPRINGY} focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--sf-butter)]/70 ${
                      selected ? "ring-4 ring-[var(--sf-butter)]" : ""
                    }`}
                  >
                    <span className="flex items-center py-2.5 pl-5 pr-3">
                      <DateStamp event={event} size="sm" />
                    </span>
                    <span className="my-3 border-l-[1.5px] border-dashed border-[var(--sf-ink)]/20" aria-hidden="true" />
                    <span className="flex min-w-0 flex-1 items-center gap-2 px-4 py-3 pr-6">
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-1.5">
                          <EventSwatch event={event} />
                          <span className="truncate text-[15px] font-extrabold">{event.title}</span>
                        </span>
                        <span className="block truncate text-[13px] font-semibold text-[var(--sf-soft)]">
                          {formatAgendaEventMeta(event, formatEventTimeRange(event))}
                        </span>
                      </span>
                      <ChevronRight
                        className="h-4 w-4 shrink-0 text-[var(--sf-ink)]/45 transition-transform duration-300 group-hover:translate-x-0.5"
                        aria-hidden="true"
                      />
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          {events.length > INITIAL_VISIBLE ? (
            <div className="mt-5">
              <button
                type="button"
                onClick={() => setExpanded((open) => !open)}
                aria-expanded={expanded}
                className={`${gBtnButterSm} ${G_FOCUS}`}
              >
                {expanded ? "Show fewer" : `Show ${hiddenCount} more`}
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-300 ${expanded ? "rotate-180" : ""}`}
                  aria-hidden="true"
                />
              </button>
            </div>
          ) : null}
        </>
      )}
    </>
  );

  if (variant === "rail") {
    return (
      <section aria-labelledby={titleId} data-testid="parent-calendar-agenda" className="px-5 py-5 sm:px-6">
        <div className="rounded-[22px] bg-[var(--sf-clay-deep)] p-5 text-white shadow-[0_3px_0_0_rgba(43,36,29,0.12)]">
          <div className="mb-4">
            <GKicker light>Next up</GKicker>
            <h2 id={titleId} className="sf-display m-0 mt-1 text-[1.4rem] leading-[1.05] text-white">
              {title}
            </h2>
          </div>
          {body}
        </div>
      </section>
    );
  }

  return (
    <GCard index={index} tone="dark" kicker="Next up" title={title} data-testid="parent-calendar-agenda">
      {body}
    </GCard>
  );
}
