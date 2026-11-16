"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { FinancesTransactionsApiResponse } from "@/app/api/school-admin/finances/transactions/route";
import {
  TRANSACTIONS_PAGE_DEFAULT_SIZE,
  type PaymentRecordDisplayRow,
  type PaymentRowsSummary,
} from "@/lib/admissions/payment-records";
import type { PaymentStatus, PaymentType } from "@/lib/stripe/application-payments";
import { reportPortalOperationalError } from "@/lib/portal-operational-errors";
import type { TransactionsPageMeta } from "@/lib/school-admin/transactions-page-meta";
import {
  clearAttentionDismiss,
  dismissAttention as persistDismissAttention,
  readDismissedAttention,
  type TransactionsAttentionVariant,
} from "@/lib/school-admin/transactions-attention-dismiss";

export const TRANSACTION_STATUS_FILTERS: Array<{ value: "" | PaymentStatus; label: string }> = [
  { value: "", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "succeeded", label: "Succeeded" },
  { value: "failed", label: "Failed" },
  { value: "refunded", label: "Refunded" },
];

export const TRANSACTION_TYPE_FILTERS: Array<{ value: "" | PaymentType; label: string }> = [
  { value: "", label: "All" },
  { value: "application_fee", label: "Application fee" },
  { value: "enrollment_checklist", label: "Enrollment" },
  { value: "tuition", label: "Tuition" },
];

const STATUS_VALUES = new Set<string>(["pending", "succeeded", "failed", "refunded"]);
const TYPE_VALUES = new Set<string>(["application_fee", "enrollment_checklist", "tuition"]);

export function parseStatusParam(value: string | null | undefined): "" | PaymentStatus {
  return value && STATUS_VALUES.has(value) ? (value as PaymentStatus) : "";
}

export function parseTypeParam(value: string | null | undefined): "" | PaymentType {
  return value && TYPE_VALUES.has(value) ? (value as PaymentType) : "";
}

/**
 * Replace query params in place (filters are view state, so no history entry
 * and no server round-trip). `null` removes a param.
 */
