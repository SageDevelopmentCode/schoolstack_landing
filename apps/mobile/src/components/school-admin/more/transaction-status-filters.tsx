import { ScrollView, StyleSheet, View } from 'react-native';

import { AdmissionsFilterPill } from '@/components/school-admin/admissions/admissions-filter-pill';
import { Spacing } from '@/constants/theme';
import {
  PAYMENT_STATUS_LABELS,
  PAYMENT_TYPE_LABELS,
  type PaymentStatus,
  type PaymentType,
} from '@/lib/admissions/payment-records';

type TransactionStatusFiltersProps = {
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

export function TransactionStatusFilters({
  activeStatus,
  activeType,
  statusCounts,
  typeCounts,
  totalCount,
  onChangeStatus,
  onChangeType,
}: TransactionStatusFiltersProps) {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}>
        {STATUS_FILTERS.map((filter) => (
          <AdmissionsFilterPill
            key={filter.value || 'all-status'}
            active={activeStatus === filter.value}
            label={filter.label}
            count={filter.value ? statusCounts[filter.value] : totalCount}
            onPress={() => onChangeStatus(filter.value)}
          />
        ))}
      </ScrollView>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}>
        {TYPE_FILTERS.map((filter) => (
          <AdmissionsFilterPill
            key={filter.value || 'all-type'}
            active={activeType === filter.value}
            label={filter.label}
            count={filter.value ? typeCounts[filter.value] : totalCount}
            onPress={() => onChangeType(filter.value)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.two,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingBottom: Spacing.one,
  },
});
