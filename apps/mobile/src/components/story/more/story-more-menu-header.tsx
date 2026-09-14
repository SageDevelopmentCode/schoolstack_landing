import { StyleSheet, Text, View } from 'react-native';

import { StoryDisplayHeading } from '@/components/story/story-display-heading';
import { StorySectionKicker } from '@/components/story/story-section-kicker';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';

type StoryMoreMenuHeaderProps = {
  kicker: string;
  title: string;
  subtitle: string;
};

export function StoryMoreMenuHeader({ kicker, title, subtitle }: StoryMoreMenuHeaderProps) {
  const theme = useParentTheme();

  return (
    <View style={styles.container}>
      <StorySectionKicker style={styles.kicker}>{kicker}</StorySectionKicker>
      <StoryDisplayHeading size="section">{title}</StoryDisplayHeading>
      <Text style={[styles.subtitle, { color: theme.muted }]}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.one,
  },
  kicker: {
    marginBottom: 0,
  },
  subtitle: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
    lineHeight: 20,
    marginTop: Spacing.one,
  },
});
