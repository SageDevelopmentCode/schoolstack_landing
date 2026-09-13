import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { StoryCard } from '@/components/story/story-card';
import { StorySectionKicker } from '@/components/story/story-section-kicker';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { StoryCardPadding, StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';

type StoryDetailSectionProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

export function StoryDetailSection({ title, description, children }: StoryDetailSectionProps) {
  const theme = useParentTheme();

  return (
    <StoryCard compact style={styles.card}>
      <StorySectionKicker style={styles.kicker}>{title}</StorySectionKicker>
      {description ? (
        <Text style={[styles.description, { color: theme.muted }]}>{description}</Text>
      ) : null}
      <View style={styles.body}>{children}</View>
    </StoryCard>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: StoryCardPadding,
    gap: Spacing.two,
  },
  kicker: {
    marginBottom: 0,
  },
  description: {
    fontFamily: StoryFonts.body,
    fontSize: 13,
    lineHeight: 18,
  },
  body: {
    gap: Spacing.two,
  },
});
