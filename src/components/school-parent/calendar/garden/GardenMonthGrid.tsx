"use client";

import { dateKey, getExtendedMonthGrid, isToday } from "@/lib/committees/calendar-utils";
import { getEventDisplayStyle } from "@/lib/school-events/event-labels";
import type { OrganizationEvent } from "@/lib/school-events/types";
import { G_FOCUS } from "@/components/school-parent/garden/ui";
import { WEEKDAY_SHORT, dayAriaLabel } from "./calendar-garden-shared";

const PILL_LIMIT = 3;
const DOT_LIMIT = 3;

/**
 * Garden month grid, edge to edge: rows stretch to fill the pane (with a
 * minimum height, so short screens scroll). Each day is a real button (fills the cell, behind the
 * event pills) so there's no nested interactive markup: tapping a day selects
 * it, tapping a pill opens that event. Phones show colour dots instead of pills.
 */
export default function GardenMonthGrid({
  year,
  month,
  eventsByDate,
  selectedDate,
  selectedEventId,
  onDayClick,
  onEventClick,
}: {
  year: number;
  month: number;
  eventsByDate: Map<string, OrganizationEvent[]>;
  selectedDate: string | null;
  selectedEventId: string | null;
  onDayClick: (date: string) => void;
  onEventClick: (event: OrganizationEvent) => void;
}) {
  const cells = getExtendedMonthGrid(year, month);

  return (
    <div className="flex flex-1 flex-col bg-white" data-testid="parent-calendar-month-grid">
      <div
        className="sticky top-0 z-10 grid shrink-0 grid-cols-7 border-b-[1.5px] border-[var(--sf-ink)]/10 bg-[var(--sf-paper)]"
        aria-hidden="true"
      >
        {WEEKDAY_SHORT.map((day) => (
          <div
            key={day}
            className="py-2.5 text-center text-[11px] font-extrabold uppercase tracking-[0.14em] text-[var(--sf-soft)]"
          >
            <span className="sm:hidden">{day.slice(0, 1)}</span>
            <span className="hidden sm:inline">{day}</span>
          </div>
        ))}
      </div>
      <div className="grid flex-1 auto-rows-fr grid-cols-7 gap-px bg-[var(--sf-ink)]/[0.08]">
        {cells.map((cell) => {
          const key = dateKey(cell.date);
          const dayEvents = eventsByDate.get(key) ?? [];
          const selected = selectedDate === key;
          const today = isToday(cell.date);
          const hidden = dayEvents.length - PILL_LIMIT;
          return (
            <div
              key={key}
              className={`relative flex min-h-[64px] flex-col p-1.5 sm:min-h-[80px] sm:p-2 ${
                selected
                  ? "bg-[var(--sf-accent-wash)]"
                  : cell.inCurrentMonth
                    ? "bg-white"
                    : "bg-[var(--sf-paper)]"
              }`}
            >
              <button
                type="button"
                onClick={() => onDayClick(key)}
                aria-label={dayAriaLabel(cell.date, dayEvents.length)}
                aria-pressed={selected}
                aria-current={today ? "date" : undefined}
                data-testid={`parent-calendar-day-${key}`}
                className={`absolute inset-0 z-0 cursor-pointer transition-colors hover:bg-[var(--sf-accent-wash)] ${G_FOCUS} focus-visible:ring-inset focus-visible:ring-offset-0 ${
                  selected ? "ring-2 ring-inset ring-[var(--sf-clay)]" : ""
                }`}
              />
              <span
                aria-hidden="true"
                className={`pointer-events-none relative z-[1] mb-1 inline-flex h-7 w-7 items-center justify-center self-start rounded-full text-[13px] font-extrabold ${
                  today
                    ? "bg-[var(--sf-clay)] text-white shadow-[0_2px_0_0_var(--sf-ink)]"
                    : cell.inCurrentMonth
                      ? "text-[var(--sf-ink)]"
                      : "text-[var(--sf-ink)]/35"
                }`}
              >
                {cell.date.getDate()}
              </span>

              {dayEvents.length > 0 ? (
                <>
                  {/* Phones: dots (the day button opens the list). */}
                  <span aria-hidden="true" className="pointer-events-none relative z-[1] flex flex-wrap items-center gap-1 px-0.5 sm:hidden">
                    {dayEvents.slice(0, DOT_LIMIT).map((event) => (
                      <span
                        key={event.id}
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: getEventDisplayStyle(event).text }}
                      />
                    ))}
                    {dayEvents.length > DOT_LIMIT ? (
                      <span className="text-[10px] font-extrabold leading-none text-[var(--sf-soft)]">+{dayEvents.length - DOT_LIMIT}</span>
                    ) : null}
                  </span>

                  {/* Larger screens: event pills. */}
                  <div className={`relative z-[1] hidden min-h-0 flex-col gap-1 sm:flex ${cell.inCurrentMonth ? "" : "opacity-60"}`}>
                    {dayEvents.slice(0, PILL_LIMIT).map((event) => {
                      const colors = getEventDisplayStyle(event);
                      const active = selectedEventId === event.id;
                      return (
                        <button
                          key={event.id}
                          type="button"
                          onClick={() => onEventClick(event)}
                          title={event.title}
                          className={`w-full cursor-pointer truncate rounded-md px-1.5 py-0.5 text-left text-[11px] font-bold transition-[filter,transform] duration-150 hover:-translate-y-px hover:brightness-95 ${G_FOCUS} focus-visible:ring-offset-0 ${
                            active ? "ring-2 ring-[var(--sf-ink)]" : ""
                          }`}
                          style={{
                            backgroundColor: colors.bg,
                            color: colors.text,
                            borderLeft: `3px solid ${colors.text}`,
                          }}
                        >
                          {event.title}
                        </button>
                      );
                    })}
                    {hidden > 0 ? (
                      <span className="pointer-events-none px-1 text-[11px] font-extrabold text-[var(--sf-soft)]">+{hidden} more</span>
                    ) : null}
                  </div>
                </>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
