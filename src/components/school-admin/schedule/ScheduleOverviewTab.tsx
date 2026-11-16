"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CalendarClock, ChevronRight, Eye, MapPin, MessagesSquare, PartyPopper } from "lucide-react";
import {
  GardenEmptyState,
  GardenLoadError,
  GardenStatTiles,
  GardenSteps,
  ROW_INTERACTIVE,
  type GardenStep,
} from "@/components/school-admin/garden/kit";
import { GardenGroupHeading, GardenLeadStrip } from "@/components/school-admin/garden/blocks";
import { GCard, GChip, GSkeleton, gBtnOutlineSm, gBtnPopSm, gLinkSm } from "@/components/school-parent/garden/ui";
import { useScheduleVisitsContext } from "@/components/school-admin/schedule/schedule-visits-context";
import type { AdminScheduledVisit } from "@/lib/admissions/admin-scheduled-visits";
import type { PostSubmitActionType } from "@/lib/admissions/application-form-schema";
import { createClient } from "@/utils/supabase/client";
import type { ScheduleTabId } from "./schedule-tabs";
import { listUpcomingEventsForOrg } from "@/lib/school-events/events";
import { getEventDisplayStyle, SCHOOL_EVENT_TYPE_LABELS } from "@/lib/school-events/event-labels";
import type { OrganizationEvent } from "@/lib/school-events/types";
import { formatActionError } from "@/lib/school-admin/admin-toast";
import { reportPortalOperationalError } from "@/lib/portal-operational-errors";

type ScheduleOverviewTabProps = {
  organizationId: string;
  monthSlotCount: number | null;
  monthObservationDayCount: number | null;
  selectedApplicationId: string | null;
  loadingSubmission: boolean;
  onVisitClick: (visit: AdminScheduledVisit) => void;
  onTabChange: (tab: ScheduleTabId) => void;
  onUpcomingCountChange?: (count: number) => void;
  onLoadingChange?: (loading: boolean) => void;
  visitsDeferred?: boolean;
  timezone: string;
  refreshToken?: number;
};

export const VISIT_TYPE_STYLE: Record<PostSubmitActionType, { icon: typeof MapPin; tint: string; label: string }> = {
  schedule_campus_tour: { icon: MapPin, tint: "bg-[var(--sf-sky)]", label: "Tour" },
  schedule_family_interview: { icon: MessagesSquare, tint: "bg-[var(--sf-lav)]", label: "Interview" },
  schedule_observation_day: { icon: Eye, tint: "bg-[var(--sf-butter)]", label: "Shadow day" },
};

function todayInTimezone(timezone: string): string {
  try {
    return new Intl.DateTimeFormat("en-CA", { timeZone: timezone }).format(new Date());
  } catch {
    return new Intl.DateTimeFormat("en-CA").format(new Date());
  }
}

