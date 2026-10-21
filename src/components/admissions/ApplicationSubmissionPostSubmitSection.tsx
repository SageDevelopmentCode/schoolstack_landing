"use client";

import { useMemo, useState } from "react";
import ConfirmDialog from "@/components/school-admin/ConfirmDialog";
import PostSubmitStepCompleteDialog from "@/components/school-admin/admissions/PostSubmitStepCompleteDialog";
import PostSubmitStepDocumentationDialog from "@/components/school-admin/admissions/PostSubmitStepDocumentationDialog";
import DetailPanelSection from "@/components/school-admin/admissions/DetailPanelSection";
import DetailPanelStepTimeline, {
  type DetailPanelStepTimelineItem,
} from "@/components/school-admin/admissions/DetailPanelStepTimeline";
import { formatScheduledVisitWhenLabel } from "@/lib/admissions/admissions-availability";
import {
  SUBMISSION_POST_APPLICATION_STEPS_ANCHOR_ID,
  type AdminPostSubmitStep,
} from "@/lib/admissions/admin-post-submit-steps";
import { postSubmitStepDocumentationSummary } from "@/lib/admissions/post-submit-step-documentation";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import { getAdminButtonStyle } from "@/lib/organization-settings/admin-button-styles";
import { adminToast, formatActionError } from "@/lib/school-admin/admin-toast";
import { reportPortalOperationalError } from "@/lib/portal-operational-errors";

type ApplicationSubmissionPostSubmitSectionProps = {
  C: AdminThemeTokens;
  organizationId: string;
  applicationId: string;
  steps: AdminPostSubmitStep[];
  onStepUpdated?: () => void;
};

type PendingAction =
  | { type: "complete"; step: AdminPostSubmitStep }
  | { type: "undo"; step: AdminPostSubmitStep };

function formatBookingLabel(step: AdminPostSubmitStep): string {
  if (!step.booking) return "";
  const docSummary = postSubmitStepDocumentationSummary(step);
  if (step.booking.completedManuallyAt) {
    const base = formatScheduledVisitWhenLabel(step.booking);
    return docSummary ? `${base} · ${docSummary}` : base;
  }
  const scheduled = `Scheduled ${formatScheduledVisitWhenLabel(step.booking)}`;
  return docSummary ? `${scheduled} · ${docSummary}` : scheduled;
}

