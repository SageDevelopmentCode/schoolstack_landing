"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { SchoolAdminSummaryCardsSkeleton } from "@/components/school-admin/skeletons";
import {
  listOrgScheduledVisits,
  type AdminScheduledVisit,
} from "@/lib/admissions/admin-scheduled-visits";
import { getAdminButtonStyle } from "@/lib/organization-settings/admin-button-styles";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import { createClient } from "@/utils/supabase/client";
import type { ScheduleTabId } from "./schedule-tabs";

type ScheduleOverviewTabProps = {
  C: AdminThemeTokens;
  organizationId: string;
  monthSlotCount: number | null;
  monthObservationDayCount: number | null;
  selectedApplicationId: string | null;
  loadingSubmission: boolean;
  onVisitClick: (visit: AdminScheduledVisit) => void;
  onTabChange: (tab: ScheduleTabId) => void;
  onUpcomingCountChange?: (count: number) => void;
};

function SummaryCard({
  C,
  label,
  value,
  onClick,
}: {
  C: AdminThemeTokens;
  label: string;
  value: string;
  onClick?: () => void;
}) {
  const content = (
    <>
      <p className="text-[11px] font-medium" style={{ color: C.textTertiary }}>
        {label}
      </p>
      <p className="mt-1 text-xl font-semibold tabular-nums" style={{ color: C.textPrimary }}>
        {value}
      </p>
    </>
  );

  if (!onClick) {
    return (
      <div
        className="rounded-sm p-3"
        style={{ backgroundColor: C.elevated, border: `1px solid ${C.border}` }}
      >
        {content}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-sm p-3 text-left transition-colors"
      style={{ backgroundColor: C.elevated, border: `1px solid ${C.border}` }}
    >
      {content}
    </button>
  );
}

function timingBadgeStyle(
  timing: AdminScheduledVisit["timing"],
  C: AdminThemeTokens,
): { backgroundColor: string; color: string } {
  switch (timing) {
    case "upcoming":
      return { backgroundColor: C.infoBg, color: C.info };
    case "happening":
      return { backgroundColor: C.successBg, color: C.success };
    case "past":
      return { backgroundColor: C.elevated, color: C.textTertiary };
  }
}

export default function ScheduleOverviewTab({
  C,
  organizationId,
  monthSlotCount,
  monthObservationDayCount,
  selectedApplicationId,
  loadingSubmission,
  onVisitClick,
  onTabChange,
  onUpcomingCountChange,
}: ScheduleOverviewTabProps) {
  const supabase = useMemo(() => createClient(), []);
  const [visits, setVisits] = useState<AdminScheduledVisit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadVisits = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const rows = await listOrgScheduledVisits(supabase, organizationId);
      setVisits(rows);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load scheduled visits.");
    } finally {
      setLoading(false);
    }
  }, [organizationId, supabase]);

  useEffect(() => {
    queueMicrotask(() => {
      void loadVisits();
    });
  }, [loadVisits]);

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
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <SummaryCard
          C={C}
          label="Open time slots this month"
          value={monthSlotCount == null ? "—" : String(monthSlotCount)}
          onClick={() => onTabChange("tours")}
        />
        <SummaryCard
          C={C}
          label="Open shadow days this month"
          value={monthObservationDayCount == null ? "—" : String(monthObservationDayCount)}
          onClick={() => onTabChange("shadow")}
        />
        <SummaryCard
          C={C}
          label="Upcoming visits"
          value={loading ? "—" : String(upcomingCount)}
          onClick={() => onTabChange("visits")}
        />
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold" style={{ color: C.textPrimary }}>
              Upcoming agenda
            </h2>
            <p className="mt-0.5 text-xs" style={{ color: C.textTertiary }}>
              Next tours, interviews, and shadow visits on your calendar
            </p>
          </div>
          <button
            type="button"
            onClick={() => onTabChange("visits")}
            className="rounded-sm px-3 py-1.5 text-xs font-medium"
            style={getAdminButtonStyle(C, "secondary")}
          >
            View all
          </button>
        </div>

        {loading ? (
          <SchoolAdminSummaryCardsSkeleton C={C} count={3} label="Loading upcoming visits" />
        ) : error ? (
          <p className="text-sm" style={{ color: C.error }}>
            {error}
          </p>
        ) : upcomingVisits.length === 0 ? (
          <div
            className="rounded-sm border px-4 py-8 text-center"
            style={{ borderColor: C.border, backgroundColor: C.surface }}
          >
            <p className="text-sm leading-relaxed" style={{ color: C.textSecondary }}>
              No upcoming visits yet. Families book after submitting an application.
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => onTabChange("tours")}
                className="rounded-sm px-3 py-2 text-xs font-medium"
                style={getAdminButtonStyle(C, "primary")}
              >
                Set tour slots
              </button>
              <button
                type="button"
                onClick={() => onTabChange("shadow")}
                className="rounded-sm px-3 py-2 text-xs font-medium"
                style={getAdminButtonStyle(C, "primary")}
              >
                Open shadow days
              </button>
            </div>
          </div>
        ) : (
          <div
            className="overflow-hidden rounded-sm border"
            style={{ borderColor: C.border, backgroundColor: C.surface }}
          >
            {visitsByDate.map(([date, dayVisits], groupIndex) => (
              <div
                key={date}
                style={{
                  borderTop: groupIndex > 0 ? `1px solid ${C.border}` : undefined,
                }}
              >
                <div
                  className="px-4 py-2 text-[11px] font-semibold uppercase tracking-wide"
                  style={{ backgroundColor: C.bg, color: C.textQuaternary }}
                >
                  {dayVisits[0]?.whenLabel.split("·")[0]?.trim() ?? date}
                </div>
                {dayVisits.map((visit) => {
                  const isSelected = visit.applicationId === selectedApplicationId;
                  const timingStyle = timingBadgeStyle(visit.timing, C);

                  return (
                    <button
                      key={visit.id}
                      type="button"
                      onClick={() => onVisitClick(visit)}
                      className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors"
                      style={{
                        backgroundColor: isSelected ? C.accentLight : "transparent",
                        borderTop: `1px solid ${C.border}`,
                        opacity: loadingSubmission && isSelected ? 0.7 : 1,
                      }}
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium" style={{ color: C.textPrimary }}>
                          {visit.stepTitle}
                        </p>
                        <p className="mt-0.5 truncate text-xs" style={{ color: C.textSecondary }}>
                          {visit.studentLabel ?? "Student pending"}
                          <span className="mx-1.5 opacity-50">·</span>
                          {visit.whenLabel}
                        </p>
                      </div>
                      <span
                        className="shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium"
                        style={timingStyle}
                      >
                        {visit.timing === "happening" ? "Now" : "Upcoming"}
                      </span>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
