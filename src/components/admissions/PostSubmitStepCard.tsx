"use client";

import { motion } from "framer-motion";
import { Check, CheckCircle2 } from "lucide-react";
import { formatDateOnlyLabel, formatDurationLabel } from "@/lib/admissions/admissions-availability";
import { getPostSubmitStepPresentation } from "@/lib/admissions/post-submit-step-presentations";
import { POST_SUBMIT_ACTION_TEMPLATES } from "@/lib/admissions/post-submit-templates";
import type { ApplicationPostSubmitTask } from "@/lib/admissions/parent-portal-access";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";

type PostSubmitStepCardProps = {
  C: AdminThemeTokens;
  task: ApplicationPostSubmitTask;
  stepNumber: number;
  totalSteps: number;
  isLast: boolean;
  applicationId: string;
  onSchedule: (applicationId: string, task: ApplicationPostSubmitTask) => void;
};

function formatBookingLabel(task: ApplicationPostSubmitTask): string {
  if (!task.booking) return "";
  const dateLabel = formatDateOnlyLabel(task.booking.scheduledDate);
  return `${dateLabel} at ${task.booking.startTimeSlot}`;
}

function CardPattern({
  pattern,
  C,
}: {
  pattern: "none" | "bubbles" | "timeline";
  C: AdminThemeTokens;
}) {
  if (pattern === "none") return null;

  if (pattern === "bubbles") {
    return (
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div
          className="absolute -right-3 -top-3 h-16 w-16 rounded-full opacity-30"
          style={{ backgroundColor: C.accentLight }}
        />
        <div
          className="absolute bottom-4 right-10 h-8 w-8 rounded-full opacity-20"
          style={{ backgroundColor: C.accent }}
        />
        <div
          className="absolute bottom-8 left-[40%] h-5 w-5 rounded-full opacity-15"
          style={{ backgroundColor: C.accentMid }}
        />
      </div>
    );
  }

  return (
    <div className="pointer-events-none absolute inset-y-0 right-4 flex flex-col justify-center gap-1.5" aria-hidden>
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex items-center gap-2">
          <div
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: i === 1 ? C.accent : C.border }}
          />
          <div
            className="h-px w-8"
            style={{ backgroundColor: C.border }}
          />
        </div>
      ))}
    </div>
  );
}

export default function PostSubmitStepCard({
  C,
  task,
  stepNumber,
  isLast,
  applicationId,
  onSchedule,
}: PostSubmitStepCardProps) {
  const isScheduled = task.status === "scheduled";
  const presentation = getPostSubmitStepPresentation(task.type);
  const template = POST_SUBMIT_ACTION_TEMPLATES[task.type];
  const Icon = template.Icon;

  return (
    <motion.li
      className="flex gap-4"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: (stepNumber - 1) * 0.06 }}
    >
      <div className="relative flex w-8 shrink-0 items-center justify-center self-stretch">
        {!isLast ? (
          <div
            className="absolute left-1/2 w-0.5 -translate-x-1/2"
            style={{
              top: "calc(50% + 1rem)",
              bottom: "-1rem",
              backgroundColor: isScheduled ? C.successBorder : C.border,
            }}
            aria-hidden
          />
        ) : null}
        <div
          className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold"
          style={
            isScheduled
              ? {
                  backgroundColor: C.successBg,
                  border: `2px solid ${C.successBorder}`,
                  color: C.success,
                }
              : {
                  backgroundColor: C.surface,
                  border: `2px solid ${C.accent}`,
                  color: C.accent,
                }
          }
        >
          {isScheduled ? (
            <Check className="h-4 w-4" aria-hidden />
          ) : (
            <span>{stepNumber}</span>
          )}
        </div>
      </div>

      <article
        className="relative mb-4 min-w-0 flex-1 overflow-hidden rounded-xl border"
        style={{
          backgroundColor: "#FFFFFF",
          ...presentation.cardBorder(C),
        }}
      >
        <CardPattern pattern={presentation.cardPattern} C={C} />

        <div className="relative px-4 py-3" style={presentation.headerBand(C)}>
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
              style={presentation.iconRing(C)}
            >
              <Icon className="h-5 w-5" aria-hidden />
            </div>
            <div className="min-w-0">
              <p
                className="text-[11px] font-semibold uppercase tracking-wide"
                style={{ color: presentation.accentText(C) }}
              >
                {presentation.eyebrow}
              </p>
              <div className="mt-0.5 flex flex-wrap items-center gap-2">
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
            </div>
          </div>
        </div>

        <div className="relative px-4 py-3">
          {isScheduled && task.booking ? (
            <div
              className="flex items-start gap-2 rounded-lg px-3 py-2"
              style={{
                backgroundColor: C.successBg,
                border: `1px solid ${C.successBorder}`,
              }}
            >
              <CheckCircle2
                className="mt-0.5 h-4 w-4 shrink-0"
                style={{ color: C.success }}
                aria-hidden
              />
              <p className="text-sm" style={{ color: C.success }}>
                Scheduled {formatBookingLabel(task)}
              </p>
            </div>
          ) : (
            <>
              <p className="text-sm leading-relaxed" style={{ color: C.textSecondary }}>
                {task.instructions}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <span
                  className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium"
                  style={{
                    backgroundColor: C.elevated,
                    color: C.textSecondary,
                    border: `1px solid ${C.border}`,
                  }}
                >
                  {formatDurationLabel(task.durationMinutes)}
                </span>
                <button
                  type="button"
                  onClick={() => onSchedule(applicationId, task)}
                  className="inline-flex items-center justify-center rounded-md px-3.5 py-2 text-xs font-medium text-white transition hover:opacity-90"
                  style={{ backgroundColor: C.accent }}
                >
                  {presentation.ctaLabel}
                </button>
              </div>
            </>
          )}
        </div>
      </article>
    </motion.li>
  );
}
