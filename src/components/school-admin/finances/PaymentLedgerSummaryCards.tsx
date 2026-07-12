"use client";

import { useMemo } from "react";
import { formatFeeAmount } from "@/lib/admissions/application-form-schema";
import type { PaymentRowsSummary } from "@/lib/admissions/payment-records";
import {
  buildAdminThemeTokens,
  type AdminThemeTokens,
} from "@/lib/organization-settings/theme";
import type { OrganizationBranding } from "@/lib/organization-settings/types";

type PaymentLedgerSummaryCardsProps = {
  summary: PaymentRowsSummary;
  branding: OrganizationBranding;
  mode: "admissions" | "revenue" | "transactions";
};

function SummaryCard({
  label,
  value,
  color,
  C,
}: {
  label: string;
  value: string;
  color: string;
  C: AdminThemeTokens;
}) {
  return (
    <div
      className="rounded-sm p-3"
      style={{
        backgroundColor: C.elevated,
        border: `1px solid ${C.border}`,
      }}
    >
      <p
        className="mb-1 text-[10px] font-medium"
        style={{ color: C.textTertiary }}
      >
        {label}
      </p>
      <p className="text-lg font-bold tabular-nums" style={{ color }}>
        {value}
      </p>
    </div>
  );
}

export default function PaymentLedgerSummaryCards({
  summary,
  branding,
  mode,
}: PaymentLedgerSummaryCardsProps) {
  const C = useMemo(() => buildAdminThemeTokens(branding), [branding]);

  const cards =
    mode === "admissions"
      ? [
          {
            label: "Collected this month",
            value: formatFeeAmount(summary.collectedThisMonthCents),
            color: C.success,
          },
          {
            label: "Collected YTD",
            value: formatFeeAmount(summary.collectedYtdCents),
            color: C.textPrimary,
          },
          {
            label: "Application fees",
            value: formatFeeAmount(summary.applicationFeeCents),
            color: C.accent,
          },
          {
            label: "Pending",
            value:
              summary.pendingCount > 0
                ? `${summary.pendingCount} · ${formatFeeAmount(summary.pendingCents)}`
                : "0",
            color: summary.pendingCount > 0 ? C.warning : C.textSecondary,
          },
        ]
      : mode === "revenue"
      ? [
          {
            label: "Collected this month",
            value: formatFeeAmount(summary.collectedThisMonthCents),
            color: C.success,
          },
          {
            label: "Collected YTD",
            value: formatFeeAmount(summary.collectedYtdCents),
            color: C.textPrimary,
          },
          {
            label: "Application fees",
            value: formatFeeAmount(summary.applicationFeeCents),
            color: C.accent,
          },
          {
            label: "Enrollment fees",
            value: formatFeeAmount(summary.enrollmentCents),
            color: C.info,
          },
        ]
      : [
          {
            label: "Collected this month",
            value: formatFeeAmount(summary.collectedThisMonthCents),
            color: C.success,
          },
          {
            label: "Pending",
            value:
              summary.pendingCount > 0
                ? `${summary.pendingCount} · ${formatFeeAmount(summary.pendingCents)}`
                : "0",
            color: summary.pendingCount > 0 ? C.warning : C.textSecondary,
          },
          {
            label: "Failed",
            value: String(summary.failedCount),
            color: summary.failedCount > 0 ? C.error : C.textSecondary,
          },
          {
            label: "Refunded",
            value:
              summary.refundedCount > 0
                ? `${summary.refundedCount} · ${formatFeeAmount(summary.refundedCents)}`
                : "0",
            color: C.textSecondary,
          },
        ];

  return (
    <div
      className="grid grid-cols-2 gap-3 px-4 py-3 sm:grid-cols-4 sm:px-5"
      style={{ borderBottom: `1px solid ${C.border}` }}
    >
      {cards.map((card) => (
        <SummaryCard
          key={card.label}
          label={card.label}
          value={card.value}
          color={card.color}
          C={C}
        />
      ))}
    </div>
  );
}
