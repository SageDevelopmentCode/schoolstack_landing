import { View, StyleSheet } from 'react-native';

import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { useAdminTheme } from '@/contexts/admin-theme-context';
import { Radius, Spacing } from '@/constants/theme';
import { adminCardShadow } from '@/lib/organization-settings/build-admin-theme';
import { formatBillingDueDate, formatCents, formatDueCountdown } from '@/lib/tuition/format-cents';
import type { ParentBillingNextCharge } from '@/lib/parent/parent-portal-api';

type ParentBillingBalanceHeroProps = {
  balanceDueCents: number;
  totalRemainingCents: number;
  familyTotalRemainingCents: number | null;
  nextCharge: ParentBillingNextCharge | null;
  payLabel: string;
  onPay: () => void;
  paying: boolean;
  disabled?: boolean;
};

export function ParentBillingBalanceHero({
  balanceDueCents,
  totalRemainingCents,
  familyTotalRemainingCents,
  nextCharge,
  payLabel,
  onPay,
  paying,
  disabled = false,
}: ParentBillingBalanceHeroProps) {
  const theme = useAdminTheme();
  const countdown = nextCharge ? formatDueCountdown(nextCharge.dueDate) : null;
  const urgencyColor =
    countdown?.urgency === 'overdue'
      ? theme.error
      : countdown?.urgency === 'urgent'
        ? '#B45309'
        : theme.textSecondary;

  const showTotalRemaining =
    familyTotalRemainingCents !== null &&
    familyTotalRemainingCents !== totalRemainingCents &&
    familyTotalRemainingCents > balanceDueCents;

  return (
    <View
      style={[
        styles.card,
        adminCardShadow(theme),
        { backgroundColor: theme.surface, borderColor: theme.border },
      ]}>
      <ThemedText type="small" style={{ color: theme.textSecondary }}>
        Balance due
      </ThemedText>
      <ThemedText type="title" style={[styles.amount, { color: theme.textPrimary }]}>
        {formatCents(balanceDueCents)}
      </ThemedText>

      {nextCharge ? (
        <View style={styles.dueRow}>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            Next due {formatBillingDueDate(nextCharge.dueDate)}
          </ThemedText>
          {countdown ? (
            <ThemedText type="small" style={{ color: urgencyColor }}>
              {countdown.label}
            </ThemedText>
          ) : null}
        </View>
      ) : totalRemainingCents > 0 ? (
        <ThemedText type="small" style={{ color: theme.textSecondary }}>
          No charges due right now
        </ThemedText>
      ) : (
        <ThemedText type="small" style={{ color: theme.textSecondary }}>
          You&apos;re all caught up
        </ThemedText>
      )}

      {showTotalRemaining ? (
        <ThemedText type="small" style={{ color: theme.textSecondary, marginTop: Spacing.one }}>
          {formatCents(totalRemainingCents)} remaining for your share ·{' '}
          {formatCents(familyTotalRemainingCents!)} family total
        </ThemedText>
      ) : totalRemainingCents > balanceDueCents ? (
        <ThemedText type="small" style={{ color: theme.textSecondary, marginTop: Spacing.one }}>
          {formatCents(totalRemainingCents)} total remaining this year
        </ThemedText>
      ) : null}

      {balanceDueCents > 0 ? (
        <View style={styles.payButton}>
          <PrimaryButton
            label={payLabel}
            variant="accent"
            appearance="native"
            onPress={onPay}
            disabled={disabled || paying}
            accessibilityLabel={payLabel}
          />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.five,
    gap: Spacing.two,
    alignItems: 'center',
  },
  amount: {
    fontSize: 36,
    lineHeight: 42,
  },
  dueRow: {
    alignItems: 'center',
    gap: 2,
  },
  payButton: {
    width: '100%',
    marginTop: Spacing.three,
  },
});
