import type { SupabaseClient } from "@supabase/supabase-js";
import {
  listOrganizationPayments,
  summarizePaymentRows,
  type PaymentRecordDisplayRow,
  type PaymentRowsSummary,
} from "@/lib/admissions/payment-records";
import type { PaymentStatus, PaymentType } from "@/lib/stripe/application-payments";

export type TransactionsPageMeta = {
  summary: PaymentRowsSummary;
  statusCounts: Partial<Record<PaymentStatus, number>>;
  typeCounts: Partial<Record<PaymentType, number>>;
  totalCount: number;
};

type RpcSummaryRow = {
  collected_this_month_cents?: number;
  collected_ytd_cents?: number;
  pending_count?: number;
  pending_cents?: number;
  failed_count?: number;
  refunded_count?: number;
  refunded_cents?: number;
  application_fee_cents?: number;
  enrollment_cents?: number;
  tuition_cents?: number;
};

type RpcMetaRow = {
  total_count?: number;
  status_counts?: Record<string, number>;
  type_counts?: Record<string, number>;
  summary?: RpcSummaryRow;
};

function parseCountMap<T extends string>(
  value: Record<string, number> | undefined,
): Partial<Record<T, number>> {
  if (!value) return {};
  const counts: Partial<Record<T, number>> = {};
  for (const [key, count] of Object.entries(value)) {
    counts[key as T] = Number(count ?? 0);
  }
  return counts;
}

function parseSummary(value: RpcSummaryRow | undefined): PaymentRowsSummary {
  return {
    collectedThisMonthCents: Number(value?.collected_this_month_cents ?? 0),
    collectedYtdCents: Number(value?.collected_ytd_cents ?? 0),
    pendingCount: Number(value?.pending_count ?? 0),
    pendingCents: Number(value?.pending_cents ?? 0),
    failedCount: Number(value?.failed_count ?? 0),
    refundedCount: Number(value?.refunded_count ?? 0),
    refundedCents: Number(value?.refunded_cents ?? 0),
    applicationFeeCents: Number(value?.application_fee_cents ?? 0),
    enrollmentCents: Number(value?.enrollment_cents ?? 0),
    tuitionCents: Number(value?.tuition_cents ?? 0),
  };
}

function parseRpcMeta(value: RpcMetaRow | null): TransactionsPageMeta | null {
  if (!value) return null;

  return {
    totalCount: Number(value.total_count ?? 0),
    statusCounts: parseCountMap<PaymentStatus>(value.status_counts),
    typeCounts: parseCountMap<PaymentType>(value.type_counts),
    summary: parseSummary(value.summary),
  };
}

async function fetchTransactionsPageMetaFromRpc(
  supabase: SupabaseClient,
  organizationId: string,
): Promise<TransactionsPageMeta | null> {
  const { data, error } = await supabase.rpc(
    "get_organization_payment_transactions_meta",
    { p_organization_id: organizationId },
  );

  if (error) {
    return null;
  }

  return parseRpcMeta(data as RpcMetaRow | null);
}

async function fetchTransactionsPageMetaFallback(
  supabase: SupabaseClient,
  organizationId: string,
): Promise<TransactionsPageMeta> {
  const rows = await listOrganizationPayments(supabase, organizationId);
  const statusCounts: Partial<Record<PaymentStatus, number>> = {};
  const typeCounts: Partial<Record<PaymentType, number>> = {};

  for (const row of rows) {
    statusCounts[row.status] = (statusCounts[row.status] ?? 0) + 1;
    typeCounts[row.paymentType] = (typeCounts[row.paymentType] ?? 0) + 1;
  }

  return {
    totalCount: rows.length,
    statusCounts,
    typeCounts,
    summary: summarizePaymentRows(rows),
  };
}

export async function fetchTransactionsPageMeta(
  supabase: SupabaseClient,
  organizationId: string,
): Promise<TransactionsPageMeta> {
  const fromRpc = await fetchTransactionsPageMetaFromRpc(supabase, organizationId);
  if (fromRpc) return fromRpc;
  return fetchTransactionsPageMetaFallback(supabase, organizationId);
}

export function buildTransactionsPageMetaFromRows(
  rows: PaymentRecordDisplayRow[],
): TransactionsPageMeta {
  const statusCounts: Partial<Record<PaymentStatus, number>> = {};
  const typeCounts: Partial<Record<PaymentType, number>> = {};

  for (const row of rows) {
    statusCounts[row.status] = (statusCounts[row.status] ?? 0) + 1;
    typeCounts[row.paymentType] = (typeCounts[row.paymentType] ?? 0) + 1;
  }

  return {
    totalCount: rows.length,
    statusCounts,
    typeCounts,
    summary: summarizePaymentRows(rows),
  };
}
