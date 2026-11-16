"use client";

import { useId, useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronRight, Plus } from "lucide-react";
import type { CalendarViewMode } from "@/components/school-events-calendar/CalendarToolbar";
import { useEventsCalendarNavigation } from "@/components/school-events-calendar/useEventsCalendarNavigation";
import GardenCalendarToolbar from "@/components/school-parent/calendar/garden/GardenCalendarToolbar";
import GardenMonthGrid from "@/components/school-parent/calendar/garden/GardenMonthGrid";
import GardenWeekGrid from "@/components/school-parent/calendar/garden/GardenWeekGrid";
import { PORTAL_EASE } from "@/components/school-parent/garden/motion";
import { GCard, GChip, G_FOCUS, gBtnPopSm } from "@/components/school-parent/garden/ui";
import { dateKey } from "@/lib/committees/calendar-utils";
import type { OrganizationEvent } from "@/lib/school-events/types";
import { CommitteeDateStamp, GardenSectionHeader, plural } from "./committee-garden-section";

/**
 * Committee Calendar (Garden): the parent Calendar tab's toolbar and month /
 * week grids (shared navigation hook, so arrows/Today/keyboard behave the
 * same), plus a "Coming up" rail. Clicking a day still opens "Add event"
 * (unless read-only) and clicking an event opens its details.
 */
export default function GardenCommitteeCalendar({
  events,
  view,
  onViewChange,
  initialDate,
  readOnly,
  selectedEventId,
  onDayClick,
  onEventClick,
  onAdd,
  onPeriodMetaChange,
}: {
  events: OrganizationEvent[];
  view: CalendarViewMode;
  onViewChange: (view: CalendarViewMode) => void;
  initialDate?: Date;
  readOnly: boolean;
  selectedEventId: string | null;
  onDayClick?: (date: string) => void;
  onEventClick: (event: OrganizationEvent) => void;
  onAdd: () => void;
  onPeriodMetaChange?: (meta: { periodLabel: string; isCurrentPeriod: boolean }) => void;
}) {
  const reduce = useReducedMotion() === true;
  const headingId = useId();
  const nav = useEventsCalendarNavigation({
    events,
    view,
    onViewChange,
    readOnly,
    initialDate,
    onDayClick,
    onEventClick,
    onPeriodMetaChange,
  });

  const todayKey = dateKey(new Date());
  const upcoming = useMemo(
    () =>
      [...events]
        .filter((event) => event.date >= todayKey)
        .sort((a, b) => (a.date === b.date ? (a.time ?? "").localeCompare(b.time ?? "") : a.date.localeCompare(b.date)))
        .slice(0, 6),
    [events, todayKey],
  );

  const periodCount = useMemo(() => {
    if (view === "month") {
      const prefix = `${nav.year}-${String(nav.month + 1).padStart(2, "0")}`;
      return events.filter((event) => event.date.startsWith(prefix)).length;
    }
    const keys = new Set(nav.weekDates.map((day) => dateKey(day)));
    return events.filter((event) => keys.has(event.date)).length;
  }, [events, nav.month, nav.weekDates, nav.year, view]);

  const where = nav.isCurrentPeriod ? `this ${view}` : `in ${nav.periodLabel}`;
  const hint = readOnly ? "tap an event for details" : "tap a day to add one";
  const summary =
    periodCount === 0 ? `Nothing scheduled ${where} · ${hint}` : `${plural(periodCount, "event")} ${where} · ${hint}`;

  return (
    <div data-testid="committee-calendar-garden">
      <GardenSectionHeader
        kicker="Calendar"
        title="Committee dates"
        description="Meetings, deadlines and events for this committee."
        actions={
          !readOnly ? (
            <button type="button" className={gBtnPopSm} onClick={onAdd}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add event
            </button>
          ) : null
        }
      />

      <div className="grid items-start gap-5 2xl:grid-cols-[minmax(0,1fr)_320px]">
        <section
          aria-labelledby={headingId}
          className="flex min-w-0 flex-col overflow-hidden rounded-[24px] border-[1.5px] border-[var(--sf-ink)]/12 bg-white shadow-[0_3px_0_0_rgba(43,36,29,0.08)]"
        >
          <div className="shrink-0 border-b-[1.5px] border-[var(--sf-ink)]/10 px-4 py-3.5 sm:px-5">
            <GardenCalendarToolbar
              view={view}
              periodLabel={nav.periodLabel}
              isCurrentPeriod={nav.isCurrentPeriod}
              loading={false}
              onPrev={nav.goPrev}
              onNext={nav.goNext}
              onToday={nav.goToday}
              onViewChange={nav.handleViewChange}
              headingId={headingId}
              summary={summary}
            />
          </div>
          <motion.div
            key={`${view}-${nav.periodLabel}`}
            className="flex min-h-[420px] flex-col"
            initial={reduce ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, ease: PORTAL_EASE }}
          >
            {view === "month" ? (
              <GardenMonthGrid
                year={nav.year}
                month={nav.month}
                eventsByDate={nav.eventsByDate}
                selectedDate={nav.selectedDate}
                selectedEventId={selectedEventId}
                onDayClick={nav.handleDayClick}
                onEventClick={onEventClick}
              />
            ) : (
              <GardenWeekGrid
                weekDates={nav.weekDates}
                eventsByDate={nav.eventsByDate}
                selectedDate={nav.selectedDate}
                selectedEventId={selectedEventId}
                onDayClick={nav.handleDayClick}
                onEventClick={onEventClick}
              />
            )}
          </motion.div>
        </section>

        <GCard index={2} kicker="Coming up" title="Next dates" className="order-first 2xl:order-none">
          {upcoming.length === 0 ? (
            <p className="m-0 text-[14px] font-semibold text-[var(--sf-soft)]">
              No upcoming dates.{!readOnly ? " Add the first one so everyone knows what's next." : ""}
            </p>
          ) : (
            <ul className="-mx-1 m-0 flex list-none gap-2 overflow-x-auto p-1 [scrollbar-width:thin] 2xl:mx-0 2xl:flex-col 2xl:overflow-visible 2xl:p-0">
              {upcoming.map((event) => {
                const selected = event.id === selectedEventId;
                return (
                  <li key={event.id} className="min-w-[250px] shrink-0 2xl:min-w-0 2xl:shrink">
                    <button
                      type="button"
                      onClick={() => onEventClick(event)}
                      aria-current={selected ? "true" : undefined}
                      className={`group flex w-full items-center gap-3 rounded-[16px] border-[1.5px] p-2.5 text-left hover:-translate-y-0.5 ${G_FOCUS} transition-transform ${
                        selected
                          ? "border-[var(--sf-clay)] bg-[var(--sf-accent-wash)]"
                          : "border-[var(--sf-ink)]/10 bg-[var(--sf-paper)] hover:border-[var(--sf-ink)]/30"
                      }`}
                    >
                      <CommitteeDateStamp date={event.date} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[14.5px] font-extrabold text-[var(--sf-ink)]">{event.title}</span>
                        <span className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[12.5px] font-semibold text-[var(--sf-soft)]">
                          {event.time ? <span>{event.time}</span> : null}
                          {event.location ? <span className="truncate">· {event.location}</span> : null}
                        </span>
                        {event.date === todayKey ? <GChip tone="success" className="mt-1">Today</GChip> : null}
                      </span>
                      <ChevronRight
                        className="h-4 w-4 shrink-0 text-[var(--sf-ink)]/40 transition-transform group-hover:translate-x-0.5"
                        aria-hidden="true"
                      />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </GCard>
      </div>
    </div>
  );
}
