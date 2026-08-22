import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useAdminTheme } from '@/contexts/admin-theme-context';
import { Radius, Spacing } from '@/constants/theme';
import {
  formatPaymentAmount,
  type PaymentRowsSummary,
} from '@/lib/admissions/payment-records';

type TransactionSummaryCardsProps = {
  summary: PaymentRowsSummary;
};

function SummaryCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  const theme = useAdminTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.elevated,
          borderColor: theme.border,
        },
      ]}>
      <ThemedText type="small" style={{ color: theme.textTertiary }}>
        {label}
      </ThemedText>
      <ThemedText type="smallBold" style={[styles.value, { color }]}>
        {value}
      </ThemedText>
    </View>
  );
}

export function TransactionSummaryCards({ summary }: TransactionSummaryCardsProps) {
  const theme = useAdminTheme();

  const pendingValue =
    summary.pendingCount > 0
      ? `${summary.pendingCount} · ${formatPaymentAmount(summary.pendingCents)}`
      : '0';
  const refundedValue =
    summary.refundedCount > 0
      ? `${summary.refundedCount} · ${formatPaymentAmount(summary.refundedCents)}`
      : '0';

  return (
    <View style={styles.grid}>
      <View style={styles.row}>
        <SummaryCard
          label="Collected this month"
          value={formatPaymentAmount(summary.collectedThisMonthCents)}
          color={theme.success}
        />
        <SummaryCard
          label="Pending"
          value={pendingValue}
          color={summary.pendingCount > 0 ? theme.warning : theme.textSecondary}
        />
      </View>
      <View style={styles.row}>
        <SummaryCard
          label="Failed"
          value={String(summary.failedCount)}
          color={summary.failedCount > 0 ? theme.error : theme.textSecondary}
        />
        <SummaryCard
          label="Refunded"
          value={refundedValue}
          color={theme.textSecondary}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    gap: Spacing.two,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  card: {
    flex: 1,
    borderRadius: Radius.sm,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.two,
    gap: 4,
  },
  value: {
    fontSize: 16,
    lineHeight: 22,
  },
});
