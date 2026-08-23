import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import {
  AdminListCard,
  AdminListCardPressable,
} from '@/components/school-admin/admin-list-card';
import { ThemedText } from '@/components/themed-text';
import { useAdminTheme } from '@/contexts/admin-theme-context';
import { Spacing } from '@/constants/theme';
import type { ParentTuitionPaymentRecord } from '@/lib/parent/parent-portal-api';
import { formatCents } from '@/lib/tuition/format-cents';

type ParentBillingPaymentHistoryRowProps = {
  payment: ParentTuitionPaymentRecord;
  onPress: () => void;
};

function formatPaymentDate(iso: string | null): string {
  if (!iso) return 'Payment';
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function ParentBillingPaymentHistoryRow({
  payment,
  onPress,
}: ParentBillingPaymentHistoryRowProps) {
  const theme = useAdminTheme();
  const amount = payment.chargedAmountCents ?? payment.amountCents;
  const subtitle = payment.studentFirstName
    ? `${payment.studentFirstName} · ${payment.label ?? 'Tuition'}`
    : (payment.label ?? 'Tuition');

  return (
    <AdminListCard>
      <AdminListCardPressable onPress={onPress}>
        <View style={styles.row}>
          <View style={styles.textColumn}>
            <ThemedText type="smallBold" style={{ color: theme.textPrimary }}>
              {formatCents(amount)}
            </ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              {subtitle}
            </ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              {formatPaymentDate(payment.paidAt ?? payment.createdAt)}
            </ThemedText>
          </View>
          <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />
        </View>
      </AdminListCardPressable>
    </AdminListCard>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
  },
  textColumn: {
    flex: 1,
    gap: 2,
  },
});
