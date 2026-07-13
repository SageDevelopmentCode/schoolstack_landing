"use client";

import { useMemo } from "react";
import DetailPanelSection from "@/components/school-admin/admissions/DetailPanelSection";
import DetailPanelStepTimeline, {
  type DetailPanelStepTimelineItem,
} from "@/components/school-admin/admissions/DetailPanelStepTimeline";
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
  return `Scheduled ${dateLabel} at ${step.booking.startTimeSlot}`;
}

export default function ApplicationSubmissionPostSubmitSection({
  C,
  steps,
}: ApplicationSubmissionPostSubmitSectionProps) {
  const timelineItems: DetailPanelStepTimelineItem[] = useMemo(
    () =>
      steps.map((step) => {
        const isScheduled = step.status === "scheduled";

        return {
          id: step.actionId,
          title: step.title,
          status: isScheduled ? "completed" : "not_started",
          kindLabel: "Post-application",
          optional: !step.required,
          meta: isScheduled && step.booking ? formatBookingLabel(step) : "Not scheduled",
        };
      }),
    [steps],
  );

  const showStatusText = timelineItems.some((item) => item.status !== "completed");

  if (steps.length === 0) return null;

  return (
    <DetailPanelSection C={C} title="Post-application steps">
      <DetailPanelStepTimeline
        C={C}
        items={timelineItems}
        showStatusText={showStatusText}
      />
    </DetailPanelSection>
  );
}
