"use client";

import { useCallback, useEffect, useMemo, useState, type CSSProperties } from "react";
import {
  Check,
  CircleDot,
  CreditCard,
  Loader2,
  MinusCircle,
  X,
} from "lucide-react";
import { formatFeeAmount } from "@/lib/admissions/application-form-schema";
import {
  listApplicationPayments,
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_LABELS,
  PAYMENT_TYPE_LABELS,
  summarizePaymentRows,
  type PaymentRecordDisplayRow,
} from "@/lib/admissions/payment-records";
import type { PaymentStatus } from "@/lib/stripe/application-payments";
import {
  buildAdminThemeTokens,
  type AdminThemeTokens,
} from "@/lib/organization-settings/theme";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import { createClient } from "@/utils/supabase/client";

type SubmissionPaymentsPanelProps = {
  applicationId: string;
  branding: OrganizationBranding;
};

function formatDateTime(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function paymentTimestamp(row: PaymentRecordDisplayRow): number {
  const iso = row.paidAt ?? row.createdAt;
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? 0 : date.getTime();
}

function statusBadgeStyle(status: PaymentStatus, C: AdminThemeTokens): CSSProperties {
  switch (status) {
    case "succeeded":
      return { color: "#16A34A", backgroundColor: "#ECFDF3" };
    case "pending":
      return { color: C.warning, backgroundColor: "#FFFBEB" };
    case "failed":
      return { color: C.error, backgroundColor: C.errorBg };
    case "refunded":
      return { color: C.textSecondary, backgroundColor: C.elevated };
    default:
      return { color: C.textSecondary, backgroundColor: C.elevated };
  }
}

function PaymentStatusIcon({
  status,
  C,
}: {
  status: PaymentStatus;
  C: AdminThemeTokens;
}) {
  if (status === "succeeded") {
    return (
      <div
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
        style={{ backgroundColor: C.success, color: "#FFFFFF" }}
      >
        <Check className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
      </div>
    );
  }

  if (status === "pending") {
    return (
      <div
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
        style={{
          backgroundColor: C.accentLight,
          border: `2px solid ${C.accent}`,
          color: C.accent,
        }}
      >
        <CircleDot className="h-3.5 w-3.5" aria-hidden />
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
        style={{ backgroundColor: C.errorBg, color: C.error }}
      >
        <X className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
      </div>
    );
  }

  return (
    <div
      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
      style={{
        backgroundColor: C.elevated,
        border: `1px solid ${C.border}`,
        color: C.textTertiary,
      }}
    >
      <MinusCircle className="h-3.5 w-3.5" aria-hidden />
    </div>
  );
}

function SummaryPill({
  label,
  value,
  C,
  tone = "default",
}: {
  label: string;
  value: string;
  C: AdminThemeTokens;
  tone?: "default" | "pending";
}) {
  return (
    <div
      className="rounded-md border px-3 py-2"
      style={{
        borderColor: C.border,
        backgroundColor: tone === "pending" ? C.warningBg : C.elevated,
      }}
    >
      <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: C.textTertiary }}>
        {label}
      </p>
      <p
        className="mt-0.5 text-sm font-semibold tabular-nums"
        style={{ color: tone === "pending" ? C.warning : C.textPrimary }}
      >
        {value}
      </p>
    </div>
  );
}

function DetailRow({
  label,
  value,
  C,
  emphasize = false,
}: {
  label: string;
  value: string;
  C: AdminThemeTokens;
  emphasize?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <span className="text-xs" style={{ color: C.textTertiary }}>
        {label}
      </span>
      <span
        className={`text-right text-xs tabular-nums ${emphasize ? "font-semibold" : "font-medium"}`}
        style={{ color: emphasize ? C.textPrimary : C.textSecondary }}
      >
        {value}
      </span>
    </div>
  );
}