export default function ScheduleOverviewTab({
  organizationId,
  monthSlotCount,
  monthObservationDayCount,
  selectedApplicationId,
  loadingSubmission,
  onVisitClick,
  onTabChange,
  onUpcomingCountChange,
  onLoadingChange,
  visitsDeferred = false,
  timezone,
  refreshToken = 0,
}: ScheduleOverviewTabProps) {
  const supabase = useMemo(() => createClient(), []);
  const { visits, visitsReady } = useScheduleVisitsContext();
  const [upcomingEvents, setUpcomingEvents] = useState<OrganizationEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [eventsError, setEventsError] = useState<string | null>(null);
  const loading = visitsDeferred || !visitsReady;

  // Callback props in refs so inline parents don't re-trigger effects.
  const onUpcomingRef = useRef(onUpcomingCountChange);
  const onLoadingRef = useRef(onLoadingChange);
  useEffect(() => {
    onUpcomingRef.current = onUpcomingCountChange;
    onLoadingRef.current = onLoadingChange;
  });

  const loadEvents = useCallback(async () => {
    setEventsLoading(true);
    setEventsError(null);
    try {
      const rows = await listUpcomingEventsForOrg(supabase, organizationId, 5);
      setUpcomingEvents(rows);
    } catch (err) {
      void reportPortalOperationalError(
        "school_admin",
        { organizationId, operation: "schedule.upcoming_events.load", error: "" },
        err,
      );
      setUpcomingEvents([]);
      setEventsError(formatActionError(err, "Could not load school events."));
    } finally {
      setEventsLoading(false);
    }
  }, [organizationId, supabase]);

  useEffect(() => {
    queueMicrotask(() => {
      void loadEvents();
    });
  }, [loadEvents, refreshToken]);

  const upcomingVisits = useMemo(
    () => visits.filter((visit) => visit.timing === "upcoming" || visit.timing === "happening").slice(0, 7),
    [visits],
  );
  const upcomingCount = useMemo(() => visits.filter((visit) => visit.timing === "upcoming").length, [visits]);

  useEffect(() => {
    if (!loading) onUpcomingRef.current?.(upcomingCount);
  }, [loading, upcomingCount]);

  useEffect(() => {
    onLoadingRef.current?.(loading || eventsLoading);
  }, [eventsLoading, loading]);

  const visitsByDate = useMemo(() => {
    const groups = new Map<string, AdminScheduledVisit[]>();
    for (const visit of upcomingVisits) {
      const existing = groups.get(visit.scheduledDate) ?? [];
      existing.push(visit);
      groups.set(visit.scheduledDate, existing);
    }
    return [...groups.entries()];
  }, [upcomingVisits]);

  const lead = useMemo(() => {
    if (loading) return null;
    const happening = visits.find((visit) => visit.timing === "happening");
    if (happening) return { visit: happening, kicker: "Happening now" };
    const today = todayInTimezone(timezone);
    const nextToday = visits.find((visit) => visit.timing === "upcoming" && visit.scheduledDate === today);
    return nextToday ? { visit: nextToday, kicker: "Next visit today" } : null;
  }, [loading, timezone, visits]);

  const steps: GardenStep[] = useMemo(() => {
    const checks = [
      {
        id: "tours",
        tab: "tours" as ScheduleTabId,
        title: "Open tour & interview slots",
        done: (monthSlotCount ?? 0) > 0,
        description:
          monthSlotCount == null
            ? "Families pick a 30-minute slot after they apply."
            : `${monthSlotCount} open this month · families pick one after they apply.`,
        cta: "Set tour slots",
      },
      {
        id: "shadow",
        tab: "shadow" as ScheduleTabId,
        title: "Open shadow days",
        done: (monthObservationDayCount ?? 0) > 0,
        description:
          monthObservationDayCount == null
            ? "Let students spend a day in class before enrolling."
            : `${monthObservationDayCount} open this month.`,
        cta: "Open shadow days",
      },
      {
        id: "events",
        tab: "events" as ScheduleTabId,
        title: "Add school events",
        done: upcomingEvents.length > 0,
        description: "Field trips, no-school days, and community events show in the parent portal.",
        cta: "Add event",
      },
    ];
    const firstOpen = checks.findIndex((check) => !check.done);
    return checks.map((check, index) => ({
      id: check.id,
      title: check.title,
      description: check.description,
      status: check.done ? "done" : index === firstOpen ? "current" : "todo",
      aside: check.done ? undefined : (
        <button
          type="button"
          className={index === firstOpen && !lead ? gBtnPopSm : gBtnOutlineSm}
          onClick={() => onTabChange(check.tab)}
        >
          {check.cta}
        </button>
      ),
    }));
  }, [lead, monthObservationDayCount, monthSlotCount, onTabChange, upcomingEvents.length]);
  const allReady = !eventsLoading && steps.every((step) => step.status === "done");

  return (
    <div className="flex flex-col gap-5">
      {lead ? (
        <GardenLeadStrip
          icon={CalendarClock}
          kicker={lead.kicker}
          title={`${lead.visit.stepTitle}${lead.visit.studentLabel ? ` · ${lead.visit.studentLabel}` : ""}`}
          meta={lead.visit.whenLabel}
          cta={lead.visit.applicationId ? "Open application" : "See visit"}
          onClick={() => (lead.visit.applicationId ? onVisitClick(lead.visit) : onTabChange("visits"))}
          busy={loadingSubmission && lead.visit.applicationId === selectedApplicationId}
          data-testid="schedule-lead-visit"
        />
      ) : null}

      <GardenStatTiles
        ariaLabel="Schedule numbers"
        stats={[
          {
            id: "slots",
            label: "Open time slots this month",
            value: monthSlotCount == null ? "—" : monthSlotCount,
            accent: "sky",
            onClick: () => onTabChange("tours"),
          },
          {
            id: "shadow",
            label: "Open shadow days this month",
            value: monthObservationDayCount == null ? "—" : monthObservationDayCount,
            accent: "gold",
            onClick: () => onTabChange("shadow"),
          },
          {
            id: "visits",
            label: "Upcoming visits",
            value: loading ? "—" : upcomingCount,
            accent: "forest",
            onClick: () => onTabChange("visits"),
          },
        ]}
      />

      <div className="grid items-start gap-5 lg:grid-cols-[1.55fr_1fr]">
        <GCard
          index={2}
          kicker="Upcoming agenda"
          title="Next visits"
          action={
            <button type="button" className={gLinkSm} onClick={() => onTabChange("visits")}>
              View all
            </button>
          }
        >
          <p className="m-0 -mt-2 mb-4 text-[13px] font-semibold text-[var(--sf-soft)]">
            Tours, interviews, and shadow visits on your calendar
          </p>
          {loading ? (
            <div className="flex flex-col gap-2" aria-busy="true" aria-label="Loading upcoming visits">
              {[0, 1, 2].map((i) => (
                <GSkeleton key={i} className="h-[58px] rounded-[14px]" />
              ))}
            </div>
          ) : upcomingVisits.length === 0 ? (
            <GardenEmptyState
              icon={CalendarClock}
              tint="bg-[var(--sf-sky)]"
              title="No upcoming visits yet"
              description="Families book after submitting an application."
              action={
                <>
                  <button type="button" className={gBtnOutlineSm} onClick={() => onTabChange("tours")}>
                    Set tour slots
                  </button>
                  <button type="button" className={gBtnOutlineSm} onClick={() => onTabChange("shadow")}>
                    Open shadow days
                  </button>
                </>
              }
            />
          ) : (
            <div className="flex flex-col gap-4">
              {visitsByDate.map(([date, dayVisits]) => (
                <section key={date}>
                  <GardenGroupHeading count={dayVisits.length}>
                    {dayVisits[0]?.whenLabel.split("·")[0]?.trim() ?? date}
                  </GardenGroupHeading>
                  <ul className="m-0 -mx-2 flex list-none flex-col gap-0.5 p-0">
                    {dayVisits.map((visit) => (
                      <li key={visit.id}>
                        <VisitRow
                          visit={visit}
                          selected={visit.applicationId != null && visit.applicationId === selectedApplicationId}
                          loading={loadingSubmission}
                          onClick={() => onVisitClick(visit)}
                        />
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          )}
        </GCard>

        <div className="flex min-w-0 flex-col gap-5">
          <GCard
            index={3}
            kicker="School events"
            title="On the calendar"
            action={
              <button type="button" className={gLinkSm} onClick={() => onTabChange("events")}>
                Manage
              </button>
            }
          >
            <p className="m-0 -mt-2 mb-4 text-[13px] font-semibold text-[var(--sf-soft)]">
              Events families see in the parent portal
            </p>
            {eventsLoading ? (
              <div className="flex flex-col gap-2" aria-busy="true" aria-label="Loading school events">
                {[0, 1].map((i) => (
                  <GSkeleton key={i} className="h-[52px] rounded-[14px]" />
                ))}
              </div>
            ) : eventsError ? (
              <GardenLoadError title="Couldn't load school events." description={eventsError} onRetry={() => void loadEvents()} />
            ) : upcomingEvents.length === 0 ? (
              <GardenEmptyState
                icon={PartyPopper}
                title="No school events yet"
                description="Add field trips, no-school days, and community events."
                action={
                  <button type="button" className={gBtnOutlineSm} onClick={() => onTabChange("events")}>
                    Add event
                  </button>
                }
              />
            ) : (
              <ul className="m-0 -mx-2 flex list-none flex-col gap-0.5 p-0">
                {upcomingEvents.map((event) => {
                  const colors = getEventDisplayStyle(event);
                  return (
                    <li key={event.id}>
                      <button type="button" className={ROW_INTERACTIVE} onClick={() => onTabChange("events")}>
                        <span
                          aria-hidden
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] border-[1.5px] border-[var(--sf-ink)]/10"
                          style={{ backgroundColor: colors.bg }}
                        >
                          <MapPin className="h-4 w-4" style={{ color: colors.text }} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[14px] font-extrabold text-[var(--sf-ink)]">{event.title}</span>
                          <span className="block truncate text-[12.5px] font-semibold text-[var(--sf-soft)]">
                            {event.date}
                            {!event.isAllDay && event.time ? ` · ${event.time}` : ""}
                          </span>
                        </span>
                        <GChip tone="neutral">{SCHOOL_EVENT_TYPE_LABELS[event.type]}</GChip>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </GCard>

          <GCard index={4} kicker="Quick setup" title={allReady ? "Ready for families" : "Get ready for families"}>
            {allReady ? (
              <div className="rounded-[16px] bg-[var(--sf-mint)] p-3.5 text-[13.5px] font-semibold text-[var(--sf-forest)]">
                Tour slots, shadow days and events are all set for this month.
              </div>
            ) : (
              <GardenSteps steps={steps} progressLabel="Schedule setup" data-testid="schedule-setup-steps" />
            )}
          </GCard>
        </div>
      </div>
    </div>
  );
}

function VisitRow({
  visit,
  selected,
  loading,
  onClick,
}: {
  visit: AdminScheduledVisit;
  selected: boolean;
  loading: boolean;
  onClick: () => void;
}) {
  const style = VISIT_TYPE_STYLE[visit.actionType];
  const Icon = style.icon;
  const content = (
    <>
      <span
        aria-hidden
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] border-[1.5px] border-[var(--sf-ink)]/12 ${style.tint}`}
      >
        <Icon className="h-4 w-4 text-[var(--sf-ink)]/70" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[14px] font-extrabold text-[var(--sf-ink)]">{visit.stepTitle}</span>
        <span className="block truncate text-[12.5px] font-semibold text-[var(--sf-soft)]">
          {visit.studentLabel ?? "Student pending"} · {visit.whenLabel}
        </span>
      </span>
      <GChip tone={visit.timing === "happening" ? "success" : "info"}>
        {visit.timing === "happening" ? "Now" : "Upcoming"}
      </GChip>
    </>
  );
  if (!visit.applicationId) {
    return (
      <div className="flex w-full items-center gap-3 rounded-[14px] px-3 py-3" title="Booked from the public tour page — no application to open">
        {content}
        <span className="w-4 shrink-0" aria-hidden />
      </div>
    );
  }
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={selected ? "true" : undefined}
      aria-busy={selected && loading ? true : undefined}
      className={`${ROW_INTERACTIVE} ${selected ? "bg-[var(--sf-accent-wash)] ring-[1.5px] ring-inset ring-[var(--sf-clay)]/35" : ""} ${
        selected && loading ? "opacity-70" : ""
      }`}
    >
      {content}
      <ChevronRight aria-hidden className="h-4 w-4 shrink-0 text-[var(--sf-ink)]/30 transition-transform group-hover:translate-x-0.5" />
    </button>
  );
}
