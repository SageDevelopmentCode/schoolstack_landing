"use client";

import { useCallback, useEffect, useMemo, useState, type CSSProperties } from "react";
import Link from "next/link";
import { CreditCard } from "lucide-react";
import {
  SchoolAdminSummaryCardsSkeleton,
  SchoolAdminTableSkeleton,
} from "@/components/school-admin/skeletons";
import { formatFeeAmount } from "@/lib/admissions/application-form-schema";
import {
  listApplicationPayments,
  listOrganizationPayments,
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_LABELS,
  PAYMENT_TYPE_LABELS,
  summarizePaymentRows,
  type PaymentRecordDisplayRow,
} from "@/lib/admissions/payment-records";
import type { PaymentStatus, PaymentType } from "@/lib/stripe/application-payments";
import PaymentLedgerSummaryCards from "@/components/school-admin/finances/PaymentLedgerSummaryCards";
import { BuilderSectionIntro } from "@/components/school-admin/admissions/builder-question-card";
import {
  buildAdminThemeTokens,
  type AdminThemeTokens,
} from "@/lib/organization-settings/theme";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import {
  parseOperationalError,
  reportClientOperationalError,
} from "@/lib/operational-errors-client";
import { createClient } from "@/utils/supabase/client";

type PaymentsHistoryPanelMode = "admissions" | "revenue" | "transactions";

type PaymentsHistoryPanelProps = {
  organizationId?: string;
  applicationId?: string;
  orgSlug?: string;
  branding: OrganizationBranding;
  showOrganizationColumn?: boolean;
  mode?: PaymentsHistoryPanelMode;
  isReady?: boolean;
  onSwitchToSetup?: () => void;
};

const STATUS_FILTERS: Array<{ value: "" | PaymentStatus; label: string }> = [
  { value: "", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "succeeded", label: "Succeeded" },
  { value: "failed", label: "Failed" },
  { value: "refunded", label: "Refunded" },
];

const TYPE_FILTERS: Array<{ value: "" | PaymentType; label: string }> = [
  { value: "", label: "All" },
  { value: "application_fee", label: "Application fee" },
  { value: "enrollment_checklist", label: "Enrollment" },
  { value: "tuition", label: "Tuition" },
];

