import { Pressable, StyleSheet, View } from 'react-native';

import { AdminListCard } from '@/components/school-admin/admin-list-card';
import { ThemedText } from '@/components/themed-text';
import { useAdminTheme } from '@/contexts/admin-theme-context';
import { Radius, Spacing } from '@/constants/theme';
import type { TuitionCharge } from '@/lib/parent/parent-portal-api';
import { chargeRemainingCents } from '@/lib/tuition/billing-helpers';
import { formatBillingDueDate, formatCents, formatDueCountdown } from '@/lib/tuition/format-cents';

type ParentBillingChargeRowProps = {
  charge: TuitionCharge;
  studentName?: string | null;
  onPay?: () => void;
  paying?: boolean;
};

export function ParentBillingChargeRow({
  charge,
  studentName,
  onPay,
  paying = false,
}: ParentBillingChargeRowProps) {
  const theme = useAdminTheme();
  const remaining = chargeRemainingCents(charge);
  const countdown = formatDueCountdown(charge.dueDate);
  const urgencyColor =
    countdown.urgency === 'overdue'
      ? theme.error
      : countdown.urgency === 'urgent'
        ? '#B45309'
        : theme.textSecondary;

  const label = studentName ? `${studentName} — ${charge.label}` : charge.label;
  const partialPaid = charge.paidCents > 0 && remaining > 0;

  return (
    <AdminListCard>
      <View style={styles.row}>
        <View style={styles.textColumn}>
          <ThemedText type="smallBold" style={{ color: theme.textPrimary }}>
            {label}
          </ThemedText>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            Due {formatBillingDueDate(charge.dueDate)}
          </ThemedText>
          <ThemedText type="small" style={{ color: urgencyColor }}>
            {countdown.label}
          </ThemedText>
          {partialPaid ? (
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              {formatCents(charge.paidCents)} paid · {formatCents(remaining)} remaining
            </ThemedText>
          ) : null}
        </View>

        <View style={styles.amountColumn}>
          <ThemedText type="smallBold" style={{ color: theme.textPrimary }}>
            {formatCents(remaining)}
          </ThemedText>
          {onPay && remaining > 0 ? (
            <Pressable
              onPress={onPay}
              disabled={paying}
              accessibilityRole="button"
              accessibilityLabel={`Pay ${label}`}
              style={({ pressed }) => [
                styles.payButton,
                { backgroundColor: theme.accent },
                (paying || pressed) && { opacity: 0.75 },
              ]}>
              <ThemedText type="small" style={styles.payButtonLabel}>
                {paying ? 'Starting…' : 'Pay'}
              </ThemedText>
            </Pressable>
          ) : null}
        </View>
      </View>
    </AdminListCard>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.three,
  },
  textColumn: {
    flex: 1,
    gap: 2,
  },
  amountColumn: {
    alignItems: 'flex-end',
    gap: Spacing.two,
  },
  payButton: {
    minWidth: 56,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  payButtonLabel: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
