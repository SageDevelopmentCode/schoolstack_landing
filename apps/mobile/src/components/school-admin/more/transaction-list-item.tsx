import { StyleSheet, View } from 'react-native';

import { AdminListCard, AdminListCardPressable } from '@/components/school-admin/admin-list-card';
import { StatusBadge } from '@/components/ui/status-badge';
import { ThemedText } from '@/components/themed-text';
import { useAdminTheme } from '@/contexts/admin-theme-context';
import { Spacing } from '@/constants/theme';
import {
  formatPaymentAmount,
  formatPaymentDateTime,
  PAYMENT_STATUS_LABELS,
  PAYMENT_TYPE_LABELS,
  type PaymentRecordDisplayRow,
  type PaymentStatus,
} from '@/lib/admissions/payment-records';
import type { MobileAdminTheme } from '@/lib/organization-settings/build-admin-theme';

type TransactionListItemProps = {
  payment: PaymentRecordDisplayRow;
  onPress?: (payment: PaymentRecordDisplayRow) => void;
};

function statusBadgeColors(status: PaymentStatus, theme: MobileAdminTheme) {
  switch (status) {
    case 'succeeded':
      return { backgroundColor: theme.successBg, color: theme.success };
    case 'pending':
      return { backgroundColor: theme.warningBg, color: theme.warning };
    case 'failed':
      return { backgroundColor: theme.errorBg, color: theme.error };
    case 'refunded':
      return { backgroundColor: theme.elevated, color: theme.textSecondary };
  }
}

function TransactionListItemBody({ payment }: { payment: PaymentRecordDisplayRow }) {
  const theme = useAdminTheme();
  const title = payment.label ?? PAYMENT_TYPE_LABELS[payment.paymentType];
  const metaParts = [payment.applicantLabel, payment.payerEmail].filter(Boolean);

  return (
    <>
      <View style={styles.topRow}>
        <ThemedText
          type="smallBold"
          numberOfLines={2}
          style={[styles.title, { color: theme.textPrimary }]}>
          {title}
        </ThemedText>
        <ThemedText type="smallBold" style={{ color: theme.textPrimary }}>
          {formatPaymentAmount(payment.amountCents)}
        </ThemedText>
      </View>
      <View style={styles.badgeRow}>
        <StatusBadge
          label={PAYMENT_STATUS_LABELS[payment.status]}
          colors={statusBadgeColors(payment.status, theme)}
        />
        <StatusBadge
          label={PAYMENT_TYPE_LABELS[payment.paymentType]}
          colors={{ backgroundColor: theme.infoBg, color: theme.info }}
        />
      </View>
      {metaParts.length > 0 ? (
        <ThemedText type="small" numberOfLines={1} style={{ color: theme.textSecondary }}>
          {metaParts.join(' · ')}
        </ThemedText>
      ) : null}
      <ThemedText type="small" style={{ color: theme.textTertiary }}>
        {formatPaymentDateTime(payment.paidAt ?? payment.createdAt)}
      </ThemedText>
    </>
  );
}

export function TransactionListItem({ payment, onPress }: TransactionListItemProps) {
  return (
    <AdminListCard>
      {onPress ? (
        <AdminListCardPressable onPress={() => onPress(payment)}>
          <TransactionListItemBody payment={payment} />
        </AdminListCardPressable>
      ) : (
        <TransactionListItemBody payment={payment} />
      )}
    </AdminListCard>
  );
}

const styles = StyleSheet.create({
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.two,
  },
  title: {
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.one,
  },
});