export default function ApplicationSubmissionPostSubmitSection({
  C,
  organizationId,
  applicationId,
  steps,
  onStepUpdated,
}: ApplicationSubmissionPostSubmitSectionProps) {
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [documentationStep, setDocumentationStep] = useState<AdminPostSubmitStep | null>(
    null,
  );
  const [submitting, setSubmitting] = useState(false);

  async function handleMarkComplete(input: { notes: string; pendingFiles: File[] }) {
    if (!pendingAction || pendingAction.type !== "complete") return;

    setSubmitting(true);
    let responseStatus: number | undefined;
    try {
      const formData = new FormData();
      formData.set("actionId", pendingAction.step.actionId);
      if (input.notes) {
        formData.set("notes", input.notes);
      }
      for (const file of input.pendingFiles) {
        formData.append("attachments", file);
      }

      const response = await fetch(
        `/api/admissions/applications/${applicationId}/post-submit/complete`,
        {
          method: "POST",
          body: formData,
        },
      );
      responseStatus = response.status;

      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(body.error ?? "Failed to update post-application step.");
      }

      adminToast.success("Post-application step marked complete");
      setPendingAction(null);
      onStepUpdated?.();
    } catch (error) {
      if (responseStatus === undefined || responseStatus < 500) {
        void reportPortalOperationalError(
          "school_admin",
          {
            organizationId,
            operation: "admissions.post_submit.update",
            error: "",
            entityType: "application",
            entityId: applicationId,
          },
          error,
          responseStatus,
        );
      }
      adminToast.error(formatActionError(error, "Failed to update post-application step."));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleUndoConfirm() {
    if (!pendingAction || pendingAction.type !== "undo") return;

    setSubmitting(true);
    let responseStatus: number | undefined;
    try {
      const response = await fetch(
        `/api/admissions/applications/${applicationId}/post-submit/complete`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ actionId: pendingAction.step.actionId }),
        },
      );
      responseStatus = response.status;

      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(body.error ?? "Failed to update post-application step.");
      }

      adminToast.success("Manual completion undone");
      setPendingAction(null);
      onStepUpdated?.();
    } catch (error) {
      if (responseStatus === undefined || responseStatus < 500) {
        void reportPortalOperationalError(
          "school_admin",
          {
            organizationId,
            operation: "admissions.post_submit.update",
            error: "",
            entityType: "application",
            entityId: applicationId,
          },
          error,
          responseStatus,
        );
      }
      adminToast.error(formatActionError(error, "Failed to update post-application step."));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSaveDocumentation(input: {
    notes: string;
    pendingFiles: File[];
    removedFileIds: string[];
  }) {
    if (!documentationStep) return;

    setSubmitting(true);
    let responseStatus: number | undefined;
    const actionId = documentationStep.actionId;

    try {
      for (const fileId of input.removedFileIds) {
        const deleteResponse = await fetch(
          `/api/admissions/applications/${applicationId}/post-submit/steps/${encodeURIComponent(actionId)}/files/${encodeURIComponent(fileId)}`,
          { method: "DELETE" },
        );
        responseStatus = deleteResponse.status;
        const deleteBody = await deleteResponse.json().catch(() => ({}));
        if (!deleteResponse.ok) {
          throw new Error(deleteBody.error ?? "Failed to remove file.");
        }
      }

      const formData = new FormData();
      formData.set("notes", input.notes);
      for (const file of input.pendingFiles) {
        formData.append("attachments", file);
      }

      const response = await fetch(
        `/api/admissions/applications/${applicationId}/post-submit/steps/${encodeURIComponent(actionId)}/documentation`,
        {
          method: "PATCH",
          body: formData,
        },
      );
      responseStatus = response.status;

      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(body.error ?? "Failed to save documentation.");
      }

      adminToast.success("Step documentation saved");
      setDocumentationStep(null);
      onStepUpdated?.();
    } catch (error) {
      if (responseStatus === undefined || responseStatus < 500) {
        void reportPortalOperationalError(
          "school_admin",
          {
            organizationId,
            operation: "admissions.post_submit.documentation",
            error: "",
            entityType: "application",
            entityId: applicationId,
          },
          error,
          responseStatus,
        );
      }
      adminToast.error(formatActionError(error, "Failed to save documentation."));
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
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setDocumentationStep(step)}
                className="text-[11px] font-medium underline-offset-2 hover:underline"
                style={{ color: C.textSecondary }}
              >
                Notes & files
              </button>
              {isManual ? (
                <button
                  type="button"
                  onClick={() => setPendingAction({ type: "undo", step })}
                  className="text-[11px] font-medium underline-offset-2 hover:underline"
                  style={{ color: C.textSecondary }}
                >
                  Undo
                </button>
              ) : null}
            </div>
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

  const confirmTitle = "Undo manual completion?";
  const confirmDescription = pendingAction?.type === "undo"
    ? `Revert "${pendingAction.step.title}" to not started? The family will be able to schedule this step again in the portal.`
    : "";

  return (
    <>
      <DetailPanelSection
        C={C}
        id={SUBMISSION_POST_APPLICATION_STEPS_ANCHOR_ID}
        title="Post-application steps"
      >
        <DetailPanelStepTimeline
          C={C}
          items={timelineItems}
          showStatusText={showStatusText}
        />
      </DetailPanelSection>

      <PostSubmitStepCompleteDialog
        C={C}
        open={pendingAction?.type === "complete"}
        step={pendingAction?.type === "complete" ? pendingAction.step : null}
        loading={submitting}
        onConfirm={(input) => void handleMarkComplete(input)}
        onClose={() => {
          if (!submitting) setPendingAction(null);
        }}
      />

      <ConfirmDialog
        C={C}
        open={pendingAction?.type === "undo"}
        title={confirmTitle}
        description={confirmDescription}
        confirmLabel="Undo"
        variant="destructive"
        loading={submitting}
        onConfirm={() => void handleUndoConfirm()}
        onClose={() => {
          if (!submitting) setPendingAction(null);
        }}
      />

      <PostSubmitStepDocumentationDialog
        C={C}
        organizationId={organizationId}
        applicationId={applicationId}
        open={documentationStep !== null}
        step={documentationStep}
        loading={submitting}
        onSave={(input) => void handleSaveDocumentation(input)}
        onClose={() => {
          if (!submitting) setDocumentationStep(null);
        }}
      />
    </>
  );
}
