import { Pressable, StyleSheet, Text, View } from 'react-native';

import { StoryButton } from '@/components/story/story-button';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';
import { EXTRA_PAY_BANNER_CTA } from '@/lib/tuition/tuition-pay-copy';

type ParentBillingTaxCreditBannerProps = {
  chargeId: string | null;
  onDismiss: () => void;
  onApplyTaxCredit: (chargeId: string) => void;
};

export function ParentBillingTaxCreditBanner({
  chargeId,
  onDismiss,
  onApplyTaxCredit,
}: ParentBillingTaxCreditBannerProps) {
  const theme = useParentTheme();

  return (
    <View
      style={[
        styles.banner,
        { backgroundColor: theme.primarySoft, borderColor: theme.line },
      ]}
      testID="parent-billing-tax-credit-banner">
      <View style={styles.header}>
        <View style={styles.textColumn}>
          <Text style={[styles.title, { color: theme.ink }]}>
            Using Idaho Parent Choice Tax Credit?
          </Text>
          <Text style={[styles.body, { color: theme.muted }]}>
            Apply a tax credit or lump sum on a child&apos;s tuition payment. Remaining monthly
            payments will be recalculated automatically.
          </Text>
        </View>
        <Pressable onPress={onDismiss} accessibilityRole="button">
          <Text style={[styles.dismiss, { color: theme.muted }]}>Dismiss</Text>
        </Pressable>
      </View>
      {chargeId ? (
        <StoryButton
          label={EXTRA_PAY_BANNER_CTA}
          onPress={() => onApplyTaxCredit(chargeId)}
          style={styles.cta}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.three,
  },
  textColumn: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 14,
    fontWeight: '600',
  },
  body: {
    fontFamily: StoryFonts.body,
    fontSize: 13,
    lineHeight: 18,
  },
  dismiss: {
    fontFamily: StoryFonts.body,
    fontSize: 12,
  },
  cta: {
    alignSelf: 'flex-start',
  },
});
