"use client";

import { Check } from "lucide-react";
import { formatScheduledVisitWhenLabel } from "@/lib/admissions/admissions-availability";
import { getPostSubmitStepPresentation } from "@/lib/admissions/post-submit-step-presentations";
import { POST_SUBMIT_ACTION_TEMPLATES } from "@/lib/admissions/post-submit-templates";
import type { ApplicationPostSubmitTask } from "@/lib/admissions/parent-portal-access";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import { getAdminButtonStyle } from "@/lib/organization-settings/admin-button-styles";

type PostSubmitStepCardProps = {
  C: AdminThemeTokens;
  task: ApplicationPostSubmitTask;
  applicationId: string;
  onSchedule: (applicationId: string, task: ApplicationPostSubmitTask) => void;
};

function formatBookingLabel(task: ApplicationPostSubmitTask): string {
  if (!task.booking) return "";
  return formatScheduledVisitWhenLabel(task.booking);
}

export default function PostSubmitStepCard({
  C,
  task,
  applicationId,
  onSchedule,
}: PostSubmitStepCardProps) {
  const isScheduled = task.status === "scheduled";
  const presentation = getPostSubmitStepPresentation(task.type);
  const template = POST_SUBMIT_ACTION_TEMPLATES[task.type];
  const Icon = template.Icon;

  return (
    <li
      className="rounded-md border px-5 py-4"
      style={{ ...presentation.cardBorder(C), backgroundColor: "#FFFFFF" }}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-1 gap-3">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md"
            style={
              isScheduled
                ? {
                    backgroundColor: C.successBg,
                    color: C.success,
                  }
                : presentation.iconRing(C)
            }
          >
            {isScheduled ? (
              <Check className="h-4 w-4" aria-hidden />
            ) : (
              <Icon className="h-4 w-4" aria-hidden />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-semibold" style={{ color: C.accentDark }}>
                {task.title}
              </h3>
              {!task.required ? (
                <span
                  className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                  style={{ backgroundColor: C.surface, color: C.textTertiary }}
                >
                  Optional
                </span>
              ) : null}
            </div>
            {isScheduled && task.booking ? (
              <p className="mt-1 text-sm" style={{ color: C.success }}>
                {task.booking.completedManuallyAt
                  ? formatBookingLabel(task)
                  : `Scheduled ${formatBookingLabel(task)}`}
              </p>
            ) : (
              <p className="mt-1 text-sm leading-relaxed" style={{ color: C.textSecondary }}>
                {task.instructions}
              </p>
            )}
          </div>
        </div>

        {!isScheduled ? (
          <div className="shrink-0 sm:ml-4">
            <button
              type="button"
              onClick={() => onSchedule(applicationId, task)}
              className="inline-flex w-full items-center justify-center rounded-md px-3.5 py-2 text-xs font-medium text-white transition hover:opacity-90 sm:w-auto"
              style={getAdminButtonStyle(C, "primary")}
            >
              {presentation.ctaLabel}
            </button>
          </div>
        ) : null}
      </div>
    </li>
  );
}
