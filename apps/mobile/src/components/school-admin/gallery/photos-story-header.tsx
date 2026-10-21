import { StyleSheet, Text, View } from 'react-native';

import { StoryDisplayHeading } from '@/components/story/story-display-heading';
import { StorySectionKicker } from '@/components/story/story-section-kicker';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';

type PhotosStoryHeaderProps = {
  schoolName: string;
};

export function PhotosStoryHeader({ schoolName }: PhotosStoryHeaderProps) {
  const theme = useParentTheme();

  return (
    <View style={styles.container}>
      <StorySectionKicker style={styles.kicker}>Photos</StorySectionKicker>
      <StoryDisplayHeading size="display">School gallery for {schoolName}</StoryDisplayHeading>
      <Text style={[styles.subtitle, { color: theme.muted }]}>
        Upload photos in batches, set the date for each batch, and share them with families and
        staff.
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
