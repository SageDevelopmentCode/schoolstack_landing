"use client";

import { useMemo, useState } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import DetailPanelProgressBar from "@/components/school-admin/admissions/DetailPanelProgressBar";
import DetailPanelStepTimeline, {
  type DetailPanelStepTimelineItem,
} from "@/components/school-admin/admissions/DetailPanelStepTimeline";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import { getAdminButtonStyle } from "@/lib/organization-settings/admin-button-styles";
import {
  tuitionReadinessPrimaryAction,
  type TuitionReadinessStatus,
  type TuitionReadinessStepId,
} from "@/lib/tuition/tuition-readiness";

type TuitionReadinessBannerProps = {
  C: AdminThemeTokens;
  organizationId: string;
  readiness: TuitionReadinessStatus;
  onOpenSetupWizard: () => void;
  onSwitchToCatalog: () => void;
  onSwitchToFamilies: () => void;
  onRefresh: () => Promise<void>;
};

function readinessHeadline(readiness: TuitionReadinessStatus): string {
  if (!readiness.firstIncompleteStepId) {
    return "Billing is active";
  }

  switch (readiness.firstIncompleteStepId) {
    case "rate_plan":
      return "Publish a rate plan to start billing families";
    case "assign_enrollments":
      return readiness.unassignedEnrollmentCount === 1
        ? "1 enrolled student still needs a tuition assignment"
        : `${readiness.unassignedEnrollmentCount} enrolled students still need tuition assignments`;
    case "payment_plans":
      return readiness.pendingPaymentPlanCount === 1
        ? "1 student is waiting for a payment schedule"
        : `${readiness.pendingPaymentPlanCount} students are waiting for a payment schedule`;
    case "billing_schedule":
      return readiness.assignmentsWithoutChargesCount === 1
        ? "1 assignment still needs a billing schedule"
        : `${readiness.assignmentsWithoutChargesCount} assignments still need billing schedules`;
    default:
      return "Billing setup is not complete yet";
  }
}

function readinessSubtitle(readiness: TuitionReadinessStatus): string {
  if (!readiness.firstIncompleteStepId) {
    return "Families with assigned tuition and generated charges will show balances here.";
  }

  switch (readiness.firstIncompleteStepId) {
    case "rate_plan":
      return "Create and publish tuition rates before assigning them to enrolled students.";
    case "assign_enrollments":
      return "Students enrolled before your rate plan was published are not billed automatically. Assign tuition to generate schedules.";
    case "payment_plans":
      return "Choose an installment plan for each student when multiple payment options are available.";
    case "billing_schedule":
      return "Finalize payment schedules so installment charges can be generated for each family.";
    default:
      return "Complete the remaining setup steps below.";
  }
}

function stepMeta(status: DetailPanelStepTimelineItem["status"]): string | undefined {
  if (status === "completed") return "Complete";
  if (status === "in_progress") return "Needs attention";
  return undefined;
}

export default function TuitionReadinessBanner({
  C,
  organizationId,
  readiness,
  onOpenSetupWizard,
  onSwitchToCatalog,
  onSwitchToFamilies,
  onRefresh,
}: TuitionReadinessBannerProps) {
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const allComplete = readiness.completedCount === readiness.totalCount;
  const primaryAction = tuitionReadinessPrimaryAction(readiness);

  const timelineItems: DetailPanelStepTimelineItem[] = useMemo(
    () =>
      readiness.steps.map((step) => ({
        id: step.id,
        title: step.title,
        status: step.status,
        kindLabel: step.description,
        meta: stepMeta(step.status),
        onClick: () => {
          if (step.id === "rate_plan") {
            onOpenSetupWizard();
            return;
          }
          if (step.id === "assign_enrollments" || step.id === "payment_plans") {
            onSwitchToFamilies();
            return;
          }
          onSwitchToFamilies();
        },
      })),
    [onOpenSetupWizard, onSwitchToFamilies, readiness.steps],
  );

  const handlePrimaryAction = async (stepId: TuitionReadinessStepId) => {
    setActionError(null);

    if (stepId === "rate_plan") {
      onOpenSetupWizard();
      return;
    }

    if (stepId === "assign_enrollments") {
      setActionLoading(true);
      try {
        const response = await fetch("/api/tuition/assign-unassigned", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ organizationId }),
        });
        const payload = (await response.json()) as {
          error?: string;
          assignedCount?: number;
          failedCount?: number;
        };
        if (!response.ok) {
          throw new Error(payload.error ?? "Failed to assign tuition.");
        }
        if ((payload.failedCount ?? 0) > 0 && (payload.assignedCount ?? 0) === 0) {
          throw new Error(
            "No tuition assignments were created. Confirm an active rate plan exists for each program.",
          );
        }
        await onRefresh();
        onSwitchToFamilies();
      } catch (error) {
        setActionError(
          error instanceof Error ? error.message : "Failed to assign tuition.",
        );
      } finally {
        setActionLoading(false);
      }
      return;
    }

    if (stepId === "payment_plans" || stepId === "billing_schedule") {
      onSwitchToFamilies();
      return;
    }

    onSwitchToCatalog();
  };

  if (allComplete) {
    return null;
  }

  return (
    <div
      className="rounded-lg border p-5 flex flex-col gap-4"
      style={{ backgroundColor: C.surface, borderColor: C.border }}
      data-testid="tuition-readiness-banner"
    >
      <div className="flex items-start gap-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
          style={{ backgroundColor: C.accentGlow }}
        >
          <AlertCircle className="h-5 w-5" style={{ color: C.accent }} />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-semibold" style={{ color: C.textPrimary }}>
            {readinessHeadline(readiness)}
          </h2>
          <p className="mt-1 text-sm leading-relaxed" style={{ color: C.textSecondary }}>
            {readinessSubtitle(readiness)}
          </p>
        </div>
      </div>

      <DetailPanelProgressBar
        C={C}
        completed={readiness.completedCount}
        total={readiness.totalCount}
        label="Billing setup"
        subtitle={`${readiness.totalCount - readiness.completedCount} step${
          readiness.totalCount - readiness.completedCount === 1 ? "" : "s"
        } remaining.`}
      />

      <DetailPanelStepTimeline
        C={C}
        items={timelineItems}
        activeItemId={readiness.firstIncompleteStepId}
        showStatusText
      />

      {primaryAction ? (
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled={actionLoading}
            onClick={() => void handlePrimaryAction(primaryAction.stepId)}
            style={getAdminButtonStyle(C, "primary")}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium"
          >
            {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {primaryAction.label}
          </button>
          {readiness.firstIncompleteStepId === "rate_plan" ? (
            <button
              type="button"
              onClick={onSwitchToCatalog}
              className="text-sm font-medium"
              style={{ color: C.accent }}
            >
              View rate catalog
            </button>
          ) : null}
        </div>
      ) : null}

      {actionError ? (
        <p className="text-sm" style={{ color: C.error }}>
          {actionError}
        </p>
      ) : null}
    </div>
  );
}
