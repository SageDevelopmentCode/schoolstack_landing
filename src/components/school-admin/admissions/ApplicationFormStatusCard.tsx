"use client";

import { useMemo, useState } from "react";
import {
  CheckCircle2,
  Circle,
  CircleDot,
  ClipboardList,
  CreditCard,
  PenLine,
} from "lucide-react";
import ApplicationFormStepDetailModal from "@/components/school-admin/admissions/ApplicationFormStepDetailModal";
import DetailPanelSection from "@/components/school-admin/admissions/DetailPanelSection";
import DetailPanelProgressBar from "@/components/school-admin/admissions/DetailPanelProgressBar";
import {
  applicationStatusBadgeStyle,
  applicationStatusLabel,
} from "@/lib/admissions/application-status-ui";
import {
  buildApplicationFormSteps,
  computeApplicationFormStepStatuses,
  summarizeApplicationFormProgress,
  type ApplicationFormStep,
  type ApplicationFormStepStatus,
} from "@/lib/admissions/application-form-steps";
import type { ApplicationDetail } from "@/lib/admissions/parent-portal-access";
import {
  checklistItemStatusIconColor,
  checklistItemStatusLabel,
} from "@/lib/admissions/enrollment-checklist-item-status-ui";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import type { LucideIcon } from "lucide-react";

type ApplicationFormStatusCardProps = {
  C: AdminThemeTokens;
  branding: OrganizationBranding;
  schoolName: string;
  schoolSlug: string;
  detail: ApplicationDetail;
  feeStatus: string;
  applicationStatus: string;
};

function getFormStepIcon(kind: ApplicationFormStep["kind"]): LucideIcon {
  switch (kind) {
    case "section":
      return ClipboardList;
    case "acknowledgments":
      return PenLine;
    case "fee":
      return CreditCard;
  }
}

function StepStatusIcon({
  status,
  C,
}: {
  status: ApplicationFormStepStatus;
  C: AdminThemeTokens;
}) {
  const color = checklistItemStatusIconColor(status, C);

  if (status === "completed") {
    return <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" style={{ color }} aria-hidden />;
  }

  if (status === "in_progress") {
    return <CircleDot className="mt-0.5 h-4 w-4 shrink-0" style={{ color }} aria-hidden />;
  }

  return <Circle className="mt-0.5 h-4 w-4 shrink-0" style={{ color }} aria-hidden />;
}

export default function ApplicationFormStatusCard({
  C,
  branding,
  schoolName,
  schoolSlug,
  detail,
  feeStatus,
  applicationStatus,
}: ApplicationFormStatusCardProps) {
  const [selectedStepId, setSelectedStepId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

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

  const openStepDetail = (stepId: string) => {
    setSelectedStepId(stepId);
    setDetailOpen(true);
  };

  const closeStepDetail = () => {
    setDetailOpen(false);
    setSelectedStepId(null);
  };

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
        <DetailPanelProgressBar
          C={C}
          completed={progress.completed}
          total={progress.total}
          label="Steps"
        />

        <ul
          className="mt-4 overflow-hidden rounded-lg border"
          style={{ borderColor: C.border, backgroundColor: C.surface }}
        >
          {stepsWithStatus.map((step) => {
            const TypeIcon = getFormStepIcon(step.kind);

            return (
              <li key={step.id} className="border-b last:border-b-0" style={{ borderColor: C.border }}>
                <button
                  type="button"
                  onClick={() => openStepDetail(step.id)}
                  className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:opacity-90"
                >
                  <StepStatusIcon status={step.status} C={C} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <TypeIcon
                        className="h-3.5 w-3.5 shrink-0"
                        style={{ color: C.textTertiary }}
                        aria-hidden
                      />
                      <p className="text-sm font-medium" style={{ color: C.textPrimary }}>
                        {step.label}
                      </p>
                    </div>
                    <p
                      className="mt-1 text-xs"
                      style={{
                        color:
                          step.status === "completed"
                            ? C.success
                            : step.status === "in_progress"
                              ? C.info
                              : C.textTertiary,
                      }}
                    >
                      {checklistItemStatusLabel(step.status)}
                    </p>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
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
    </>
  );
}
