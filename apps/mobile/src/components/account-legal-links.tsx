import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import { Story, StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';
import { resolveWebUrl } from '@/lib/admissions/school-apply-url';

function openLegalPage(path: '/privacy' | '/terms' | '/account-deletion') {
  void Linking.openURL(resolveWebUrl(path));
}

export function AccountLegalLinks() {
  return (
    <View style={styles.container}>
      <Pressable
        accessibilityRole="link"
        accessibilityLabel="Privacy Policy"
        onPress={() => openLegalPage('/privacy')}
        hitSlop={8}>
        <Text style={styles.link}>Privacy Policy</Text>
      </Pressable>
      <Text style={styles.separator}>·</Text>
      <Pressable
        accessibilityRole="link"
        accessibilityLabel="Terms of Use"
        onPress={() => openLegalPage('/terms')}
        hitSlop={8}>
        <Text style={styles.link}>Terms of Use</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.one,
  },
  link: {
    fontFamily: StoryFonts.bodyMedium,
    fontSize: 12,
    lineHeight: 16,
    color: Story.muted,
    textDecorationLine: 'underline',
  },
  separator: {
    fontFamily: StoryFonts.body,
    fontSize: 12,
    lineHeight: 16,
    color: Story.muted,
  },
});
