import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { Garden, GardenFonts } from '@/components/parent/garden/tokens';
import {
  GCard,
  GChip,
  GCountUp,
  GHand,
  GOutlineButton,
  GTick,
  GToyButton,
} from '@/components/parent/garden/ui';
import type { ParentBillingNextCharge } from '@/lib/parent/parent-portal-api';
import { formatBillingDueDate, formatCents, formatDueCountdown } from '@/lib/tuition/format-cents';
import type { ParentLastPaymentDaySummary } from '@/lib/tuition/payment-summary';
import { EXTRA_PAY_BUTTON_LABEL } from '@/lib/tuition/tuition-pay-copy';

export type BillingDueCardProps = {
  balanceDueCents: number;
  nextCharge: ParentBillingNextCharge | null;
  nextChargeId: string | null;
  payNowLabel: string;
  paying: boolean;
  autopayEnabled: boolean;
  hasMultipleChildren?: boolean;
  hasPendingSchedule?: boolean;
  hasAnyCharges: boolean;
  familyTotalRemainingCents?: number | null;
  showEstimatedAnnual?: boolean;
  estimatedAnnualCents?: number;
  lastPaymentSummary: ParentLastPaymentDaySummary | null;
  canPayExtra?: boolean;
  /** A payment just landed: show the confirmation line. */
  justPaid?: boolean;
  onPay: () => void;
  onPayExtra?: () => void;
  index?: number;
  testID: string;
};

