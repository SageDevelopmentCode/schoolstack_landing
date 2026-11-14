"use client";

import { useEffect, useMemo, useRef } from "react";
import { dateKey, isToday } from "@/lib/committees/calendar-utils";
import {
  formatEventTimeRange,
  formatHourLabel,
  getCurrentTimeTop,
  getEventTimeRange,
  HOUR_HEIGHT_PX,
  minutesToHeight,
  minutesToTop,
  WEEK_END_HOUR,
  WEEK_GRID_TOTAL_HEIGHT,
  WEEK_START_HOUR,
} from "@/lib/school-events/calendar-time";
import { getEventDisplayStyle } from "@/lib/school-events/event-labels";
import type { OrganizationEvent } from "@/lib/school-events/types";
import { G_FOCUS } from "@/components/school-parent/garden/ui";
import { EventRow, WEEKDAY_SHORT, dayAriaLabel } from "./calendar-garden-shared";

const GUTTER = 52;
const LINE = "rgba(43, 36, 29, 0.08)";
const HOURS = WEEK_END_HOUR - WEEK_START_HOUR;

type WeekProps = {
  weekDates: Date[];
  eventsByDate: Map<string, OrganizationEvent[]>;
  selectedDate: string | null;
  selectedEventId: string | null;
  onDayClick: (date: string) => void;
  onEventClick: (event: OrganizationEvent) => void;
};

/** Week view, edge to edge: a time grid from `sm` (scrolls inside the pane), a stacked day list on phones. */
export default function GardenWeekGrid(props: WeekProps) {
  return (
    <div data-testid="parent-calendar-week-grid" className="flex min-h-0 flex-1 flex-col">
      <div className="hidden min-h-0 flex-1 flex-col sm:flex">
        <WeekTimeGrid {...props} />
      </div>
      <div className="p-3 sm:hidden">
        <WeekDayList {...props} />
      </div>
    </div>
  );
}

function TimedBlock({
  event,
  selected,
  onClick,
}: {
  event: OrganizationEvent;
  selected: boolean;
  onClick: () => void;
}) {
  const range = getEventTimeRange(event);
  if (!range) return null;
  const top = minutesToTop(range.startMinutes);
  const height = Math.max(minutesToHeight(range.startMinutes, range.endMinutes), 24);
  const colors = getEventDisplayStyle(event);
  const time = formatEventTimeRange(event);
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`${event.title}, ${time}`}
      className={`absolute left-1 right-1 z-[5] cursor-pointer overflow-hidden rounded-lg text-left transition-[filter,transform] duration-150 hover:-translate-y-px hover:brightness-95 ${G_FOCUS} focus-visible:ring-offset-0 ${
        selected ? "ring-2 ring-[var(--sf-ink)]" : ""
      }`}
      style={{ top, height, backgroundColor: colors.bg, borderLeft: `3px solid ${colors.text}` }}
    >
      <span className="block px-1.5 py-1">
        <span className="block truncate text-[11px] font-extrabold leading-tight" style={{ color: colors.text }}>
          {event.title}
        </span>
        {height >= 36 ? (
          <span className="block truncate text-[10px] font-semibold opacity-80" style={{ color: colors.text }}>
            {time}
          </span>
        ) : null}
      </span>
    </button>
  );
}

