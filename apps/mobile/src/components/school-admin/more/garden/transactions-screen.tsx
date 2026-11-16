import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { memo, useCallback, useMemo } from 'react';
import { FlatList, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { useGardenPullRefresh } from '@/components/parent/garden/feedback';
import { GInlineBanner } from '@/components/parent/garden/fields';
import { useGardenToast } from '@/components/parent/garden/toast';
import { Garden, GardenFonts, PORTAL_EASE, type GChipTone } from '@/components/parent/garden/tokens';
import { GChip, GErrorCard, GLink, GPressable, GSkeleton } from '@/components/parent/garden/ui';
import { AdminTabHeader, useAdminTopBleed } from '@/components/school-admin/garden/admin-tab-header';
import {
  AdminEmptyPanel,
  AdminEndLine,
  AdminFilterChips,
  AdminIconChip,
  AdminKpiTiles,
  AdminLeadStrip,
  AdminRowSkeleton,
  type AdminFilterChip,
} from '@/components/school-admin/garden/admin-ui';
import {
  useTransactionsController,
  type TransactionsController,
} from '@/components/school-admin/more/garden/use-transactions-controller';
import {
  formatPaymentAmount,
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_LABELS,
  PAYMENT_TYPE_LABELS,
  type PaymentRecordDisplayRow,
  type PaymentStatus,
  type PaymentType,
} from '@/lib/admissions/payment-records';
import { haptic } from '@/lib/haptics';
import { formatRelativeTime } from '@/lib/school-admin/format-relative-time';

const KPI_BARS = { collected: '#2E4A3C', pending: '#E2B33C', failed: '#B5577A', refunded: '#7FA7D9' } as const;

const STATUS_TONES: Record<PaymentStatus, GChipTone> = {
  succeeded: 'success',
  pending: 'warning',
  failed: 'alert',
  refunded: 'info',
  canceled: 'neutral',
};

const TYPE_ICONS: Record<PaymentType, keyof typeof Ionicons.glyphMap> = {
  application_fee: 'document-text-outline',
  enrollment_checklist: 'checkbox-outline',
  tuition: 'school-outline',
};

const TYPE_TINTS: Record<PaymentType, string> = {
  application_fee: Garden.sky,
  enrollment_checklist: Garden.lav,
  tuition: Garden.mint,
};

type StatusChipId = 'all' | PaymentStatus;
type TypeChipId = 'all' | PaymentType;

/** "48 payments · $3,250 collected this month" — built only from data. */
export function transactionsStatusLine(total: number, collectedCents: number): string {
  if (total === 0) return 'No payments yet';
  return `${total} payment${total === 1 ? '' : 's'} · ${formatPaymentAmount(collectedCents)} collected this month`;
}

type Props = { organizationId: string; slug: string };

/** School admin › More › Transactions (Garden). */
export function TransactionsScreen(props: Props) {
  const controller = useTransactionsController(props);
  if (controller.status === 'loading') return <TransactionsSkeleton />;
  if (controller.status === 'error') return <TransactionsError controller={controller} />;
  return <TransactionsContent controller={controller} />;
}

function useTransactionsFeedback(controller: TransactionsController) {
  const toast = useGardenToast();
  const { pullRefreshing, onPullRefresh } = useGardenPullRefresh({
    refresh: controller.pullRefresh,
    error: controller.error,
    label: 'Transactions',
    id: 'admin-transactions-refresh',
  });

  const applyStatus = useCallback(
    (status: '' | PaymentStatus) => {
      haptic.select();
      controller.applyStatus(status);
    },
    [controller],
  );

  const applyType = useCallback(
    (type: '' | PaymentType) => {
      haptic.select();
      controller.applyType(type);
    },
    [controller],
  );

  const dismiss = useCallback(() => {
    const variant = controller.dismissCurrentAttention();
    if (!variant) return;
    toast.info('Alert hidden', {
      id: 'transactions-attention-dismiss',
      description: `It comes back if new ${variant} payments show up.`,
      action: { label: 'Undo', onPress: () => controller.restoreAttention(variant) },
    });
  }, [controller, toast]);

  return { pullRefreshing, onPullRefresh, applyStatus, applyType, dismiss };
}

function TransactionsContent({ controller }: { controller: TransactionsController }) {
  const feedback = useTransactionsFeedback(controller);
  const bleed = useAdminTopBleed();
  const { summary, statusCounts, typeCounts, metaTotalCount, statusFilter, typeFilter, rows } = controller;
  const filtering = Boolean(statusFilter || typeFilter);
  const loadMoreError = controller.error && rows.length > 0 && !controller.isRefreshing ? controller.error : null;

  const statusChips = useMemo<AdminFilterChip<StatusChipId>[]>(
    () => [
      { id: 'all', label: 'All', count: metaTotalCount },
      ...(['pending', 'succeeded', 'failed', 'refunded'] as const).map((status) => ({
        id: status,
        label: PAYMENT_STATUS_LABELS[status],
        count: statusCounts[status] ?? 0,
      })),
    ],
    [metaTotalCount, statusCounts],
  );

  const typeChips = useMemo<AdminFilterChip<TypeChipId>[]>(
    () => [
      { id: 'all', label: 'All types', count: metaTotalCount },
      ...(['application_fee', 'enrollment_checklist', 'tuition'] as const).map((type) => ({
        id: type,
        label: PAYMENT_TYPE_LABELS[type],
        count: typeCounts[type] ?? 0,
      })),
    ],
    [metaTotalCount, typeCounts],
  );

  const attention = controller.attentionVariant;
  const header = (
    <View style={styles.headerBlock}>
      {controller.hasAnyPayments ? (
        <Animated.View entering={FadeInDown.delay(40).duration(320).easing(PORTAL_EASE)}>
          <AdminKpiTiles
            tiles={[
              {
                id: 'collected',
                label: 'Collected this month',
                value: formatPaymentAmount(summary.collectedThisMonthCents),
                barColor: KPI_BARS.collected,
                onPress: () => feedback.applyStatus('succeeded'),
                testID: 'transactions-kpi-collected',
              },
              {
                id: 'pending',
                label: summary.pendingCount > 0 ? `Pending · ${formatPaymentAmount(summary.pendingCents)}` : 'Pending',
                value: String(summary.pendingCount),
                barColor: KPI_BARS.pending,
                onPress: () => feedback.applyStatus('pending'),
                testID: 'transactions-kpi-pending',
              },
              {
                id: 'failed',
                label: 'Failed',
                value: String(summary.failedCount),
                barColor: KPI_BARS.failed,
                onPress: () => feedback.applyStatus('failed'),
                testID: 'transactions-kpi-failed',
              },
              {
                id: 'refunded',
                label: summary.refundedCount > 0 ? `Refunded · ${formatPaymentAmount(summary.refundedCents)}` : 'Refunded',
                value: String(summary.refundedCount),
                barColor: KPI_BARS.refunded,
                onPress: () => feedback.applyStatus('refunded'),
                testID: 'transactions-kpi-refunded',
              },
            ]}
          />
        </Animated.View>
      ) : null}

      {controller.showAttention && attention && statusFilter !== attention ? (
        <Animated.View entering={FadeInDown.delay(90).duration(320).easing(PORTAL_EASE)} style={styles.attention}>
          <AdminLeadStrip
            label="Needs attention"
            testID="transactions-attention"
            icon={attention === 'failed' ? 'alert-circle-outline' : 'hourglass-outline'}
            title={
              attention === 'failed'
                ? `${summary.failedCount} ${summary.failedCount === 1 ? 'payment failed' : 'payments failed'} and may need follow-up.`
                : `${summary.pendingCount} payment${summary.pendingCount === 1 ? ' is' : 's are'} still pending.`
            }
            subtitle={attention === 'failed' ? 'Open each one to see the family and application.' : null}
            pillLabel={attention === 'failed' ? 'View failed' : 'View pending'}
            onPress={() => feedback.applyStatus(attention)}
          />
          <GLink label="Dismiss" icon={null} accessibilityLabel="Dismiss payment alert" onPress={feedback.dismiss} style={styles.dismiss} />
        </Animated.View>
      ) : null}

      {controller.hasAnyPayments ? (
        <View style={styles.filters}>
          <AdminFilterChips<StatusChipId>
            accessibilityLabel="Filter by status"
            items={statusChips}
            activeId={statusFilter || 'all'}
            onChange={(id) => feedback.applyStatus(id === 'all' ? '' : id)}
          />
          <AdminFilterChips<TypeChipId>
            accessibilityLabel="Filter by type"
            items={typeChips}
            activeId={typeFilter || 'all'}
            onChange={(id) => feedback.applyType(id === 'all' ? '' : id)}
          />
        </View>
      ) : null}

      {controller.error && rows.length === 0 ? (
        <GInlineBanner
          tone="error"
          title="Couldn't load payments"
          description={controller.error}
          action={<GLink label="Try again" icon="refresh" onPress={() => void feedback.onPullRefresh()} />}
        />
      ) : null}

      {filtering && rows.length > 0 ? (
        <Text style={styles.resultCount} accessibilityLiveRegion="polite">
          Showing {rows.length} of {controller.totalCount}
        </Text>
      ) : null}
    </View>
  );

  return (
    <View style={[styles.root, bleed]} testID="school-admin-transactions-ready">
      <StatusBar style="dark" />
      <View style={styles.top}>
        <AdminTabHeader
          title="Transactions"
          accentWord="Transactions"
          statusLine={transactionsStatusLine(metaTotalCount, summary.collectedThisMonthCents)}
          lastUpdatedAt={controller.lastUpdatedAt}
          statusTestID="transactions-status-line"
        />
      </View>
      <FlatList
        data={rows}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={Separator}
        ListHeaderComponent={header}
        initialNumToRender={10}
        maxToRenderPerBatch={8}
        onEndReached={controller.loadMoreIfAny}
        onEndReachedThreshold={0.4}
        refreshControl={
          <RefreshControl refreshing={feedback.pullRefreshing} onRefresh={() => void feedback.onPullRefresh()} tintColor={Garden.soft} />
        }
        ListFooterComponent={
          controller.isLoadingMore ? (
            <View style={styles.footer}>
              <AdminRowSkeleton count={2} />
            </View>
          ) : loadMoreError ? (
            <View style={styles.footer}>
              <GInlineBanner
                tone="error"
                title="Couldn't load more payments"
                description={loadMoreError}
                action={<GLink label="Try again" icon="refresh" onPress={() => void controller.loadMore()} />}
              />
            </View>
          ) : rows.length > 0 && !controller.hasMore ? (
            <AdminEndLine label={filtering ? 'That’s every match' : 'That’s every payment'} />
          ) : null
        }
        ListEmptyComponent={
          controller.isRefreshing ? (
            <AdminRowSkeleton count={4} />
          ) : filtering && controller.hasAnyPayments ? (
            <AdminEmptyPanel
              icon="search-outline"
              title="No payments match the current filters."
              actionLabel="Show every payment"
              onAction={() => {
                feedback.applyStatus('');
                feedback.applyType('');
              }}
            />
          ) : (
            <AdminEmptyPanel
              icon="card-outline"
              title="No payments yet."
              body="When families pay application, enrollment, or tuition fees, they will appear here."
            />
          )
        }
        renderItem={({ item }) => <PaymentRow payment={item} onPress={item.applicationId ? controller.openPayment : undefined} />}
      />
    </View>
  );
}

const PaymentRow = memo(function PaymentRow({
  payment,
  onPress,
}: {
  payment: PaymentRecordDisplayRow;
  onPress?: (payment: PaymentRecordDisplayRow) => void;
}) {
  const title = payment.label ?? PAYMENT_TYPE_LABELS[payment.paymentType];
  const payerLine = [payment.payerEmail, payment.applicantLabel].filter(Boolean).join(' · ');
  const method = payment.paymentMethodType ? PAYMENT_METHOD_LABELS[payment.paymentMethodType] : null;
  const when = formatRelativeTime(payment.paidAt ?? payment.createdAt);
  const meta = [payerLine, method, when].filter(Boolean).join(' · ');
  const charged =
    payment.chargedAmountCents && payment.chargedAmountCents !== payment.amountCents
      ? `Charged ${formatPaymentAmount(payment.chargedAmountCents)}${
          payment.processingFeeCents ? ` (+${formatPaymentAmount(payment.processingFeeCents)} fee)` : ''
        }`
      : null;

  const body = (
    <>
      <AdminIconChip name={TYPE_ICONS[payment.paymentType]} tint={TYPE_TINTS[payment.paymentType]} size={40} />
      <View style={styles.rowCopy}>
        <View style={styles.rowTop}>
          <Text style={styles.rowTitle} numberOfLines={2}>
            {title}
          </Text>
          <Text style={styles.amount}>{formatPaymentAmount(payment.amountCents)}</Text>
        </View>
        <View style={styles.chips}>
          <GChip label={PAYMENT_STATUS_LABELS[payment.status]} tone={STATUS_TONES[payment.status]} />
          <GChip label={PAYMENT_TYPE_LABELS[payment.paymentType]} tone="neutral" />
        </View>
        {meta ? (
          <Text style={styles.rowMeta} numberOfLines={2}>
            {meta}
          </Text>
        ) : null}
        {charged ? <Text style={styles.rowMeta}>{charged}</Text> : null}
        {onPress && payment.applicantLabel ? (
          <View style={styles.linkRow}>
            <Text style={styles.linkText}>{payment.applicantLabel} · View application</Text>
            <Ionicons name="chevron-forward" size={14} color={Garden.forest} />
          </View>
        ) : null}
      </View>
    </>
  );

  if (!onPress) {
    return (
      <View style={styles.card} accessible accessibilityLabel={`${title}. ${formatPaymentAmount(payment.amountCents)}. ${PAYMENT_STATUS_LABELS[payment.status]}`}>
        {body}
      </View>
    );
  }
  return (
    <GPressable accessibilityLabel={title} accessibilityHint="Opens the application" pressedScale={0.985} onPress={() => onPress(payment)} style={styles.card}>
      {body}
    </GPressable>
  );
});

function Separator() {
  return <View style={styles.separator} />;
}

function TransactionsError({ controller }: { controller: TransactionsController }) {
  const bleed = useAdminTopBleed();
  return (
    <ScrollView style={[styles.root, bleed]} contentContainerStyle={styles.errorWrap}>
      <StatusBar style="dark" />
      <AdminTabHeader title="Transactions" accentWord="Transactions" />
      <GErrorCard
        title="We couldn't load payments"
        message={controller.error ?? 'Failed to load transactions.'}
        onRetry={() => void controller.retryFirstLoad()}
      />
    </ScrollView>
  );
}

function TransactionsSkeleton() {
  const bleed = useAdminTopBleed();
  return (
    <ScrollView style={[styles.root, bleed]} scrollEnabled={false} accessibilityLabel="Loading transactions" contentContainerStyle={styles.skeleton}>
      <GSkeleton style={styles.skTitle} />
      <GSkeleton style={styles.skStatus} />
      <View style={styles.skGrid}>
        <GSkeleton style={styles.skTile} />
        <GSkeleton style={styles.skTile} />
        <GSkeleton style={styles.skTile} />
        <GSkeleton style={styles.skTile} />
      </View>
      <GSkeleton style={styles.skChips} />
      <GSkeleton style={styles.skRow} />
      <GSkeleton style={styles.skRow} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Garden.cream },
  top: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 6 },
  list: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 32, flexGrow: 1 },
  headerBlock: { gap: 14, marginBottom: 14 },
  attention: { gap: 6 },
  dismiss: { alignSelf: 'flex-end', marginRight: 4 },
  filters: { gap: 8 },
  separator: { height: 10 },
  footer: { paddingTop: 12 },
  resultCount: { fontFamily: GardenFonts.bodyBold, fontSize: 13, color: Garden.soft, fontVariant: ['tabular-nums'] },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: Garden.ink10,
    backgroundColor: Garden.white,
    padding: 12,
  },
  rowCopy: { flex: 1, minWidth: 0, gap: 6 },
  rowTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  rowTitle: { flex: 1, fontFamily: GardenFonts.bodyExtra, fontSize: 15.5, lineHeight: 20, color: Garden.ink },
  amount: { fontFamily: GardenFonts.display, fontSize: 18, lineHeight: 22, color: Garden.ink, fontVariant: ['tabular-nums'] },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  rowMeta: { fontFamily: GardenFonts.bodySemi, fontSize: 13, lineHeight: 18, color: Garden.soft },
  linkRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  linkText: { fontFamily: GardenFonts.bodyExtra, fontSize: 13, color: Garden.forest },
  errorWrap: { paddingHorizontal: 16, paddingTop: 8, gap: 16 },
  skeleton: { paddingHorizontal: 16, paddingTop: 8, gap: 12 },
  skTitle: { width: '60%', height: 32, borderRadius: 10, marginTop: 6 },
  skStatus: { width: '75%', height: 16, borderRadius: 8 },
  skGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 6 },
  skTile: { flexGrow: 1, flexBasis: '45%', height: 104, borderRadius: 18 },
  skChips: { height: 40, borderRadius: 20 },
  skRow: { height: 120, borderRadius: 18 },
});
