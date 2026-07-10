"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import ApplicationReadOnlyView from "@/components/admissions/ApplicationReadOnlyView";
import { formatFeeAmount } from "@/lib/admissions/application-form-schema";
import type {
  ApplicationFormStep,
  ApplicationFormStepStatus,
} from "@/lib/admissions/application-form-steps";
import {
  FEE_STATUS_LABELS,
} from "@/lib/admissions/application-status-ui";
import type { ApplicationDetail } from "@/lib/admissions/parent-portal-access";
import {
  checklistItemStatusLabel,
  checklistItemStatusStyle,
} from "@/lib/admissions/enrollment-checklist-item-status-ui";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import type { OrganizationBranding } from "@/lib/organization-settings/types";

type ApplicationFormStepDetailModalProps = {
  C: AdminThemeTokens;
  branding: OrganizationBranding;
  schoolName: string;
  schoolSlug: string;
  open: boolean;
  step: ApplicationFormStep | null;
  stepStatus: ApplicationFormStepStatus;
  detail: ApplicationDetail;
  feeStatus: string;
  onClose: () => void;
};

function FeeReadOnlyPanel({
  C,
  detail,
  feeStatus,
}: {
  C: AdminThemeTokens;
  detail: ApplicationDetail;
  feeStatus: string;
}) {
  const feeConfig = detail.feeConfig;
  const amount = formatFeeAmount(feeConfig.amount_cents ?? 0);
  const statusLabel = FEE_STATUS_LABELS[feeStatus] ?? feeStatus.replace(/_/g, " ");
  const isPaid = feeStatus === "paid" || feeStatus === "not_required" || feeStatus === "waived";

  return (
    <div className="space-y-4">
      <div
        className="rounded-lg border px-4 py-4"
        style={{ borderColor: C.border, backgroundColor: "#FFFFFF" }}
      >
        <p className="text-sm" style={{ color: C.textSecondary }}>
          Amount due
        </p>
        <p className="mt-1 text-2xl font-semibold" style={{ color: C.textPrimary }}>
          {amount}
        </p>
        <p
          className="mt-2 text-sm font-medium"
          style={{ color: isPaid ? C.success : C.textSecondary }}
        >
          {statusLabel}
        </p>
      </div>
    </div>
  );
}

export default function ApplicationFormStepDetailModal({
  C,
  branding,
  schoolName,
  schoolSlug,
  open,
  step,
  stepStatus,
  detail,
  feeStatus,
  onClose,
}: ApplicationFormStepDetailModalProps) {
  const stepTypeLabel =
    step?.kind === "section"
      ? "Form section"
      : step?.kind === "acknowledgments"
        ? "Acknowledgments"
        : step?.kind === "fee"
          ? "Payment"
          : "";

  return (
    <AnimatePresence>
      {open && step ? (
        <motion.div
          className="fixed inset-0 z-[120] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className="absolute inset-0"
            style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 8 }}
            className="relative z-10 flex max-h-[min(90vh,720px)] w-full max-w-2xl flex-col overflow-hidden rounded-lg"
            style={{
              backgroundColor: C.surface,
              border: `1px solid ${C.border}`,
              boxShadow: C.shadowMedium,
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <div
              className="flex items-start justify-between gap-3 border-b px-5 py-4"
              style={{ borderColor: C.border }}
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-semibold" style={{ color: C.textPrimary }}>
                    {step.label}
                  </h3>
                  <span
                    className="rounded-full px-2 py-0.5 text-[11px] font-medium"
                    style={checklistItemStatusStyle(stepStatus, C)}
                  >
                    {checklistItemStatusLabel(stepStatus)}
                  </span>
                </div>
                <p className="mt-1 text-sm" style={{ color: C.textSecondary }}>
                  {stepTypeLabel}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded p-1"
                style={{ color: C.textTertiary }}
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
              {step.kind === "fee" ? (
                <FeeReadOnlyPanel C={C} detail={detail} feeStatus={feeStatus} />
              ) : (
                <ApplicationReadOnlyView
                  branding={branding}
                  schoolName={schoolName}
                  schoolSlug={schoolSlug}
                  application={detail}
                  embedded
                  view={step.kind === "acknowledgments" ? "acknowledgments" : "section"}
                  sectionId={step.kind === "section" ? step.id : undefined}
                />
              )}
            </div>

            <div
              className="border-t px-5 py-3 text-xs"
              style={{ borderColor: C.border, color: C.textTertiary }}
            >
              Read-only — this is what the family sees
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
