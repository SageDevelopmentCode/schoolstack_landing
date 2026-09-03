"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Calendar, MapPin } from "lucide-react";
import { SchoolAdminSummaryCardsSkeleton } from "@/components/school-admin/skeletons";
import AdminButton from "@/components/school-admin/ui/story/AdminButton";
import AdminCard from "@/components/school-admin/ui/story/AdminCard";
import AdminChip from "@/components/school-admin/ui/story/AdminChip";
import AdminMetricCard from "@/components/school-admin/ui/story/AdminMetricCard";
import AdminSectionKicker from "@/components/school-admin/ui/story/AdminSectionKicker";
import { useScheduleVisitsContext } from "@/components/school-admin/schedule/schedule-visits-context";
import type { AdminScheduledVisit } from "@/lib/admissions/admin-scheduled-visits";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import { createClient } from "@/utils/supabase/client";
import type { ScheduleTabId } from "./schedule-tabs";
import { listUpcomingEventsForOrg } from "@/lib/school-events/events";
import { eventTypeChipTone } from "@/components/school-parent/calendar/parent-calendar-agenda-utils";
import {
  getEventDisplayStyle,
  SCHOOL_EVENT_TYPE_LABELS,
} from "@/lib/school-events/event-labels";
import type { OrganizationEvent } from "@/lib/school-events/types";

type ScheduleOverviewTabProps = {
  theme: ParentThemeTokens;
  C: AdminThemeTokens;
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
};

function visitChipTone(
  timing: AdminScheduledVisit["timing"],
): "info" | "success" | "purple" {
  switch (timing) {
    case "happening":
      return "success";
    case "past":
      return "purple";
    default:
      return "info";
  }
}

