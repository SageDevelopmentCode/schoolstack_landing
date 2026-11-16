"use client";

import { ArrowRight, CalendarCheck } from "lucide-react";
import { Tick } from "@/components/garden/ui";
import { GChip, GIcon, gBtnOutlineSm } from "@/components/school-parent/garden/ui";
import { formatScheduledVisitWhenLabel } from "@/lib/admissions/admissions-availability";
import { getPostSubmitStepPresentation } from "@/lib/admissions/post-submit-step-presentations";
import { POST_SUBMIT_ACTION_TEMPLATES } from "@/lib/admissions/post-submit-templates";
import type { ApplicationPostSubmitTask } from "@/lib/admissions/parent-portal-access";

/*
 * One numbered post-submit step (Garden). Done = Tick + "Scheduled …" in
 * forest; the current step sits on the accent wash. Must render inside
 * <ParentGardenFrame>.
 */

type PostSubmitStepCardProps = {
  task: ApplicationPostSubmitTask;
  applicationId: string;
  stepNumber: number;
  isCurrent?: boolean;
  onSchedule: (applicationId: string, task: ApplicationPostSubmitTask) => void;
};

function formatBookingLabel(task: ApplicationPostSubmitTask): string {
  if (!task.booking) return "";
  return formatScheduledVisitWhenLabel(task.booking);
}

export default function PostSubmitStepCard({
  task,
  applicationId,
  stepNumber,
  isCurrent = false,
  onSchedule,
}: PostSubmitStepCardProps) {
  const isScheduled = task.status === "scheduled";
  const presentation = getPostSubmitStepPresentation(task.type);
  const template = POST_SUBMIT_ACTION_TEMPLATES[task.type];
  const Icon = template.Icon;

  return (
    <li
      aria-current={isCurrent ? "step" : undefined}
      className={`rounded-[16px] border-[1.5px] p-3.5 sm:p-4 ${
        isScheduled
          ? "border-[var(--sf-forest)]/20 bg-[var(--sf-mint)]/45"
          : isCurrent
            ? "border-[var(--sf-clay)]/35 bg-[var(--sf-accent-wash)]"
            : "border-[var(--sf-ink)]/10 bg-white"
      }`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="flex min-w-0 flex-1 gap-3">
          {isScheduled ? (
            <Tick className="h-8 w-8" color="var(--sf-forest)" />
          ) : (
            <span
              aria-hidden="true"
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-[13px] font-extrabold ${
                isCurrent
                  ? "border-[var(--sf-ink)] bg-[var(--sf-clay)] text-white"
                  : "border-[var(--sf-ink)]/20 bg-white text-[var(--sf-ink)]/60"
              }`}
            >
              {stepNumber}
            </span>
          )}
          <div className="min-w-0 flex-1">
            <p className="m-0 text-[11px] font-extrabold uppercase tracking-[0.16em] text-[var(--sf-soft)]">
              <span className="sr-only">Step {stepNumber}: </span>
              {presentation.eyebrow}
            </p>
            <div className="mt-0.5 flex flex-wrap items-center gap-2">
              <h3 className="m-0 text-[15px] font-extrabold leading-snug text-[var(--sf-ink)]">{task.title}</h3>
              {!task.required ? <GChip tone="neutral">Optional</GChip> : null}
              {isScheduled ? <GChip tone="success">✓ Booked</GChip> : null}
            </div>
            {isScheduled && task.booking ? (
              <p className="m-0 mt-1 inline-flex items-center gap-1.5 text-[14px] font-bold text-[var(--sf-forest)]">
                <CalendarCheck className="h-4 w-4 shrink-0" aria-hidden />
                {task.booking.completedManuallyAt
                  ? formatBookingLabel(task)
                  : `Scheduled ${formatBookingLabel(task)}`}
              </p>
            ) : (
              <p className="m-0 mt-1 text-[14px] font-medium leading-relaxed text-[var(--sf-ink)]/70">
                {task.instructions}
              </p>
            )}
          </div>
        </div>

        {!isScheduled ? (
          <div className="flex shrink-0 items-center gap-3 pl-11 sm:pl-0">
            <span className="hidden sm:block">
              <GIcon size="sm">
                <Icon />
              </GIcon>
            </span>
            <button
              type="button"
              onClick={() => onSchedule(applicationId, task)}
              className={`${gBtnOutlineSm} w-full sm:w-auto ${isCurrent ? "!border-[var(--sf-clay)] !text-[var(--sf-clay-deep)]" : ""}`}
            >
              {presentation.ctaLabel}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </button>
          </div>
        ) : null}
      </div>
    </li>
  );
}
