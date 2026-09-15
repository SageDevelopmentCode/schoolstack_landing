import type {
  PaymentRecordDisplayRow,
  PaymentStatus,
  PaymentType,
} from '@/lib/admissions/payment-records';
import { fetchSchoolAdminApi } from '@/lib/school-admin-api';

export const TRANSACTIONS_PAGE_SIZE = 50;

export type TransactionsPageMeta = {
  summary: {
    collectedThisMonthCents: number;
    collectedYtdCents: number;
    pendingCount: number;
    pendingCents: number;
    failedCount: number;
    refundedCount: number;
    refundedCents: number;
    applicationFeeCents: number;
    enrollmentCents: number;
    tuitionCents: number;
  };
  statusCounts: Partial<Record<PaymentStatus, number>>;
  typeCounts: Partial<Record<PaymentType, number>>;
  totalCount: number;
};

export type FinancesTransactionsApiResponse = {
  rows: PaymentRecordDisplayRow[];
  totalCount: number;
  limit: number;
  offset: number;
  hasMore: boolean;
  meta?: TransactionsPageMeta;
};

type FetchTransactionsPageOptions = {
  organizationId: string;
  offset: number;
  limit?: number;
  status?: PaymentStatus;
  paymentType?: PaymentType;
  includeMeta?: boolean;
};

export async function fetchTransactionsPage(
  options: FetchTransactionsPageOptions,
): Promise<FinancesTransactionsApiResponse> {
  const params = new URLSearchParams({
    organizationId: options.organizationId,
    offset: String(options.offset),
    limit: String(options.limit ?? TRANSACTIONS_PAGE_SIZE),
  });

  if (options.status) params.set('status', options.status);
  if (options.paymentType) params.set('paymentType', options.paymentType);
  if (options.includeMeta) params.set('includeMeta', '1');

  return fetchSchoolAdminApi<FinancesTransactionsApiResponse>(
    `/api/school-admin/finances/transactions?${params.toString()}`,
  );
}
