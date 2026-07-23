"use client";

import { useMemo, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { buildInstallmentDueDates } from "@/lib/tuition/charge-generator";
import { formatCents } from "@/lib/tuition/pricing";
import {
  formatPaymentSchedulePreview,
  paymentScheduleCadence,
  paymentScheduleLabel,
  schoolYearPreviewStartDate,
  type PaymentOptionPreview,
} from "@/lib/tuition/setup-wizard";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";

type PaymentSchedulePreviewPanelProps = {
  C: AdminThemeTokens;
  annualAmountCents: number;
  defaultPreview: PaymentOptionPreview;
  otherPreviews: PaymentOptionPreview[];
  effectiveStart?: string | null;
  effectiveEnd?: string | null;
  schoolYearMonths?: number | null;
};

function formatDueDateLabel(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

export default function PaymentSchedulePreviewPanel({
  C,
  annualAmountCents,
  defaultPreview,
  otherPreviews,
  effectiveStart,
  effectiveEnd,
  schoolYearMonths,
}: PaymentSchedulePreviewPanelProps) {
  const [showOthers, setShowOthers] = useState(false);
  const summary = formatPaymentSchedulePreview(
    defaultPreview,
    annualAmountCents,
    schoolYearMonths,
  );

  const dueDates = useMemo(() => {
    const startDate = schoolYearPreviewStartDate(effectiveStart);
    return buildInstallmentDueDates(
      {
        id: "preview",
        organizationId: "preview",
        ratePlanId: "preview",
        name: summary.label,
        installmentCount: defaultPreview.count,
        installmentAmountCents: defaultPreview.amountCents,
        billingDayOfMonth: 1,
        isDefault: true,
        createdAt: "",
        updatedAt: "",
      },
      startDate,
    );
  }, [
    defaultPreview.amountCents,
    defaultPreview.count,
    effectiveStart,
    summary.label,
  ]);

  const showInstallmentLabels = defaultPreview.count <= 12;

  const lastDueDateExceedsSchoolYear =
    effectiveEnd != null &&
    dueDates.length > 0 &&
    dueDates[dueDates.length - 1]! > effectiveEnd;

  return (
    <div className="flex flex-col gap-4">
      <div
        className="rounded-xl p-5 flex flex-col gap-4"
        style={{ backgroundColor: C.bg, border: `1px solid ${C.border}` }}
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide" style={{ color: C.textTertiary }}>
              Default schedule preview
            </p>
            <h3 className="text-base font-semibold mt-1" style={{ color: C.textPrimary }}>
              {summary.label}
            </h3>
            <p className="text-sm mt-0.5" style={{ color: C.textSecondary }}>
              {summary.cadence}
            </p>
          </div>
          <span
            className="text-xs font-medium px-2.5 py-1 rounded-full"
            style={{ backgroundColor: C.accentLight, color: C.accent }}
          >
            Default schedule
          </span>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <PreviewStat
            label="Annual tuition"
            value={summary.annualLabel}
            C={C}
          />
          <PreviewStat
            label="Per payment"
            value={summary.perPaymentLabel}
            C={C}
          />
          <PreviewStat
            label="Payments"
            value={String(summary.count)}
            C={C}
          />
        </div>

        <div>
          <p className="text-xs font-medium mb-2" style={{ color: C.textSecondary }}>
            Installment timeline
          </p>
          <div className="flex gap-1">
            {Array.from({ length: defaultPreview.count }).map((_, index) => (
              <div
                key={index}
                className="h-2 flex-1 rounded-sm"
                style={{
                  backgroundColor:
                    index === 0 ? C.accent : C.accentLight,
                  opacity: index === 0 ? 1 : 0.55 + (index / defaultPreview.count) * 0.35,
                }}
                title={`Payment ${index + 1}`}
              />
            ))}
          </div>
          {showInstallmentLabels ? (
            <div className="mt-2 flex flex-wrap gap-2">
              {Array.from({ length: defaultPreview.count }).map((_, index) => (
                <span
                  key={index}
                  className="text-[10px] px-1.5 py-0.5 rounded"
                  style={{ backgroundColor: C.surface, color: C.textTertiary }}
                >
                  {index + 1}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs mt-2" style={{ color: C.textTertiary }}>
              {defaultPreview.count} equal payments across the school year
            </p>
          )}
        </div>

        <div>
          <p className="text-xs font-medium mb-2" style={{ color: C.textSecondary }}>
            Estimated due dates
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {dueDates.map((dueDate, index) => (
              <div
                key={dueDate}
                className="flex items-center justify-between gap-3 rounded-md px-3 py-2 text-sm"
                style={{ backgroundColor: C.surface, border: `1px solid ${C.border}` }}
              >
                <span style={{ color: C.textSecondary }}>
                  Payment {index + 1}
                </span>
                <span className="font-medium" style={{ color: C.textPrimary }}>
                  {formatDueDateLabel(dueDate)} · {formatCents(defaultPreview.amountCents)}
                </span>
              </div>
            ))}
          </div>
          {lastDueDateExceedsSchoolYear ? (
            <p className="text-xs mt-2" style={{ color: C.warning }}>
              The last estimated due date falls after your school year ends (
              {formatDueDateLabel(effectiveEnd!)}). Adjust dates or choose fewer
              installments.
            </p>
          ) : null}
        </div>

        <p className="text-xs" style={{ color: C.textTertiary }}>
          Amounts are estimates based on your default tuition rate. Exact due dates follow
          your school year start{effectiveStart ? "" : " (using August 1 if not set yet)"}.
        </p>
      </div>

      {otherPreviews.length > 0 ? (
        <div
          className="rounded-xl overflow-hidden"
          style={{ border: `1px solid ${C.border}` }}
        >
          <button
            type="button"
            onClick={() => setShowOthers((prev) => !prev)}
            className="flex w-full items-center justify-between gap-3 px-4 py-3 text-sm font-medium"
            style={{ backgroundColor: C.surface, color: C.textPrimary }}
          >
            Other enabled schedules ({otherPreviews.length})
            {showOthers ? (
              <ChevronUp className="h-4 w-4" style={{ color: C.textTertiary }} />
            ) : (
              <ChevronDown className="h-4 w-4" style={{ color: C.textTertiary }} />
            )}
          </button>
          {showOthers ? (
            <div className="px-4 pb-4 flex flex-col gap-2">
              {otherPreviews.map((preview) => (
                <div
                  key={preview.count}
                  className="flex items-center justify-between gap-3 rounded-md px-3 py-2 text-sm"
                  style={{ backgroundColor: C.bg, border: `1px solid ${C.border}` }}
                >
                  <div>
                    <p className="font-medium" style={{ color: C.textPrimary }}>
                      {paymentScheduleLabel(preview.count)}
                    </p>
                    <p className="text-xs" style={{ color: C.textTertiary }}>
                      {paymentScheduleCadence(preview.count, schoolYearMonths)}
                    </p>
                  </div>
                  <span style={{ color: C.textSecondary }}>
                    {formatCents(preview.amountCents)} × {preview.count}
                  </span>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function PreviewStat({
  label,
  value,
  C,
}: {
  label: string;
  value: string;
  C: AdminThemeTokens;
}) {
  return (
    <div
      className="rounded-lg px-3 py-2.5"
      style={{ backgroundColor: C.surface, border: `1px solid ${C.border}` }}
    >
      <p className="text-xs" style={{ color: C.textTertiary }}>
        {label}
      </p>
      <p className="text-sm font-semibold mt-0.5" style={{ color: C.textPrimary }}>
        {value}
      </p>
    </div>
  );
}
