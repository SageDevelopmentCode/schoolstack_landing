"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { PaymentSchedulePreviewContent } from "@/components/school-admin/tuition/PaymentSchedulePreviewPanel";
import SchoolAdminModalShell from "@/components/school-admin/ui/SchoolAdminModalShell";
import { paymentScheduleLabel, type PaymentOptionPreview } from "@/lib/tuition/setup-wizard";
import { getAdminButtonStyle } from "@/lib/organization-settings/admin-button-styles";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import ParentGardenFrame, { PortalIsland } from "@/components/school-parent/garden/ParentGardenFrame";
import { GKicker, G_FOCUS, gBtnPopSm } from "@/components/school-parent/garden/ui";

type PaymentSchedulePreviewModalProps = {
  C: AdminThemeTokens;
  open: boolean;
  previews: PaymentOptionPreview[];
  defaultCount: number;
  annualAmountCents: number;
  effectiveStart?: string | null;
  effectiveEnd?: string | null;
  billingDayOfMonth?: number;
  schoolYearMonths?: number | null;
  title?: string;
  closeLabel?: string;
  testId?: string;
  onClose: () => void;
  /** "parent-garden" = parent portal Garden chrome (needs `theme`). Admin keeps "default". */
  appearance?: "default" | "parent-garden";
  theme?: ParentThemeTokens;
};

export default function PaymentSchedulePreviewModal({
  C,
  open,
  previews,
  defaultCount,
  annualAmountCents,
  effectiveStart,
  effectiveEnd,
  billingDayOfMonth = 1,
  schoolYearMonths,
  title = "Payment schedules",
  closeLabel = "Done",
  testId,
  onClose,
  appearance = "default",
  theme,
}: PaymentSchedulePreviewModalProps) {
  const [activeCount, setActiveCount] = useState(defaultCount);

  useEffect(() => {
    if (open) {
      queueMicrotask(() => {
        setActiveCount(defaultCount);
      });
    }
  }, [open, defaultCount]);

  const activePreview =
    previews.length > 0
      ? previews.find((preview) => preview.count === activeCount) ?? previews[0]!
      : null;
  const isActiveDefault = activePreview?.count === defaultCount;
  const showScheduleTabs = previews.length > 1;
  const garden = appearance === "parent-garden" && theme != null;

  if (garden && theme && !showScheduleTabs) {
    return (
      <SchoolAdminModalShell
        open={open && activePreview != null}
        onClose={onClose}
        maxWidth="2xl"
        zIndex={120}
        ariaLabelledBy="payment-schedule-modal-title"
        testId={testId}
        panelClassName="flex max-h-[min(90vh,720px)] flex-col overflow-hidden !rounded-[24px]"
        panelStyle={{ backgroundColor: "transparent", border: "none", boxShadow: "none" }}
      >
        {activePreview ? (
          <ParentGardenFrame
            theme={theme}
            className="flex min-h-0 flex-1 flex-col rounded-[24px] border-[1.5px] border-[var(--sf-ink)]/12 bg-white shadow-[0_3px_0_0_rgba(43,36,29,0.08)]"
          >
            <div className="flex flex-shrink-0 items-start justify-between gap-3 border-b-[1.5px] border-dashed border-[var(--sf-ink)]/15 px-5 py-4 sm:px-6">
              <div className="min-w-0">
                <GKicker>Preview</GKicker>
                <h2
                  id="payment-schedule-modal-title"
                  className="sf-display m-0 mt-1 text-[1.4rem] leading-[1.05] text-[var(--sf-ink)]"
                >
                  {title}
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-[1.5px] border-[var(--sf-ink)]/20 text-[var(--sf-ink)]/70 hover:border-[var(--sf-ink)]/50 ${G_FOCUS}`}
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div id="schedule-panel-single" className="min-h-0 flex-1 overflow-y-auto px-5 py-4 sm:px-6">
              <PortalIsland>
                <PaymentSchedulePreviewContent
                  C={C}
                  preview={activePreview}
                  annualAmountCents={annualAmountCents}
                  isDefault={isActiveDefault}
                  effectiveStart={effectiveStart}
                  effectiveEnd={effectiveEnd}
                  billingDayOfMonth={billingDayOfMonth}
                  schoolYearMonths={schoolYearMonths}
                  embedded
                />
              </PortalIsland>
            </div>
            <div className="flex flex-shrink-0 items-center justify-end border-t-[1.5px] border-dashed border-[var(--sf-ink)]/15 px-5 py-4 sm:px-6">
              <button type="button" onClick={onClose} className={gBtnPopSm}>
                {closeLabel}
              </button>
            </div>
          </ParentGardenFrame>
        ) : null}
      </SchoolAdminModalShell>
    );
  }

  return (
    <SchoolAdminModalShell
      open={open && activePreview != null}
      onClose={onClose}
      maxWidth="2xl"
      zIndex={120}
      ariaLabelledBy="payment-schedule-modal-title"
      testId={testId}
      panelClassName="flex max-h-[min(90vh,720px)] flex-col"
      panelStyle={{
        backgroundColor: C.surface,
        border: `1px solid ${C.border}`,
        boxShadow: C.shadowMedium,
      }}
    >
      {activePreview ? (
        <>
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
              billingDayOfMonth={billingDayOfMonth}
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
        </>
      ) : null}
    </SchoolAdminModalShell>
  );
}
