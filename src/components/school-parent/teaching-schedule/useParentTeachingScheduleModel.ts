"use client";

import { useCallback, useMemo, useState } from "react";
import {
  computeTeachingScheduleSummary,
  sortTeachingScheduleWeeks,
  type CoopTeachingScheduleWeek,
  type TeachingScheduleParentRole,
} from "@/lib/admissions/program-coop-teaching-schedule-mock";
import {
  DEFAULT_COOP_TEACHING_SCHEDULE_FILTERS,
  filterCoopTeachingScheduleWeeks,
  type CoopTeachingScheduleFilters,
} from "@/lib/admissions/program-coop-teaching-schedule-filters";
import { reportPortalOperationalError } from "@/lib/portal-operational-errors";
import { parentToast } from "@/lib/school-parent/parent-toast";
import type { ParentTeachingSchedulePendingAction } from "./ParentTeachingScheduleSignupButton";

/**
 * View-model for the parent co-op Teaching schedule: weeks (re-sorted after a
 * sign-up / withdraw), filters, summary and the pending action. Same endpoints
 * and rules as before the Garden migration.
 */
export function useParentTeachingScheduleModel({
  organizationId,
  programId,
  initialWeeks,
  currentFamilyId,
  familyNameMap,
  previewMode,
}: {
  organizationId: string;
  programId: string;
  initialWeeks: CoopTeachingScheduleWeek[];
  currentFamilyId: string;
  familyNameMap: Record<string, string>;
  previewMode: boolean;
}) {
  const familyNames = useMemo(() => new Map(Object.entries(familyNameMap)), [familyNameMap]);
  const [weeks, setWeeks] = useState(() => sortTeachingScheduleWeeks(initialWeeks));
  const [filters, setFilters] = useState<CoopTeachingScheduleFilters>(DEFAULT_COOP_TEACHING_SCHEDULE_FILTERS);
  const [pendingAction, setPendingAction] = useState<ParentTeachingSchedulePendingAction | null>(null);

  const summary = useMemo(() => computeTeachingScheduleSummary(weeks), [weeks]);
  const nextWeek = useMemo(
    () => weeks.find((week) => week.id === summary.nextWeekId) ?? null,
    [summary.nextWeekId, weeks],
  );
  const filteredWeeks = useMemo(
    () => filterCoopTeachingScheduleWeeks(weeks, filters, { variant: "parent", currentFamilyId }),
    [currentFamilyId, filters, weeks],
  );

  const runAction = useCallback(
    async (weekId: string, role: TeachingScheduleParentRole, type: "signup" | "withdraw") => {
      if (previewMode) return;
      const target = weeks.find((week) => week.id === weekId);
      const weekName = target?.weekName.trim() || "this week";

      setPendingAction({ weekId, role, type });
      let response: Response | undefined;
      try {
        response = await fetch(`/api/parent-portal/teaching-schedule/${type === "signup" ? "signup" : "withdraw"}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ organizationId, programId, weekId, role }),
        });
        const payload = (await response.json()) as { week?: CoopTeachingScheduleWeek; error?: string };
        if (!response.ok || !payload.week) {
          throw new Error(payload.error ?? "Unable to update sign-up.");
        }
        const updated = payload.week;
        setWeeks((current) =>
          sortTeachingScheduleWeeks(current.map((week) => (week.id === updated.id ? updated : week))),
        );
        if (type === "signup") {
          parentToast.success(`You're the ${role} for ${weekName}`, {
            description: "Thanks for volunteering! It's on the schedule for everyone.",
          });
        } else {
          parentToast.success(`Withdrawn as ${role} for ${weekName}`, {
            description: "The slot is open again for another parent.",
          });
        }
      } catch (error) {
        parentToast.error(type === "signup" ? "Couldn't sign you up" : "Couldn't withdraw you", {
          description: error instanceof Error ? error.message : "Unable to update sign-up.",
        });
        void reportPortalOperationalError(
          "parent_portal",
          { organizationId, operation: "teaching_schedule.update_signup", error: "" },
          error,
          response?.status,
        );
      } finally {
        setPendingAction(null);
      }
    },
    [organizationId, previewMode, programId, weeks],
  );

  return {
    weeks,
    familyNames,
    filters,
    setFilters,
    filteredWeeks,
    summary,
    nextWeek,
    pendingAction,
    signUp: useCallback(
      (weekId: string, role: TeachingScheduleParentRole) => void runAction(weekId, role, "signup"),
      [runAction],
    ),
    withdraw: useCallback(
      (weekId: string, role: TeachingScheduleParentRole) => void runAction(weekId, role, "withdraw"),
      [runAction],
    ),
  };
}
