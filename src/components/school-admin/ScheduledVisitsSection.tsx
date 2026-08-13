"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { SchoolAdminTableSkeleton } from "@/components/school-admin/skeletons";
import {
  listOrgScheduledVisits,
  type AdminScheduledVisit,
  type ScheduledVisitTiming,
} from "@/lib/admissions/admin-scheduled-visits";
import type { PostSubmitActionType } from "@/lib/admissions/application-form-schema";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import { createClient } from "@/utils/supabase/client";

type ScheduledVisitsSectionProps = {
  C: AdminThemeTokens;
  organizationId: string;
  selectedApplicationId: string | null;
  loadingSubmission: boolean;
  onVisitClick: (visit: AdminScheduledVisit) => void;
  showHeader?: boolean;
};

type TimingFilter = "all" | ScheduledVisitTiming;
type VisitTypeFilter = "all" | PostSubmitActionType;

const TIMING_FILTERS: { value: TimingFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "upcoming", label: "Upcoming" },
  { value: "happening", label: "Happening" },
  { value: "past", label: "Past" },
];

const VISIT_TYPE_FILTERS: { value: VisitTypeFilter; label: string }[] = [
  { value: "all", label: "All types" },
  { value: "schedule_campus_tour", label: "Tours" },
  { value: "schedule_family_interview", label: "Interviews" },
  { value: "schedule_observation_day", label: "Shadow days" },
];

const TIMING_LABELS: Record<ScheduledVisitTiming, string> = {
  upcoming: "Upcoming",
  happening: "Happening",
  past: "Past",
};

const EMPTY_MESSAGES: Record<TimingFilter, string> = {
  all: "No visits have been booked yet. Families schedule tours and interviews from their application dashboard after submitting.",
  upcoming: "No upcoming visits booked yet.",
  happening: "No visits happening right now.",
  past: "No past visits to show.",
};

function FilterChip({
  active,
  label,
  count,
  onClick,
  C,
}: {
  active: boolean;
  label: string;
  count?: number;
  onClick: () => void;
  C: AdminThemeTokens;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors"
      style={{
        backgroundColor: active ? C.accentLight : C.elevated,
        color: active ? C.accent : C.textSecondary,
        border: `1px solid ${active ? C.accent : C.border}`,
      }}
    >
      {label}
      {count != null ? (
        <span
          className="rounded-full px-1.5 py-0.5 text-[10px] font-semibold"
          style={{
            backgroundColor: active ? C.surface : C.bg,
            color: active ? C.accent : C.textTertiary,
          }}
        >
          {count}
        </span>
      ) : null}
    </button>
  );
}

