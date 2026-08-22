import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useAdminTheme } from '@/contexts/admin-theme-context';
import { Radius, Spacing } from '@/constants/theme';
import {
  PAYMENT_STATUS_LABELS,
  PAYMENT_TYPE_LABELS,
  type PaymentStatus,
  type PaymentType,
} from '@/lib/admissions/payment-records';

type TransactionFiltersProps = {
  activeStatus: '' | PaymentStatus;
  activeType: '' | PaymentType;
  statusCounts: Partial<Record<PaymentStatus, number>>;
  typeCounts: Partial<Record<PaymentType, number>>;
  totalCount: number;
  onChangeStatus: (status: '' | PaymentStatus) => void;
  onChangeType: (type: '' | PaymentType) => void;
};

const STATUS_FILTERS: Array<{ value: '' | PaymentStatus; label: string }> = [
  { value: '', label: 'All' },
  { value: 'pending', label: PAYMENT_STATUS_LABELS.pending },
  { value: 'succeeded', label: PAYMENT_STATUS_LABELS.succeeded },
  { value: 'failed', label: PAYMENT_STATUS_LABELS.failed },
  { value: 'refunded', label: PAYMENT_STATUS_LABELS.refunded },
];

const TYPE_FILTERS: Array<{ value: '' | PaymentType; label: string }> = [
  { value: '', label: 'All' },
  { value: 'application_fee', label: PAYMENT_TYPE_LABELS.application_fee },
  { value: 'enrollment_checklist', label: PAYMENT_TYPE_LABELS.enrollment_checklist },
  { value: 'tuition', label: PAYMENT_TYPE_LABELS.tuition },
];

function FilterChip({
  active,
  label,
  count,
  onPress,
}: {
  active: boolean;
  label: string;
  count?: number;
  onPress: () => void;
}) {
  const theme = useAdminTheme();

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[
        styles.chip,
        {
          backgroundColor: active ? theme.accentLight : theme.surface,
          borderColor: active ? theme.accent : theme.border,
        },
      ]}>
      <ThemedText type="smallBold" style={{ color: active ? theme.accent : theme.textSecondary }}>
        {label}
        {count ? ` ${count}` : ''}
      </ThemedText>
    </Pressable>
  );
}

export function TransactionFilters({
  activeStatus,
  activeType,
  statusCounts,
  typeCounts,
  totalCount,
  onChangeStatus,
  onChangeType,
}: TransactionFiltersProps) {
  const theme = useAdminTheme();

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <ThemedText type="smallBold" style={[styles.rowLabel, { color: theme.accentDark }]}>
          Status
        </ThemedText>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}>
          {STATUS_FILTERS.map((filter) => (
            <FilterChip
              key={filter.value || 'all-status'}
              active={activeStatus === filter.value}
              label={filter.label}
              count={filter.value ? statusCounts[filter.value] : totalCount}
              onPress={() => onChangeStatus(filter.value)}
            />
          ))}
        </ScrollView>
      </View>
      <View style={styles.row}>
        <ThemedText type="smallBold" style={[styles.rowLabel, { color: theme.accentDark }]}>
          Type
        </ThemedText>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}>
          {TYPE_FILTERS.map((filter) => (
            <FilterChip
              key={filter.value || 'all-type'}
              active={activeType === filter.value}
              label={filter.label}
              count={filter.value ? typeCounts[filter.value] : totalCount}
              onPress={() => onChangeType(filter.value)}
            />
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.two,
  },
  row: {
    gap: Spacing.one,
  },
  rowLabel: {
    fontSize: 11,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  chips: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingBottom: Spacing.one,
  },
  chip: {
    borderRadius: Radius.pill,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
});