function PaymentTimelineEntry({
  row,
  C,
  showConnector,
}: {
  row: PaymentRecordDisplayRow;
  C: AdminThemeTokens;
  showConnector: boolean;
}) {
  const chargedAmount = row.chargedAmountCents ?? row.amountCents;
  const methodLabel = row.paymentMethodType
    ? PAYMENT_METHOD_LABELS[row.paymentMethodType]
    : "—";

  return (
    <div className={showConnector ? "pb-5" : undefined}>
      <div className="flex gap-3">
        <div className="flex w-7 shrink-0 items-center justify-center">
          <PaymentStatusIcon status={row.status} C={C} />
        </div>

        <div className="min-w-0 flex-1">
          <div
            className="rounded-lg border px-3 py-3"
            style={{ borderColor: C.border, backgroundColor: C.surface }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold" style={{ color: C.textPrimary }}>
                    {row.label ?? "Payment"}
                  </p>
                  <span
                    className="rounded-full px-2 py-0.5 text-[11px] font-medium"
                    style={statusBadgeStyle(row.status, C)}
                  >
                    {PAYMENT_STATUS_LABELS[row.status]}
                  </span>
                </div>
                <p className="mt-1 text-xs" style={{ color: C.textTertiary }}>
                  {formatDateTime(row.paidAt ?? row.createdAt)}
                </p>
              </div>
              <p className="shrink-0 text-base font-semibold tabular-nums" style={{ color: C.textPrimary }}>
                {formatFeeAmount(row.amountCents)}
              </p>
            </div>

            <div
              className="mt-3 space-y-2 rounded-md px-3 py-2.5"
              style={{ backgroundColor: C.elevated }}
            >
              <DetailRow
                label="Family paid"
                value={formatFeeAmount(chargedAmount)}
                C={C}
                emphasize
              />
              {row.processingFeeCents ? (
                <DetailRow
                  label="Processing fee"
                  value={`+${formatFeeAmount(row.processingFeeCents)}`}
                  C={C}
                />
              ) : null}
              <DetailRow label="Method" value={methodLabel} C={C} />
              <DetailRow
                label="Type"
                value={PAYMENT_TYPE_LABELS[row.paymentType]}
                C={C}
              />
            </div>
          </div>
        </div>
      </div>

      {showConnector ? (
        <div className="flex gap-3">
          <div className="flex w-7 shrink-0 justify-center">
            <div
              className="min-h-5 w-px"
              style={{ backgroundColor: C.border }}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default function SubmissionPaymentsPanel({
  applicationId,
  branding,
}: SubmissionPaymentsPanelProps) {
  const C = useMemo(() => buildAdminThemeTokens(branding), [branding]);
  const supabase = createClient();
  const [rows, setRows] = useState<PaymentRecordDisplayRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRows = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listApplicationPayments(supabase, applicationId);
      setRows(data);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Failed to load payment history.",
      );
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [applicationId, supabase]);

  useEffect(() => {
    queueMicrotask(() => {
      void loadRows();
    });
  }, [loadRows]);

  const sortedRows = useMemo(
    () => [...rows].sort((a, b) => paymentTimestamp(b) - paymentTimestamp(a)),
    [rows],
  );

  const summary = useMemo(() => summarizePaymentRows(rows), [rows]);
  const collectedCents = summary.applicationFeeCents + summary.enrollmentCents;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-5 w-5 animate-spin" style={{ color: C.textTertiary }} />
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-sm" style={{ color: C.error }}>
        {error}
      </p>
    );
  }

  if (sortedRows.length === 0) {
    return (
      <div className="flex flex-col items-center py-12 text-center">
        <div
          className="mb-4 flex h-12 w-12 items-center justify-center rounded-full"
          style={{ backgroundColor: C.accentGlow, color: C.accent }}
        >
          <CreditCard className="h-5 w-5" aria-hidden />
        </div>
        <p className="text-sm font-semibold" style={{ color: C.textPrimary }}>
          No payments yet for this application
        </p>
        <p className="mt-1 max-w-xs text-xs leading-relaxed" style={{ color: C.textTertiary }}>
          Application and enrollment fees will appear here once families pay.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        <SummaryPill
          label="Collected"
          value={formatFeeAmount(collectedCents)}
          C={C}
        />
        <SummaryPill
          label="Payments"
          value={String(rows.length)}
          C={C}
        />
        {summary.pendingCount > 0 ? (
          <SummaryPill
            label="Pending"
            value={`${formatFeeAmount(summary.pendingCents)} · ${summary.pendingCount}`}
            C={C}
            tone="pending"
          />
        ) : null}
      </div>

      <div className="space-y-0">
        {sortedRows.map((row, index) => (
          <PaymentTimelineEntry
            key={row.id}
            row={row}
            C={C}
            showConnector={index < sortedRows.length - 1}
          />
        ))}
      </div>
    </div>
  );
}
