"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CalendarClock, ChevronRight } from "lucide-react";
import { GardenEmptyState, GardenFilterChips } from "@/components/school-admin/garden/kit";
import { G_TABLE, G_TD, G_TH, gRowClass } from "@/components/school-admin/garden/blocks";
import { GCard, GChip, GSkeleton, gLinkSm, type GChipTone } from "@/components/school-parent/garden/ui";
import { VISIT_TYPE_STYLE } from "@/components/school-admin/schedule/ScheduleOverviewTab";
import { useScheduleVisitsContext } from "@/components/school-admin/schedule/schedule-visits-context";
import { type AdminScheduledVisit, type ScheduledVisitTiming } from "@/lib/admissions/admin-scheduled-visits";
import { formatGradeValuesLabel } from "@/lib/admissions/admissions-observation-slots";
import type { PostSubmitActionType } from "@/lib/admissions/application-form-schema";

type ScheduledVisitsSectionProps = {
  selectedApplicationId: string | null;
  loadingSubmission: boolean;
  onVisitClick: (visit: AdminScheduledVisit) => void;
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

const TIMING_TONES: Record<ScheduledVisitTiming, GChipTone> = {
  upcoming: "info",
  happening: "success",
  past: "neutral",
};

const EMPTY_ALL =
  "No visits have been booked yet. Families schedule tours and interviews from their application dashboard after submitting.";

function shadowVisitDetailLabel(visit: AdminScheduledVisit): string | null {
  if (visit.actionType !== "schedule_observation_day" || !visit.observationSlots?.length) return null;
  const hasTimedSlots = visit.observationSlots.some((slot) => slot.startTime !== "ALL_DAY");
  const hasGrades = visit.observationSlots.some((slot) => slot.gradeValues.length > 0);
  if (!hasTimedSlots && !hasGrades) return null;
  return visit.observationSlots
    .map((slot) => {
      const parts: string[] = [];
      if (slot.gradeValues.length > 0) parts.push(formatGradeValuesLabel(slot.gradeValues));
      if (slot.startTime !== "ALL_DAY") parts.push(slot.endTime ? `${slot.startTime} – ${slot.endTime}` : slot.startTime);
      return parts.join(" · ");
    })
    .join("; ");
}

/** All visits (admin Garden): type + timing filters with counts, a table from md, cards on phones. */
export default function ScheduledVisitsSection({
  selectedApplicationId,
  loadingSubmission,
  onVisitClick,
  onLoadingChange,
  visitsDeferred = false,
}: ScheduledVisitsSectionProps) {
  const { visits, visitsReady } = useScheduleVisitsContext();
  const loading = visitsDeferred || !visitsReady;
  const [timingFilter, setTimingFilter] = useState<TimingFilter>("all");
  const [visitTypeFilter, setVisitTypeFilter] = useState<VisitTypeFilter>("all");
  const onLoadingRef = useRef(onLoadingChange);
  useEffect(() => {
    onLoadingRef.current = onLoadingChange;
  });

  useEffect(() => {
    onLoadingRef.current?.(loading);
  }, [loading]);

  const timingCounts = useMemo(() => {
    const counts: Record<TimingFilter, number> = { all: visits.length, upcoming: 0, happening: 0, past: 0 };
    for (const visit of visits) counts[visit.timing] += 1;
    return counts;
  }, [visits]);

  const visitTypeCounts = useMemo(() => {
    const counts: Record<VisitTypeFilter, number> = {
      all: visits.length,
      schedule_campus_tour: 0,
      schedule_family_interview: 0,
      schedule_observation_day: 0,
    };
    for (const visit of visits) counts[visit.actionType] += 1;
    return counts;
  }, [visits]);

  const filteredVisits = useMemo(
    () =>
      visits.filter(
        (visit) =>
          (timingFilter === "all" || visit.timing === timingFilter) &&
          (visitTypeFilter === "all" || visit.actionType === visitTypeFilter),
      ),
    [timingFilter, visitTypeFilter, visits],
  );

  const typeOptions = VISIT_TYPE_FILTERS.filter(
    (f) => f.value === "all" || visitTypeCounts[f.value] > 0 || visitTypeFilter === f.value,
  ).map((f) => ({ key: f.value, label: f.label, count: visitTypeCounts[f.value] }));
  const timingOptions = TIMING_FILTERS.filter(
    (f) => f.value === "all" || timingCounts[f.value] > 0 || timingFilter === f.value,
  ).map((f) => ({ key: f.value, label: f.label, count: timingCounts[f.value] }));

  const resetFilters = () => {
    setTimingFilter("all");
    setVisitTypeFilter("all");
  };

  return (
    <GCard index={1} kicker="All visits" title="Booked visits" data-testid="schedule-visits">
      {!loading && visits.length > 0 ? (
        <div className="mb-4 flex flex-col gap-2">
          <GardenFilterChips
            options={typeOptions}
            value={visitTypeFilter}
            onChange={(key) => setVisitTypeFilter(key as VisitTypeFilter)}
            ariaLabel="Filter by visit type"
          />
          <GardenFilterChips
            options={timingOptions}
            value={timingFilter}
            onChange={(key) => setTimingFilter(key as TimingFilter)}
            ariaLabel="Filter by when"
          />
        </div>
      ) : null}

      {loading ? (
        <div className="flex flex-col gap-2" aria-busy="true" aria-label="Loading scheduled visits">
          {[0, 1, 2, 3, 4].map((i) => (
            <GSkeleton key={i} className="h-[52px] rounded-[14px]" />
          ))}
        </div>
      ) : visits.length === 0 ? (
        <GardenEmptyState icon={CalendarClock} tint="bg-[var(--sf-sky)]" title="No visits yet" description={EMPTY_ALL} />
      ) : filteredVisits.length === 0 ? (
        <div className="rounded-[16px] border-[1.5px] border-dashed border-[var(--sf-ink)]/15 bg-[var(--sf-paper)] px-4 py-6 text-center">
          <p className="m-0 text-[14px] font-extrabold text-[var(--sf-ink)]">No visits match these filters.</p>
          <button type="button" className={`${gLinkSm} mt-1`} onClick={resetFilters}>
            Show all visits
          </button>
        </div>
      ) : (
        <>
          {/* md+: table */}
          <div className="-mx-2 hidden overflow-x-auto md:block">
            <table className={`${G_TABLE} min-w-[720px]`}>
              <thead>
                <tr>
                  {["When", "Visit", "Student", "Form", "Status"].map((heading) => (
                    <th key={heading} className={G_TH} scope="col">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredVisits.map((visit) => {
                  const interactive = Boolean(visit.applicationId);
                  const selected = interactive && visit.applicationId === selectedApplicationId;
                  const slotDetail = shadowVisitDetailLabel(visit);
                  const type = VISIT_TYPE_STYLE[visit.actionType];
                  return (
                    <tr
                      key={visit.id}
                      tabIndex={interactive ? 0 : undefined}
                      aria-selected={selected || undefined}
                      onClick={() => interactive && onVisitClick(visit)}
                      onKeyDown={(event) => {
                        if (interactive && (event.key === "Enter" || event.key === " ")) {
                          event.preventDefault();
                          onVisitClick(visit);
                        }
                      }}
                      className={`${gRowClass({ selected, interactive })} ${selected && loadingSubmission ? "opacity-70" : ""}`}
                    >
                      <td className={G_TD}>
                        <span className="block text-[13.5px] font-extrabold text-[var(--sf-ink)]">{visit.whenLabel}</span>
                        {slotDetail ? (
                          <span className="block text-[12px] font-semibold text-[var(--sf-soft)]">{slotDetail}</span>
                        ) : null}
                      </td>
                      <td className={G_TD}>
                        <span className="flex items-center gap-2">
                          <span aria-hidden className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-[9px] ${type.tint}`}>
                            <type.icon className="h-3.5 w-3.5 text-[var(--sf-ink)]/70" />
                          </span>
                          <span className="text-[13.5px] font-bold text-[var(--sf-ink)]">{visit.stepTitle}</span>
                        </span>
                      </td>
                      <td className={`${G_TD} text-[13px] font-semibold text-[var(--sf-soft)]`}>{visit.studentLabel ?? "—"}</td>
                      <td className={`${G_TD} text-[13px] font-semibold text-[var(--sf-soft)]`}>
                        {visit.formTitle}
                        {!interactive ? <span className="block text-[11.5px] font-bold">No application to open</span> : null}
                      </td>
                      <td className={G_TD}>
                        <span className="flex items-center justify-between gap-2">
                          <GChip tone={TIMING_TONES[visit.timing]}>{TIMING_LABELS[visit.timing]}</GChip>
                          {interactive ? <ChevronRight className="h-4 w-4 text-[var(--sf-ink)]/30" aria-hidden /> : null}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* phones: stacked cards */}
          <ul className="m-0 flex list-none flex-col gap-2 p-0 md:hidden">
            {filteredVisits.map((visit) => {
              const interactive = Boolean(visit.applicationId);
              const selected = interactive && visit.applicationId === selectedApplicationId;
              const type = VISIT_TYPE_STYLE[visit.actionType];
              const body = (
                <>
                  <span aria-hidden className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] ${type.tint}`}>
                    <type.icon className="h-4 w-4 text-[var(--sf-ink)]/70" />
                  </span>
                  <span className="min-w-0 flex-1 text-left">
                    <span className="block truncate text-[14px] font-extrabold text-[var(--sf-ink)]">{visit.stepTitle}</span>
                    <span className="block text-[12.5px] font-semibold text-[var(--sf-soft)]">{visit.whenLabel}</span>
                    <span className="block truncate text-[12.5px] font-semibold text-[var(--sf-soft)]">
                      {visit.studentLabel ?? "—"} · {visit.formTitle}
                    </span>
                  </span>
                  <GChip tone={TIMING_TONES[visit.timing]}>{TIMING_LABELS[visit.timing]}</GChip>
                </>
              );
              return (
                <li key={visit.id}>
                  {interactive ? (
                    <button
                      type="button"
                      onClick={() => onVisitClick(visit)}
                      aria-current={selected ? "true" : undefined}
                      className={`flex w-full items-center gap-3 rounded-[16px] border-[1.5px] border-[var(--sf-ink)]/10 px-3 py-3 ${gRowClass({ selected, interactive: true })}`}
                    >
                      {body}
                    </button>
                  ) : (
                    <div className="flex w-full items-center gap-3 rounded-[16px] border-[1.5px] border-[var(--sf-ink)]/10 px-3 py-3">
                      {body}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </>
      )}
    </GCard>
  );
}
