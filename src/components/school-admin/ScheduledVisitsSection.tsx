"use client";

import { useEffect, useMemo, useState } from "react";
import { SchoolAdminTableSkeleton } from "@/components/school-admin/skeletons";
import AdminCard from "@/components/school-admin/ui/story/AdminCard";
import AdminChip from "@/components/school-admin/ui/story/AdminChip";
import { useScheduleVisitsContext } from "@/components/school-admin/schedule/schedule-visits-context";
import {
  type AdminScheduledVisit,
  type ScheduledVisitTiming,
} from "@/lib/admissions/admin-scheduled-visits";
import { formatGradeValuesLabel } from "@/lib/admissions/admissions-observation-slots";
import type { PostSubmitActionType } from "@/lib/admissions/application-form-schema";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

type ScheduledVisitsSectionProps = {
  theme: ParentThemeTokens;
  C: AdminThemeTokens;
  organizationId: string;
  selectedApplicationId: string | null;
  loadingSubmission: boolean;
  onVisitClick: (visit: AdminScheduledVisit) => void;
  showHeader?: boolean;
  onLoadingChange?: (loading: boolean) => void;
  visitsDeferred?: boolean;
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

function shadowVisitDetailLabel(visit: AdminScheduledVisit): string | null {
  if (
    visit.actionType !== "schedule_observation_day" ||
    !visit.observationSlots?.length
  ) {
    return null;
  }

  const hasTimedSlots = visit.observationSlots.some(
    (slot) => slot.startTime !== "ALL_DAY",
  );
  const hasGrades = visit.observationSlots.some(
    (slot) => slot.gradeValues.length > 0,
  );

  if (!hasTimedSlots && !hasGrades) return null;

  return visit.observationSlots
    .map((slot) => {
      const parts: string[] = [];
      if (slot.gradeValues.length > 0) {
        parts.push(formatGradeValuesLabel(slot.gradeValues));
      }
      if (slot.startTime !== "ALL_DAY") {
        parts.push(
          slot.endTime ? `${slot.startTime} – ${slot.endTime}` : slot.startTime,
        );
      }
      return parts.join(" · ");
    })
    .join("; ");
}

function StoryFilterPill({
  active,
  label,
  count,
  onClick,
  theme,
}: {
  active: boolean;
  label: string;
  count?: number;
  onClick: () => void;
  theme: ParentThemeTokens;
}) {
  const displayLabel = count != null ? `${label} · ${count}` : label;

  return (
    <button
      type="button"
      onClick={onClick}
      className="cursor-pointer rounded-[9px] border px-2.5 py-2 text-[11px] font-medium transition-colors"
      style={
        active
          ? {
              backgroundColor: "#E9F2EA",
              color: theme.primary,
              borderColor: "#BCD4C1",
              fontWeight: 700,
            }
          : {
              backgroundColor: theme.white,
              color: "#5D6D73",
              borderColor: "#DCE4DC",
            }
      }
    >
      {displayLabel}
    </button>
  );
}

function visitChipTone(timing: ScheduledVisitTiming): "info" | "success" | "purple" {
  switch (timing) {
    case "happening":
      return "success";
    case "past":
      return "purple";
    default:
      return "info";
  }
}

export default function ScheduledVisitsSection({
  theme,
  C,
  organizationId,
  selectedApplicationId,
  loadingSubmission,
  onVisitClick,
  showHeader = true,
  onLoadingChange,
  visitsDeferred = false,
}: ScheduledVisitsSectionProps) {
  const { visits, visitsReady } = useScheduleVisitsContext();
  const loading = visitsDeferred || !visitsReady;
  const [timingFilter, setTimingFilter] = useState<TimingFilter>("all");
  const [visitTypeFilter, setVisitTypeFilter] = useState<VisitTypeFilter>("all");

  useEffect(() => {
    onLoadingChange?.(loading);
  }, [loading, onLoadingChange]);

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
          <h2
            className="font-heading text-lg font-semibold"
            style={{ fontFamily: theme.fontDisplay, color: theme.ink }}
          >
            Scheduled visits
          </h2>
          <p className="mt-1 text-xs" style={{ color: theme.muted }}>
            Tours, interviews, and observation days booked by families
          </p>
        </div>
      ) : null}

      <div className="mb-3 flex flex-wrap items-center gap-2">
        {VISIT_TYPE_FILTERS.map((filter) => (
          <StoryFilterPill
            key={filter.value}
            active={visitTypeFilter === filter.value}
            label={filter.label}
            count={visitTypeCounts[filter.value]}
            onClick={() => setVisitTypeFilter(filter.value)}
            theme={theme}
          />
        ))}
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {TIMING_FILTERS.map((filter) => (
          <StoryFilterPill
            key={filter.value}
            active={timingFilter === filter.value}
            label={filter.label}
            count={
              filter.value === "all" ? visits.length : timingCounts[filter.value]
            }
            onClick={() => setTimingFilter(filter.value)}
            theme={theme}
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
      ) : visits.length === 0 ? (
        <AdminCard theme={theme} padding="canvas">
          <p className="text-sm leading-relaxed" style={{ color: theme.muted }}>
            {EMPTY_MESSAGES.all}
          </p>
        </AdminCard>
      ) : filteredVisits.length === 0 ? (
        <AdminCard theme={theme} padding="canvas">
          <p className="text-sm leading-relaxed" style={{ color: theme.muted }}>
            {EMPTY_MESSAGES[timingFilter]}
          </p>
        </AdminCard>
      ) : (
        <AdminCard theme={theme} padding="none">
          <div className="overflow-auto">
            <table className="w-full min-w-[760px] border-collapse text-left text-sm">
              <thead style={{ backgroundColor: "#FBFCFB", borderBottom: "1px solid #EDF1ED" }}>
                <tr>
                  {["When", "Visit", "Student", "Form", "Status"].map((heading) => (
                    <th
                      key={heading}
                      className="px-4 py-3 text-[10px] font-extrabold uppercase tracking-[0.08em] first:pl-5 last:pr-5"
                      style={{ color: "#8B9699" }}
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredVisits.map((visit) => {
                  const isSelected = visit.applicationId === selectedApplicationId;
                  const slotDetail = shadowVisitDetailLabel(visit);

                  return (
                    <tr
                      key={visit.id}
                      onClick={() => {
                        if (visit.applicationId) {
                          onVisitClick(visit);
                        }
                      }}
                      className={
                        visit.applicationId
                          ? "cursor-pointer transition-colors hover:bg-[#FAFCFA]"
                          : ""
                      }
                      style={{
                        backgroundColor: isSelected ? "#E9F2EA" : "transparent",
                        borderBottom: "1px solid #EDF1ED",
                        boxShadow: isSelected ? `inset 3px 0 0 ${theme.primary}` : undefined,
                        opacity: loadingSubmission && isSelected ? 0.7 : 1,
                      }}
                    >
                      <td className="px-4 py-3 first:pl-5" style={{ color: theme.ink }}>
                        <div className="text-xs font-medium">{visit.whenLabel}</div>
                        {slotDetail ? (
                          <div className="mt-0.5 text-[11px]" style={{ color: theme.muted }}>
                            {slotDetail}
                          </div>
                        ) : null}
                      </td>
                      <td className="px-4 py-3 text-xs" style={{ color: theme.ink }}>
                        {visit.stepTitle}
                      </td>
                      <td className="px-4 py-3 text-xs" style={{ color: theme.muted }}>
                        {visit.studentLabel ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-xs" style={{ color: theme.muted }}>
                        {visit.formTitle}
                      </td>
                      <td className="px-4 py-3 last:pr-5">
                        <AdminChip theme={theme} tone={visitChipTone(visit.timing)}>
                          {TIMING_LABELS[visit.timing]}
                        </AdminChip>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </AdminCard>
      )}
    </div>
  );
}
