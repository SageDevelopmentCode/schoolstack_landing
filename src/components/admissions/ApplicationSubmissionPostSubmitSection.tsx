"use client";

import { CheckCircle2, Circle } from "lucide-react";
import DetailPanelSection from "@/components/school-admin/admissions/DetailPanelSection";
import { formatDateOnlyLabel } from "@/lib/admissions/admissions-availability";
import type { AdminPostSubmitStep } from "@/lib/admissions/admin-post-submit-steps";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";

type ApplicationSubmissionPostSubmitSectionProps = {
  C: AdminThemeTokens;
  steps: AdminPostSubmitStep[];
};

function formatBookingLabel(step: AdminPostSubmitStep): string {
  if (!step.booking) return "";
  const dateLabel = formatDateOnlyLabel(step.booking.scheduledDate);
  return `${dateLabel} at ${step.booking.startTimeSlot}`;
}

export default function ApplicationSubmissionPostSubmitSection({
  C,
  steps,
}: ApplicationSubmissionPostSubmitSectionProps) {
  if (steps.length === 0) return null;

  return (
    <DetailPanelSection C={C} title="Post-application steps">
      <ul
        className="overflow-hidden rounded-lg border"
        style={{ borderColor: C.border, backgroundColor: C.surface }}
      >
        {steps.map((step) => {
          const isScheduled = step.status === "scheduled";

          return (
            <li
              key={step.actionId}
              className="flex items-start gap-3 border-b px-4 py-3 last:border-b-0"
              style={{ borderColor: C.border }}
            >
              {isScheduled ? (
                <CheckCircle2
                  className="mt-0.5 h-4 w-4 shrink-0"
                  style={{ color: C.success }}
                  aria-hidden
                />
              ) : (
                <Circle
                  className="mt-0.5 h-4 w-4 shrink-0"
                  style={{ color: C.textTertiary }}
                  aria-hidden
                />
              )}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium" style={{ color: C.textPrimary }}>
                    {step.title}
                  </p>
                  {!step.required ? (
                    <span
                      className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                      style={{ backgroundColor: C.surface, color: C.textTertiary }}
                    >
                      Optional
                    </span>
                  ) : null}
                </div>
                {isScheduled && step.booking ? (
                  <p className="mt-1 text-xs" style={{ color: C.success }}>
                    Scheduled {formatBookingLabel(step)}
                  </p>
                ) : (
                  <p className="mt-1 text-xs" style={{ color: C.textTertiary }}>
                    Not scheduled
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </DetailPanelSection>
  );
}
