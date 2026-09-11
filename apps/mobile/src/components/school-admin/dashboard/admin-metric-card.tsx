import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useAdminTheme } from '@/contexts/admin-theme-context';
import { Radius, Spacing } from '@/constants/theme';
import type { DashboardMetric } from '@/lib/school-admin/dashboard-summary-types';

const ACCENT_COLORS: Record<DashboardMetric['accent'], string> = {
  forest: '#315E4F',
  sky: '#8ABAC6',
  gold: '#E4BD65',
  berry: '#B66A83',
};

type AdminMetricCardProps = {
  metric: DashboardMetric;
};

export function AdminMetricCard({ metric }: AdminMetricCardProps) {
  const theme = useAdminTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.surface,
          borderColor: theme.border,
        },
      ]}>
      <View style={[styles.accentBar, { backgroundColor: ACCENT_COLORS[metric.accent] }]} />
      <ThemedText type="title" style={[styles.value, { color: theme.textPrimary }]}>
        {metric.value}
      </ThemedText>
      <ThemedText type="small" style={{ color: theme.textSecondary }}>
        {metric.label}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: '46%',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.lg,
    padding: Spacing.three,
    paddingLeft: Spacing.three + 4,
    overflow: 'hidden',
  },
  accentBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  value: {
    fontSize: 24,
    lineHeight: 28,
    marginBottom: Spacing.one,
  },
});
