"use client";

import { useCallback, useMemo, useState } from "react";
import { CalendarDays } from "lucide-react";
import CoopTeachingScheduleFilterBar from "@/components/admissions/CoopTeachingScheduleFilterBar";
import ParentTeachingScheduleVolunteerActions from "@/components/school-parent/teaching-schedule/ParentTeachingScheduleVolunteerActions";
import {
  type ParentTeachingSchedulePendingAction,
} from "@/components/school-parent/teaching-schedule/ParentTeachingScheduleSignupButton";
import {
  computeTeachingScheduleSummary,
  formatTeachingAssignedParents,
  formatTeachingScheduleDateRange,
  isTeachingWeekPast,
  sortTeachingScheduleWeeks,
  teachingScheduleParentRowStyle,
  teachingScheduleRowSurfaceStyle,
  type CoopTeachingScheduleWeek,
  type TeachingScheduleParentRole,
} from "@/lib/admissions/program-coop-teaching-schedule-mock";
import {
  DEFAULT_COOP_TEACHING_SCHEDULE_FILTERS,
  filterCoopTeachingScheduleWeeks,
  type CoopTeachingScheduleFilters,
} from "@/lib/admissions/program-coop-teaching-schedule-filters";
import { useParentTheme } from "@/components/school-parent/ParentThemeContext";
import ParentCard from "@/components/school-parent/ui/ParentCard";
import ParentChip from "@/components/school-parent/ui/ParentChip";
import ParentDisplayHeading from "@/components/school-parent/ui/ParentDisplayHeading";
import ParentSectionKicker from "@/components/school-parent/ui/ParentSectionKicker";

type ParentTeachingSchedulePageProps = {
  organizationId: string;
  programId: string;
  initialWeeks: CoopTeachingScheduleWeek[];
  currentFamilyId: string;
  currentFamilyLabel: string;
  familyNameMap: Record<string, string>;
  previewMode?: boolean;
};

