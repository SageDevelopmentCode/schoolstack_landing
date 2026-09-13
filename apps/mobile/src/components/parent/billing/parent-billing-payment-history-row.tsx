import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { StoryCard } from '@/components/story/story-card';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';
import type { ParentTuitionPaymentRecord } from '@/lib/parent/parent-portal-api';
import { formatCents } from '@/lib/tuition/format-cents';

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

export function ParentBillingPaymentHistoryRow({
  payment,
  onPress,
}: ParentBillingPaymentHistoryRowProps) {
  const theme = useParentTheme();
  const amount = payment.chargedAmountCents ?? payment.amountCents;
  const subtitle = payment.studentFirstName
    ? `${payment.studentFirstName} · ${payment.label ?? 'Tuition'}`
    : (payment.label ?? 'Tuition');

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
    fontSize: 13,
    fontWeight: '600',
  },
  meta: {
    fontFamily: StoryFonts.body,
    fontSize: 12,
    lineHeight: 16,
  },
});
