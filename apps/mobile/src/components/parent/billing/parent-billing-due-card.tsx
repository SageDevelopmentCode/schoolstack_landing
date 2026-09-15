import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { ParentBillingNeedsScheduleBadge } from '@/components/parent/billing/parent-billing-needs-schedule-badge';
import { StoryButton } from '@/components/story/story-button';
import { StoryCard } from '@/components/story/story-card';
import { StoryChip } from '@/components/story/story-chip';
import { StoryDisplayHeading } from '@/components/story/story-display-heading';
import { StorySectionKicker } from '@/components/story/story-section-kicker';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { StoryCardPadding, StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';
import type { ParentBillingNextCharge } from '@/lib/parent/parent-portal-api';
import type { ParentLastPaymentDaySummary } from '@/lib/tuition/payment-summary';
import { EXTRA_PAY_BUTTON_LABEL } from '@/lib/tuition/tuition-pay-copy';
import { formatBillingDueDate, formatCents, formatDueCountdown } from '@/lib/tuition/format-cents';

type ParentBillingDueCardProps = {
  balanceDueCents: number;
  nextCharge: ParentBillingNextCharge | null;
  nextChargeId: string | null;
  payNowLabel: string;
  paying: boolean;
  payDisabled?: boolean;
  autopayEnabled?: boolean;
  hasMultipleChildren?: boolean;
  hasPendingSchedule?: boolean;
  familyTotalRemainingCents?: number | null;
  showEstimatedAnnual?: boolean;
  estimatedAnnualCents?: number;
  lastPaymentSummary?: ParentLastPaymentDaySummary | null;
  showLastPayment?: boolean;
  canPayExtra?: boolean;
  onPay: () => void;
  onPayExtra?: () => void;
  testID?: string;
};

function formatStudentNamesForLastPayment(names: string[]): string {
  if (names.length === 0) return '';
  if (names.length === 1) return names[0]!;
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names.slice(0, -1).join(', ')}, and ${names[names.length - 1]}`;
}

export function ParentBillingDueCard({
  balanceDueCents,
  nextCharge,
  nextChargeId,
  payNowLabel,
  paying,
  payDisabled = false,
  autopayEnabled = false,
  hasMultipleChildren = false,
  hasPendingSchedule = false,
  familyTotalRemainingCents = null,
  showEstimatedAnnual = false,
  estimatedAnnualCents = 0,
  lastPaymentSummary = null,
  showLastPayment = false,
  canPayExtra = false,
  onPay,
  onPayExtra,
  testID = 'parent-billing-summary',
}: ParentBillingDueCardProps) {
  const theme = useParentTheme();
  const dueCountdown = nextCharge ? formatDueCountdown(nextCharge.dueDate) : null;
  const showDueCountdown =
    dueCountdown != null &&
    (dueCountdown.urgency === 'overdue' || dueCountdown.urgency === 'urgent');

  const lastPaymentDateLabel = lastPaymentSummary?.paidAt
    ? formatBillingDueDate(lastPaymentSummary.paidAt.slice(0, 10))
    : null;
  const lastPaymentStudentLabel =
    showLastPayment && lastPaymentSummary?.studentFirstNames.length
      ? ` for ${formatStudentNamesForLastPayment(lastPaymentSummary.studentFirstNames)}`
      : '';

  const urgencyColor =
    dueCountdown?.urgency === 'overdue'
      ? theme.alert
      : dueCountdown?.urgency === 'urgent'
        ? theme.warning
        : theme.muted;

  const showPayButton = Boolean(nextCharge && nextChargeId);

  return (
    <StoryCard variant="today" style={styles.card} testID={testID}>
      <StorySectionKicker>Next payment</StorySectionKicker>

      {nextCharge ? (
        <View style={styles.chipRow}>
          {autopayEnabled && balanceDueCents > 0 ? (
            <StoryChip tone="info" label="Autopay on" />
          ) : null}
          {hasPendingSchedule && !hasMultipleChildren ? (
            <ParentBillingNeedsScheduleBadge label="Schedule needed" />
          ) : null}
        </View>
      ) : null}

      <StoryDisplayHeading size="display" style={styles.amount}>
        {formatCents(balanceDueCents)}
      </StoryDisplayHeading>

      {nextCharge ? (
        <Text style={[styles.meta, { color: showDueCountdown ? urgencyColor : theme.muted }]}>
          Due {formatBillingDueDate(nextCharge.dueDate)}
          {showDueCountdown ? ` · ${dueCountdown!.label}` : ''}
          {hasMultipleChildren && balanceDueCents > 0 ? ' · Family total due' : ''}
        </Text>
      ) : (
        <Text style={[styles.meta, { color: theme.muted }]}>No payment due right now</Text>
      )}

      {familyTotalRemainingCents != null && familyTotalRemainingCents > 0 ? (
        <Text style={[styles.meta, { color: theme.muted }]}>
          Family total remaining: {formatCents(familyTotalRemainingCents)}
        </Text>
      ) : null}

      {showEstimatedAnnual && estimatedAnnualCents > 0 ? (
        <Text style={[styles.meta, { color: theme.muted }]}>
          Estimated annual tuition: {formatCents(estimatedAnnualCents)}
        </Text>
      ) : null}

      {lastPaymentSummary && lastPaymentDateLabel ? (
        <View
          style={[
            styles.lastPaymentBanner,
            { backgroundColor: theme.successBg, borderColor: theme.line },
          ]}
          testID="parent-billing-last-payment-banner">
          <Text style={[styles.lastPaymentText, { color: theme.success }]}>
            Last payment: {formatCents(lastPaymentSummary.amountCents)} on {lastPaymentDateLabel}
            {lastPaymentStudentLabel}
          </Text>
        </View>
      ) : null}

      {autopayEnabled && nextCharge && balanceDueCents > 0 ? (
        <Text style={[styles.hint, { color: theme.muted }]} testID="parent-billing-pay-early-hint">
          Autopay will charge your saved card on the due date. Pay early anytime if you prefer.
        </Text>
      ) : null}

      {showPayButton && balanceDueCents > 0 ? (
        <View style={styles.actions}>
          <StoryButton
            label={paying ? 'Starting…' : payNowLabel}
            onPress={onPay}
            disabled={payDisabled || paying}
            testID="parent-billing-family-pay-now"
            trailingIcon={paying ? <ActivityIndicator color="#FFFFFF" size="small" /> : undefined}
          />
          {canPayExtra && onPayExtra ? (
            <StoryButton
              label={EXTRA_PAY_BUTTON_LABEL}
              variant="outline"
              onPress={onPayExtra}
              disabled={paying}
            />
          ) : null}
        </View>
      ) : null}
    </StoryCard>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: StoryCardPadding + 4,
    gap: Spacing.two,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  amount: {
    marginTop: Spacing.one,
  },
  meta: {
    fontFamily: StoryFonts.body,
    fontSize: 13,
    lineHeight: 18,
  },
  lastPaymentBanner: {
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: Spacing.one,
  },
  lastPaymentText: {
    fontFamily: StoryFonts.body,
    fontSize: 13,
    lineHeight: 18,
  },
  hint: {
    fontFamily: StoryFonts.body,
    fontSize: 12,
    lineHeight: 16,
  },
  actions: {
    gap: Spacing.two,
    marginTop: Spacing.two,
  },
});
