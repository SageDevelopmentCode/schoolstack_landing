"use client";

import { CalendarDays, Eye, SearchX } from "lucide-react";
import { Tick } from "@/components/garden/ui";
import CoopTeachingScheduleFilterBar from "@/components/admissions/CoopTeachingScheduleFilterBar";
import ParentTeachingScheduleVolunteerActions from "@/components/school-parent/teaching-schedule/ParentTeachingScheduleVolunteerActions";
import ParentGardenFrame from "@/components/school-parent/garden/ParentGardenFrame";
import ParentGardenPageHeader from "@/components/school-parent/garden/ParentGardenPageHeader";
import { G_TABLE, G_TD, G_TH } from "@/components/school-parent/garden/fields";
import { GCard, GChip, GIcon, GKicker, GStatTile } from "@/components/school-parent/garden/ui";
import { useParentTheme } from "@/components/school-parent/ParentThemeContext";
import {
  formatTeachingAssignedParents,
  formatTeachingScheduleDateRange,
  isTeachingWeekPast,
  type CoopTeachingScheduleWeek,
} from "@/lib/admissions/program-coop-teaching-schedule-mock";
import { PORTAL_HOME_CONTAINER_CLASS } from "@/lib/portal-home/layout";
import { useParentTeachingScheduleModel } from "./useParentTeachingScheduleModel";

type ParentTeachingSchedulePageProps = {
  organizationId: string;
  programId: string;
  initialWeeks: CoopTeachingScheduleWeek[];
  currentFamilyId: string;
  currentFamilyLabel: string;
  familyNameMap: Record<string, string>;
  previewMode?: boolean;
};

const TABLE_HEADINGS = [
  "Week",
  "Parent instructor",
  "Parent assistant",
  "Seasonal theme",
  "Character lesson",
  "Celebration / event",
  "Volunteer",
] as const;