function timingBadgeStyle(
  timing: ScheduledVisitTiming,
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

export default function ScheduledVisitsSection({
  C,
  organizationId,
  selectedApplicationId,
  loadingSubmission,
  onVisitClick,
  showHeader = true,
}: ScheduledVisitsSectionProps) {
  const supabase = useMemo(() => createClient(), []);
  const [visits, setVisits] = useState<AdminScheduledVisit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timingFilter, setTimingFilter] = useState<TimingFilter>("all");
  const [visitTypeFilter, setVisitTypeFilter] = useState<VisitTypeFilter>("all");

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

  const timingCounts = useMemo(() => {
    const counts: Record<ScheduledVisitTiming, number> = {
      upcoming: 0,
      happening: 0,
      past: 0,
    };
    for (const visit of visits) {
      counts[visit.timing] += 1;
    }
    return counts;
  }, [visits]);

  const visitTypeCounts = useMemo(() => {
    const counts: Record<VisitTypeFilter, number> = {
      all: visits.length,
      schedule_campus_tour: 0,
      schedule_family_interview: 0,
      schedule_observation_day: 0,
    };
    for (const visit of visits) {
      counts[visit.actionType] += 1;
    }
    return counts;
  }, [visits]);

  const filteredVisits = useMemo(() => {
    return visits.filter((visit) => {
      const matchesTiming = timingFilter === "all" || visit.timing === timingFilter;
      const matchesType =
        visitTypeFilter === "all" || visit.actionType === visitTypeFilter;
      return matchesTiming && matchesType;
    });
  }, [timingFilter, visitTypeFilter, visits]);

  return (
    <div>
      {showHeader ? (
        <div className="mb-4">
          <h2 className="text-sm font-semibold" style={{ color: C.textPrimary }}>
            Scheduled visits
          </h2>
          <p className="mt-0.5 text-xs" style={{ color: C.textTertiary }}>
            Tours, interviews, and observation days booked by families
          </p>
        </div>
      ) : null}

      <div className="mb-3 flex flex-wrap items-center gap-2">
        {VISIT_TYPE_FILTERS.map((filter) => (
          <FilterChip
            key={filter.value}
            active={visitTypeFilter === filter.value}
            label={filter.label}
            count={visitTypeCounts[filter.value]}
            onClick={() => setVisitTypeFilter(filter.value)}
            C={C}
          />
        ))}
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {TIMING_FILTERS.map((filter) => (
          <FilterChip
            key={filter.value}
            active={timingFilter === filter.value}
            label={filter.label}
            count={
              filter.value === "all" ? visits.length : timingCounts[filter.value]
            }
            onClick={() => setTimingFilter(filter.value)}
            C={C}
          />
        ))}
      </div>

      {loading ? (
        <SchoolAdminTableSkeleton
          C={C}
          rows={5}
          columns={5}
          showFilters={false}
          compact
          label="Loading scheduled visits"
        />
      ) : error ? (
        <p className="text-sm" style={{ color: C.error }}>
          {error}
        </p>
      ) : visits.length === 0 ? (
        <p className="text-sm leading-relaxed" style={{ color: C.textSecondary }}>
          {EMPTY_MESSAGES.all}
        </p>
      ) : filteredVisits.length === 0 ? (
        <p className="text-sm leading-relaxed" style={{ color: C.textSecondary }}>
          {EMPTY_MESSAGES[timingFilter]}
        </p>
      ) : (
        <div className="overflow-auto">
          <table className="w-full min-w-[760px] border-collapse text-left text-sm">
            <thead style={{ borderBottom: `1px solid ${C.border}` }}>
              <tr>
                {["When", "Visit", "Student", "Form", "Status"].map((heading) => (
                  <th
                    key={heading}
                    className="px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wide first:pl-0 last:pr-0"
                    style={{ color: C.textQuaternary }}
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredVisits.map((visit) => {
                const isSelected = visit.applicationId === selectedApplicationId;
                const timingStyle = timingBadgeStyle(visit.timing, C);

                return (
                  <tr
                    key={visit.id}
                    onClick={() => {
                      if (visit.applicationId) {
                        onVisitClick(visit);
                      }
                    }}
                    className={
                      visit.applicationId ? "cursor-pointer transition-colors" : ""
                    }
                    style={{
                      backgroundColor: isSelected ? C.accentLight : "transparent",
                      borderBottom: `1px solid ${C.border}`,
                      opacity: loadingSubmission && isSelected ? 0.7 : 1,
                    }}
                  >
                    <td className="px-3 py-3 first:pl-0" style={{ color: C.textPrimary }}>
                      <div className="font-medium">{visit.whenLabel}</div>
                    </td>
                    <td className="px-3 py-3" style={{ color: C.textPrimary }}>
                      {visit.stepTitle}
                    </td>
                    <td className="px-3 py-3" style={{ color: C.textSecondary }}>
                      {visit.studentLabel ?? "—"}
                    </td>
                    <td className="px-3 py-3" style={{ color: C.textSecondary }}>
                      {visit.formTitle}
                    </td>
                    <td className="px-3 py-3 last:pr-0">
                      <span
                        className="inline-flex rounded-full px-2 py-0.5 text-xs font-medium"
                        style={timingStyle}
                      >
                        {TIMING_LABELS[visit.timing]}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
