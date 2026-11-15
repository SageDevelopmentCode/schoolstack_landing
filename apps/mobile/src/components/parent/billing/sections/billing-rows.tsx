import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { CHIP_TONES, Garden, GardenFonts, useGardenAccent, type GChipTone } from '@/components/parent/garden/tokens';
import { DateStamp, GChip, GDashedRule, GPressable, GTick } from '@/components/parent/garden/ui';
import type { ParentTuitionPaymentRecord, TuitionCharge } from '@/lib/parent/parent-portal-api';
import { chargeRemainingCents, OPEN_CHARGE_STATUSES } from '@/lib/tuition/billing-helpers';
import {
  formatParentChargeStatusBadge,
  type ChargeStatusBadgeTone,
} from '@/lib/tuition/charge-status-display';
import { formatBillingDueDate, formatCents, formatDueCountdown } from '@/lib/tuition/format-cents';
import {
  tuitionPaymentStripeStatusBadge,
  tuitionPaymentStripeStatusHint,
} from '@/lib/tuition/stripe-provider-status-display';

export function chipToneFor(tone: ChargeStatusBadgeTone): GChipTone {
  switch (tone) {
    case 'success':
      return 'success';
    case 'info':
    case 'accent':
      return 'info';
    case 'warning':
      return 'warning';
    case 'danger':
      return 'alert';
    default:
      return 'neutral';
  }
}

/**
 * One charge as a paper ticket: date stamp, dashed tear line, details, amount,
 * status and a Pay pill. Same data and labels as the old charge row.
 */
export function BillingChargeTicket({
  charge,
  studentName,
  autopayEnabled,
  paying,
  onPay,
  surface = Garden.white,
}: {
  charge: TuitionCharge;
  studentName: string | null;
  autopayEnabled: boolean;
  paying: boolean;
  onPay: () => void;
  /** Colour behind the ticket, used for the notches. */
  surface?: string;
}) {
  const accent = useGardenAccent();
  const remaining = chargeRemainingCents(charge);
  const countdown = formatDueCountdown(charge.dueDate);
  const label = studentName ? `${studentName} — ${charge.label}` : charge.label;
  const partialPaid = charge.paidCents > 0 && remaining > 0;
  const canPay = OPEN_CHARGE_STATUSES.has(charge.status) && remaining > 0;
  const showAutopayHint = autopayEnabled && canPay;
  const status = formatParentChargeStatusBadge(charge);
  const countdownColor =
    countdown.urgency === 'overdue'
      ? CHIP_TONES.alert.fg
      : countdown.urgency === 'urgent'
        ? CHIP_TONES.warning.fg
        : Garden.soft;

  return (
    <View style={styles.ticket}>
      <View style={[styles.notch, styles.notchLeft, { backgroundColor: surface }]} />
      <View style={[styles.notch, styles.notchRight, { backgroundColor: surface }]} />
      <DateStamp date={charge.dueDate} />
      {/* Absolute so the 60 dashes never set the row height; the wrapper clips them. */}
      <View style={styles.tear}>
        <GDashedRule vertical color={Garden.ink25} style={styles.tearRule} />
      </View>
      <View style={styles.ticketCopy}>
        <Text style={styles.ticketTitle} numberOfLines={2}>
          {label}
        </Text>
        <Text style={styles.ticketMeta}>Due {formatBillingDueDate(charge.dueDate)}</Text>
        <Text style={[styles.ticketMeta, { color: countdownColor }]}>{countdown.label}</Text>
        {partialPaid ? (
          <Text style={styles.ticketMeta}>
            {formatCents(charge.paidCents)} paid · {formatCents(remaining)} remaining
          </Text>
        ) : null}
        {showAutopayHint ? <Text style={styles.ticketMeta}>Autopay on due date</Text> : null}
      </View>
      <View style={styles.ticketRight}>
        <Text style={styles.ticketAmount}>{formatCents(remaining)}</Text>
        <GChip tone={chipToneFor(status.tone)} label={status.label} />
        {canPay ? (
          <GPressable
            accessibilityLabel={showAutopayHint ? `Pay ${label} early` : `Pay ${label}`}
            accessibilityState={{ busy: paying, disabled: paying }}
            disabled={paying}
            haptic="press"
            hitSlop={8}
            onPress={onPay}
            style={[styles.payPill, { backgroundColor: accent.clay }]}>
            {paying ? (
              <ActivityIndicator size="small" color={Garden.white} />
            ) : (
              <Text style={styles.payPillText}>Pay</Text>
            )}
          </GPressable>
        ) : null}
      </View>
    </View>
  );
}

