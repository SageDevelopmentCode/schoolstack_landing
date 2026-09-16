import { Pressable, StyleSheet, Text } from 'react-native';

import { StoryCard } from '@/components/story/story-card';
import { StorySectionKicker } from '@/components/story/story-section-kicker';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { StoryCardPadding, StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';

type PortalNeedHelpCardProps = {
  onPress: () => void;
};

export function PortalNeedHelpCard({ onPress }: PortalNeedHelpCardProps) {
  const theme = useParentTheme();

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [pressed && styles.pressed]}>
      <StoryCard
        style={{
          ...styles.card,
          backgroundColor: theme.primarySoft,
          borderColor: theme.line,
        }}>
        <StorySectionKicker style={styles.kicker}>Need help</StorySectionKicker>
        <Text style={[styles.title, { color: theme.ink }]}>Need help?</Text>
        <Text style={[styles.subtitle, { color: theme.muted }]}>
          Tell us what&apos;s going on and attach screenshots if helpful.
        </Text>
        <Text style={[styles.cta, { color: theme.primary }]}>Get help →</Text>
      </StoryCard>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: StoryCardPadding,
    gap: Spacing.one,
  },
  kicker: {
    marginBottom: 0,
  },
  title: {
    fontFamily: StoryFonts.display,
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 24,
  },
  subtitle: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
    lineHeight: 20,
  },
  cta: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 13,
    fontWeight: '700',
    marginTop: Spacing.one,
  },
  pressed: {
    opacity: 0.9,
  },
});