function WeekLabel({ week, isPast, isNext }: { week: CoopTeachingScheduleWeek; isPast: boolean; isNext: boolean }) {
  return (
    <div className="flex flex-col items-start gap-1">
      <span className="flex flex-wrap items-center gap-1.5">
        <GChip tone={isNext ? "warning" : isPast ? "neutral" : "info"}>{week.weekName.trim() || "Teaching week"}</GChip>
        {isNext ? <span className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-[var(--sf-clay-deep)]">Next up</span> : null}
      </span>
      <span
        className={`flex items-center gap-1 text-[13px] font-semibold ${isPast ? "text-[var(--sf-soft)]" : "text-[var(--sf-ink)]"}`}
      >
        {isPast ? <Tick className="h-3.5 w-3.5" fill="var(--sf-mint)" /> : null}
        {formatTeachingScheduleDateRange(week.startDate, week.endDate)}
        {isPast ? <span className="sr-only"> (done)</span> : null}
      </span>
    </div>
  );
}

/**
 * Parent co-op Teaching schedule (Garden): summary strip, filter card, then
 * the year in one card (table from md, week cards on phones). Past weeks are
 * dimmed with a tick; the next week is on the accent wash.
 */
export default function ParentTeachingSchedulePage({
  organizationId,
  programId,
  initialWeeks,
  currentFamilyId,
  familyNameMap,
  previewMode = false,
}: ParentTeachingSchedulePageProps) {
  const { theme } = useParentTheme();
  const model = useParentTeachingScheduleModel({
    organizationId,
    programId,
    initialWeeks,
    currentFamilyId,
    familyNameMap,
    previewMode,
  });
  const { familyNames, filteredWeeks, summary, nextWeek } = model;

  const actionsFor = (week: CoopTeachingScheduleWeek, emptyFallback?: string) => (
    <ParentTeachingScheduleVolunteerActions
      week={week}
      currentFamilyId={currentFamilyId}
      previewMode={previewMode}
      pendingAction={model.pendingAction}
      onSignUp={(role) => model.signUp(week.id, role)}
      onWithdraw={(role) => model.withdraw(week.id, role)}
      emptyFallback={emptyFallback}
    />
  );

  return (
    <ParentGardenFrame theme={theme}>
      <div className={PORTAL_HOME_CONTAINER_CLASS} data-testid="parent-coop-teaching-schedule-ready">
        <ParentGardenPageHeader
          kicker="Co-op"
          title={
            <>
              Teaching <span className="text-[var(--sf-clay)]">schedule</span>
            </>
          }
          subtitle="View the full year teaching schedule and sign up to volunteer when instructor or assistant slots are open."
          data-testid="parent-coop-teaching-schedule-header"
        />

        {previewMode ? (
          <p className="m-0 -mt-3 flex w-fit items-center gap-2 rounded-[12px] bg-[var(--sf-sky)] px-3 py-2 text-[12px] font-extrabold text-[#24507a]">
            <Eye className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            Preview mode — volunteer sign-ups are turned off here.
          </p>
        ) : null}

        <GCard index={1} kicker="At a glance" className="overflow-hidden" bodyClassName="-mx-5 -mb-5 sm:-mx-6 sm:-mb-6">
          <div className="grid grid-cols-3 border-t-[1.5px] border-[var(--sf-ink)]/10 lg:grid-cols-[1fr_1fr_1fr_1.6fr]">
            <div className="border-r-[1.5px] border-[var(--sf-ink)]/10">
              <GStatTile value={summary.weekCount} label={summary.weekCount === 1 ? "Week" : "Weeks"} />
            </div>
            <div className="border-r-[1.5px] border-[var(--sf-ink)]/10">
              <GStatTile value={summary.eventCount} label={summary.eventCount === 1 ? "Event" : "Events"} />
            </div>
            <div className="lg:border-r-[1.5px] lg:border-[var(--sf-ink)]/10">
              <GStatTile value={summary.completedCount} label="Completed" />
            </div>
            <div className="col-span-3 flex flex-col items-start justify-center gap-1 border-t-[1.5px] border-[var(--sf-ink)]/10 bg-[var(--sf-accent-wash)] px-5 py-4 lg:col-span-1 lg:border-t-0">
              <GKicker>Next up</GKicker>
              {nextWeek ? (
                <>
                  <span className="sf-display text-[1.35rem] leading-tight text-[var(--sf-ink)]">{summary.nextWeekName}</span>
                  <span className="text-[13px] font-semibold text-[var(--sf-soft)]">
                    {formatTeachingScheduleDateRange(nextWeek.startDate, nextWeek.endDate)}
                  </span>
                </>
              ) : (
                <span className="text-[15px] font-extrabold text-[var(--sf-soft)]">
                  {model.weeks.length > 0 ? "No more weeks this year" : "—"}
                </span>
              )}
            </div>
          </div>
        </GCard>

        {model.weeks.length === 0 ? (
          <GCard index={2} kicker="Schedule" title="No teaching weeks yet" data-testid="parent-teaching-schedule-empty">
            <div className="flex flex-col items-start gap-3 rounded-[18px] bg-[var(--sf-paper)] p-5 sm:flex-row sm:items-center">
              <GIcon>
                <CalendarDays />
              </GIcon>
              <p className="m-0 text-[15px] font-semibold text-[var(--sf-soft)]">
                No teaching weeks have been published yet.
              </p>
            </div>
          </GCard>
        ) : (
          <>
            <CoopTeachingScheduleFilterBar
              variant="parent"
              filters={model.filters}
              onChange={model.setFilters}
              theme={theme}
              resultCount={filteredWeeks.length}
              totalCount={model.weeks.length}
            />

            <GCard index={3} kicker="Schedule" title="The year, week by week" data-testid="parent-teaching-schedule-weeks">
              {filteredWeeks.length === 0 ? (
                <div className="flex flex-col items-start gap-3 rounded-[18px] bg-[var(--sf-paper)] p-5 sm:flex-row sm:items-center">
                  <GIcon>
                    <SearchX />
                  </GIcon>
                  <p className="m-0 text-[15px] font-semibold text-[var(--sf-soft)]">
                    No teaching weeks match the current filters.
                  </p>
                </div>
              ) : (
                <>
                  <ul className="m-0 flex list-none flex-col gap-2.5 p-0 md:hidden">
                    {filteredWeeks.map((week) => {
                      const isPast = isTeachingWeekPast(week);
                      const isNext = week.id === summary.nextWeekId;
                      const hasEvent = Boolean(week.celebrationEvent?.trim());
                      return (
                        <li
                          key={week.id}
                          className={`rounded-[16px] border-[1.5px] p-3.5 ${
                            isNext
                              ? "border-[var(--sf-clay)]/40 bg-[var(--sf-accent-wash)]"
                              : isPast
                                ? "border-[var(--sf-ink)]/[0.08] bg-[var(--sf-paper)]"
                                : "border-[var(--sf-ink)]/10 bg-white"
                          }`}
                        >
                          <div className={isPast ? "opacity-80" : undefined}>
                            <WeekLabel week={week} isPast={isPast} isNext={isNext} />
                            <dl className="m-0 mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-[13px]">
                              <dt className="font-extrabold text-[var(--sf-ink)]">Instructor</dt>
                              <dd className="m-0 font-semibold text-[var(--sf-soft)]">
                                {formatTeachingAssignedParents(week.instructorFamilyIds, familyNames)}
                              </dd>
                              <dt className="font-extrabold text-[var(--sf-ink)]">Assistant</dt>
                              <dd className="m-0 font-semibold text-[var(--sf-soft)]">
                                {formatTeachingAssignedParents(week.assistantFamilyIds, familyNames)}
                              </dd>
                              {week.seasonalTheme.trim() ? (
                                <>
                                  <dt className="font-extrabold text-[var(--sf-ink)]">Theme</dt>
                                  <dd className="m-0 font-semibold text-[var(--sf-soft)]">{week.seasonalTheme}</dd>
                                </>
                              ) : null}
                              {week.characterLesson.trim() ? (
                                <>
                                  <dt className="font-extrabold text-[var(--sf-ink)]">Lesson</dt>
                                  <dd className="m-0 font-semibold text-[var(--sf-soft)]">{week.characterLesson}</dd>
                                </>
                              ) : null}
                              {hasEvent ? (
                                <>
                                  <dt className="font-extrabold text-[var(--sf-ink)]">Event</dt>
                                  <dd className="m-0 font-semibold text-[var(--sf-ink)]">{week.celebrationEvent}</dd>
                                </>
                              ) : null}
                            </dl>
                          </div>
                          <div className="mt-3 empty:hidden">{actionsFor(week, "")}</div>
                        </li>
                      );
                    })}
                  </ul>

                  <div className="-mx-5 hidden overflow-x-auto px-5 sm:-mx-6 sm:px-6 md:block">
                    <table className={`${G_TABLE} min-w-[1080px]`}>
                      <thead>
                        <tr>
                          {TABLE_HEADINGS.map((heading) => (
                            <th key={heading} scope="col" className={G_TH}>
                              {heading}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredWeeks.map((week) => {
                          const isPast = isTeachingWeekPast(week);
                          const isNext = week.id === summary.nextWeekId;
                          const hasEvent = Boolean(week.celebrationEvent?.trim());
                          const muted = `${G_TD} text-[13px] font-semibold text-[var(--sf-soft)] ${isPast ? "opacity-75" : ""}`;
                          return (
                            <tr
                              key={week.id}
                              className={`transition-colors ${
                                isNext ? "bg-[var(--sf-accent-wash)]" : "hover:bg-[var(--sf-ink)]/[0.025]"
                              }`}
                            >
                              <th scope="row" className={`${G_TD} min-w-[170px] text-left font-normal`}>
                                <WeekLabel week={week} isPast={isPast} isNext={isNext} />
                              </th>
                              <td className={muted}>{formatTeachingAssignedParents(week.instructorFamilyIds, familyNames)}</td>
                              <td className={muted}>{formatTeachingAssignedParents(week.assistantFamilyIds, familyNames)}</td>
                              <td className={muted}>{week.seasonalTheme}</td>
                              <td className={muted}>{week.characterLesson}</td>
                              <td className={`${muted} ${hasEvent ? "!text-[var(--sf-ink)]" : ""}`}>
                                {hasEvent ? week.celebrationEvent : "—"}
                              </td>
                              <td className={G_TD}>{actionsFor(week)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </GCard>
          </>
        )}
      </div>
    </ParentGardenFrame>
  );
}
