"use client";

import { useMemo } from "react";
import { buildInstallmentDueDates } from "@/lib/tuition/charge-generator";
import { formatCents } from "@/lib/tuition/pricing";
import {
  formatPaymentSchedulePreview,
  schoolYearPreviewStartDate,
  type PaymentOptionPreview,
} from "@/lib/tuition/setup-wizard";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import { formatBillingDueDate } from "@/lib/tuition/due-date-display";

export function formatDueDateLabel(iso: string): string {
  return formatBillingDueDate(iso);
}

export type PaymentSchedulePreviewContentProps = {
  C: AdminThemeTokens;
  preview: PaymentOptionPreview;
  annualAmountCents: number;
  isDefault?: boolean;
  effectiveStart?: string | null;
  effectiveEnd?: string | null;
  schoolYearMonths?: number | null;
  embedded?: boolean;
};

export function PaymentSchedulePreviewContent({
  C,
  preview,
  annualAmountCents,
  isDefault = false,
  effectiveStart,
  effectiveEnd,
  schoolYearMonths,
  embedded = false,
}: PaymentSchedulePreviewContentProps) {
  const summary = formatPaymentSchedulePreview(
    preview,
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
        installmentCount: preview.count,
        installmentAmountCents: preview.amountCents,
        billingDayOfMonth: 1,
        isDefault: true,
        createdAt: "",
        updatedAt: "",
      },
      startDate,
    );
  }, [effectiveStart, preview.amountCents, preview.count, summary.label]);

  const showInstallmentLabels = preview.count <= 12;

  const lastDueDateExceedsSchoolYear =
    effectiveEnd != null &&
    dueDates.length > 0 &&
    dueDates[dueDates.length - 1]! > effectiveEnd;

  return (
    <div
      className={`flex flex-col gap-4 ${embedded ? "" : "rounded-xl p-5"}`}
      style={
        embedded
          ? undefined
          : { backgroundColor: C.bg, border: `1px solid ${C.border}` }
      }
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide" style={{ color: C.textTertiary }}>
            Schedule preview
          </p>
          <h3 className="text-base font-semibold mt-1" style={{ color: C.textPrimary }}>
            {summary.label}
          </h3>
          <p className="text-sm mt-0.5" style={{ color: C.textSecondary }}>
            {summary.cadence}
          </p>
        </div>
        {isDefault ? (
          <span
            className="text-xs font-medium px-2.5 py-1 rounded-full"
            style={{ backgroundColor: C.accentLight, color: C.accent }}
          >
            Default
          </span>
        ) : null}
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <PreviewStat label="Annual tuition" value={summary.annualLabel} C={C} />
        <PreviewStat label="Per payment" value={summary.perPaymentLabel} C={C} />
        <PreviewStat label="Payments" value={String(summary.count)} C={C} />
      </div>

      <div>
        <p className="text-xs font-medium mb-2" style={{ color: C.textSecondary }}>
          Installment timeline
        </p>
        <div className="flex gap-1">
          {Array.from({ length: preview.count }).map((_, index) => (
            <div
              key={index}
              className="h-2 flex-1 rounded-sm"
              style={{
                backgroundColor: index === 0 ? C.accent : C.accentLight,
                opacity: index === 0 ? 1 : 0.55 + (index / preview.count) * 0.35,
              }}
              title={`Payment ${index + 1}`}
            />
          ))}
        </div>
        {showInstallmentLabels ? (
          <div className="mt-2 flex flex-wrap gap-2">
            {Array.from({ length: preview.count }).map((_, index) => (
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
            {preview.count} equal payments across the school year
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
              <span style={{ color: C.textSecondary }}>Payment {index + 1}</span>
              <span className="font-medium" style={{ color: C.textPrimary }}>
                {formatDueDateLabel(dueDate)} · {formatCents(preview.amountCents)}
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
