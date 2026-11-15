"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  listApplicationPayments,
  listOrganizationPayments,
  matchesPaymentRecordFilters,
  summarizePaymentRows,
  type PaymentRecordDisplayRow,
} from "@/lib/admissions/payment-records";
import type { PaymentStatus, PaymentType } from "@/lib/stripe/application-payments";
import { parseOperationalError } from "@/lib/operational-errors-client";
import { reportPortalOperationalError } from "@/lib/portal-operational-errors";
import { createClient } from "@/utils/supabase/client";

export type PaymentsHistoryPanelMode = "admissions" | "revenue" | "transactions";

export const PAYMENT_STATUS_FILTERS: Array<{ value: "" | PaymentStatus; label: string }> = [
  { value: "", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "succeeded", label: "Succeeded" },
  { value: "failed", label: "Failed" },
  { value: "refunded", label: "Refunded" },
];

export const PAYMENT_TYPE_FILTERS: Array<{ value: "" | PaymentType; label: string }> = [
  { value: "", label: "All" },
  { value: "application_fee", label: "Application fee" },
  { value: "enrollment_checklist", label: "Enrollment" },
  { value: "tuition", label: "Tuition" },
];

/**
 * Payment history state shared by the story panel (Finances → Revenue) and
 * the Garden Admissions → Payments history. Logic lives here only.
 */
export function usePaymentsHistoryModel({
  organizationId,
  applicationId,
  mode = "admissions",
}: {
  organizationId?: string;
  applicationId?: string;
  mode?: PaymentsHistoryPanelMode;
}) {
  const supabase = useMemo(() => createClient(), []);
  const [rows, setRows] = useState<PaymentRecordDisplayRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [reloading, setReloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadedAt, setLoadedAt] = useState(() => Date.now());
  const [statusFilter, setStatusFilter] = useState<"" | PaymentStatus>(() =>
    mode === "revenue" ? "succeeded" : "",
  );
  const [typeFilter, setTypeFilter] = useState<"" | PaymentType>("");
  const requestRef = useRef(0);

  const loadRows = useCallback(
    async (options?: { silent?: boolean }): Promise<boolean> => {
      const requestId = ++requestRef.current;
      if (options?.silent) setReloading(true);
      else setLoading(true);
      setError(null);
      try {
        let data: PaymentRecordDisplayRow[];
        if (applicationId) {
          data = await listApplicationPayments(supabase, applicationId);
        } else if (organizationId) {
          data = await listOrganizationPayments(supabase, organizationId, {});
        } else {
          data = [];
        }
        if (requestId !== requestRef.current) return true;
        setRows(data);
        setLoadedAt(Date.now());
        return true;
      } catch (loadError) {
        if (requestId !== requestRef.current) return false;
        const parsed = parseOperationalError(loadError);
        setError(
          parsed.message === "Unknown error" ? "Failed to load payment history." : parsed.message,
        );
        if (!options?.silent) setRows([]);
        if (organizationId) {
          void reportPortalOperationalError(
            "school_admin",
            {
              organizationId,
              operation: mode === "admissions" ? "payments.history.load" : `finances.${mode}.load`,
              error: parsed.message,
              code: parsed.code,
              details: parsed.details,
            },
            loadError,
          );
        }
        return false;
      } finally {
        if (requestId === requestRef.current) {
          setLoading(false);
          setReloading(false);
        }
      }
    },
    [applicationId, mode, organizationId, supabase],
  );

  useEffect(() => {
    queueMicrotask(() => {
      void loadRows();
    });
  }, [loadRows]);

  const filteredRows = useMemo(
    () =>
      rows.filter((row) =>
        matchesPaymentRecordFilters(row, { status: statusFilter, paymentType: typeFilter }),
      ),
    [rows, statusFilter, typeFilter],
  );

  const summary = useMemo(() => summarizePaymentRows(rows), [rows]);

  const statusCounts = useMemo(() => {
    const counts: Partial<Record<PaymentStatus, number>> = {};
    for (const row of rows) counts[row.status] = (counts[row.status] ?? 0) + 1;
    return counts;
  }, [rows]);

  const typeCounts = useMemo(() => {
    const counts: Partial<Record<PaymentType, number>> = {};
    for (const row of rows) counts[row.paymentType] = (counts[row.paymentType] ?? 0) + 1;
    return counts;
  }, [rows]);

  const clearFilters = useCallback(() => {
    setStatusFilter("");
    setTypeFilter("");
  }, []);

  return {
    rows,
    filteredRows,
    loading,
    reloading,
    error,
    loadedAt,
    summary,
    statusCounts,
    typeCounts,
    statusFilter,
    setStatusFilter,
    typeFilter,
    setTypeFilter,
    clearFilters,
    hasFilters: statusFilter !== "" || typeFilter !== "",
    reload: loadRows,
  };
}

export type PaymentsHistoryModel = ReturnType<typeof usePaymentsHistoryModel>;
