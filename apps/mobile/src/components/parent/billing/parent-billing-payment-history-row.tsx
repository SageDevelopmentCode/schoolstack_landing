import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { StoryCard } from '@/components/story/story-card';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';
import type { ParentTuitionPaymentRecord } from '@/lib/parent/parent-portal-api';
import { formatCents } from '@/lib/tuition/format-cents';
import type { ChargeStatusBadgeTone } from '@/lib/tuition/charge-status-display';
import {
  tuitionPaymentStripeStatusBadge,
  tuitionPaymentStripeStatusHint,
} from '@/lib/tuition/stripe-provider-status-display';
import type { MobileParentTheme } from '@/lib/organization-settings/parent-theme';

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

function badgeColors(
  theme: MobileParentTheme,
  tone: ChargeStatusBadgeTone,
): { bg: string; fg: string } {
  switch (tone) {
    case 'success':
      return { bg: theme.successBg, fg: theme.success };
    case 'info':
      return { bg: theme.infoBg, fg: theme.info };
    case 'accent':
      return { bg: theme.primarySoft, fg: theme.primaryDark };
    case 'warning':
      return { bg: theme.warningBg, fg: theme.warning };
    case 'danger':
      return { bg: theme.alertBg, fg: theme.alert };
    default:
      return { bg: theme.cream, fg: theme.muted };
  }
}

export function ParentBillingPaymentHistoryRow({
  payment,
  onPress,
}: ParentBillingPaymentHistoryRowProps) {
  const theme = useParentTheme();
  const amount = payment.chargedAmountCents ?? payment.amountCents;
  const subtitle = payment.studentFirstName
    ? `${payment.studentFirstName} · ${payment.label ?? 'Tuition'}`
    : (payment.label ?? 'Tuition');
  const stripeStatusBadge = tuitionPaymentStripeStatusBadge(payment);
  const stripeStatusHint = tuitionPaymentStripeStatusHint(payment);
  const statusColors = stripeStatusBadge
    ? badgeColors(theme, stripeStatusBadge.tone)
    : null;
  const hintColor =
    stripeStatusHint?.tone === 'danger'
      ? theme.alert
      : stripeStatusHint?.tone === 'warning'
        ? theme.warning
        : theme.muted;

  return (
    <Pressable onPress={onPress} accessibilityRole="button">
      <StoryCard compact style={styles.card}>
        <View style={styles.row}>
          <View style={styles.textColumn}>
            <Text style={[styles.amount, { color: theme.ink }]}>{formatCents(amount)}</Text>
            <Text style={[styles.meta, { color: theme.muted }]}>{subtitle}</Text>
            <Text style={[styles.meta, { color: theme.muted }]}>
              {formatPaymentDate(payment.paidAt ?? payment.createdAt)}
            </Text>
            {stripeStatusBadge && statusColors ? (
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: statusColors.bg },
                ]}
                accessibilityLabel={stripeStatusBadge.label}
              >
                <Text style={[styles.statusBadgeText, { color: statusColors.fg }]}>
                  {stripeStatusBadge.label}
                </Text>
              </View>
            ) : null}
            {stripeStatusHint ? (
              <Text style={[styles.hint, { color: hintColor }]}>{stripeStatusHint.message}</Text>
            ) : null}
          </View>
          <Ionicons name="chevron-forward" size={18} color={theme.muted} />
        </View>
      </StoryCard>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 15,
    padding: Spacing.four,
  },
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
  amount: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 16,
  },
  meta: {
    fontFamily: StoryFonts.body,
    fontSize: 13,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    marginTop: 4,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  statusBadgeText: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 10,
    letterSpacing: 0.4,
  },
  hint: {
    fontFamily: StoryFonts.body,
    fontSize: 11,
    lineHeight: 15,
    marginTop: 2,
  },
});
