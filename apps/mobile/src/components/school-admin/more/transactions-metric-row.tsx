import { Pressable, StyleSheet, Text, View } from 'react-native';

import { StoryCard } from '@/components/story/story-card';
import { useParentTheme } from '@/contexts/parent-theme-context';
import {
  formatPaymentAmount,
  type PaymentRowsSummary,
} from '@/lib/admissions/payment-records';
import type { PaymentStatus } from '@/lib/admissions/payment-records';
import { StoryCardPadding, StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';

type MetricAccent = 'forest' | 'sky' | 'gold' | 'berry';

const ACCENT_COLORS: Record<MetricAccent, string> = {
  forest: '#315E4F',
  sky: '#8ABAC6',
  gold: '#E4BD65',
  berry: '#B66A83',
};

type MetricItem = {
  value: string;
  label: string;
  accent: MetricAccent;
  onPress?: () => void;
};

type TransactionsMetricRowProps = {
  summary: PaymentRowsSummary;
  onFilterStatus?: (status: PaymentStatus) => void;
};

function TransactionsMetricCard({ value, label, accent, onPress }: MetricItem) {
  const theme = useParentTheme();

  const content = (
    <StoryCard compact style={styles.metricCard}>
      <View style={[styles.accentBar, { backgroundColor: ACCENT_COLORS[accent] }]} />
      <View style={styles.valueRow}>
        <Text
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.65}
          style={[styles.value, { color: theme.ink }]}>
          {value}
        </Text>
      </View>
      <Text style={[styles.label, { color: theme.muted }]}>{label}</Text>
    </StoryCard>
  );

  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => [styles.metricPressable, pressed && { opacity: 0.95 }]}>
        {content}
      </Pressable>
    );
  }

  return <View style={styles.metricPressable}>{content}</View>;
}

export function TransactionsMetricRow({ summary, onFilterStatus }: TransactionsMetricRowProps) {
  const pendingValue =
    summary.pendingCount > 0
      ? `${summary.pendingCount} · ${formatPaymentAmount(summary.pendingCents)}`
      : '0';
  const refundedValue =
    summary.refundedCount > 0
      ? `${summary.refundedCount} · ${formatPaymentAmount(summary.refundedCents)}`
      : '0';

  const metrics: MetricItem[] = [
    {
      value: formatPaymentAmount(summary.collectedThisMonthCents),
      label: 'Collected this month',
      accent: 'forest',
    },
    {
      value: pendingValue,
      label: 'Pending',
      accent: 'gold',
      onPress: onFilterStatus ? () => onFilterStatus('pending') : undefined,
    },
    {
      value: String(summary.failedCount),
      label: 'Failed',
      accent: 'berry',
      onPress: onFilterStatus ? () => onFilterStatus('failed') : undefined,
    },
    {
      value: refundedValue,
      label: 'Refunded',
      accent: 'sky',
      onPress: onFilterStatus ? () => onFilterStatus('refunded') : undefined,
    },
  ];

  return (
    <View style={styles.grid}>
      {metrics.map((metric) => (
        <TransactionsMetricCard key={metric.label} {...metric} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  metricPressable: {
    flexGrow: 1,
    flexBasis: '46%',
    minWidth: '46%',
    alignSelf: 'stretch',
  },
  metricCard: {
    flex: 1,
    padding: StoryCardPadding,
    paddingLeft: StoryCardPadding + 4,
    overflow: 'hidden',
  },
  valueRow: {
    minHeight: 28,
    justifyContent: 'center',
    marginBottom: Spacing.one,
  },
  accentBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  value: {
    fontFamily: StoryFonts.display,
    fontSize: 24,
    lineHeight: 28,
    fontWeight: '600',
  },
  label: {
    fontFamily: StoryFonts.body,
    fontSize: 13,
    lineHeight: 18,
  },
});