function formatDateTime(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function columnDividerStyle(C: AdminThemeTokens, isLast: boolean): CSSProperties {
  return isLast ? {} : { borderRight: `1px solid ${C.border}` };
}

function paymentColumnHeaderBadgeStyle(
  heading: string,
  C: AdminThemeTokens,
): CSSProperties {
  switch (heading) {
    case "Status":
      return { backgroundColor: C.accentLight, color: C.accent };
    case "Type":
      return { backgroundColor: C.infoBg, color: C.info };
    case "Method":
      return { backgroundColor: C.warningBg, color: C.warning };
    default:
      return {
        backgroundColor: C.bg,
        color: C.textTertiary,
        border: `1px solid ${C.border}`,
      };
  }
}

function statusStyle(status: PaymentStatus, C: ReturnType<typeof buildAdminThemeTokens>) {
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

function FilterChip({
  active,
  label,
  count,
  onClick,
  C,
}: {
  active: boolean;
  label: string;
  count?: number;
  onClick: () => void;
  C: ReturnType<typeof buildAdminThemeTokens>;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors"
      style={{
        backgroundColor: active ? C.accentLight : C.elevated,
        color: active ? C.accent : C.textSecondary,
        border: `1px solid ${active ? C.accent : C.border}`,
      }}
    >
      {label}
      {count != null ? (
        <span
          className="rounded-full px-1.5 py-0.5 text-[10px] font-semibold"
          style={{
            backgroundColor: active ? C.surface : C.bg,
            color: active ? C.accent : C.textTertiary,
          }}
        >
          {count}
        </span>
      ) : null}
    </button>
  );
}

function PaymentsEmptyState({
  C,
  hasFilters,
  isReady,
  onSwitchToSetup,
}: {
  C: AdminThemeTokens;
  hasFilters: boolean;
  isReady?: boolean;
  onSwitchToSetup?: () => void;
}) {
  if (hasFilters) {
    return (
      <p className="px-4 py-8 text-sm sm:px-5" style={{ color: C.textSecondary }}>
        No payments match the current filters.
      </p>
    );
  }

  return (
    <div className="flex flex-col items-center px-4 py-16 text-center sm:px-5">
      <div
        className="mb-4 flex h-14 w-14 items-center justify-center rounded-full"
        style={{ backgroundColor: C.accentGlow, color: C.accent }}
      >
        <CreditCard className="h-6 w-6" aria-hidden />
      </div>
      <p className="text-base font-semibold" style={{ color: C.textPrimary }}>
        No payments yet
      </p>
      <p className="mt-2 max-w-sm text-sm" style={{ color: C.textTertiary }}>
        {isReady
          ? "When families pay application or enrollment fees, they'll appear here."
          : "Connect Stripe on the Setup tab to start collecting fees from families."}
      </p>
      {!isReady && onSwitchToSetup ? (
        <button
          type="button"
          onClick={onSwitchToSetup}
          className="mt-4 text-sm font-medium underline-offset-2 hover:underline"
          style={{ color: C.accent }}
        >
          Go to Setup
        </button>
      ) : null}
    </div>
  );
}

export default function PaymentsHistoryPanel({
  organizationId,
  applicationId,
  orgSlug,
  branding,
  showOrganizationColumn = false,
  mode = "admissions",
  isReady,
  onSwitchToSetup,
}: PaymentsHistoryPanelProps) {
  const C = useMemo(() => buildAdminThemeTokens(branding), [branding]);
  const supabase = createClient();
  const useClientSideFilters =
    Boolean(applicationId) || mode === "revenue" || mode === "transactions";
  const [rows, setRows] = useState<PaymentRecordDisplayRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<"" | PaymentStatus>(() =>
    mode === "revenue" ? "succeeded" : "",
  );
  const [typeFilter, setTypeFilter] = useState<"" | PaymentType>("");
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const loadRows = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let data: PaymentRecordDisplayRow[];
      if (applicationId) {
        data = await listApplicationPayments(supabase, applicationId);
      } else if (organizationId) {
        data = await listOrganizationPayments(
          supabase,
          organizationId,
          useClientSideFilters
            ? {}
            : {
                status: statusFilter || undefined,
                paymentType: typeFilter || undefined,
              },
        );
      } else {
        data = [];
      }
      setRows(data);
    } catch (loadError) {
      const parsed = parseOperationalError(loadError);
      setError(
        parsed.message === "Unknown error"
          ? "Failed to load payment history."
          : parsed.message,
      );
      setRows([]);
      if (organizationId) {
        void reportClientOperationalError({
          organizationId,
          operation:
            mode === "admissions"
              ? "payments.history.load"
              : `finances.${mode}.load`,
          error: parsed.message,
          code: parsed.code,
          details: parsed.details,
        });
      }
    } finally {
      setLoading(false);
    }
  }, [
    applicationId,
    mode,
    organizationId,
    supabase,
    useClientSideFilters,
    statusFilter,
    typeFilter,
  ]);

  useEffect(() => {
    queueMicrotask(() => {
      void loadRows();
    });
  }, [loadRows]);

  const filteredRows = useMemo(() => {
    if (useClientSideFilters) {
      return rows.filter((row) => {
        if (statusFilter && row.status !== statusFilter) return false;
        if (typeFilter && row.paymentType !== typeFilter) return false;
        return true;
      });
    }
    return rows;
  }, [rows, statusFilter, typeFilter, useClientSideFilters]);

  const summary = useMemo(() => summarizePaymentRows(rows), [rows]);

  const statusCounts = useMemo(() => {
    const counts: Partial<Record<PaymentStatus, number>> = {};
    for (const row of rows) {
      counts[row.status] = (counts[row.status] ?? 0) + 1;
    }
    return counts;
  }, [rows]);

  const typeCounts = useMemo(() => {
    const counts: Partial<Record<PaymentType, number>> = {};
    for (const row of rows) {
      counts[row.paymentType] = (counts[row.paymentType] ?? 0) + 1;
    }
    return counts;
  }, [rows]);

  const columnHeadings = useMemo(() => {
    const headings = [
      "Date",
      "Label",
      "Type",
      "School amount",
      "Charged",
      "Method",
      "Status",
      "Payer",
    ];
    if (showOrganizationColumn) headings.push("School");
    if (!applicationId) headings.push("Application");
    return headings;
  }, [applicationId, showOrganizationColumn]);

  const filters = !applicationId ? (
    <div
      className="flex flex-shrink-0 flex-wrap items-center gap-x-2 gap-y-2 px-4 py-3 sm:px-5"
      style={{ borderBottom: `1px solid ${C.border}` }}
    >
      <span
        className="text-[11px] font-semibold uppercase tracking-wide"
        style={{ color: C.accentDark }}
      >
        Status
      </span>
      {STATUS_FILTERS.map((filter) => (
        <FilterChip
          key={filter.value || "all-status"}
          active={statusFilter === filter.value}
          label={filter.label}
          count={
            filter.value
              ? statusCounts[filter.value]
              : rows.length
          }
          onClick={() => setStatusFilter(filter.value)}
          C={C}
        />
      ))}
      <span
        className="mx-1 hidden text-xs sm:inline"
        style={{ color: C.textTertiary }}
        aria-hidden
      >
        |
      </span>
      <span
        className="text-[11px] font-semibold uppercase tracking-wide"
        style={{ color: C.accentDark }}
      >
        Type
      </span>
      {TYPE_FILTERS.map((filter) => (
        <FilterChip
          key={filter.value || "all-type"}
          active={typeFilter === filter.value}
          label={filter.label}
          count={
            filter.value
              ? typeCounts[filter.value]
              : rows.length
          }
          onClick={() => setTypeFilter(filter.value)}
          C={C}
        />
      ))}
    </div>
  ) : null;

  const tableContent = loading ? (
    <SchoolAdminTableSkeleton
      C={C}
      rows={8}
      columns={columnHeadings.length}
      showFilters={!applicationId}
      label="Loading payments"
    />
  ) : error ? (
    <p className="px-4 py-8 text-sm sm:px-5" style={{ color: C.error }}>
      {error}
    </p>
  ) : filteredRows.length === 0 ? (
    mode === "admissions" && !applicationId ? (
      <PaymentsEmptyState
        C={C}
        hasFilters={rows.length > 0}
        isReady={isReady}
        onSwitchToSetup={onSwitchToSetup}
      />
    ) : (
      <p className="px-4 py-8 text-sm sm:px-5" style={{ color: C.textSecondary }}>
        {rows.length === 0
          ? "No payments recorded yet."
          : "No payments match the current filters."}
      </p>
    )
  ) : (
    <div className="h-full overflow-auto" style={{ backgroundColor: C.surface }}>
      <table className="w-full min-w-[960px] border-collapse text-left text-sm">
        <thead
          className="sticky top-0 z-[1]"
          style={{
            backgroundColor: C.surface,
            borderBottom: `2px solid ${C.border}`,
          }}
        >
          <tr>
            {columnHeadings.map((heading, index) => {
              const isLast = index === columnHeadings.length - 1;
              return (
                <th
                  key={heading}
                  className="px-3 py-2.5 sm:px-4"
                  style={columnDividerStyle(C, isLast)}
                >
                  <span
                    className="inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
                    style={paymentColumnHeaderBadgeStyle(heading, C)}
                  >
                    {heading}
                  </span>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {filteredRows.map((row) => (
            <tr
              key={row.id}
              onMouseEnter={() => setHoveredId(row.id)}
              onMouseLeave={() => setHoveredId(null)}
              className="transition-colors"
              style={{
                backgroundColor:
                  hoveredId === row.id ? C.accentLight : C.surface,
                borderBottom: `1px solid ${C.border}`,
              }}
            >
              <td
                className="px-3 py-3 whitespace-nowrap sm:px-4"
                style={{ color: C.textPrimary, ...columnDividerStyle(C, false) }}
              >
                {formatDateTime(row.paidAt ?? row.createdAt)}
              </td>
              <td
                className="px-3 py-3 sm:px-4"
                style={{ color: C.textPrimary, ...columnDividerStyle(C, false) }}
              >
                {row.label ?? "Payment"}
              </td>
              <td
                className="px-3 py-3 whitespace-nowrap sm:px-4"
                style={{ color: C.textSecondary, ...columnDividerStyle(C, false) }}
              >
                {PAYMENT_TYPE_LABELS[row.paymentType]}
              </td>
              <td
                className="px-3 py-3 whitespace-nowrap font-medium sm:px-4"
                style={{ color: C.textPrimary, ...columnDividerStyle(C, false) }}
              >
                {formatFeeAmount(row.amountCents)}
              </td>
              <td
                className="px-3 py-3 whitespace-nowrap sm:px-4"
                style={{ color: C.textPrimary, ...columnDividerStyle(C, false) }}
              >
                {formatFeeAmount(row.chargedAmountCents ?? row.amountCents)}
                {row.processingFeeCents ? (
                  <p className="text-xs" style={{ color: C.textTertiary }}>
                    +{formatFeeAmount(row.processingFeeCents)} fee
                  </p>
                ) : null}
              </td>
              <td
                className="px-3 py-3 whitespace-nowrap sm:px-4"
                style={{ color: C.textSecondary, ...columnDividerStyle(C, false) }}
              >
                {row.paymentMethodType
                  ? PAYMENT_METHOD_LABELS[row.paymentMethodType]
                  : "—"}
              </td>
              <td
                className="px-3 py-3 sm:px-4"
                style={columnDividerStyle(C, false)}
              >
                <span
                  className="rounded-full px-2 py-0.5 text-xs font-medium"
                  style={statusStyle(row.status, C)}
                >
                  {PAYMENT_STATUS_LABELS[row.status]}
                </span>
              </td>
              <td
                className="px-3 py-3 sm:px-4"
                style={{ color: C.textSecondary, ...columnDividerStyle(C, false) }}
              >
                {row.payerEmail ?? row.applicantLabel ?? "—"}
              </td>
              {showOrganizationColumn ? (
                <td
                  className="px-3 py-3 sm:px-4"
                  style={{ color: C.textSecondary, ...columnDividerStyle(C, false) }}
                >
                  {row.organizationName ?? "—"}
                </td>
              ) : null}
              {!applicationId && orgSlug ? (
                <td className="px-3 py-3 sm:px-4">
                  <Link
                    href={`/school/${orgSlug}/admin/admissions/submissions?application=${row.applicationId}`}
                    className="underline-offset-2 hover:underline"
                    style={{ color: C.accent }}
                  >
                    {row.applicantLabel ?? "View application"}
                  </Link>
                </td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="flex h-full min-h-0 flex-col overflow-y-auto">
      {mode === "admissions" && !applicationId ? (
        <div className="flex-shrink-0 px-4 pt-5 sm:px-5">
          <BuilderSectionIntro
            C={C}
            eyebrow="Payments"
            title="Payment history"
            subtitle="Application and enrollment fees collected through Stripe"
          />
        </div>
      ) : null}
      {loading ? (
        <SchoolAdminSummaryCardsSkeleton C={C} />
      ) : (
        <PaymentLedgerSummaryCards
          summary={summary}
          branding={branding}
          mode={mode}
        />
      )}
      {!loading ? filters : null}
      <div className="relative min-h-0 flex-1 overflow-hidden">
        {tableContent}
      </div>
    </div>
  );
}
