import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { StoryButton } from '@/components/story/story-button';
import { StoryCard } from '@/components/story/story-card';
import { StorySectionKicker } from '@/components/story/story-section-kicker';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { StoryCardPadding, StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';
import type { SavedPaymentMethodSummary } from '@/lib/parent/parent-portal-api';
import { formatPaymentMethodLabel } from '@/lib/tuition/billing-helpers';

type ParentBillingSettingsCardProps = {
  autopayEnabled: boolean;
  savedPaymentMethod: SavedPaymentMethodSummary | null;
  paymentMethodLoading: boolean;
  onAutopayToggleRequest: (enabled: boolean) => void;
  onManagePaymentMethod: () => void;
};

export function ParentBillingSettingsCard({
  autopayEnabled,
  savedPaymentMethod,
  paymentMethodLoading,
  onAutopayToggleRequest,
  onManagePaymentMethod,
}: ParentBillingSettingsCardProps) {
  const theme = useParentTheme();
  const methodLabel = formatPaymentMethodLabel(savedPaymentMethod);

  return (
    <StoryCard variant="primary" style={styles.card} testID="parent-billing-family-settings">
      <StorySectionKicker light>Payment settings</StorySectionKicker>

      <Text style={styles.heading}>
        {autopayEnabled ? 'Autopay is on' : 'Autopay is off'}
      </Text>

      <Text style={styles.body}>
        {autopayEnabled
          ? 'Due charges are paid automatically with your saved card on each due date.'
          : "Turn on automatic payments and we'll process each scheduled tuition payment on its due date."}
      </Text>

      <View style={styles.methodRow} testID="parent-payment-method-card">
        <Text style={styles.methodLabel}>Payment method</Text>
        <Pressable
          onPress={onManagePaymentMethod}
          disabled={paymentMethodLoading}
          accessibilityRole="button"
          testID="parent-payment-method-manage">
          {paymentMethodLoading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.methodAction}>
              {methodLabel ? `${methodLabel} →` : 'Add a card →'}
            </Text>
          )}
        </Pressable>
      </View>

      <StoryButton
        label={autopayEnabled ? 'Manage autopay' : 'Turn on autopay'}
        variant="soft"
        onPress={() => onAutopayToggleRequest(!autopayEnabled)}
        testID="parent-billing-autopay-toggle"
        style={[styles.autopayButton, { backgroundColor: '#FFFFFF' }]}
      />
    </StoryCard>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: StoryCardPadding + 4,
    gap: Spacing.two,
  },
  heading: {
    fontFamily: StoryFonts.display,
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  body: {
    fontFamily: StoryFonts.body,
    fontSize: 12,
    lineHeight: 18,
    color: '#D6E6D9',
  },
  methodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.17)',
    paddingTop: Spacing.three,
    marginTop: Spacing.one,
  },
  methodLabel: {
    fontFamily: StoryFonts.body,
    fontSize: 11,
    color: '#D4E4D7',
  },
  methodAction: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  autopayButton: {
    marginTop: Spacing.two,
  },
});
