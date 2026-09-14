import { Pressable, StyleSheet, Text, View } from 'react-native';

import { StoryButton } from '@/components/story/story-button';
import type { PaymentRowsSummary } from '@/lib/admissions/payment-records';
import type { PaymentStatus } from '@/lib/admissions/payment-records';
import { StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';

type TransactionsNeedsAttentionBannerProps = {
  summary: PaymentRowsSummary;
  onFilterStatus: (status: PaymentStatus) => void;
  onDismiss: () => void;
};

export function TransactionsNeedsAttentionBanner({
  summary,
  onFilterStatus,
  onDismiss,
}: TransactionsNeedsAttentionBannerProps) {
  if (summary.failedCount > 0) {
    const countLabel = summary.failedCount === 1 ? 'payment failed' : 'payments failed';
    return (
      <View style={styles.banner}>
        <Text style={styles.copy}>
          <Text style={styles.bold}>Needs attention: </Text>
          {summary.failedCount} {countLabel} and may need follow-up.
        </Text>
        <View style={styles.actions}>
          <StoryButton
            label="View failed →"
            variant="soft"
            onPress={() => onFilterStatus('failed')}
            style={styles.button}
          />
          <Pressable
            onPress={onDismiss}
            accessibilityRole="button"
            accessibilityLabel="Dismiss payment alert">
            <Text style={styles.dismiss}>Dismiss</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  if (summary.pendingCount > 0) {
    const verb = summary.pendingCount === 1 ? 'is' : 'are';
    return (
      <View style={styles.banner}>
        <Text style={styles.copy}>
          <Text style={styles.bold}>Needs attention: </Text>
          {summary.pendingCount} payment{summary.pendingCount === 1 ? '' : 's'} {verb} still
          pending.
        </Text>
        <View style={styles.actions}>
          <StoryButton
            label="View pending →"
            variant="soft"
            onPress={() => onFilterStatus('pending')}
            style={styles.button}
          />
          <Pressable
            onPress={onDismiss}
            accessibilityRole="button"
            accessibilityLabel="Dismiss payment alert">
            <Text style={styles.dismiss}>Dismiss</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#EAF4EB',
    borderColor: '#C7DFCB',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    gap: Spacing.two,
  },
  copy: {
    fontFamily: StoryFonts.body,
    fontSize: 13,
    lineHeight: 20,
    color: '#42694F',
  },
  bold: {
    fontFamily: StoryFonts.bodySemiBold,
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: Spacing.three,
  },
  button: {
    alignSelf: 'flex-start',
    minWidth: 0,
    width: 'auto',
  },
  dismiss: {
    fontFamily: StoryFonts.body,
    fontSize: 12,
    color: '#5D7A63',
  },
});
