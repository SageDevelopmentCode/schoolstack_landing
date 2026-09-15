import { StyleSheet, Text, View } from 'react-native';

import { StoryDisplayHeading } from '@/components/story/story-display-heading';
import { StorySectionKicker } from '@/components/story/story-section-kicker';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';

type BulletinStoryHeaderProps = {
  schoolName: string;
};

export function BulletinStoryHeader({ schoolName }: BulletinStoryHeaderProps) {
  const theme = useParentTheme();

  return (
    <View style={styles.container}>
      <StorySectionKicker style={styles.kicker}>Bulletin</StorySectionKicker>
      <StoryDisplayHeading size="display">Announcements for {schoolName}</StoryDisplayHeading>
      <Text style={[styles.subtitle, { color: theme.muted }]}>
        Publish school updates with optional flyers. Active posts appear on parent and teacher home
        pages.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.two,
  },
  kicker: {
    marginBottom: 0,
  },
  subtitle: {
    fontFamily: StoryFonts.body,
    fontSize: 15,
    lineHeight: 22,
    marginTop: Spacing.one,
  },
});
