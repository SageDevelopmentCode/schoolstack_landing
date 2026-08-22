import { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { ADMIN_LIST_HORIZONTAL_PADDING, AdminListSeparator } from '@/components/school-admin/admin-list-layout';
import { TransactionFilters } from '@/components/school-admin/more/transaction-filters';
import { TransactionListItem } from '@/components/school-admin/more/transaction-list-item';
import { TransactionSummaryCards } from '@/components/school-admin/more/transaction-summary-cards';
import { TransactionsListSkeleton } from '@/components/school-admin/more/transactions-list-skeleton';
import { ThemedText } from '@/components/themed-text';
import { useAdminTheme } from '@/contexts/admin-theme-context';
import { Spacing } from '@/constants/theme';
import {
  listOrganizationPayments,
  summarizePaymentRows,
  type PaymentRecordDisplayRow,
  type PaymentStatus,
  type PaymentType,
} from '@/lib/admissions/payment-records';
import { getSupabaseClient } from '@/lib/supabase';

type TransactionsListScreenProps = {
  organizationId: string;
  slug: string;
};

export function TransactionsListScreen({ organizationId, slug }: TransactionsListScreenProps) {
  const theme = useAdminTheme();
  const router = useRouter();
  const supabase = useMemo(() => getSupabaseClient(), []);

  const [rows, setRows] = useState<PaymentRecordDisplayRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'' | PaymentStatus>('');
  const [typeFilter, setTypeFilter] = useState<'' | PaymentType>('');

  const loadRows = useCallback(
    async (options?: { silent?: boolean }) => {
      if (!options?.silent) {
        setLoading(true);
      }
      setError(null);
      try {
        const data = await listOrganizationPayments(supabase, organizationId);
        setRows(data);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Failed to load transactions.');
        setRows([]);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [organizationId, supabase],
  );

  useEffect(() => {
    void loadRows();
  }, [loadRows]);

  const filteredRows = useMemo(
    () =>
      rows.filter((row) => {
        if (statusFilter && row.status !== statusFilter) return false;
        if (typeFilter && row.paymentType !== typeFilter) return false;
        return true;
      }),
    [rows, statusFilter, typeFilter],
  );

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

  const handlePressPayment = (payment: PaymentRecordDisplayRow) => {
    if (!payment.applicationId) return;
    router.push(`/school-admin/${slug}/admissions/submissions/${payment.applicationId}`);
  };

  const hasFilters = Boolean(statusFilter || typeFilter);

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={styles.header}>
        <ThemedText type="title" style={{ color: theme.textPrimary }}>
          Transactions
        </ThemedText>
      </View>

      {loading && rows.length === 0 ? (
        <TransactionsListSkeleton />
      ) : (
        <>
          <View style={styles.toolbar}>
            <TransactionSummaryCards summary={summary} />
            <TransactionFilters
              activeStatus={statusFilter}
              activeType={typeFilter}
              statusCounts={statusCounts}
              typeCounts={typeCounts}
              totalCount={rows.length}
              onChangeStatus={setStatusFilter}
              onChangeType={setTypeFilter}
            />
            {error ? (
              <ThemedText type="small" style={{ color: theme.error }}>
                {error}
              </ThemedText>
            ) : null}
          </View>
          <FlatList
            data={filteredRows}
            keyExtractor={(item) => item.id}
            style={styles.list}
            contentContainerStyle={styles.listContent}
            ItemSeparatorComponent={AdminListSeparator}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => {
                  setRefreshing(true);
                  void loadRows({ silent: true });
                }}
                tintColor={theme.accent}
              />
            }
            ListEmptyComponent={
              error ? null : (
                <View style={styles.emptyState}>
                  <View style={[styles.emptyIcon, { backgroundColor: theme.accentGlow }]}>
                    <Ionicons name="card-outline" size={24} color={theme.accent} />
                  </View>
                  <ThemedText type="smallBold" style={{ color: theme.textPrimary, textAlign: 'center' }}>
                    {hasFilters ? 'No payments match the current filters.' : 'No payments yet'}
                  </ThemedText>
                  {hasFilters ? null : (
                    <ThemedText type="small" style={{ color: theme.textTertiary, textAlign: 'center' }}>
                      When families pay application, enrollment, or tuition fees, they will appear here.
                    </ThemedText>
                  )}
                </View>
              )
            }
            renderItem={({ item }) => (
              <TransactionListItem
                payment={item}
                onPress={item.applicationId ? handlePressPayment : undefined}
              />
            )}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: ADMIN_LIST_HORIZONTAL_PADDING,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.three,
  },
  toolbar: {
    paddingHorizontal: ADMIN_LIST_HORIZONTAL_PADDING,
    paddingBottom: Spacing.three,
    gap: Spacing.three,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: ADMIN_LIST_HORIZONTAL_PADDING,
    paddingBottom: Spacing.six,
    flexGrow: 1,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.five,
    paddingHorizontal: Spacing.four,
    gap: Spacing.two,
  },
  emptyIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.one,
  },
});
