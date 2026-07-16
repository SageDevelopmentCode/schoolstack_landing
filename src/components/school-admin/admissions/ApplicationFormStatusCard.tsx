"use client";

import { useMemo, useRef, useState } from "react";
import { FileText } from "lucide-react";
import ApplicationReadOnlyView from "@/components/admissions/ApplicationReadOnlyView";
import ApplicationAnswersModal from "@/components/school-admin/admissions/ApplicationAnswersModal";
import ApplicationPdfDownloadButton from "@/components/school-admin/admissions/ApplicationPdfDownloadButton";
import ApplicationFormStepDetailModal from "@/components/school-admin/admissions/ApplicationFormStepDetailModal";
import DetailPanelProgressBar from "@/components/school-admin/admissions/DetailPanelProgressBar";
import DetailPanelSection from "@/components/school-admin/admissions/DetailPanelSection";
import DetailPanelStepTimeline, {
  type DetailPanelStepTimelineItem,
} from "@/components/school-admin/admissions/DetailPanelStepTimeline";
import { formatShortDate } from "@/lib/admissions/application-submissions";
import {
  applicationStatusBadgeStyle,
  applicationStatusLabel,
  FEE_STATUS_LABELS,
} from "@/lib/admissions/application-status-ui";
import {
  buildApplicationFormSteps,
  computeApplicationFormStepStatuses,
  summarizeApplicationFormProgress,
  type ApplicationFormStep,
} from "@/lib/admissions/application-form-steps";
import type { ApplicationDetail } from "@/lib/admissions/parent-portal-access";
import { getAdminButtonStyle } from "@/lib/organization-settings/admin-button-styles";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import type { OrganizationBranding } from "@/lib/organization-settings/types";

type ApplicationFormStatusCardProps = {
  C: AdminThemeTokens;
  branding: OrganizationBranding;
  schoolName: string;
  schoolSlug: string;
  detail: ApplicationDetail;
  feeStatus: string;
  applicationStatus: string;
  formTitle: string;
  submittedAt: string | null;
  feeEnabled: boolean;
  downloadLabel?: string;
};

function stepKindLabel(kind: ApplicationFormStep["kind"]): string {
  switch (kind) {
    case "section":
      return "Form";
    case "acknowledgments":
      return "Acknowledgments";
    case "fee":
      return "Fee";
  }
}

function buildProgressSubtitle(
  applicationStatus: string,
  submittedAt: string | null,
  feeEnabled: boolean,
  feeStatus: string,
): string | null {
  const parts: string[] = [];

  if (applicationStatus !== "draft" && submittedAt) {
    parts.push(`Submitted ${formatShortDate(submittedAt)}`);
  }

  if (feeEnabled && feeStatus !== "not_required") {
    const feeLabel = FEE_STATUS_LABELS[feeStatus] ?? feeStatus.replace(/_/g, " ");
    parts.push(`Fee ${feeLabel.toLowerCase()}`);
  }

  return parts.length > 0 ? parts.join(" · ") : null;
}

export default function ApplicationFormStatusCard({
  C,
  branding,
  schoolName,
  schoolSlug,
  detail,
  feeStatus,
  applicationStatus,
  formTitle,
  submittedAt,
  feeEnabled,
  downloadLabel,
}: ApplicationFormStatusCardProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const [selectedStepId, setSelectedStepId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [answersOpen, setAnswersOpen] = useState(false);
  const resolvedDownloadLabel = downloadLabel ?? formTitle;

  const stepsWithStatus = useMemo(() => {
    const steps = buildApplicationFormSteps(detail.schema, detail.feeConfig);
    return computeApplicationFormStepStatuses(steps, {
      applicationStatus,
      stepIndex: detail.stepIndex,
      feeStatus,
    });
  }, [applicationStatus, detail.feeConfig, detail.schema, detail.stepIndex, feeStatus]);

  const progress = useMemo(
    () => summarizeApplicationFormProgress(stepsWithStatus),
    [stepsWithStatus],
  );

  const selectedStep = stepsWithStatus.find((step) => step.id === selectedStepId) ?? null;
  const statusStyle = applicationStatusBadgeStyle(applicationStatus, C);
  const progressSubtitle = buildProgressSubtitle(
    applicationStatus,
    submittedAt,
    feeEnabled,
    feeStatus,
  );

  const showStatusText =
    applicationStatus === "draft" || progress.completed < progress.total;

  const openStepDetail = (stepId: string) => {
    setSelectedStepId(stepId);
    setDetailOpen(true);
  };

  const closeStepDetail = () => {
    setDetailOpen(false);
    setSelectedStepId(null);
  };

  const timelineItems: DetailPanelStepTimelineItem[] = useMemo(
    () =>
      stepsWithStatus.map((step) => ({
        id: step.id,
        title: step.label,
        status: step.status,
        kindLabel: stepKindLabel(step.kind),
        onClick: () => openStepDetail(step.id),
      })),
    [stepsWithStatus],
  );

  if (stepsWithStatus.length === 0) return null;

  return (
    <>
      <DetailPanelSection
        C={C}
        title="Application form"
        badge={
          <span
            className="rounded-full px-2 py-0.5 text-[11px] font-medium"
            style={statusStyle}
          >
            {applicationStatusLabel(applicationStatus)}
          </span>
        }
      >
        <p
          className="-mt-1 mb-3 text-[10px] font-semibold uppercase tracking-wider"
          style={{ color: C.textQuaternary }}
        >
          {formTitle}
        </p>

        <DetailPanelProgressBar
          C={C}
          completed={progress.completed}
          total={progress.total}
          label="Steps"
          subtitle={progressSubtitle}
        />

        <div className="mb-3 flex flex-wrap items-start gap-2">
          <button
            type="button"
            onClick={() => setAnswersOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition hover:opacity-90"
            style={getAdminButtonStyle(C, "secondary")}
          >
            <FileText className="h-3.5 w-3.5" />
            View application answers
          </button>
          <ApplicationPdfDownloadButton
            C={C}
            downloadLabel={resolvedDownloadLabel}
            getElement={() => printRef.current}
          />
        </div>

        <DetailPanelStepTimeline
          C={C}
          items={timelineItems}
          activeItemId={detailOpen ? selectedStepId : null}
          showStatusText={showStatusText}
        />
      </DetailPanelSection>

      <ApplicationFormStepDetailModal
        C={C}
        branding={branding}
        schoolName={schoolName}
        schoolSlug={schoolSlug}
        open={detailOpen}
        step={selectedStep}
        stepStatus={selectedStep?.status ?? "not_started"}
        detail={detail}
        feeStatus={feeStatus}
        onClose={closeStepDetail}
      />

      <ApplicationAnswersModal
        C={C}
        branding={branding}
        schoolName={schoolName}
        schoolSlug={schoolSlug}
        open={answersOpen}
        detail={detail}
        downloadLabel={resolvedDownloadLabel}
        onClose={() => setAnswersOpen(false)}
      />

      <div
        className="pointer-events-none fixed left-[-10000px] top-0 w-[800px]"
        aria-hidden="true"
      >
        <div ref={printRef}>
          <ApplicationReadOnlyView
            branding={branding}
            schoolName={schoolName}
            schoolSlug={schoolSlug}
            application={detail}
            layout="page"
            view="full"
            hideBackLink
            standalone={false}
          />
        </div>
      </div>
    </>
  );
}
