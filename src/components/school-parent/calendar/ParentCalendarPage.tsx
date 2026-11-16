"use client";

import { useId } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { CalendarHeart, Loader2 } from "lucide-react";
import type { CalendarViewMode } from "@/components/school-events-calendar/CalendarToolbar";
import GardenAgendaCard from "@/components/school-parent/calendar/garden/GardenAgendaCard";
import GardenCalendarLegend from "@/components/school-parent/calendar/garden/GardenCalendarLegend";
import GardenCalendarToolbar from "@/components/school-parent/calendar/garden/GardenCalendarToolbar";
import GardenEventDrawer from "@/components/school-parent/calendar/garden/GardenEventDrawer";
import GardenMonthGrid from "@/components/school-parent/calendar/garden/GardenMonthGrid";
import GardenSelectedDayCard, { GardenDaySheet } from "@/components/school-parent/calendar/garden/GardenSelectedDayCard";
import GardenWeekGrid from "@/components/school-parent/calendar/garden/GardenWeekGrid";
import { pluralEvents } from "@/components/school-parent/calendar/garden/calendar-garden-shared";
import { useParentCalendarModel } from "@/components/school-parent/calendar/garden/useParentCalendarModel";
import ParentGardenFrame from "@/components/school-parent/garden/ParentGardenFrame";
import { PORTAL_EASE } from "@/components/school-parent/garden/motion";
import { GSkeleton } from "@/components/school-parent/garden/ui";
import { useParentTheme } from "@/components/school-parent/ParentThemeContext";
import { dateKey } from "@/lib/committees/calendar-utils";
import type { OrganizationEvent } from "@/lib/school-events/types";
import type { OrganizationBranding } from "@/lib/organization-settings/types";

type ParentCalendarPageProps = {
  branding: OrganizationBranding;
  organizationId: string;
  organizationSlug: string;
  events: OrganizationEvent[];
  eventsDeferred?: boolean;
  previewMode?: boolean;
  agendaTitle?: string;
  programId?: string;
  initialView?: CalendarViewMode;
  previewAnchorDate?: string;
  previewAgendaAsOf?: string;
};

const NO_EVENTS_COPY =
  "No events scheduled yet. Your school calendar will appear here when events are added.";

const PANE_LINE = "border-[var(--sf-ink)]/10";

/**
 * Parent Calendar tab — Garden "full-height app tab" (skill:
 * parent-portal-garden-design, same recipe as Messages). The calendar IS the
 * page: no visible header (sr-only h1), full-bleed panes split by thin
 * dividers — calendar (toolbar · legend strip · grid) | rail (Selected day ·
 * Next up). From `lg` each pane scrolls on its own; below it the page is one
 * scrolling column. The event drawer and phone day sheet mount outside the
 * frame. State and fetching live in `useParentCalendarModel`.
 */
