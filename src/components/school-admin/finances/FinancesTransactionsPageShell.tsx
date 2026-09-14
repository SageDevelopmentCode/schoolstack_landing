"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { CreditCard, Loader2 } from "lucide-react";
import { useSchoolAdminStoryTheme } from "@/components/school-admin/SchoolAdminStoryShell";
import { SchoolAdminTableSkeleton } from "@/components/school-admin/skeletons";
import AdminButton from "@/components/school-admin/ui/story/AdminButton";
import AdminCard from "@/components/school-admin/ui/story/AdminCard";
import AdminChip from "@/components/school-admin/ui/story/AdminChip";
import AdminMetricCard from "@/components/school-admin/ui/story/AdminMetricCard";
import type { FinancesTransactionsApiResponse } from "@/app/api/school-admin/finances/transactions/route";
import { formatFeeAmount } from "@/lib/admissions/application-form-schema";
import {
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_LABELS,
  PAYMENT_TYPE_LABELS,
  TRANSACTIONS_PAGE_DEFAULT_SIZE,
  type PaymentRecordDisplayRow,
} from "@/lib/admissions/payment-records";
import { paymentStatusChipTone } from "@/lib/admissions/payment-status-ui";
import type { PaymentStatus, PaymentType } from "@/lib/stripe/application-payments";
import { reportPortalOperationalError } from "@/lib/portal-operational-errors";
import type { TransactionsPageMeta } from "@/lib/school-admin/transactions-page-meta";
import {
  clearAttentionDismiss,
  dismissAttention,
  readDismissedAttention,
  type TransactionsAttentionVariant,
} from "@/lib/school-admin/transactions-attention-dismiss";