export function writeFilterParams(values: Record<string, string | null | "">) {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  for (const [key, value] of Object.entries(values)) {
    if (value) url.searchParams.set(key, value);
    else url.searchParams.delete(key);
  }
  window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`);
}

const EMPTY_SUMMARY: PaymentRowsSummary = {
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

/** "ok" = applied, "error" = failed, "stale" = a newer request replaced it. */
export type TransactionsLoadResult = "ok" | "error" | "stale";

type LoadMode = "initial" | "filter" | "more" | "refresh";

/**
 * Finances → Transactions state: server-paginated payment ledger with status
 * and type filters, summary meta and the "needs attention" banner. All
 * fetching lives here; the Garden page only renders it.
 */
export function useFinancesTransactionsModel({ organizationId }: { organizationId: string }) {
  const searchParams = useSearchParams();
  const urlStatus = parseStatusParam(searchParams?.get("status"));
  const urlType = parseTypeParam(searchParams?.get("type"));

  const [loadedRows, setLoadedRows] = useState<PaymentRecordDisplayRow[]>([]);
  const [meta, setMeta] = useState<TransactionsPageMeta | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isRefetching, setIsRefetching] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadedAt, setLoadedAt] = useState(() => Date.now());
  const [statusFilter, setStatusFilter] = useState<"" | PaymentStatus>(urlStatus);
  const [typeFilter, setTypeFilter] = useState<"" | PaymentType>(urlType);
  const [dismissedAttention, setDismissedAttention] = useState<
    Partial<Record<TransactionsAttentionVariant, boolean>>
  >(() => readDismissedAttention(organizationId));
  const [trackedOrganizationId, setTrackedOrganizationId] = useState(organizationId);

  const loadedRowsLengthRef = useRef(0);
  const metaRef = useRef<TransactionsPageMeta | null>(null);
  const statusFilterRef = useRef(statusFilter);
  const typeFilterRef = useRef(typeFilter);
  /** Filters that produced the rows currently on screen (last successful non-append load). */
  const appliedFiltersRef = useRef<{ status: "" | PaymentStatus; type: "" | PaymentType }>({
    status: urlStatus,
    type: urlType,
  });
  const requestRef = useRef(0);
  /** Latest applied response, readable right after an awaited load (toasts). */
  const snapshotRef = useRef<{ totalCount: number; meta: TransactionsPageMeta | null }>({
    totalCount: 0,
    meta: null,
  });

  if (organizationId !== trackedOrganizationId) {
    setTrackedOrganizationId(organizationId);
    setDismissedAttention(readDismissedAttention(organizationId));
    setMeta(null);
  }

  const appliedFiltersOrgRef = useRef(organizationId);
  useEffect(() => {
    if (appliedFiltersOrgRef.current === organizationId) return;
    appliedFiltersOrgRef.current = organizationId;
    appliedFiltersRef.current = { status: urlStatus, type: urlType };
  }, [organizationId, urlStatus, urlType]);

  useEffect(() => {
    loadedRowsLengthRef.current = loadedRows.length;
  }, [loadedRows.length]);

  useEffect(() => {
    metaRef.current = meta;
  }, [meta]);

  const fetchTransactionsPage = useCallback(
    async ({
      offset,
      includeMeta,
      status,
      paymentType,
    }: {
      offset: number;
      includeMeta?: boolean;
      status?: "" | PaymentStatus;
      paymentType?: "" | PaymentType;
    }): Promise<FinancesTransactionsApiResponse> => {
      const params = new URLSearchParams({
        organizationId,
        offset: String(offset),
        limit: String(TRANSACTIONS_PAGE_DEFAULT_SIZE),
      });
      if (status) params.set("status", status);
      if (paymentType) params.set("paymentType", paymentType);
      if (includeMeta) params.set("includeMeta", "1");

      const response = await fetch(`/api/school-admin/finances/transactions?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to load transactions.");
      }
      return (await response.json()) as FinancesTransactionsApiResponse;
    },
    [organizationId],
  );

  const applyMeta = useCallback(
    (nextMeta: TransactionsPageMeta) => {
      setMeta(nextMeta);
      if (nextMeta.summary.failedCount === 0) {
        clearAttentionDismiss(organizationId, "failed");
        setDismissedAttention((current) => {
          if (!current.failed) return current;
          const next = { ...current };
          delete next.failed;
          return next;
        });
      }
      if (nextMeta.summary.pendingCount === 0) {
        clearAttentionDismiss(organizationId, "pending");
        setDismissedAttention((current) => {
          if (!current.pending) return current;
          const next = { ...current };
          delete next.pending;
          return next;
        });
      }
    },
    [organizationId],
  );

  const runLoad = useCallback(
    async ({
      mode,
      status = statusFilterRef.current,
      paymentType = typeFilterRef.current,
    }: {
      mode: LoadMode;
      status?: "" | PaymentStatus;
      paymentType?: "" | PaymentType;
    }): Promise<TransactionsLoadResult> => {
      const append = mode === "more";
      // Load-more continues the current list; anything else starts a new one.
      const requestId = append ? requestRef.current : ++requestRef.current;
      const requestOffset = append ? loadedRowsLengthRef.current : 0;

      if (mode === "refresh") setRefreshing(true);
      else if (append) setLoadingMore(true);
      else if (loadedRowsLengthRef.current > 0) setIsRefetching(true);
      else setLoading(true);
      setError(null);

      try {
        const body = await fetchTransactionsPage({
          offset: requestOffset,
          includeMeta: mode === "refresh" || (requestOffset === 0 && !metaRef.current),
          status,
          paymentType,
        });
        if (requestId !== requestRef.current) return "stale";
        if (body.meta) applyMeta(body.meta);
        if (append) setLoadedRows((prev) => [...prev, ...body.rows]);
        else setLoadedRows(body.rows);
        setTotalCount(body.totalCount);
        setHasMore(body.hasMore);
        setLoadedAt(Date.now());
        snapshotRef.current = {
          totalCount: body.totalCount,
          meta: body.meta ?? metaRef.current,
        };
        if (!append) {
          appliedFiltersRef.current = { status, type: paymentType };
        }
        return "ok";
      } catch (loadError) {
        if (requestId !== requestRef.current) return "stale";
        void reportPortalOperationalError(
          "school_admin",
          {
            organizationId,
            operation: append
              ? "finances.transactions.load_more"
              : mode === "refresh"
                ? "finances.transactions.refresh"
                : "finances.transactions.load",
            error: "",
          },
          loadError,
        );
        const message =
          loadError instanceof Error ? loadError.message : "Failed to load payment history.";
        if (!append && loadedRowsLengthRef.current === 0) {
          setError(message);
          setLoadedRows([]);
        }
        return "error";
      } finally {
        if (requestId === requestRef.current) {
          setLoading(false);
          setIsRefetching(false);
          setLoadingMore(false);
          setRefreshing(false);
        }
      }
    },
    [applyMeta, fetchTransactionsPage, organizationId],
  );

  useEffect(() => {
    queueMicrotask(() => {
      void runLoad({ mode: "initial" });
    });
  }, [runLoad]);

  /** Mirror filters into `?status=&type=` without a navigation (no server refetch). */
  const writeUrl = useCallback((status: "" | PaymentStatus, type: "" | PaymentType) => {
    writeFilterParams({ status, type });
  }, []);

  /**
   * Apply filters and reload. If the reload fails while rows are on screen,
   * roll back to the last applied filters so the chips always match the rows.
   */
  const applyFilters = useCallback(
    async (status: "" | PaymentStatus, type: "" | PaymentType): Promise<TransactionsLoadResult> => {
      const previous = appliedFiltersRef.current;
      const hadRows = loadedRowsLengthRef.current > 0;
      statusFilterRef.current = status;
      typeFilterRef.current = type;
      setStatusFilter(status);
      setTypeFilter(type);
      writeUrl(status, type);
      const result = await runLoad({ mode: "filter", status, paymentType: type });
      if (result === "error" && hadRows) {
        statusFilterRef.current = previous.status;
        typeFilterRef.current = previous.type;
        setStatusFilter(previous.status);
        setTypeFilter(previous.type);
        writeUrl(previous.status, previous.type);
      }
      return result;
    },
    [runLoad, writeUrl],
  );

  const applyStatusFilter = useCallback(
    (status: "" | PaymentStatus) => applyFilters(status, typeFilterRef.current),
    [applyFilters],
  );

  const applyTypeFilter = useCallback(
    (type: "" | PaymentType) => applyFilters(statusFilterRef.current, type),
    [applyFilters],
  );

  const clearFilters = useCallback(() => applyFilters("", ""), [applyFilters]);

  const loadMore = useCallback(() => runLoad({ mode: "more" }), [runLoad]);
  const refresh = useCallback(() => runLoad({ mode: "refresh" }), [runLoad]);
  const retryLoad = useCallback(() => runLoad({ mode: "initial" }), [runLoad]);
  const getSnapshot = useCallback(() => snapshotRef.current, []);

  const summary = meta?.summary ?? EMPTY_SUMMARY;
  const statusCounts = useMemo(() => meta?.statusCounts ?? {}, [meta]);
  const typeCounts = useMemo(() => meta?.typeCounts ?? {}, [meta]);
  const metaTotalCount = meta?.totalCount ?? 0;

  const attentionVariant = useMemo((): TransactionsAttentionVariant | null => {
    if (summary.failedCount > 0) return "failed";
    if (summary.pendingCount > 0) return "pending";
    return null;
  }, [summary.failedCount, summary.pendingCount]);

  const showAttention = attentionVariant != null && !dismissedAttention[attentionVariant];

  /** Hide the banner on this device; returns the variant so it can be undone. */
  const dismissAttention = useCallback((): TransactionsAttentionVariant | null => {
    if (!attentionVariant) return null;
    persistDismissAttention(organizationId, attentionVariant);
    setDismissedAttention((current) => ({ ...current, [attentionVariant]: true }));
    return attentionVariant;
  }, [attentionVariant, organizationId]);

  const undoDismissAttention = useCallback(
    (variant: TransactionsAttentionVariant) => {
      clearAttentionDismiss(organizationId, variant);
      setDismissedAttention((current) => {
        const next = { ...current };
        delete next[variant];
        return next;
      });
    },
    [organizationId],
  );

  return {
    rows: loadedRows,
    meta,
    summary,
    statusCounts,
    typeCounts,
    metaTotalCount,
    totalCount,
    remainingCount: Math.max(totalCount - loadedRows.length, 0),
    hasMore,
    loading,
    loadingMore,
    isRefetching,
    refreshing,
    error,
    loadedAt,
    statusFilter,
    typeFilter,
    hasFilters: Boolean(statusFilter || typeFilter),
    applyStatusFilter,
    applyTypeFilter,
    applyFilters,
    clearFilters,
    loadMore,
    refresh,
    retryLoad,
    getSnapshot,
    attentionVariant,
    showAttention,
    dismissAttention,
    undoDismissAttention,
  };
}

export type FinancesTransactionsModel = ReturnType<typeof useFinancesTransactionsModel>;