export default function ParentTeachingSchedulePage({
  organizationId,
  programId,
  initialWeeks,
  currentFamilyId,
  currentFamilyLabel,
  familyNameMap,
  previewMode = false,
}: ParentTeachingSchedulePageProps) {
  const { theme } = useParentTheme();
  const familyNames = useMemo(
    () => new Map(Object.entries(familyNameMap)),
    [familyNameMap],
  );
  const [weeks, setWeeks] = useState(() => sortTeachingScheduleWeeks(initialWeeks));
  const [filters, setFilters] = useState<CoopTeachingScheduleFilters>(
    DEFAULT_COOP_TEACHING_SCHEDULE_FILTERS,
  );
  const [hoveredWeekId, setHoveredWeekId] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<ParentTeachingSchedulePendingAction | null>(
    null,
  );
  const [actionError, setActionError] = useState<string | null>(null);

  const summary = useMemo(() => computeTeachingScheduleSummary(weeks), [weeks]);

  const filteredWeeks = useMemo(
    () =>
      filterCoopTeachingScheduleWeeks(weeks, filters, {
        variant: "parent",
        currentFamilyId,
      }),
    [currentFamilyId, filters, weeks],
  );

  const updateWeek = useCallback((updated: CoopTeachingScheduleWeek) => {
    setWeeks((current) =>
      sortTeachingScheduleWeeks(
        current.map((week) => (week.id === updated.id ? updated : week)),
      ),
    );
  }, []);

  const runAction = useCallback(
    async (weekId: string, role: TeachingScheduleParentRole, type: "signup" | "withdraw") => {
      if (previewMode) return;

      setPendingAction({ weekId, role, type });
      setActionError(null);

      try {
        const response = await fetch(
          `/api/parent-portal/teaching-schedule/${type === "signup" ? "signup" : "withdraw"}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              organizationId,
              programId,
              weekId,
              role,
            }),
          },
        );

        const payload = (await response.json()) as {
          week?: CoopTeachingScheduleWeek;
          error?: string;
        };

        if (!response.ok || !payload.week) {
          throw new Error(payload.error ?? "Unable to update sign-up.");
        }

        updateWeek(payload.week);
      } catch (error) {
        setActionError(
          error instanceof Error ? error.message : "Unable to update sign-up.",
        );
      } finally {
        setPendingAction(null);
      }
    },
    [organizationId, previewMode, programId, updateWeek],
  );

  return (
    <div className="mx-auto w-full max-w-[1250px] px-4 py-6 sm:py-8 md:px-9">
      <div className="mb-5">
        <ParentSectionKicker theme={theme}>Co-op</ParentSectionKicker>
        <div className="mt-1 flex items-center gap-2.5">
          <CalendarDays
            className="h-7 w-7 shrink-0"
            style={{ color: theme.primary }}
            aria-hidden
          />
          <ParentDisplayHeading theme={theme} size="display">
            Teaching schedule
          </ParentDisplayHeading>
        </div>
        <p className="mt-2 max-w-2xl text-sm" style={{ color: theme.muted }}>
          View the full year teaching schedule and sign up to volunteer when instructor or
          assistant slots are open.
        </p>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
        <ParentCard theme={theme} className="p-3 sm:p-4">
          <div
            className="text-[10px] font-extrabold uppercase tracking-[0.08em] sm:text-[11px]"
            style={{ color: theme.muted }}
          >
            Weeks
          </div>
          <div className="mt-1 text-xl font-semibold sm:text-2xl" style={{ color: theme.ink }}>
            {summary.weekCount}
          </div>
        </ParentCard>
        <ParentCard theme={theme} className="p-3 sm:p-4">
          <div
            className="text-[10px] font-extrabold uppercase tracking-[0.08em] sm:text-[11px]"
            style={{ color: theme.muted }}
          >
            Events
          </div>
          <div className="mt-1 text-xl font-semibold sm:text-2xl" style={{ color: theme.ink }}>
            {summary.eventCount}
          </div>
        </ParentCard>
        <ParentCard theme={theme} className="p-3 sm:p-4">
          <div
            className="text-[10px] font-extrabold uppercase tracking-[0.08em] sm:text-[11px]"
            style={{ color: theme.muted }}
          >
            Completed
          </div>
          <div className="mt-1 text-xl font-semibold sm:text-2xl" style={{ color: theme.ink }}>
            {summary.completedCount}
          </div>
        </ParentCard>
        <ParentCard theme={theme} className="p-3 sm:p-4">
          <div
            className="text-[10px] font-extrabold uppercase tracking-[0.08em] sm:text-[11px]"
            style={{ color: theme.muted }}
          >
            Next up
          </div>
          <div className="mt-1 text-xs font-semibold sm:text-sm" style={{ color: theme.ink }}>
            {summary.nextWeekName}
          </div>
        </ParentCard>
      </div>

      {actionError ? (
        <div
          className="mb-4 rounded-md border px-3 py-2 text-sm"
          style={{
            borderColor: theme.alert,
            backgroundColor: theme.alertBg,
            color: theme.alert,
          }}
        >
          {actionError}
        </div>
      ) : null}

      {weeks.length === 0 ? (
        <p className="py-8 text-sm" style={{ color: theme.muted }}>
          No teaching weeks have been published yet.
        </p>
      ) : (
        <>
          <CoopTeachingScheduleFilterBar
            variant="parent"
            filters={filters}
            onChange={setFilters}
            theme={theme}
            resultCount={filteredWeeks.length}
            totalCount={weeks.length}
          />

          {filteredWeeks.length === 0 ? (
            <p className="py-8 text-sm" style={{ color: theme.muted }}>
              No teaching weeks match the current filters.
            </p>
          ) : (
            <>
              <div className="space-y-2 md:hidden">
                {filteredWeeks.map((week) => {
                  const isPast = isTeachingWeekPast(week);
                  const surfaceStyle = teachingScheduleRowSurfaceStyle({
                    variant: "parent",
                    parentTheme: theme,
                    isPast,
                  });

                  return (
                    <ParentCard
                      key={week.id}
                      theme={theme}
                      className="p-3.5"
                      style={surfaceStyle}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <ParentChip theme={theme} tone="info">
                            {week.weekName.trim() || "Teaching week"}
                          </ParentChip>
                          <div className="mt-1 text-xs font-semibold" style={{ color: theme.ink }}>
                            {formatTeachingScheduleDateRange(week.startDate, week.endDate)}
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 space-y-2 text-xs" style={{ color: theme.muted }}>
                        <div>
                          <span className="font-semibold" style={{ color: theme.ink }}>
                            Instructor:
                          </span>{" "}
                          {formatTeachingAssignedParents(week.instructorFamilyIds, familyNames)}
                        </div>
                        <div>
                          <span className="font-semibold" style={{ color: theme.ink }}>
                            Assistant:
                          </span>{" "}
                          {formatTeachingAssignedParents(week.assistantFamilyIds, familyNames)}
                        </div>
                        <div>{week.seasonalTheme}</div>
                        <div>{week.characterLesson}</div>
                        {week.celebrationEvent?.trim() ? (
                          <div style={{ color: theme.ink }}>{week.celebrationEvent}</div>
                        ) : null}
                      </div>
                      <div className="mt-3">
                        <ParentTeachingScheduleVolunteerActions
                          theme={theme}
                          week={week}
                          currentFamilyId={currentFamilyId}
                          previewMode={previewMode}
                          pendingAction={pendingAction}
                          onSignUp={(role) => void runAction(week.id, role, "signup")}
                          onWithdraw={(role) => void runAction(week.id, role, "withdraw")}
                          emptyFallback=""
                        />
                      </div>
                    </ParentCard>
                  );
                })}
              </div>

              <div className="hidden overflow-x-auto md:block">
                <table className="min-w-[1080px] w-full border-collapse text-left">
                  <thead style={{ backgroundColor: "#FBFCFB" }}>
                    <tr>
                      {[
                        "Week",
                        "Parent instructor",
                        "Parent assistant",
                        "Seasonal theme",
                        "Character lesson",
                        "Celebration / event",
                        "Volunteer",
                      ].map((heading) => (
                        <th
                          key={heading}
                          className="px-[15px] py-2.5 text-left text-[10px] font-extrabold uppercase tracking-[0.08em]"
                          style={{ color: "#8B9699" }}
                        >
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredWeeks.map((week) => {
                      const isPast = isTeachingWeekPast(week);
                      const isHovered = week.id === hoveredWeekId;
                      const rowStyle = teachingScheduleParentRowStyle(theme, {
                        isPast,
                        isHovered,
                      });
                      const textOpacity = isPast ? 0.82 : 1;
                      const hasEvent = Boolean(week.celebrationEvent?.trim());

                      return (
                        <tr
                          key={week.id}
                          onMouseEnter={() => setHoveredWeekId(week.id)}
                          onMouseLeave={() => setHoveredWeekId(null)}
                          className="transition-colors"
                          style={{
                            ...rowStyle,
                            borderTop: `1px solid ${theme.line}`,
                          }}
                        >
                          <td className="min-w-[160px] px-[15px] py-3" style={{ opacity: textOpacity }}>
                            <ParentChip theme={theme} tone="info">
                              {week.weekName.trim() || "Teaching week"}
                            </ParentChip>
                            <div
                              className="mt-1 text-xs font-semibold"
                              style={{ color: isPast ? theme.muted : theme.ink }}
                            >
                              {formatTeachingScheduleDateRange(week.startDate, week.endDate)}
                            </div>
                          </td>
                          <td className="px-[15px] py-3 text-xs" style={{ color: theme.muted, opacity: textOpacity }}>
                            {formatTeachingAssignedParents(week.instructorFamilyIds, familyNames)}
                          </td>
                          <td className="px-[15px] py-3 text-xs" style={{ color: theme.muted, opacity: textOpacity }}>
                            {formatTeachingAssignedParents(week.assistantFamilyIds, familyNames)}
                          </td>
                          <td className="px-[15px] py-3 text-xs" style={{ color: theme.muted, opacity: textOpacity }}>
                            {week.seasonalTheme}
                          </td>
                          <td className="px-[15px] py-3 text-xs" style={{ color: theme.muted, opacity: textOpacity }}>
                            {week.characterLesson}
                          </td>
                          <td className="px-[15px] py-3 text-xs" style={{ color: theme.muted, opacity: textOpacity }}>
                            {hasEvent ? week.celebrationEvent : "—"}
                          </td>
                          <td className="px-[15px] py-3">
                            <ParentTeachingScheduleVolunteerActions
                              theme={theme}
                              week={week}
                              currentFamilyId={currentFamilyId}
                              previewMode={previewMode}
                              pendingAction={pendingAction}
                              onSignUp={(role) => void runAction(week.id, role, "signup")}
                              onWithdraw={(role) => void runAction(week.id, role, "withdraw")}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