type FinancesTransactionsPageShellProps = {
  organizationId: string;
  slug: string;
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

function StoryFilterPill({
  active,
  label,
  count,
  onClick,
  theme,
}: {
  active: boolean;
  label: string;
  count?: number;
  onClick: () => void;
  theme: ReturnType<typeof useSchoolAdminStoryTheme>["theme"];
}) {
  const displayLabel = count != null ? `${label} · ${count}` : label;

  return (
    <button
      type="button"
      onClick={onClick}
      className="cursor-pointer rounded-[9px] border px-2.5 py-2 text-[11px] font-medium transition-colors"
      style={
        active
          ? {
              backgroundColor: "#E9F2EA",
              color: theme.primary,
              borderColor: "#BCD4C1",
              fontWeight: 700,
            }
          : {
              backgroundColor: theme.white,
              color: "#5D6D73",
              borderColor: "#DCE4DC",
            }
      }
    >
      {displayLabel}
    </button>
  );
}

function formatDateTime(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function FinancesTransactionsPageShell({
  organizationId,
  slug,
}: FinancesTransactionsPageShellProps) {
  const { theme, C } = useSchoolAdminStoryTheme();

  const [rows, setRows] = useState<PaymentRecordDisplayRow[]>([]);
  const [meta, setMeta] = useState<TransactionsPageMeta | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isRefetching, setIsRefetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<"" | PaymentStatus>("");
  const [typeFilter, setTypeFilter] = useState<"" | PaymentType>("");
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [dismissedAttention, setDismissedAttention] = useState<
    Partial<Record<TransactionsAttentionVariant, boolean>>
  >({});
  const rowsLengthRef = useRef(0);
  const metaRef = useRef<TransactionsPageMeta | null>(null);

  useEffect(() => {
    rowsLengthRef.current = rows.length;
  }, [rows.length]);

  useEffect(() => {
    metaRef.current = meta;
  }, [meta]);

  const fetchTransactionsPage = useCallback(
    async ({
      offset,
      append,
      includeMeta,
    }: {
      offset: number;
      append: boolean;
      includeMeta?: boolean;
    }) => {
      const params = new URLSearchParams({
        organizationId,
        offset: String(offset),
        limit: String(TRANSACTIONS_PAGE_DEFAULT_SIZE),
      });
      if (statusFilter) params.set("status", statusFilter);
      if (typeFilter) params.set("paymentType", typeFilter);
      if (includeMeta) params.set("includeMeta", "1");

      const response = await fetch(
        `/api/school-admin/finances/transactions?${params.toString()}`,
      );
      if (!response.ok) {
        throw new Error("Failed to load transactions.");
      }

      const body = (await response.json()) as FinancesTransactionsApiResponse;

      if (body.meta) {
        setMeta(body.meta);
      }

      if (append) {
        setRows((prev) => [...prev, ...body.rows]);
      } else {
        setRows(body.rows);
      }
      setTotalCount(body.totalCount);
      setHasMore(body.hasMore);
    },
    [organizationId, statusFilter, typeFilter],
  );

  const loadTransactions = useCallback(
    async ({ append = false }: { append?: boolean } = {}) => {
      const requestOffset = append ? rowsLengthRef.current : 0;

      if (append) {
        setLoadingMore(true);
      } else if (rowsLengthRef.current > 0) {
        setIsRefetching(true);
      } else {
        setLoading(true);
      }
      setError(null);

      try {
        await fetchTransactionsPage({
          offset: requestOffset,
          append,
          includeMeta: requestOffset === 0 && !metaRef.current,
        });
      } catch (loadError) {
        void reportPortalOperationalError(
          "school_admin",
          {
            organizationId,
            operation: append
              ? "finances.transactions.load_more"
              : "finances.transactions.load",
            error: "",
          },
          loadError,
        );
        const message =
          loadError instanceof Error
            ? loadError.message
            : "Failed to load payment history.";
        if (!append && rowsLengthRef.current === 0) {
          setError(message);
          setRows([]);
        }
      } finally {
        setLoading(false);
        setIsRefetching(false);
        setLoadingMore(false);
      }
    },
    [fetchTransactionsPage, organizationId],
  );

  useEffect(() => {
    queueMicrotask(() => {
      void loadTransactions();
    });
  }, [loadTransactions]);

  useEffect(() => {
    setDismissedAttention(readDismissedAttention(organizationId));
    setMeta(null);
    metaRef.current = null;
  }, [organizationId]);

  const summary = meta?.summary ?? {
    collectedThisMonthCents: 0,
    collectedYtdCents: 0,
    pendingCount: 0,
    pendingCents: 0,
    failedCount: 0,
    refundedCount: 0,
    refundedCents: 0,
    applicationFeeCents: 0,
    enrollmentCents: 0,
    tuitionCents: 0,
  };

  useEffect(() => {
    if (loading) return;
    if (summary.failedCount === 0) {
      clearAttentionDismiss(organizationId, "failed");
      setDismissedAttention((current) => {
        if (!current.failed) return current;
        const next = { ...current };
        delete next.failed;
        return next;
      });
    }
  }, [loading, organizationId, summary.failedCount]);

  useEffect(() => {
    if (loading) return;
    if (summary.pendingCount === 0) {
      clearAttentionDismiss(organizationId, "pending");
      setDismissedAttention((current) => {
        if (!current.pending) return current;
        const next = { ...current };
        delete next.pending;
        return next;
      });
    }
  }, [loading, organizationId, summary.pendingCount]);

  const statusCounts = meta?.statusCounts ?? {};
  const typeCounts = meta?.typeCounts ?? {};
  const metaTotalCount = meta?.totalCount ?? 0;

  const showMetrics = metaTotalCount > 0;
  const hasFilters = Boolean(statusFilter || typeFilter);

  const pendingValue =
    summary.pendingCount > 0
      ? `${summary.pendingCount} · ${formatFeeAmount(summary.pendingCents)}`
      : "0";
  const refundedValue =
    summary.refundedCount > 0
      ? `${summary.refundedCount} · ${formatFeeAmount(summary.refundedCents)}`
      : "0";

  const attentionVariant = useMemo((): TransactionsAttentionVariant | null => {
    if (summary.failedCount > 0) return "failed";
    if (summary.pendingCount > 0) return "pending";
    return null;
  }, [summary.failedCount, summary.pendingCount]);

  const attentionBanner = useMemo(() => {
    if (attentionVariant === "failed") {
      return {
        variant: attentionVariant,
        message: `Needs attention: ${summary.failedCount} payment${summary.failedCount === 1 ? "" : "s"} failed and may need follow-up.`,
        cta: "View failed →",
        onClick: () => setStatusFilter("failed"),
      };
    }
    if (attentionVariant === "pending") {
      return {
        variant: attentionVariant,
        message: `Needs attention: ${summary.pendingCount} payment${summary.pendingCount === 1 ? " is" : "s are"} still pending.`,
        cta: "View pending →",
        onClick: () => setStatusFilter("pending"),
      };
    }
    return null;
  }, [attentionVariant, summary.failedCount, summary.pendingCount]);

  const showAttentionBanner =
    attentionBanner != null && !dismissedAttention[attentionBanner.variant];

  const handleDismissAttention = useCallback(() => {
    if (!attentionBanner) return;
    dismissAttention(organizationId, attentionBanner.variant);
    setDismissedAttention((current) => ({
      ...current,
      [attentionBanner.variant]: true,
    }));
  }, [attentionBanner, organizationId]);

  const tableContent = loading ? (
    <SchoolAdminTableSkeleton
      C={C}
      rows={8}
      columns={8}
      showFilters={false}
      compact
      label="Loading transactions"
    />
  ) : error ? (
    <p className="px-5 py-8 text-sm" style={{ color: theme.alert }}>
      {error}
    </p>
  ) : rows.length === 0 ? (
    <div className="flex flex-col items-center px-5 py-16 text-center">
      {metaTotalCount === 0 ? (
        <>
          <div
            className="mb-4 flex h-14 w-14 items-center justify-center rounded-full"
            style={{ backgroundColor: "#E9F2EA", color: theme.primary }}
          >
            <CreditCard className="h-6 w-6" aria-hidden />
          </div>
          <p
            className="font-heading text-base font-semibold"
            style={{ fontFamily: theme.fontDisplay, color: theme.ink }}
          >
            No payments yet
          </p>
          <p className="mt-2 max-w-sm text-sm" style={{ color: theme.muted }}>
            When families pay application, enrollment, or tuition fees, they will appear here.
          </p>
        </>
      ) : (
        <p className="text-sm" style={{ color: theme.muted }}>
          {hasFilters
            ? "No payments match the current filters."
            : "No payments recorded yet."}
        </p>
      )}
    </div>
  ) : (
    <div className="overflow-auto">
      <table className="w-full min-w-[960px] border-collapse text-left text-sm">
        <thead style={{ backgroundColor: "#FBFCFB", borderBottom: "1px solid #EDF1ED" }}>
          <tr>
            {[
              "Date",
              "Payment",
              "Payer",
              "Type",
              "Method",
              "Amount",
              "Status",
              "Application",
            ].map((heading) => (
              <th
                key={heading}
                className="px-4 py-3 text-[10px] font-extrabold uppercase tracking-[0.08em] first:pl-5 last:pr-5"
                style={{ color: "#8B9699" }}
              >
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.id}
              onMouseEnter={() => setHoveredId(row.id)}
              onMouseLeave={() => setHoveredId(null)}
              className="transition-colors"
              style={{
                backgroundColor: hoveredId === row.id ? "#FAFCFA" : "transparent",
                borderBottom: "1px solid #EDF1ED",
              }}
            >
              <td
                className="px-4 py-3 whitespace-nowrap pl-5 text-xs"
                style={{ color: theme.ink }}
              >
                {formatDateTime(row.paidAt ?? row.createdAt)}
              </td>
              <td className="px-4 py-3 text-xs font-semibold" style={{ color: "#2C3E43" }}>
                {row.label ?? PAYMENT_TYPE_LABELS[row.paymentType]}
              </td>
              <td className="px-4 py-3 text-[11px]" style={{ color: theme.muted }}>
                {row.payerEmail ?? row.applicantLabel ?? "—"}
              </td>
              <td className="px-4 py-3">
                <AdminChip theme={theme} tone="info">
                  {PAYMENT_TYPE_LABELS[row.paymentType]}
                </AdminChip>
              </td>
              <td className="px-4 py-3 text-xs" style={{ color: theme.muted }}>
                {row.paymentMethodType
                  ? PAYMENT_METHOD_LABELS[row.paymentMethodType]
                  : "—"}
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <span className="text-xs font-semibold tabular-nums" style={{ color: theme.ink }}>
                  {formatFeeAmount(row.amountCents)}
                </span>
                <p className="text-[10px] tabular-nums" style={{ color: theme.muted }}>
                  Charged {formatFeeAmount(row.chargedAmountCents ?? row.amountCents)}
                  {row.processingFeeCents
                    ? ` (+${formatFeeAmount(row.processingFeeCents)} fee)`
                    : ""}
                </p>
              </td>
              <td className="px-4 py-3">
                <AdminChip theme={theme} tone={paymentStatusChipTone(row.status)}>
                  {PAYMENT_STATUS_LABELS[row.status]}
                </AdminChip>
              </td>
              <td className="px-4 py-3 pr-5">
                {row.applicationId ? (
                  <Link
                    href={`/school/${slug}/admin/admissions/submissions?application=${row.applicationId}`}
                    className="text-[11px] font-semibold underline-offset-2 hover:underline"
                    style={{ color: theme.primary }}
                  >
                    {row.applicantLabel ?? "View application"}
                  </Link>
                ) : (
                  <span className="text-[11px]" style={{ color: theme.muted }}>—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="relative flex h-full min-h-0 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[1350px] px-[clamp(25px,4vw,56px)] py-[30px] pb-14">
          {showMetrics ? (
            <>
              <div className="mb-[19px] grid grid-cols-1 gap-[13px] sm:grid-cols-2 xl:grid-cols-4">
                <AdminMetricCard
                  theme={theme}
                  value={formatFeeAmount(summary.collectedThisMonthCents)}
                  label="Collected this month"
                  accent="forest"
                />
                <AdminMetricCard
                  theme={theme}
                  value={pendingValue}
                  label="Pending"
                  accent="gold"
                  onClick={() => setStatusFilter("pending")}
                />
                <AdminMetricCard
                  theme={theme}
                  value={String(summary.failedCount)}
                  label="Failed"
                  accent="berry"
                  onClick={() => setStatusFilter("failed")}
                />
                <AdminMetricCard
                  theme={theme}
                  value={refundedValue}
                  label="Refunded"
                  accent="sky"
                  onClick={() => setStatusFilter("refunded")}
                />
              </div>

              {showAttentionBanner && attentionBanner ? (
                <div
                  className="mb-[15px] flex flex-col items-start justify-between gap-3 rounded-[12px] border px-4 py-3.5 sm:flex-row sm:items-center"
                  style={{
                    backgroundColor: "#EAF4EB",
                    borderColor: "#C7DFCB",
                    color: "#42694F",
                  }}
                >
                  <span className="text-xs">{attentionBanner.message}</span>
                  <div className="flex flex-wrap items-center gap-3">
                    <AdminButton
                      theme={theme}
                      variant="soft"
                      onClick={attentionBanner.onClick}
                    >
                      {attentionBanner.cta}
                    </AdminButton>
                    <button
                      type="button"
                      className="text-xs"
                      style={{ color: "#5D7A63" }}
                      aria-label="Dismiss payment alert"
                      onClick={handleDismissAttention}
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              ) : null}
            </>
          ) : null}

          <div className="mb-[15px] flex flex-wrap items-center gap-2">
            {loading || isRefetching ? (
              <Loader2
                className="h-3.5 w-3.5 animate-spin"
                style={{ color: theme.primary }}
                aria-label="Loading transactions"
              />
            ) : null}
            {STATUS_FILTERS.map((filter) => (
              <StoryFilterPill
                key={filter.value || "all-status"}
                active={statusFilter === filter.value}
                label={filter.label}
                count={
                  filter.value ? statusCounts[filter.value] : metaTotalCount
                }
                onClick={() => setStatusFilter(filter.value)}
                theme={theme}
              />
            ))}
          </div>

          <div className="mb-[15px] flex flex-wrap items-center gap-2">
            {TYPE_FILTERS.map((filter) => (
              <StoryFilterPill
                key={filter.value || "all-type"}
                active={typeFilter === filter.value}
                label={filter.label}
                count={
                  filter.value ? typeCounts[filter.value] : metaTotalCount
                }
                onClick={() => setTypeFilter(filter.value)}
                theme={theme}
              />
            ))}
          </div>

          <AdminCard theme={theme} padding="none">
            {tableContent}
            {hasMore && !loading && !error ? (
              <div className="border-t px-5 py-4 text-center" style={{ borderColor: "#EDF1ED" }}>
                <button
                  type="button"
                  className="text-xs font-semibold"
                  style={{ color: theme.primary }}
                  disabled={loadingMore}
                  onClick={() => void loadTransactions({ append: true })}
                >
                  {loadingMore
                    ? "Loading more..."
                    : `Show more (${totalCount - rows.length} remaining) →`}
                </button>
              </div>
            ) : null}
          </AdminCard>
        </div>
      </div>
    </div>
  );
}