export default function ScheduleOverviewTab({
  theme,
  C,
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
}: ScheduleOverviewTabProps) {
  const supabase = useMemo(() => createClient(), []);
  const { visits, visitsReady } = useScheduleVisitsContext();
  const [upcomingEvents, setUpcomingEvents] = useState<OrganizationEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);

  const loading = visitsDeferred || !visitsReady;

  const loadEvents = useCallback(async () => {
    setEventsLoading(true);
    try {
      const rows = await listUpcomingEventsForOrg(supabase, organizationId, 5);
      setUpcomingEvents(rows);
    } catch {
      setUpcomingEvents([]);
    } finally {
      setEventsLoading(false);
    }
  }, [organizationId, supabase]);

  useEffect(() => {
    queueMicrotask(() => {
      void loadEvents();
    });
  }, [loadEvents]);

  const upcomingVisits = useMemo(
    () =>
      visits
        .filter((visit) => visit.timing === "upcoming" || visit.timing === "happening")
        .slice(0, 7),
    [visits],
  );

  const upcomingCount = useMemo(
    () => visits.filter((visit) => visit.timing === "upcoming").length,
    [visits],
  );

  useEffect(() => {
    if (!loading) {
      onUpcomingCountChange?.(upcomingCount);
    }
  }, [loading, onUpcomingCountChange, upcomingCount]);

  useEffect(() => {
    onLoadingChange?.(loading || eventsLoading);
  }, [eventsLoading, loading, onLoadingChange]);

  const visitsByDate = useMemo(() => {
    const groups = new Map<string, AdminScheduledVisit[]>();
    for (const visit of upcomingVisits) {
      const key = visit.scheduledDate;
      const existing = groups.get(key) ?? [];
      existing.push(visit);
      groups.set(key, existing);
    }
    return [...groups.entries()];
  }, [upcomingVisits]);

  return (
    <div className="space-y-[19px]">
      <div className="grid grid-cols-1 gap-[13px] sm:grid-cols-3">
        <AdminMetricCard
          theme={theme}
          accent="sky"
          label="Open time slots this month"
          value={monthSlotCount == null ? "—" : String(monthSlotCount)}
          onClick={() => onTabChange("tours")}
        />
        <AdminMetricCard
          theme={theme}
          accent="gold"
          label="Open shadow days this month"
          value={monthObservationDayCount == null ? "—" : String(monthObservationDayCount)}
          onClick={() => onTabChange("shadow")}
        />
        <AdminMetricCard
          theme={theme}
          accent="forest"
          label="Upcoming visits"
          value={loading ? "—" : String(upcomingCount)}
          onClick={() => onTabChange("visits")}
        />
      </div>

      <div className="grid grid-cols-1 gap-[15px] lg:grid-cols-[1.35fr_0.65fr]">
        <AdminCard theme={theme}>
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <AdminSectionKicker theme={theme}>Upcoming agenda</AdminSectionKicker>
              <h2
                className="mt-1.5 font-heading text-[23px] font-semibold leading-tight tracking-[-0.03em]"
                style={{ fontFamily: theme.fontDisplay, color: theme.ink }}
              >
                Next visits
              </h2>
              <p className="mt-2 text-xs leading-relaxed" style={{ color: theme.muted }}>
                Tours, interviews, and shadow visits on your calendar
              </p>
            </div>
            <AdminButton
              theme={theme}
              variant="soft"
              size="compact"
              onClick={() => onTabChange("visits")}
            >
              View all
            </AdminButton>
          </div>

          {loading ? (
            <SchoolAdminSummaryCardsSkeleton C={C} count={3} label="Loading upcoming visits" />
          ) : upcomingVisits.length === 0 ? (
            <div className="py-2 text-center">
              <p className="text-sm leading-relaxed" style={{ color: theme.muted }}>
                No upcoming visits yet. Families book after submitting an application.
              </p>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                <AdminButton theme={theme} variant="soft" onClick={() => onTabChange("tours")}>
                  Set tour slots
                </AdminButton>
                <AdminButton theme={theme} variant="soft" onClick={() => onTabChange("shadow")}>
                  Open shadow days
                </AdminButton>
              </div>
            </div>
          ) : (
            <div>
              {visitsByDate.map(([date, dayVisits], groupIndex) => (
                <div key={date}>
                  <p
                    className="py-2 text-[10px] font-extrabold uppercase tracking-[0.08em]"
                    style={{
                      color: "#8B9699",
                      borderTop: groupIndex > 0 ? "1px solid #EDF1ED" : undefined,
                    }}
                  >
                    {dayVisits[0]?.whenLabel.split("·")[0]?.trim() ?? date}
                  </p>
                  {dayVisits.map((visit, visitIndex) => {
                    const isSelected = visit.applicationId === selectedApplicationId;

                    return (
                      <button
                        key={visit.id}
                        type="button"
                        onClick={() => onVisitClick(visit)}
                        className="flex w-full items-center gap-2.5 py-[11px] text-left transition-colors"
                        style={{
                          borderTop:
                            visitIndex > 0 || groupIndex > 0
                              ? "1px solid #E9EFEA"
                              : undefined,
                          backgroundColor: isSelected ? "#E9F2EA" : "transparent",
                          borderLeft: isSelected
                            ? `3px solid ${theme.primary}`
                            : "3px solid transparent",
                          paddingLeft: isSelected ? "7px" : "10px",
                          opacity: loadingSubmission && isSelected ? 0.7 : 1,
                        }}
                      >
                        <span
                          className="grid h-[31px] w-[31px] shrink-0 place-items-center rounded-[10px]"
                          style={{ backgroundColor: "#E9F4F7" }}
                        >
                          <Calendar className="h-4 w-4" style={{ color: theme.primary }} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <b className="block truncate text-xs" style={{ color: theme.ink }}>
                            {visit.stepTitle}
                          </b>
                          <span className="block truncate text-[10px]" style={{ color: theme.muted }}>
                            {visit.studentLabel ?? "Student pending"}
                            <span className="mx-1 opacity-50">·</span>
                            {visit.whenLabel}
                          </span>
                        </div>
                        <AdminChip theme={theme} tone={visitChipTone(visit.timing)}>
                          {visit.timing === "happening" ? "Now" : "Upcoming"}
                        </AdminChip>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </AdminCard>

        <AdminCard theme={theme}>
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <AdminSectionKicker theme={theme}>School events</AdminSectionKicker>
              <h2
                className="mt-1.5 font-heading text-[23px] font-semibold leading-tight tracking-[-0.03em]"
                style={{ fontFamily: theme.fontDisplay, color: theme.ink }}
              >
                On the calendar
              </h2>
              <p className="mt-2 text-xs leading-relaxed" style={{ color: theme.muted }}>
                Events families see in the parent portal
              </p>
            </div>
            <AdminButton
              theme={theme}
              variant="soft"
              size="compact"
              onClick={() => onTabChange("events")}
            >
              Manage
            </AdminButton>
          </div>

          {eventsLoading ? (
            <SchoolAdminSummaryCardsSkeleton C={C} count={2} label="Loading school events" />
          ) : upcomingEvents.length === 0 ? (
            <div className="py-2 text-center">
              <p className="text-sm leading-relaxed" style={{ color: theme.muted }}>
                No school events yet. Add field trips, no-school days, and community events.
              </p>
              <div className="mt-4">
                <AdminButton theme={theme} variant="soft" onClick={() => onTabChange("events")}>
                  Add event
                </AdminButton>
              </div>
            </div>
          ) : (
            <div>
              {upcomingEvents.map((event, index) => {
                const colors = getEventDisplayStyle(event);
                return (
                  <button
                    key={event.id}
                    type="button"
                    onClick={() => onTabChange("events")}
                    className="flex w-full items-center gap-2.5 py-[11px] text-left transition-colors hover:bg-[#FAFCFA]"
                    style={{
                      borderTop: index > 0 ? "1px solid #E9EFEA" : undefined,
                    }}
                  >
                    <span
                      className="grid h-[31px] w-[31px] shrink-0 place-items-center rounded-[10px]"
                      style={{ backgroundColor: colors.bg }}
                    >
                      <MapPin className="h-4 w-4" style={{ color: colors.text }} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <b className="block truncate text-xs" style={{ color: theme.ink }}>
                        {event.title}
                      </b>
                      <span className="block truncate text-[10px]" style={{ color: theme.muted }}>
                        {event.date}
                        {!event.isAllDay && event.time ? ` · ${event.time}` : ""}
                      </span>
                    </div>
                    <AdminChip theme={theme} tone={eventTypeChipTone(event.type)}>
                      {SCHOOL_EVENT_TYPE_LABELS[event.type]}
                    </AdminChip>
                  </button>
                );
              })}
            </div>
          )}

          <div
            className="mt-4 flex flex-col gap-2 border-t pt-4"
            style={{ borderColor: "#EDF1ED" }}
          >
            <p className="text-[10px] font-extrabold uppercase tracking-[0.08em]" style={{ color: "#8B9699" }}>
              Quick setup
            </p>
            <AdminButton theme={theme} variant="outline" size="compact" onClick={() => onTabChange("tours")}>
              Set tour slots
            </AdminButton>
            <AdminButton theme={theme} variant="outline" size="compact" onClick={() => onTabChange("shadow")}>
              Open shadow days
            </AdminButton>
          </div>
        </AdminCard>
      </div>
    </div>
  );
}