function WeekTimeGrid({ weekDates, eventsByDate, selectedDate, selectedEventId, onDayClick, onEventClick }: WeekProps) {
  const hasToday = weekDates.some((d) => isToday(d));
  const nowTop = hasToday ? getCurrentTimeTop() : -1;
  const columns = `${GUTTER}px repeat(7, minmax(0, 1fr))`;
  const scrollerRef = useRef<HTMLDivElement>(null);
  const weekKey = weekDates[0] ? dateKey(weekDates[0]) : "";

  // Open each week near the start of the school day, or at "now" when this week contains today.
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const target = nowTop >= 0 ? nowTop - 120 : minutesToTop(8 * 60) - 16;
    scroller.scrollTop = Math.max(0, target);
    // Only when the week changes, so we never fight the parent's own scrolling.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekKey]);

  const allDayByDate = useMemo(() => {
    const map = new Map<string, OrganizationEvent[]>();
    for (const day of weekDates) {
      const key = dateKey(day);
      const list = (eventsByDate.get(key) ?? []).filter((e) => e.isAllDay || !getEventTimeRange(e));
      if (list.length > 0) map.set(key, list);
    }
    return map;
  }, [eventsByDate, weekDates]);

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-white">
      <div ref={scrollerRef} className="max-h-[70vh] min-h-0 flex-1 overflow-auto overscroll-contain lg:max-h-none">
        <div style={{ minWidth: 600 }}>
          {/* Sticky day headers + all-day strip */}
          <div className="sticky top-0 z-20 bg-[var(--sf-paper)]" style={{ borderBottom: `1.5px solid ${LINE}` }}>
            <div className="grid" style={{ gridTemplateColumns: columns }}>
              <div />
              {weekDates.map((day) => {
                const key = dateKey(day);
                const today = isToday(day);
                const selected = selectedDate === key;
                const count = (eventsByDate.get(key) ?? []).length;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => onDayClick(key)}
                    aria-label={dayAriaLabel(day, count)}
                    aria-pressed={selected}
                    aria-current={today ? "date" : undefined}
                    data-testid={`parent-calendar-day-${key}`}
                    className={`flex cursor-pointer flex-col items-center gap-1 py-2.5 transition-colors hover:bg-[var(--sf-accent-wash)] ${G_FOCUS} focus-visible:ring-inset focus-visible:ring-offset-0 ${
                      selected ? "bg-[var(--sf-accent-wash)] shadow-[inset_0_-3px_0_0_var(--sf-clay)]" : ""
                    }`}
                    style={{ borderLeft: `1px solid ${LINE}` }}
                  >
                    <span className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-[var(--sf-soft)]">
                      {WEEKDAY_SHORT[day.getDay()]}
                    </span>
                    <span
                      className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-[15px] font-extrabold ${
                        today ? "bg-[var(--sf-clay)] text-white shadow-[0_2px_0_0_var(--sf-ink)]" : "text-[var(--sf-ink)]"
                      }`}
                    >
                      {day.getDate()}
                    </span>
                  </button>
                );
              })}
            </div>

            {allDayByDate.size > 0 ? (
              <div className="grid bg-white" style={{ gridTemplateColumns: columns, borderTop: `1px solid ${LINE}` }}>
                <div className="flex items-center justify-end pr-2" style={{ minHeight: 34 }}>
                  <span className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-[var(--sf-soft)]">All day</span>
                </div>
                {weekDates.map((day) => {
                  const key = dateKey(day);
                  const list = allDayByDate.get(key) ?? [];
                  return (
                    <div
                      key={key}
                      className="flex min-w-0 flex-col gap-1 p-1"
                      style={{
                        borderLeft: `1px solid ${LINE}`,
                        backgroundColor: isToday(day) ? "var(--sf-accent-wash)" : undefined,
                      }}
                    >
                      {list.map((event) => {
                        const colors = getEventDisplayStyle(event);
                        return (
                          <button
                            key={event.id}
                            type="button"
                            onClick={() => onEventClick(event)}
                            title={event.title}
                            className={`w-full cursor-pointer truncate rounded-md px-1.5 py-0.5 text-left text-[11px] font-bold hover:brightness-95 ${G_FOCUS} focus-visible:ring-offset-0 ${
                              selectedEventId === event.id ? "ring-2 ring-[var(--sf-ink)]" : ""
                            }`}
                            style={{ backgroundColor: colors.bg, color: colors.text, borderLeft: `3px solid ${colors.text}` }}
                          >
                            {event.title}
                          </button>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            ) : null}
          </div>

          {/* Time grid */}
          <div className="relative grid" style={{ gridTemplateColumns: columns, height: WEEK_GRID_TOTAL_HEIGHT }}>
            <div className="relative" aria-hidden="true">
              {Array.from({ length: HOURS }, (_, i) => (
                <div key={i} className="flex items-start justify-end pr-2 pt-0.5" style={{ height: HOUR_HEIGHT_PX }}>
                  <span className="text-[10px] font-bold text-[var(--sf-soft)]">{formatHourLabel(WEEK_START_HOUR + i)}</span>
                </div>
              ))}
            </div>

            {weekDates.map((day) => {
              const key = dateKey(day);
              const timed = (eventsByDate.get(key) ?? []).filter((e) => !e.isAllDay && getEventTimeRange(e));
              return (
                <div
                  key={key}
                  className="relative"
                  style={{
                    borderLeft: `1px solid ${LINE}`,
                    backgroundColor: isToday(day) ? "var(--sf-accent-wash)" : undefined,
                  }}
                >
                  {/* Background click target: selects the day (keyboard users use the header button). */}
                  <button
                    type="button"
                    tabIndex={-1}
                    aria-hidden="true"
                    onClick={() => onDayClick(key)}
                    className="absolute inset-0 z-0 cursor-pointer hover:bg-[var(--sf-ink)]/[0.02]"
                  />
                  {Array.from({ length: HOURS }, (_, i) => (
                    <div
                      key={i}
                      aria-hidden="true"
                      className="pointer-events-none absolute left-0 right-0"
                      style={{ top: i * HOUR_HEIGHT_PX, borderTop: `1px solid ${LINE}` }}
                    />
                  ))}
                  {timed.map((event) => (
                    <TimedBlock
                      key={event.id}
                      event={event}
                      selected={selectedEventId === event.id}
                      onClick={() => onEventClick(event)}
                    />
                  ))}
                </div>
              );
            })}

            {nowTop >= 0 ? (
              <div aria-hidden="true" className="pointer-events-none absolute right-0 z-10" style={{ top: nowTop, left: GUTTER }}>
                <span className="absolute -left-1 -top-[4px] h-2.5 w-2.5 rounded-full border-2 border-white bg-[var(--sf-clay)]" />
                <span className="block h-[2px] w-full bg-[var(--sf-clay)]" />
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function WeekDayList({ weekDates, eventsByDate, selectedDate, selectedEventId, onEventClick }: WeekProps) {
  return (
    <ol className="m-0 flex list-none flex-col gap-2 p-0">
      {weekDates.map((day) => {
        const key = dateKey(day);
        const list = eventsByDate.get(key) ?? [];
        const today = isToday(day);
        const selected = selectedDate === key;
        return (
          <li
            key={key}
            aria-label={dayAriaLabel(day, list.length)}
            className={`flex gap-3 rounded-2xl border-[1.5px] p-2.5 ${
              selected ? "border-[var(--sf-clay)] bg-[var(--sf-accent-wash)]" : "border-[var(--sf-ink)]/10 bg-white"
            }`}
          >
            <div className="flex w-11 shrink-0 flex-col items-center pt-1" aria-hidden="true">
              <span className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[var(--sf-soft)]">
                {WEEKDAY_SHORT[day.getDay()]}
              </span>
              <span
                className={`mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-full text-[15px] font-extrabold ${
                  today ? "bg-[var(--sf-clay)] text-white shadow-[0_2px_0_0_var(--sf-ink)]" : "text-[var(--sf-ink)]"
                }`}
              >
                {day.getDate()}
              </span>
            </div>
            <div className="flex min-w-0 flex-1 flex-col justify-center gap-2">
              {list.length === 0 ? (
                <p className="m-0 py-2 text-[13px] font-semibold text-[var(--sf-ink)]/40">Nothing scheduled</p>
              ) : (
                list.map((event) => (
                  <EventRow key={event.id} event={event} onOpen={onEventClick} selected={selectedEventId === event.id} />
                ))
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