function formatPaymentDate(iso: string | null): string {
  if (!iso) return 'Payment';
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/** One payment in the notebook list. Tapping opens the receipt. */
export function BillingPaymentRow({
  payment,
  first,
  onPress,
}: {
  payment: ParentTuitionPaymentRecord;
  first: boolean;
  onPress: () => void;
}) {
  const amount = payment.chargedAmountCents ?? payment.amountCents;
  const subtitle = payment.studentFirstName
    ? `${payment.studentFirstName} · ${payment.label ?? 'Tuition'}`
    : (payment.label ?? 'Tuition');
  const date = formatPaymentDate(payment.paidAt ?? payment.createdAt);
  const badge = tuitionPaymentStripeStatusBadge(payment);
  const hint = tuitionPaymentStripeStatusHint(payment);
  const hintColor =
    hint?.tone === 'danger'
      ? CHIP_TONES.alert.fg
      : hint?.tone === 'warning'
        ? CHIP_TONES.warning.fg
        : Garden.soft;

  return (
    <GPressable
      accessibilityLabel={`${formatCents(amount)}, ${subtitle}, ${date}${badge ? `, ${badge.label}` : ''}. Open receipt`}
      pressedScale={0.99}
      onPress={onPress}
      style={[styles.paymentRow, !first && styles.paymentRowDivider]}>
      {badge ? (
        <View style={[styles.statusIcon, { backgroundColor: CHIP_TONES[chipToneFor(badge.tone)].bg }]}>
          <Ionicons
            name={badge.tone === 'danger' ? 'close' : badge.tone === 'warning' ? 'alert' : 'time-outline'}
            size={14}
            color={CHIP_TONES[chipToneFor(badge.tone)].fg}
          />
        </View>
      ) : (
        <GTick size={26} />
      )}
      <View style={styles.paymentCopy}>
        <View style={styles.paymentTop}>
          <Text style={styles.paymentAmount}>{formatCents(amount)}</Text>
          {badge ? (
            <View testID={badge.testId} accessibilityLabel={badge.label}>
              <GChip tone={chipToneFor(badge.tone)} label={badge.label} />
            </View>
          ) : null}
        </View>
        <Text style={styles.paymentMeta} numberOfLines={1}>
          {subtitle} · {date}
        </Text>
        {hint ? <Text style={[styles.paymentHint, { color: hintColor }]}>{hint.message}</Text> : null}
      </View>
      <Ionicons name="chevron-forward" size={18} color={Garden.ink60} />
    </GPressable>
  );
}

const styles = StyleSheet.create({
  ticket: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingLeft: 16,
    paddingRight: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Garden.ink10,
    backgroundColor: Garden.paper,
    overflow: 'hidden',
  },
  notch: {
    position: 'absolute',
    top: '50%',
    width: 18,
    height: 18,
    marginTop: -9,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: Garden.ink10,
  },
  notchLeft: {
    left: -9,
  },
  notchRight: {
    right: -9,
  },
  tear: {
    alignSelf: 'stretch',
    width: 1.5,
    marginVertical: -4,
    overflow: 'hidden',
  },
  tearRule: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
  },
  ticketCopy: {
    flex: 1,
    gap: 1,
  },
  ticketTitle: {
    fontFamily: GardenFonts.bodyExtra,
    fontSize: 15,
    lineHeight: 20,
    color: Garden.ink,
  },
  ticketMeta: {
    fontFamily: GardenFonts.bodySemi,
    fontSize: 12,
    lineHeight: 17,
    color: Garden.soft,
  },
  ticketRight: {
    alignItems: 'flex-end',
    gap: 6,
  },
  ticketAmount: {
    fontFamily: GardenFonts.display,
    fontSize: 19,
    color: Garden.ink,
  },
  payPill: {
    minWidth: 64,
    height: 36,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: Garden.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  payPillText: {
    fontFamily: GardenFonts.bodyExtra,
    fontSize: 14,
    color: Garden.white,
  },
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 60,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  paymentRowDivider: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(46,74,60,0.1)',
  },
  statusIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentCopy: {
    flex: 1,
    gap: 2,
  },
  paymentTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  paymentAmount: {
    fontFamily: GardenFonts.bodyExtra,
    fontSize: 16,
    color: Garden.ink,
  },
  paymentMeta: {
    fontFamily: GardenFonts.bodySemi,
    fontSize: 13,
    color: Garden.soft,
  },
  paymentHint: {
    fontFamily: GardenFonts.bodySemi,
    fontSize: 12,
    lineHeight: 17,
  },
});
