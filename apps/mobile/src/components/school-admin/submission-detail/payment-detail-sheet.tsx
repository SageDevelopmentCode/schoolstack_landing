import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ReadOnlyFieldRow } from '@/components/school-admin/submission-detail/read-only-field-row';
import { StatusBadge } from '@/components/ui/status-badge';
import { ThemedText } from '@/components/themed-text';
import { useAdminTheme } from '@/contexts/admin-theme-context';
import { Spacing } from '@/constants/theme';
import { formatFeeAmount } from '@/lib/admissions/application-form-schema';
import {
  formatPaymentAmount,
  formatPaymentDateTime,
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_LABELS,
  PAYMENT_TYPE_LABELS,
  type PaymentRecordDisplayRow,
} from '@/lib/admissions/payment-records';

type PaymentDetailSheetProps = {
  visible: boolean;
  payment: PaymentRecordDisplayRow | null;
  onClose: () => void;
};

function paymentStatusBadgeColors(
  status: PaymentRecordDisplayRow['status'],
  theme: ReturnType<typeof useAdminTheme>,
) {
  switch (status) {
    case 'succeeded':
      return { backgroundColor: theme.successBg, color: theme.success };
    case 'pending':
      return { backgroundColor: theme.warningBg, color: theme.warning };
    case 'failed':
      return { backgroundColor: theme.errorBg, color: theme.error };
    default:
      return { backgroundColor: theme.elevated, color: theme.textSecondary };
  }
}

export function PaymentDetailSheet({ visible, payment, onClose }: PaymentDetailSheetProps) {
  const theme = useAdminTheme();
  const insets = useSafeAreaInsets();

  if (!payment) return null;

  const chargedAmount = payment.chargedAmountCents ?? payment.amountCents;
  const methodLabel = payment.paymentMethodType
    ? PAYMENT_METHOD_LABELS[payment.paymentMethodType]
    : '—';

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={[styles.container, { backgroundColor: theme.bg, paddingTop: insets.top }]}>
        <View style={[styles.header, { borderBottomColor: theme.border }]}>
          <Pressable accessibilityRole="button" onPress={onClose}>
            <ThemedText type="small" style={{ color: theme.accent }}>
              Close
            </ThemedText>
          </Pressable>
          <ThemedText type="smallBold" style={{ color: theme.textPrimary }}>
            Payment details
          </ThemedText>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.titleRow}>
            <View style={{ flex: 1, gap: 4 }}>
              <ThemedText type="subtitle" style={{ color: theme.textPrimary }}>
                {payment.label ?? PAYMENT_TYPE_LABELS[payment.paymentType]}
              </ThemedText>
              <ThemedText type="small" style={{ color: theme.textTertiary }}>
                {formatPaymentDateTime(payment.paidAt ?? payment.createdAt)}
              </ThemedText>
            </View>
            <View style={styles.amountColumn}>
              <ThemedText type="subtitle" style={{ color: theme.textPrimary }}>
                {formatPaymentAmount(payment.amountCents)}
              </ThemedText>
              <StatusBadge
                label={PAYMENT_STATUS_LABELS[payment.status]}
                colors={paymentStatusBadgeColors(payment.status, theme)}
              />
            </View>
          </View>

          <View style={[styles.breakdown, { backgroundColor: theme.elevated, borderColor: theme.border }]}>
            <ReadOnlyFieldRow label="Family paid" value={formatFeeAmount(chargedAmount)} />
            {payment.processingFeeCents ? (
              <ReadOnlyFieldRow
                label="Processing fee"
                value={`+${formatFeeAmount(payment.processingFeeCents)}`}
              />
            ) : null}
            <ReadOnlyFieldRow label="Method" value={methodLabel} />
            <ReadOnlyFieldRow label="Type" value={PAYMENT_TYPE_LABELS[payment.paymentType]} />
            {payment.payerEmail ? (
              <ReadOnlyFieldRow label="Payer email" value={payment.payerEmail} />
            ) : null}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerSpacer: {
    width: 48,
  },
  content: {
    padding: Spacing.four,
    gap: Spacing.four,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.three,
  },
  amountColumn: {
    alignItems: 'flex-end',
    gap: Spacing.two,
  },
  breakdown: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    padding: Spacing.three,
    gap: Spacing.three,
  },
});