function formatNames(names: string[]): string {
  if (names.length === 0) return '';
  if (names.length === 1) return names[0]!;
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names.slice(0, -1).join(', ')}, and ${names[names.length - 1]}`;
}

/** "Next payment": the amount due, when, and the one Pay button on the screen. */
export function BillingDueCard({
  balanceDueCents,
  nextCharge,
  nextChargeId,
  payNowLabel,
  paying,
  autopayEnabled,
  hasMultipleChildren = false,
  hasPendingSchedule = false,
  hasAnyCharges,
  familyTotalRemainingCents = null,
  showEstimatedAnnual = false,
  estimatedAnnualCents = 0,
  lastPaymentSummary,
  canPayExtra = false,
  justPaid = false,
  onPay,
  onPayExtra,
  index = 0,
  testID,
}: BillingDueCardProps) {
  const countdown = nextCharge ? formatDueCountdown(nextCharge.dueDate) : null;
  const showCountdown =
    countdown != null && (countdown.urgency === 'overdue' || countdown.urgency === 'urgent');
  const showPayButton = Boolean(nextCharge && nextChargeId) && balanceDueCents > 0;

  const title =
    balanceDueCents > 0
      ? 'Ready to pay'
      : hasPendingSchedule || !hasAnyCharges
        ? 'Nothing due yet'
        : 'All caught up';

  const lastPaymentDate = lastPaymentSummary?.paidAt
    ? formatBillingDueDate(lastPaymentSummary.paidAt.slice(0, 10))
    : null;
  const lastPaymentNames = lastPaymentSummary?.studentFirstNames.length
    ? ` for ${formatNames(lastPaymentSummary.studentFirstNames)}`
    : '';

  return (
    <GCard index={index} kicker="Next payment" title={title} testID={testID}>
      <View style={styles.body}>
        {justPaid ? (
          <Animated.View entering={FadeIn.duration(260)} style={styles.paidLine}>
            <GTick size={22} />
            <Text style={styles.paidText}>Payment received. Your balance has been updated.</Text>
          </Animated.View>
        ) : null}

        {nextCharge && ((autopayEnabled && balanceDueCents > 0) || (hasPendingSchedule && !hasMultipleChildren)) ? (
          <View style={styles.chips}>
            {autopayEnabled && balanceDueCents > 0 ? (
              <GChip tone="info" icon="sync-outline" label="Autopay on" />
            ) : null}
            {hasPendingSchedule && !hasMultipleChildren ? (
              <GChip tone="warning" icon="calendar-outline" label="Schedule needed" />
            ) : null}
          </View>
        ) : null}

        <View style={styles.amountRow}>
          <GCountUp
            value={balanceDueCents}
            format={formatCents}
            style={styles.amount}
            accessibilityLabel={`${formatCents(balanceDueCents)} due`}
          />
          {balanceDueCents === 0 && title === 'All caught up' ? <GTick size={30} /> : null}
        </View>

        {nextCharge ? (
          <View style={styles.dueRow}>
            <Text style={styles.meta}>
              Due {formatBillingDueDate(nextCharge.dueDate)}
              {hasMultipleChildren && balanceDueCents > 0 ? ' · Family total due' : ''}
            </Text>
            {showCountdown ? (
              <GChip
                tone={countdown!.urgency === 'overdue' ? 'alert' : 'warning'}
                icon="time-outline"
                label={countdown!.label}
              />
            ) : null}
          </View>
        ) : (
          <Text style={styles.meta}>No payment due right now</Text>
        )}

        {familyTotalRemainingCents != null && familyTotalRemainingCents > 0 ? (
          <Text style={styles.meta}>
            Family total remaining: {formatCents(familyTotalRemainingCents)}
          </Text>
        ) : null}

        {showEstimatedAnnual && estimatedAnnualCents > 0 ? (
          <Text style={styles.meta}>
            Estimated annual tuition: {formatCents(estimatedAnnualCents)}
          </Text>
        ) : null}

        {lastPaymentSummary && lastPaymentDate ? (
          <View style={styles.lastPayment} testID="parent-billing-last-payment-banner">
            <Ionicons name="checkmark-circle" size={16} color={Garden.forest} />
            <Text style={styles.lastPaymentText}>
              Last payment: {formatCents(lastPaymentSummary.amountCents)} on {lastPaymentDate}
              {lastPaymentNames}
            </Text>
          </View>
        ) : null}

        {autopayEnabled && nextCharge && balanceDueCents > 0 ? (
          <Text style={styles.hint} testID="parent-billing-pay-early-hint">
            Autopay will charge your saved card on the due date. Pay early anytime if you prefer.
          </Text>
        ) : null}

        {showPayButton ? (
          <View style={styles.actions}>
            <View testID="parent-billing-family-pay-now">
              <GToyButton
                size="md"
                fullWidth
                icon="lock-closed"
                label={paying ? 'Starting…' : payNowLabel}
                accessibilityHint="Choose an amount and payment method, then finish on secure checkout"
                loading={paying}
                onPress={onPay}
              />
            </View>
            {canPayExtra && onPayExtra ? (
              <GOutlineButton
                label={EXTRA_PAY_BUTTON_LABEL}
                icon="add-circle-outline"
                onPress={() => {
                  if (!paying) onPayExtra();
                }}
                style={styles.extra}
              />
            ) : null}
            <View style={styles.secure}>
              <Ionicons name="shield-checkmark-outline" size={14} color={Garden.soft} />
              <Text style={styles.secureText}>Card or bank · secure checkout</Text>
            </View>
          </View>
        ) : title === 'All caught up' ? (
          <GHand>nothing owed today ✿</GHand>
        ) : null}
      </View>
    </GCard>
  );
}

const styles = StyleSheet.create({
  body: {
    gap: 8,
    marginTop: 4,
  },
  paidLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: 14,
    backgroundColor: Garden.mint,
  },
  paidText: {
    flex: 1,
    fontFamily: GardenFonts.bodyBold,
    fontSize: 14,
    lineHeight: 19,
    color: Garden.forest,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  amount: {
    fontFamily: GardenFonts.display,
    fontSize: 46,
    lineHeight: 50,
    letterSpacing: -1.5,
    color: Garden.ink,
  },
  dueRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
  },
  meta: {
    fontFamily: GardenFonts.bodySemi,
    fontSize: 14,
    lineHeight: 19,
    color: Garden.soft,
  },
  lastPayment: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: Garden.mint,
  },
  lastPaymentText: {
    flexShrink: 1,
    fontFamily: GardenFonts.bodyBold,
    fontSize: 13,
    lineHeight: 17,
    color: Garden.forest,
  },
  hint: {
    fontFamily: GardenFonts.bodySemi,
    fontSize: 13,
    lineHeight: 18,
    color: Garden.soft,
  },
  actions: {
    gap: 10,
    marginTop: 6,
  },
  extra: {
    alignSelf: 'stretch',
    justifyContent: 'center',
  },
  secure: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  secureText: {
    fontFamily: GardenFonts.bodySemi,
    fontSize: 12,
    color: Garden.soft,
  },
});
