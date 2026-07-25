"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { PaymentSchedulePreviewContent } from "@/components/school-admin/tuition/PaymentSchedulePreviewPanel";
import { paymentScheduleLabel, type PaymentOptionPreview } from "@/lib/tuition/setup-wizard";
import { getAdminButtonStyle } from "@/lib/organization-settings/admin-button-styles";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";

type PaymentSchedulePreviewModalProps = {
  C: AdminThemeTokens;
  open: boolean;
  previews: PaymentOptionPreview[];
  defaultCount: number;
  annualAmountCents: number;
  effectiveStart?: string | null;
  effectiveEnd?: string | null;
  schoolYearMonths?: number | null;
  title?: string;
  closeLabel?: string;
  testId?: string;
  onClose: () => void;
};

export default function PaymentSchedulePreviewModal({
  C,
  open,
  previews,
  defaultCount,
  annualAmountCents,
  effectiveStart,
  effectiveEnd,
  schoolYearMonths,
  title = "Payment schedules",
  closeLabel = "Done",
  testId,
  onClose,
}: PaymentSchedulePreviewModalProps) {
  const [activeCount, setActiveCount] = useState(defaultCount);

  useEffect(() => {
    if (open) {
      setActiveCount(defaultCount);
    }
  }, [open, defaultCount]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, open]);

  const activePreview =
    previews.length > 0
      ? previews.find((preview) => preview.count === activeCount) ?? previews[0]!
      : null;
  const isActiveDefault = activePreview?.count === defaultCount;
  const showScheduleTabs = previews.length > 1;

  return (
    <AnimatePresence>
      {open && activePreview ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[120] flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
          onClick={onClose}
          role="presentation"
        >
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className="flex w-full max-w-2xl max-h-[min(90vh,720px)] flex-col overflow-hidden rounded-xl"
            style={{
              backgroundColor: C.surface,
              border: `1px solid ${C.border}`,
              boxShadow: C.shadowMedium,
            }}
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="payment-schedule-modal-title"
            data-testid={testId}
          >
            <div
              className="flex flex-shrink-0 items-center justify-between gap-3 px-5 py-4"
              style={{ borderBottom: `1px solid ${C.border}` }}
            >
              <h2
                id="payment-schedule-modal-title"
                className="text-base font-semibold"
                style={{ color: C.textPrimary }}
              >
                {title}
              </h2>
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

            {showScheduleTabs ? (
              <div
                className="flex-shrink-0 overflow-x-auto px-5"
                style={{ borderBottom: `1px solid ${C.border}` }}
              >
                <div className="-mb-px flex gap-6" role="tablist" aria-label="Payment schedules">
                  {previews.map((preview) => {
                    const isActive = activePreview.count === preview.count;
                    const tabId = `schedule-tab-${preview.count}`;
                    const panelId = `schedule-panel-${preview.count}`;
                    const isDefault = preview.count === defaultCount;

                    return (
                      <button
                        key={preview.count}
                        id={tabId}
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        aria-controls={panelId}
                        onClick={() => setActiveCount(preview.count)}
                        className="flex shrink-0 items-center gap-2 whitespace-nowrap border-b-2 py-3 text-sm font-medium transition-colors"
                        style={{
                          borderBottomColor: isActive ? C.accent : "transparent",
                          color: isActive ? C.accent : C.textTertiary,
                        }}
                      >
                        {paymentScheduleLabel(preview.count)}
                        {isDefault ? (
                          <span
                            className="text-[10px] font-medium px-1.5 py-0.5 rounded-full"
                            style={{ backgroundColor: C.accentLight, color: C.accent }}
                          >
                            Default
                          </span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}

            <div
              id={
                showScheduleTabs
                  ? `schedule-panel-${activePreview.count}`
                  : "schedule-panel-single"
              }
              role={showScheduleTabs ? "tabpanel" : undefined}
              aria-labelledby={
                showScheduleTabs ? `schedule-tab-${activePreview.count}` : undefined
              }
              className="flex-1 overflow-y-auto px-5 py-4"
            >
              <PaymentSchedulePreviewContent
                C={C}
                preview={activePreview}
                annualAmountCents={annualAmountCents}
                isDefault={isActiveDefault}
                effectiveStart={effectiveStart}
                effectiveEnd={effectiveEnd}
                schoolYearMonths={schoolYearMonths}
                embedded
              />
            </div>

            <div
              className="flex flex-shrink-0 items-center justify-end px-5 py-4"
              style={{ borderTop: `1px solid ${C.border}` }}
            >
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium rounded-md"
                style={getAdminButtonStyle(C, "primary")}
              >
                {closeLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
