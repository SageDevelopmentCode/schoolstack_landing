import { StyleSheet, View } from 'react-native';

import { ReadOnlyFieldRow } from '@/components/school-admin/submission-detail/read-only-field-row';
import { ThemedText } from '@/components/themed-text';
import { useAdminTheme } from '@/contexts/admin-theme-context';
import { Spacing } from '@/constants/theme';
import { formatFeeAmount } from '@/lib/admissions/application-form-schema';
import type { ChecklistPaymentLineItem } from '@/lib/admissions/enrollment-checklist';

type PaymentFeeBreakdownProps = {
  lineItems: ChecklistPaymentLineItem[];
  totalCents: number;
};

export function PaymentFeeBreakdown({ lineItems, totalCents }: PaymentFeeBreakdownProps) {
  const theme = useAdminTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.elevated, borderColor: theme.border }]}>
      {lineItems.map((lineItem) => (
        <View key={lineItem.id} style={styles.row}>
          <ThemedText type="small" style={{ color: theme.textSecondary, flex: 1 }}>
            {lineItem.label}
          </ThemedText>
          <ThemedText type="smallBold" style={{ color: theme.textPrimary }}>
            {formatFeeAmount(lineItem.amountCents)}
          </ThemedText>
        </View>
      ))}
      <View style={[styles.totalRow, { borderTopColor: theme.border }]}>
        <ThemedText type="smallBold" style={{ color: theme.textPrimary }}>
          Total
        </ThemedText>
        <ThemedText type="smallBold" style={{ color: theme.textPrimary }}>
          {formatFeeAmount(totalCents)}
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 10,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: Spacing.two,
    marginTop: Spacing.one,
  },
});
