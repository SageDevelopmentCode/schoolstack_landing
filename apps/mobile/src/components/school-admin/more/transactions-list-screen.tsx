import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useRouter } from 'expo-router';

import { TransactionStatusFilters } from '@/components/school-admin/more/transaction-status-filters';
import { TransactionStoryListItem } from '@/components/school-admin/more/transaction-story-list-item';
import { TransactionsMetricRow } from '@/components/school-admin/more/transactions-metric-row';
import { TransactionsNeedsAttentionBanner } from '@/components/school-admin/more/transactions-needs-attention-banner';
import { TransactionsStoryHeader } from '@/components/school-admin/more/transactions-story-header';
import { TransactionsListSkeleton } from '@/components/school-admin/more/transactions-list-skeleton';
import { StoryCard } from '@/components/story/story-card';
import { useSchoolAdminTransactions } from '@/contexts/school-admin-transactions-context';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { SCREEN_HORIZONTAL_PADDING } from '@/constants/screen-layout';
import { Story, StoryCardPadding, StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';
import type { PaymentRecordDisplayRow } from '@/lib/admissions/payment-records';
import {
  clearAttentionDismiss,
  dismissAttention,
  readDismissedAttention,
  type TransactionsAttentionVariant,
} from '@/lib/school-admin/transactions-attention-dismiss';

type TransactionsListScreenProps = {
  organizationId: string;
  slug: string;
};

export function TransactionsListScreen({ organizationId, slug }: TransactionsListScreenProps) {
  const theme = useParentTheme();
  const router = useRouter();
  const {
    rows,
    meta,
    statusFilter,
    typeFilter,
    isLoading,
    isRefreshing,
    isLoadingMore,
    hasMore,
    error,
    setStatusFilter,
    setTypeFilter,
    refresh,
    loadMore,
  } = useSchoolAdminTransactions();

  const [dismissedAttention, setDismissedAttention] = useState<
    Partial<Record<TransactionsAttentionVariant, boolean>>
  >({});

  useEffect(() => {
    let cancelled = false;

    void readDismissedAttention(organizationId).then((dismissed) => {
      if (!cancelled) {
        setDismissedAttention(dismissed);
      }
    });

    return () => {
      cancelled = true;
    };
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

  const metaTotalCount = meta?.totalCount ?? 0;
  const statusCounts = meta?.statusCounts ?? {};
  const typeCounts = meta?.typeCounts ?? {};

  useEffect(() => {
    if (isLoading) return;
    if (summary.failedCount === 0) {
      void clearAttentionDismiss(organizationId, 'failed');
      setDismissedAttention((current) => {
        if (!current.failed) return current;
        const next = { ...current };
        delete next.failed;
        return next;
      });
    }
  }, [isLoading, organizationId, summary.failedCount]);

  useEffect(() => {
    if (isLoading) return;
    if (summary.pendingCount === 0) {
      void clearAttentionDismiss(organizationId, 'pending');
      setDismissedAttention((current) => {
        if (!current.pending) return current;
        const next = { ...current };
        delete next.pending;
        return next;
      });
    }
  }, [isLoading, organizationId, summary.pendingCount]);

  const attentionVariant = useMemo((): TransactionsAttentionVariant | null => {
    if (summary.failedCount > 0) return 'failed';
    if (summary.pendingCount > 0) return 'pending';
    return null;
  }, [summary.failedCount, summary.pendingCount]);

  const handleDismissAttention = useCallback(() => {
    if (!attentionVariant) return;
    void dismissAttention(organizationId, attentionVariant);
    setDismissedAttention((current) => ({
      ...current,
      [attentionVariant]: true,
    }));
  }, [attentionVariant, organizationId]);

  const handlePressPayment = (payment: PaymentRecordDisplayRow) => {
    if (!payment.applicationId) return;
    router.push(`/school-admin/${slug}/admissions/submissions/${payment.applicationId}`);
  };

  const hasFilters = Boolean(statusFilter || typeFilter);
  const hasAnyPayments = metaTotalCount > 0;
  const showEmptyFilteredState = rows.length === 0 && hasAnyPayments && hasFilters;
  const showAttentionBanner =
    hasAnyPayments &&
    attentionVariant != null &&
    !dismissedAttention[attentionVariant];

  const listHeader = (
    <View style={styles.headerBlock}>
      <Animated.View entering={FadeInDown.duration(350)}>
        <TransactionsStoryHeader totalCount={metaTotalCount} />
      </Animated.View>

      {hasAnyPayments ? (
        <Animated.View entering={FadeInDown.delay(40).duration(350)}>
          <TransactionsMetricRow summary={summary} onFilterStatus={setStatusFilter} />
        </Animated.View>
      ) : null}

      {showAttentionBanner ? (
        <Animated.View entering={FadeInDown.delay(80).duration(350)}>
          <TransactionsNeedsAttentionBanner
            summary={summary}
            onFilterStatus={setStatusFilter}
            onDismiss={handleDismissAttention}
          />
        </Animated.View>
      ) : null}

      <Animated.View entering={FadeInDown.delay(120).duration(350)}>
        <TransactionStatusFilters
          activeStatus={statusFilter}
          activeType={typeFilter}
          statusCounts={statusCounts}
          typeCounts={typeCounts}
          totalCount={metaTotalCount}
          onChangeStatus={setStatusFilter}
          onChangeType={setTypeFilter}
        />
      </Animated.View>
    </View>
  );

  if (isLoading && rows.length === 0) {
    return <TransactionsListSkeleton />;
  }

  if (error && rows.length === 0) {
    return (
      <View style={[styles.centered, { backgroundColor: Story.paper }]}>
        <Text style={[styles.emptyCopy, { color: theme.muted }]}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: Story.paper }]}>
      <FlatList
        data={rows}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListHeaderComponent={listHeader}
        initialNumToRender={10}
        maxToRenderPerBatch={8}
        onEndReached={() => {
          if (hasMore) void loadMore();
        }}
        onEndReachedThreshold={0.4}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => void refresh({ silent: true })}
            tintColor={theme.primary}
          />
        }
        ListFooterComponent={
          isLoadingMore ? (
            <View style={styles.footerSpinner}>
              <ActivityIndicator color={theme.primary} />
            </View>
          ) : null
        }
        ListEmptyComponent={
          <StoryCard style={styles.emptyCard}>
            <Text style={[styles.emptyCopy, { color: theme.muted }]}>
              {showEmptyFilteredState
                ? 'No payments match the current filters.'
                : 'No payments yet. When families pay application, enrollment, or tuition fees, they will appear here.'}
            </Text>
          </StoryCard>
        }
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInDown.delay(160 + index * 30).duration(300)}>
            <TransactionStoryListItem
              payment={item}
              onPress={item.applicationId ? handlePressPayment : undefined}
            />
          </Animated.View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerBlock: {
    gap: Spacing.four,
    marginBottom: Spacing.three,
  },
  listContent: {
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.six,
  },
  separator: {
    height: Spacing.three,
  },
  footerSpinner: {
    paddingVertical: Spacing.four,
    alignItems: 'center',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingVertical: Spacing.four,
  },
  emptyCard: {
    padding: StoryCardPadding,
  },
  emptyCopy: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
});
