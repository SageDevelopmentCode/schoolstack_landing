"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, Loader2, X } from "lucide-react";
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

type TuitionSetupPanelProps = {
  open: boolean;
  C: AdminThemeTokens;
  organizationId: string;
  readiness: TuitionReadinessStatus;
  onClose: () => void;
  onOpenSetupWizard: () => void;
  onSwitchToCatalog: () => void;
  onSwitchToFamilies: () => void;
  onRefresh: () => Promise<void>;
};

function readinessHeadline(readiness: TuitionReadinessStatus): string {
  if (!readiness.firstIncompleteStepId) {
    return "Billing is active";
  }

  if (
    readiness.unassignedEnrollmentCount > 0 &&
    readiness.firstIncompleteStepId === "payment_plans"
  ) {
    return readiness.unassignedEnrollmentCount === 1
      ? "1 enrolled student is missing a tuition assignment"
      : `${readiness.unassignedEnrollmentCount} enrolled students are missing tuition assignments`;
  }

  switch (readiness.firstIncompleteStepId) {
    case "rate_plan":
      return "Publish a rate plan to start billing families";
    case "payment_plans":
      return readiness.pendingPaymentPlanCount === 1
        ? "1 family still needs to choose a payment schedule"
        : `${readiness.pendingPaymentPlanCount} families still need to choose a payment schedule`;
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

  if (
    readiness.unassignedEnrollmentCount > 0 &&
    readiness.firstIncompleteStepId === "payment_plans"
  ) {
    return "Tuition is usually assigned automatically at enrollment. Sync any students who enrolled before your rate plan was ready.";
  }

  switch (readiness.firstIncompleteStepId) {
    case "rate_plan":
      return "Create and publish tuition rates before billing can begin.";
    case "payment_plans":
      return "Families choose their installment plan in the parent portal under Billing. Charges generate after they confirm, unless an admin overrides the schedule.";
    case "billing_schedule":
      return "Billing schedules appear once families confirm payment plans or an admin finalizes them.";
    default:
      return "Complete the remaining setup steps below.";
  }
}

function syncAssignmentsLabel(count: number): string {
  return count === 1
    ? "Sync assignment for enrolled student"
    : `Sync assignments for ${count} enrolled students`;
}

function stepMeta(status: DetailPanelStepTimelineItem["status"]): string | undefined {
  if (status === "completed") return "Complete";
  if (status === "in_progress") return "Needs attention";
  return undefined;
}

export default function TuitionSetupPanel({
  open,
  C,
  organizationId,
  readiness,
  onClose,
  onOpenSetupWizard,
  onSwitchToCatalog,
  onSwitchToFamilies,
  onRefresh,
}: TuitionSetupPanelProps) {
  const [syncLoading, setSyncLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const primaryAction = tuitionReadinessPrimaryAction(readiness);
  const ratePlanComplete =
    readiness.steps.find((step) => step.id === "rate_plan")?.status === "completed";
  const showSyncAlert =
    readiness.unassignedEnrollmentCount > 0 && ratePlanComplete;

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
          onSwitchToFamilies();
        },
      })),
    [onOpenSetupWizard, onSwitchToFamilies, readiness.steps],
  );

  const handleSyncAssignments = async () => {
    setActionError(null);
    setSyncLoading(true);
    try {
      const response = await fetch("/api/tuition/sync-assignments", {
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
        throw new Error(payload.error ?? "Failed to sync tuition assignments.");
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
        error instanceof Error ? error.message : "Failed to sync tuition assignments.",
      );
    } finally {
      setSyncLoading(false);
    }
  };

  const handlePrimaryAction = async (stepId: TuitionReadinessStepId) => {
    setActionError(null);

    if (stepId === "rate_plan") {
      onOpenSetupWizard();
      return;
    }

    if (stepId === "payment_plans" || stepId === "billing_schedule") {
      onSwitchToFamilies();
      return;
    }

    onSwitchToCatalog();
  };

  const remainingSteps = readiness.totalCount - readiness.completedCount;

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[100]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div
            className="absolute inset-0"
            style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="absolute inset-y-0 right-0 z-[15] flex w-[min(100%,28rem)] max-w-full flex-col overflow-hidden"
            style={{
              backgroundColor: C.surface,
              borderLeft: `1px solid ${C.border}`,
              boxShadow: C.shadowMedium,
            }}
            onClick={(event) => event.stopPropagation()}
            data-testid="tuition-setup-panel"
          >
            <div
              className="flex flex-shrink-0 items-start justify-between gap-3 px-4 py-3 sm:px-5"
              style={{ borderBottom: `1px solid ${C.border}` }}
            >
              <div className="min-w-0">
                <h3 className="text-sm font-semibold" style={{ color: C.textPrimary }}>
                  Billing setup
                </h3>
                <p className="mt-0.5 text-xs" style={{ color: C.textTertiary }}>
                  {readiness.completedCount}/{readiness.totalCount} steps complete
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-md p-1.5"
                style={{ color: C.textSecondary }}
                aria-label="Close billing setup"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-5 flex flex-col gap-4">
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

              {showSyncAlert && readiness.unassignedEnrollmentCount > 0 ? (
                <div
                  className="rounded-lg border p-4 flex flex-col gap-3"
                  style={{ backgroundColor: C.elevated, borderColor: C.border }}
                  data-testid="tuition-setup-sync-alert"
                >
                  <p className="text-sm" style={{ color: C.textSecondary }}>
                    {readiness.unassignedEnrollmentCount === 1
                      ? "1 enrolled student does not have a tuition assignment yet."
                      : `${readiness.unassignedEnrollmentCount} enrolled students do not have tuition assignments yet.`}
                  </p>
                  <button
                    type="button"
                    disabled={syncLoading}
                    onClick={() => void handleSyncAssignments()}
                    style={getAdminButtonStyle(C, "secondary")}
                    className="inline-flex w-fit items-center gap-2 px-4 py-2 text-sm font-medium"
                  >
                    {syncLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    {syncAssignmentsLabel(readiness.unassignedEnrollmentCount)}
                  </button>
                </div>
              ) : null}

              <DetailPanelProgressBar
                C={C}
                completed={readiness.completedCount}
                total={readiness.totalCount}
                label="Billing setup"
                subtitle={
                  remainingSteps === 0
                    ? "All setup steps are complete."
                    : `${remainingSteps} step${remainingSteps === 1 ? "" : "s"} remaining.`
                }
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
                    onClick={() => void handlePrimaryAction(primaryAction.stepId)}
                    style={getAdminButtonStyle(C, "primary")}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium"
                  >
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
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
