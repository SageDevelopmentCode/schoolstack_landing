import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { StoryCard } from '@/components/story/story-card';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { StoryFonts, StoryRadius } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';
import type { TuitionCharge } from '@/lib/parent/parent-portal-api';
import { chargeRemainingCents, OPEN_CHARGE_STATUSES } from '@/lib/tuition/billing-helpers';
import {
  formatParentChargeStatusBadge,
  type ChargeStatusBadgeTone,
} from '@/lib/tuition/charge-status-display';
import { formatBillingDueDate, formatCents, formatDueCountdown } from '@/lib/tuition/format-cents';
import type { MobileParentTheme } from '@/lib/organization-settings/parent-theme';

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

type ParentBillingChargeRowProps = {
  charge: TuitionCharge;
  studentName?: string | null;
  autopayEnabled?: boolean;
  onPay?: () => void;
  paying?: boolean;
};

export function ParentBillingChargeRow({
  charge,
  studentName,
  autopayEnabled = false,
  onPay,
  paying = false,
}: ParentBillingChargeRowProps) {
  const theme = useParentTheme();
  const remaining = chargeRemainingCents(charge);
  const countdown = formatDueCountdown(charge.dueDate);
  const urgencyColor =
    countdown.urgency === 'overdue'
      ? theme.alert
      : countdown.urgency === 'urgent'
        ? theme.warning
        : theme.muted;

  const label = studentName ? `${studentName} — ${charge.label}` : charge.label;
  const partialPaid = charge.paidCents > 0 && remaining > 0;
  const canPay = OPEN_CHARGE_STATUSES.has(charge.status) && remaining > 0;
  const showAutopayHint = autopayEnabled && canPay;
  const statusBadge = formatParentChargeStatusBadge(charge);
  const statusColors = badgeColors(theme, statusBadge.tone);

  return (
    <StoryCard compact style={styles.card}>
      <View style={styles.row}>
        <View style={styles.textColumn}>
          <Text style={[styles.title, { color: theme.ink }]}>{label}</Text>
          <Text style={[styles.meta, { color: theme.muted }]}>
            Due {formatBillingDueDate(charge.dueDate)}
          </Text>
          <Text style={[styles.meta, { color: urgencyColor }]}>{countdown.label}</Text>
          {partialPaid ? (
            <Text style={[styles.meta, { color: theme.muted }]}>
              {formatCents(charge.paidCents)} paid · {formatCents(remaining)} remaining
            </Text>
          ) : null}
          {showAutopayHint ? (
            <Text style={[styles.meta, { color: theme.muted }]}>Autopay on due date</Text>
          ) : null}
        </View>

        <View style={styles.amountColumn}>
          <Text style={[styles.amount, { color: theme.ink }]}>{formatCents(remaining)}</Text>
          <View style={[styles.badge, { backgroundColor: statusColors.bg }]}>
            <Text style={[styles.badgeLabel, { color: statusColors.fg }]}>{statusBadge.label}</Text>
          </View>
          {onPay && canPay ? (
            <Pressable
              onPress={onPay}
              disabled={paying}
              accessibilityRole="button"
              accessibilityLabel={showAutopayHint ? `Pay ${label} early` : `Pay ${label}`}
              style={({ pressed }) => [
                styles.payButton,
                { backgroundColor: theme.primary },
                (paying || pressed) && { opacity: 0.75 },
              ]}>
              {paying ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.payButtonLabel}>Pay</Text>
              )}
            </Pressable>
          ) : null}
        </View>
      </View>
    </StoryCard>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 15,
    padding: Spacing.four,
  },
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
  title: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 13,
    fontWeight: '600',
  },
  meta: {
    fontFamily: StoryFonts.body,
    fontSize: 12,
    lineHeight: 16,
  },
  amountColumn: {
    alignItems: 'flex-end',
    gap: Spacing.two,
  },
  amount: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 13,
    fontWeight: '600',
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeLabel: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  payButton: {
    minWidth: 56,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: StoryRadius.button,
    alignItems: 'center',
    justifyContent: 'center',
  },
  payButtonLabel: {
    fontFamily: StoryFonts.bodySemiBold,
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});
