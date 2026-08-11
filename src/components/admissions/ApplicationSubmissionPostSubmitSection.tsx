"use client";

import { useMemo, useState } from "react";
import ConfirmDialog from "@/components/school-admin/ConfirmDialog";
import DetailPanelSection from "@/components/school-admin/admissions/DetailPanelSection";
import DetailPanelStepTimeline, {
  type DetailPanelStepTimelineItem,
} from "@/components/school-admin/admissions/DetailPanelStepTimeline";
import { formatScheduledVisitWhenLabel } from "@/lib/admissions/admissions-availability";
import type { AdminPostSubmitStep } from "@/lib/admissions/admin-post-submit-steps";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import { getAdminButtonStyle } from "@/lib/organization-settings/admin-button-styles";
import { SITE_NAME } from "@/lib/site";
import { adminToast, formatActionError } from "@/lib/school-admin/admin-toast";

type ApplicationSubmissionPostSubmitSectionProps = {
  C: AdminThemeTokens;
  applicationId: string;
  steps: AdminPostSubmitStep[];
  onStepUpdated?: () => void;
};

type PendingAction =
  | { type: "complete"; step: AdminPostSubmitStep }
  | { type: "undo"; step: AdminPostSubmitStep };

function formatBookingLabel(step: AdminPostSubmitStep): string {
  if (!step.booking) return "";
  if (step.booking.completedManuallyAt) {
    return formatScheduledVisitWhenLabel(step.booking);
  }
  return `Scheduled ${formatScheduledVisitWhenLabel(step.booking)}`;
}

export default function ApplicationSubmissionPostSubmitSection({
  C,
  applicationId,
  steps,
  onStepUpdated,
}: ApplicationSubmissionPostSubmitSectionProps) {
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleConfirm() {
    if (!pendingAction) return;

    setSubmitting(true);
    try {
      const response = await fetch(
        `/api/admissions/applications/${applicationId}/post-submit/complete`,
        {
          method: pendingAction.type === "complete" ? "POST" : "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ actionId: pendingAction.step.actionId }),
        },
      );

      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(body.error ?? "Failed to update post-application step.");
      }

      adminToast.success(
        pendingAction.type === "complete"
          ? "Post-application step marked complete"
          : "Manual completion undone",
      );
      setPendingAction(null);
      onStepUpdated?.();
    } catch (error) {
      adminToast.error(formatActionError(error, "Failed to update post-application step."));
    } finally {
      setSubmitting(false);
    }
  }

  const timelineItems: DetailPanelStepTimelineItem[] = useMemo(
    () =>
      steps.map((step) => {
        const isScheduled = step.status === "scheduled";
        const isManual = Boolean(step.booking?.completedManuallyAt);

        return {
          id: step.actionId,
          title: step.title,
          status: isScheduled ? "completed" : "not_started",
          kindLabel: "Post-application",
          optional: !step.required,
          meta: isScheduled
            ? formatBookingLabel(step)
            : "Not scheduled",
          trailingAction: isScheduled ? (
            isManual ? (
              <button
                type="button"
                onClick={() => setPendingAction({ type: "undo", step })}
                className="text-[11px] font-medium underline-offset-2 hover:underline"
                style={{ color: C.textSecondary }}
              >
                Undo
              </button>
            ) : null
          ) : (
            <button
              type="button"
              onClick={() => setPendingAction({ type: "complete", step })}
              className="inline-flex items-center rounded-md px-2.5 py-1 text-[11px] font-medium"
              style={getAdminButtonStyle(C, "secondary")}
            >
              Mark complete
            </button>
          ),
        };
      }),
    [C, steps],
  );

  const showStatusText = timelineItems.some((item) => item.status !== "completed");

  if (steps.length === 0) return null;

  const confirmTitle =
    pendingAction?.type === "complete"
      ? "Mark step complete?"
      : "Undo manual completion?";

  const confirmDescription =
    pendingAction?.type === "complete"
      ? `Mark "${pendingAction.step.title}" as complete? Use this when the family completed this step outside ${SITE_NAME}.`
      : `Revert "${pendingAction?.step.title}" to not started? The family will be able to schedule this step again in the portal.`;

  return (
    <>
      <DetailPanelSection C={C} title="Post-application steps">
        <DetailPanelStepTimeline
          C={C}
          items={timelineItems}
          showStatusText={showStatusText}
        />
      </DetailPanelSection>

      <ConfirmDialog
        C={C}
        open={pendingAction !== null}
        title={confirmTitle}
        description={confirmDescription}
        confirmLabel={pendingAction?.type === "complete" ? "Mark complete" : "Undo"}
        variant={pendingAction?.type === "undo" ? "destructive" : "default"}
        loading={submitting}
        onConfirm={() => void handleConfirm()}
        onClose={() => {
          if (!submitting) setPendingAction(null);
        }}
      />
    </>
  );
}