export default function ParentCalendarPage({
  organizationId,
  events,
  eventsDeferred = false,
  previewMode = false,
  agendaTitle,
  programId,
  initialView,
  previewAnchorDate,
  previewAgendaAsOf,
}: ParentCalendarPageProps) {
  const { theme } = useParentTheme();
  const reduce = useReducedMotion() === true;
  const headingId = useId();
  const model = useParentCalendarModel({
    organizationId,
    events,
    eventsDeferred,
    previewMode,
    programId,
    initialView,
    previewAnchorDate,
    previewAgendaAsOf,
  });
  const { nav, view } = model;
  const selectedDate = nav.selectedDate ?? dateKey(new Date());
  const selectedEventId = model.selectedEvent?.id ?? null;

  const unit = view === "month" ? "month" : "week";
  const where = nav.isCurrentPeriod ? `this ${unit}` : `in ${nav.periodLabel}`;
  const summary = eventsDeferred
    ? "Loading calendar events…"
    : model.periodEventCount === 0
      ? `Nothing on the calendar ${where} — tap any day to see its details.`
      : `${pluralEvents(model.periodEventCount)} ${where} · tap a day or event for details.`;

  return (
    <div className="relative flex min-h-0 flex-1 flex-col overflow-y-auto lg:overflow-hidden">
      <ParentGardenFrame theme={theme} className="flex min-h-0 flex-1 flex-col bg-white lg:overflow-hidden">
        <h1 className="sr-only">Calendar</h1>

        <div className="flex flex-col lg:min-h-0 lg:flex-1 lg:flex-row">
          {/* Calendar pane */}
          <section
            aria-labelledby={headingId}
            data-testid="parent-calendar-grid-card"
            className="flex min-w-0 flex-col bg-white lg:min-h-0 lg:flex-1"
          >
            <div className={`shrink-0 border-b-[1.5px] ${PANE_LINE} px-4 py-3.5 sm:px-6`}>
              <GardenCalendarToolbar
                view={view}
                periodLabel={nav.periodLabel}
                isCurrentPeriod={nav.isCurrentPeriod}
                loading={model.loadingPeriod}
                onPrev={nav.goPrev}
                onNext={nav.goNext}
                onToday={nav.goToday}
                onViewChange={nav.handleViewChange}
                headingId={headingId}
                summary={summary}
              />
            </div>

            {!eventsDeferred ? (
              model.events.length === 0 ? (
                <div
                  className={`flex shrink-0 items-center gap-2.5 border-b-[1.5px] ${PANE_LINE} bg-[var(--sf-accent-wash)] px-4 py-2.5 sm:px-6`}
                >
                  <CalendarHeart className="h-[18px] w-[18px] shrink-0 text-[var(--sf-clay-deep)]" aria-hidden="true" />
                  <p className="m-0 min-w-0 text-[13.5px] font-semibold text-[var(--sf-ink)]/80">{NO_EVENTS_COPY}</p>
                </div>
              ) : (
                <div className={`shrink-0 border-b-[1.5px] ${PANE_LINE} bg-[var(--sf-paper)] px-4 py-2.5 sm:px-6`}>
                  <GardenCalendarLegend events={model.events} />
                </div>
              )
            ) : null}

            <div className="flex flex-col lg:min-h-0 lg:flex-1 lg:overflow-auto">
              {eventsDeferred ? (
                <div className="flex flex-1 flex-col gap-3 p-4 sm:p-6">
                  <p role="status" className="m-0 inline-flex items-center gap-2 text-[15px] font-semibold text-[var(--sf-soft)]">
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    Loading calendar events…
                  </p>
                  <GSkeleton className="min-h-[420px] flex-1 !rounded-[18px]" />
                </div>
              ) : (
                <motion.div
                  key={`${view}-${nav.periodLabel}`}
                  className="flex flex-col lg:min-h-0 lg:flex-1"
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
                      onEventClick={model.openEvent}
                    />
                  ) : (
                    <GardenWeekGrid
                      weekDates={nav.weekDates}
                      eventsByDate={nav.eventsByDate}
                      selectedDate={nav.selectedDate}
                      selectedEventId={selectedEventId}
                      onDayClick={nav.handleDayClick}
                      onEventClick={model.openEvent}
                    />
                  )}
                </motion.div>
              )}
            </div>
          </section>

          {/* Rail */}
          <aside
            aria-label="Day details and upcoming events"
            className={`flex shrink-0 flex-col border-t-[1.5px] ${PANE_LINE} bg-[var(--sf-paper)] lg:w-[360px] lg:overflow-y-auto lg:border-l-[1.5px] lg:border-t-0 xl:w-[400px]`}
          >
            {eventsDeferred ? (
              <div className="flex flex-col gap-4 p-5 sm:p-6">
                <GSkeleton className="h-36" />
                <GSkeleton className="h-64" />
              </div>
            ) : (
              <>
                <GardenSelectedDayCard
                  variant="rail"
                  date={selectedDate}
                  events={model.selectedDayEvents}
                  selectedEventId={selectedEventId}
                  onOpen={model.openEvent}
                />
                <div aria-hidden="true" className="mx-5 border-t-[1.5px] border-dashed border-[var(--sf-ink)]/15 sm:mx-6" />
                <GardenAgendaCard
                  variant="rail"
                  title={agendaTitle ?? "Family agenda"}
                  events={model.upcoming}
                  selectedEventId={selectedEventId}
                  onOpen={model.openEvent}
                />
              </>
            )}
          </aside>
        </div>
      </ParentGardenFrame>

      <GardenDaySheet
        theme={theme}
        open={model.daySheetOpen}
        date={selectedDate}
        events={model.selectedDayEvents}
        selectedEventId={selectedEventId}
        onOpen={model.openEvent}
        onClose={model.closeDaySheet}
      />
      <GardenEventDrawer
        theme={theme}
        event={model.selectedEvent}
        onClose={model.closeEvent}
        previewMode={previewMode}
      />
    </div>
  );
}
