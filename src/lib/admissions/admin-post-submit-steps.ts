import type { ScheduledVisitRecord } from "./admissions-booking";
import type {
  ApplicationFormPostSubmitConfig,
  PostSubmitActionType,
} from "./application-form-schema";
import {
  postSubmitActionLabel,
} from "./post-submit-templates";

export type AdminPostSubmitStep = {
  actionId: string;
  type: PostSubmitActionType;
  title: string;
  required: boolean;
  sortIndex: number;
  status: "pending" | "scheduled";
  booking?: {
    schedulingMode?: "time_slot" | "whole_day";
    scheduledDate: string;
    endDate?: string;
    startTimeSlot: string;
    durationMinutes: number;
    visitDayCount?: number;
  };
};

export type PostSubmitSummaryTone = "complete" | "scheduled" | "pending" | "none";

export type PostSubmitSummary = {
  label: string;
  tone: PostSubmitSummaryTone;
};

export function buildAdminPostSubmitSteps(
  config: ApplicationFormPostSubmitConfig,
  visits: ScheduledVisitRecord[],
  applicationStatus: string,
): AdminPostSubmitStep[] {
  if (applicationStatus === "draft") return [];

  const visitsByActionId = new Map(
    visits.map((visit) => [visit.postSubmitActionId, visit]),
  );

  return config.actions
    .filter((action) => action.enabled)
    .map((action, sortIndex) => {
      const visit = visitsByActionId.get(action.id);

      return {
        actionId: action.id,
        type: action.type,
        title: postSubmitActionLabel(action),
        required: action.required !== false,
        sortIndex,
        status: visit ? "scheduled" : "pending",
        booking: visit
          ? {
              schedulingMode: visit.schedulingMode,
              scheduledDate: visit.scheduledDate,
              endDate: visit.endDate,
              startTimeSlot: visit.startTimeSlot,
              durationMinutes: visit.durationMinutes,
              visitDayCount: visit.visitDayCount,
            }
          : undefined,
      };
    });
}

export function formHasEnabledPostSubmitActions(
  config: ApplicationFormPostSubmitConfig,
): boolean {
  return config.actions.some((action) => action.enabled);
}

export function summarizePostSubmitSteps(
  steps: AdminPostSubmitStep[],
): PostSubmitSummary | null {
  if (steps.length === 0) return null;

  const completed = steps.filter((step) => step.status === "scheduled").length;
  const total = steps.length;
  const label = `${completed}/${total} done`;

  if (completed === total) {
    return { label, tone: "complete" };
  }

  if (completed > 0) {
    return { label, tone: "scheduled" };
  }

  return { label, tone: "pending" };
}

export function postSubmitSummaryBadgeStyle(
  tone: PostSubmitSummaryTone,
  C: {
    successBg: string;
    success: string;
    infoBg: string;
    info: string;
    warningBg: string;
    warning: string;
    elevated: string;
    textSecondary: string;
  },
): { backgroundColor: string; color: string } {
  switch (tone) {
    case "complete":
      return { backgroundColor: C.successBg, color: C.success };
    case "scheduled":
      return { backgroundColor: C.infoBg, color: C.info };
    case "pending":
      return { backgroundColor: C.warningBg, color: C.warning };
    default:
      return { backgroundColor: C.elevated, color: C.textSecondary };
  }
}
