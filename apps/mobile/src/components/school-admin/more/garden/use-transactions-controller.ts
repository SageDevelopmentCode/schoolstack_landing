import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useSchoolAdminTransactions } from '@/contexts/school-admin-transactions-context';
import type { PaymentRecordDisplayRow, PaymentStatus, PaymentType } from '@/lib/admissions/payment-records';
import {
  clearAttentionDismiss,
  dismissAttention,
  readDismissedAttention,
  type TransactionsAttentionVariant,
} from '@/lib/school-admin/transactions-attention-dismiss';

const EMPTY_SUMMARY = {
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

/**
 * School admin › More › Transactions data (no UI, no toasts): the existing
 * transactions context plus the needs-attention dismiss logic, unchanged.
 */
export function useTransactionsController({ organizationId, slug }: { organizationId: string; slug: string }) {
  const router = useRouter();
  const context = useSchoolAdminTransactions();
  const { meta, isLoading, rows, hasMore, loadMore, refresh, setStatusFilter, setTypeFilter } = context;
  const [dismissed, setDismissed] = useState<Partial<Record<TransactionsAttentionVariant, boolean>>>({});
  const [lastUpdatedAt, setLastUpdatedAt] = useState<number | null>(null);
  const wasLoading = useRef(true);

  useEffect(() => {
    let cancelled = false;
    void readDismissedAttention(organizationId).then((value) => {
      if (!cancelled) setDismissed(value);
    });
    return () => {
      cancelled = true;
    };
  }, [organizationId]);

  const summary = meta?.summary ?? EMPTY_SUMMARY;
  const metaTotalCount = meta?.totalCount ?? 0;

  useEffect(() => {
    if (wasLoading.current && !isLoading && context.hasLoaded) setLastUpdatedAt(Date.now());
    wasLoading.current = isLoading || context.isRefreshing;
  }, [context.hasLoaded, context.isRefreshing, isLoading]);

  useEffect(() => {
    if (isLoading) return;
    for (const variant of ['failed', 'pending'] as const) {
      const count = variant === 'failed' ? summary.failedCount : summary.pendingCount;
      if (count === 0) {
        void clearAttentionDismiss(organizationId, variant);
        setDismissed((current) => {
          if (!current[variant]) return current;
          const next = { ...current };
          delete next[variant];
          return next;
        });
      }
    }
  }, [isLoading, organizationId, summary.failedCount, summary.pendingCount]);

  const attentionVariant = useMemo((): TransactionsAttentionVariant | null => {
    if (summary.failedCount > 0) return 'failed';
    if (summary.pendingCount > 0) return 'pending';
    return null;
  }, [summary.failedCount, summary.pendingCount]);

  const dismissCurrentAttention = useCallback(() => {
    if (!attentionVariant) return null;
    void dismissAttention(organizationId, attentionVariant);
    setDismissed((current) => ({ ...current, [attentionVariant]: true }));
    return attentionVariant;
  }, [attentionVariant, organizationId]);

  const restoreAttention = useCallback(
    (variant: TransactionsAttentionVariant) => {
      void clearAttentionDismiss(organizationId, variant);
      setDismissed((current) => {
        const next = { ...current };
        delete next[variant];
        return next;
      });
    },
    [organizationId],
  );

  const openPayment = useCallback(
    (payment: PaymentRecordDisplayRow) => {
      if (!payment.applicationId) return;
      router.push(`/school-admin/${slug}/admissions/submissions/${payment.applicationId}`);
    },
    [router, slug],
  );

  const hasAnyPayments = metaTotalCount > 0;
  const showAttention = hasAnyPayments && attentionVariant != null && !dismissed[attentionVariant];
  const firstLoadFailed = Boolean(context.error) && rows.length === 0 && !context.hasLoaded;

  return {
    ...context,
    organizationId,
    slug,
    status: (isLoading && rows.length === 0 ? 'loading' : firstLoadFailed ? 'error' : 'ready') as 'loading' | 'error' | 'ready',
    summary,
    metaTotalCount,
    statusCounts: meta?.statusCounts ?? {},
    typeCounts: meta?.typeCounts ?? {},
    hasAnyPayments,
    attentionVariant,
    showAttention,
    dismissCurrentAttention,
    restoreAttention,
    openPayment,
    lastUpdatedAt,
    pullRefresh: useCallback(() => refresh({ silent: true, refreshMeta: true }), [refresh]),
    retryFirstLoad: useCallback(() => refresh(), [refresh]),
    loadMoreIfAny: useCallback(() => {
      if (hasMore) void loadMore();
    }, [hasMore, loadMore]),
    applyStatus: setStatusFilter as (status: '' | PaymentStatus) => void,
    applyType: setTypeFilter as (type: '' | PaymentType) => void,
  };
}

export type TransactionsController = ReturnType<typeof useTransactionsController>;
