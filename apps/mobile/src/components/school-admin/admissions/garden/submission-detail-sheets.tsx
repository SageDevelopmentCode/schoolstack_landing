import { StyleSheet, Text, View } from 'react-native';

import { GSheet } from '@/components/parent/garden/sheet';
import { Garden, GardenFonts } from '@/components/parent/garden/tokens';
import { GChip } from '@/components/parent/garden/ui';
import { paymentTone } from '@/components/school-admin/admissions/garden/submission-detail-sections';
import { AdminInfoRow } from '@/components/school-admin/garden/admin-ui';
import { ApplicationFormStepReadOnly } from '@/components/school-admin/submission-detail/application-form-step-read-only';
import { EnrollmentChecklistItemReadOnly } from '@/components/school-admin/submission-detail/enrollment-checklist-item-read-only';
import { formatFeeAmount } from '@/lib/admissions/application-form-schema';
import type { ApplicationDetail } from '@/lib/admissions/application-detail';
import type { ApplicationFormStepWithStatus } from '@/lib/admissions/application-form-steps';
import {
  checklistItemStatusLabel,
  checklistItemTypeLabel,
  type EnrollmentChecklistItem,
  type EnrollmentChecklistItemInstance,
  type EnrollmentChecklistItemStatus,
} from '@/lib/admissions/enrollment-checklist';
import {
  formatPaymentAmount,
  formatPaymentDateTime,
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_LABELS,
  PAYMENT_TYPE_LABELS,
  type PaymentRecordDisplayRow,
} from '@/lib/admissions/payment-records';

function statusTone(status: EnrollmentChecklistItemStatus) {
  if (status === 'completed' || status === 'waived') return 'success' as const;
  if (status === 'in_progress') return 'info' as const;
  return 'neutral' as const;
}

/** "Step details": the read-only answers for one application form step. */
export function GardenApplicationStepSheet({
  visible,
  step,
  detail,
  feeStatus,
  onClose,
}: {
  visible: boolean;
  step: ApplicationFormStepWithStatus | null;
  detail: ApplicationDetail | null;
  feeStatus: string;
  onClose: () => void;
}) {
  if (!step || !detail) return null;
  return (
    <GSheet
      visible={visible}
      onClose={onClose}
      title={step.label}
      subtitle="Step details"
      headerAside={<GChip label={checklistItemStatusLabel(step.status)} tone={statusTone(step.status)} />}>
      <View style={styles.body}>
        <ApplicationFormStepReadOnly step={step} detail={detail} feeStatus={feeStatus} />
      </View>
    </GSheet>
  );
}

/** "Checklist item": what the family submitted for one enrollment checklist item. */
export function GardenChecklistItemSheet({
  visible,
  item,
  instance,
  onClose,
}: {
  visible: boolean;
  item: EnrollmentChecklistItem | null;
  instance: EnrollmentChecklistItemInstance | null;
  onClose: () => void;
}) {
  if (!item) return null;
  const status = instance?.status ?? 'not_started';
  return (
    <GSheet
      visible={visible}
      onClose={onClose}
      title={item.label}
      subtitle={`Checklist item · ${checklistItemTypeLabel(item.type)}${item.required ? '' : ' · Optional'}`}
      headerAside={<GChip label={checklistItemStatusLabel(status)} tone={statusTone(status)} />}>
      <View style={styles.body}>
        <EnrollmentChecklistItemReadOnly item={item} instance={instance} />
      </View>
    </GSheet>
  );
}

/** "Payment details": amount, status, method, payer. */
export function GardenPaymentSheet({
  visible,
  payment,
  onClose,
}: {
  visible: boolean;
  payment: PaymentRecordDisplayRow | null;
  onClose: () => void;
}) {
  if (!payment) return null;
  const chargedAmount = payment.chargedAmountCents ?? payment.amountCents;
  const methodLabel = payment.paymentMethodType ? PAYMENT_METHOD_LABELS[payment.paymentMethodType] : '—';
  const label = payment.label ?? PAYMENT_TYPE_LABELS[payment.paymentType];

  return (
    <GSheet
      visible={visible}
      onClose={onClose}
      title={label}
      subtitle={`Payment details · ${formatPaymentDateTime(payment.paidAt ?? payment.createdAt)}`}
      headerAside={<GChip label={PAYMENT_STATUS_LABELS[payment.status]} tone={paymentTone(payment.status)} />}>
      <View style={styles.body}>
        <View style={styles.amountCard} accessible accessibilityLabel={`Amount ${formatPaymentAmount(payment.amountCents)}`}>
          <Text style={styles.amountLabel}>Amount</Text>
          <Text style={styles.amount}>{formatPaymentAmount(payment.amountCents)}</Text>
        </View>
        <View style={styles.rows}>
          <AdminInfoRow label="Family paid" value={formatFeeAmount(chargedAmount)} />
          {payment.processingFeeCents ? (
            <AdminInfoRow
              label="Processing fee"
              value={`+${formatFeeAmount(payment.processingFeeCents)}`}
              divider
            />
          ) : null}
          <AdminInfoRow label="Method" value={methodLabel} divider />
          <AdminInfoRow label="Type" value={PAYMENT_TYPE_LABELS[payment.paymentType]} divider />
          {payment.payerEmail ? <AdminInfoRow label="Payer email" value={payment.payerEmail} divider /> : null}
        </View>
      </View>
    </GSheet>
  );
}

const styles = StyleSheet.create({
  body: { gap: 14, paddingBottom: 8 },
  amountCard: {
    borderRadius: 18,
    backgroundColor: Garden.white,
    borderWidth: 1.5,
    borderColor: Garden.ink10,
    padding: 16,
    gap: 2,
  },
  amountLabel: { fontFamily: GardenFonts.bodyBold, fontSize: 13, color: Garden.soft },
  amount: {
    fontFamily: GardenFonts.display,
    fontSize: 32,
    lineHeight: 36,
    color: Garden.ink,
    fontVariant: ['tabular-nums'],
  },
  rows: {
    borderRadius: 18,
    backgroundColor: Garden.white,
    borderWidth: 1.5,
    borderColor: Garden.ink10,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
});
