import { Pressable, StyleSheet, Text, View } from 'react-native';

import { StoryCard } from '@/components/story/story-card';
import { StoryChip } from '@/components/story/story-chip';
import { StoryDisplayHeading } from '@/components/story/story-display-heading';
import { useParentTheme } from '@/contexts/parent-theme-context';
import {
  formatPaymentAmount,
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_LABELS,
  PAYMENT_TYPE_LABELS,
  type PaymentRecordDisplayRow,
} from '@/lib/admissions/payment-records';
import { paymentStatusStoryChipTone } from '@/lib/admissions/payment-status-ui';
import { formatRelativeTime } from '@/lib/school-admin/format-relative-time';
import { StoryCardPadding, StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';

type TransactionStoryListItemProps = {
  payment: PaymentRecordDisplayRow;
  onPress?: (payment: PaymentRecordDisplayRow) => void;
};

export function TransactionStoryListItem({ payment, onPress }: TransactionStoryListItemProps) {
  const theme = useParentTheme();
  const title = payment.label ?? PAYMENT_TYPE_LABELS[payment.paymentType];
  const payerLine = [payment.payerEmail, payment.applicantLabel].filter(Boolean).join(' · ');
  const methodLabel = payment.paymentMethodType
    ? PAYMENT_METHOD_LABELS[payment.paymentMethodType]
    : null;
  const relativeTime = formatRelativeTime(payment.paidAt ?? payment.createdAt);
  const metaParts = [payerLine, methodLabel, relativeTime].filter(Boolean);

  const content = (
    <StoryCard compact style={styles.card}>
      <View style={styles.topRow}>
        <StoryDisplayHeading size="section" numberOfLines={2} style={styles.title}>
          {title}
        </StoryDisplayHeading>
        <Text style={[styles.amount, { color: theme.ink }]}>{formatPaymentAmount(payment.amountCents)}</Text>
      </View>

      <View style={styles.chipRow}>
        <StoryChip
          tone={paymentStatusStoryChipTone(payment.status)}
          label={PAYMENT_STATUS_LABELS[payment.status]}
        />
        <StoryChip tone="info" label={PAYMENT_TYPE_LABELS[payment.paymentType]} />
      </View>

      {metaParts.length > 0 ? (
        <Text style={[styles.metaLine, { color: theme.muted }]} numberOfLines={2}>
          {metaParts.join(' · ')}
        </Text>
      ) : null}

      {payment.chargedAmountCents && payment.chargedAmountCents !== payment.amountCents ? (
        <Text style={[styles.chargedLine, { color: theme.muted }]}>
          Charged {formatPaymentAmount(payment.chargedAmountCents)}
          {payment.processingFeeCents
            ? ` (+${formatPaymentAmount(payment.processingFeeCents)} fee)`
            : ''}
        </Text>
      ) : null}

      {payment.applicationId && payment.applicantLabel ? (
        <Text style={[styles.footerLine, { color: theme.primary }]}>
          {payment.applicantLabel} · View application
        </Text>
      ) : null}
    </StoryCard>
  );

  if (!onPress) {
    return content;
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={() => onPress(payment)}
      style={({ pressed }) => [pressed && { opacity: 0.95 }]}>
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: StoryCardPadding,
    gap: Spacing.two,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.two,
  },
  title: {
    flex: 1,
    fontSize: 20,
    lineHeight: 24,
  },
  amount: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.one,
  },
  metaLine: {
    fontFamily: StoryFonts.body,
    fontSize: 12,
    lineHeight: 17,
  },
  chargedLine: {
    fontFamily: StoryFonts.body,
    fontSize: 11,
    lineHeight: 15,
  },
  footerLine: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
  },
});
