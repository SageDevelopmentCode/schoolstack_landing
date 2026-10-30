import { Pressable, StyleSheet, Text, View } from 'react-native';

import { StoryFonts } from '@/constants/story-theme';
import { Brand, Spacing } from '@/constants/theme';

type MobileOperationalErrorFallbackProps = {
  onGoBack?: () => void;
};

export function MobileOperationalErrorFallback({
  onGoBack,
}: MobileOperationalErrorFallbackProps) {
  return (
    <View style={styles.fallback}>
      <Text style={styles.fallbackTitle}>Something went wrong</Text>
      <Text style={styles.fallbackCopy}>
        This screen could not be displayed. You can go back and try again.
      </Text>
      {onGoBack ? (
        <Pressable
          accessibilityRole="button"
          onPress={onGoBack}
          style={({ pressed }) => [styles.goBackButton, pressed && styles.goBackButtonPressed]}>
          <Text style={styles.goBackLabel}>Go back</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: {
    flex: 1,
    backgroundColor: Brand.bg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.five,
    gap: Spacing.three,
  },
  fallbackTitle: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 17,
    fontWeight: '600',
    color: '#0F172A',
    textAlign: 'center',
  },
  fallbackCopy: {
    fontFamily: StoryFonts.body,
    fontSize: 15,
    lineHeight: 22,
    color: '#64748B',
    textAlign: 'center',
  },
  goBackButton: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 999,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
  },
  goBackButtonPressed: {
    opacity: 0.85,
  },
  goBackLabel: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
  },
});
