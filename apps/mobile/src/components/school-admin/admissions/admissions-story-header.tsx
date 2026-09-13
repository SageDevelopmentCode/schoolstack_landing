import { StyleSheet, Text, View } from 'react-native';

import { StoryDisplayHeading } from '@/components/story/story-display-heading';
import { StorySectionKicker } from '@/components/story/story-section-kicker';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';

type AdmissionsStoryHeaderProps = {
  activeCount: number;
};

export function AdmissionsStoryHeader({ activeCount }: AdmissionsStoryHeaderProps) {
  const theme = useParentTheme();
  const subtitle =
    activeCount === 1
      ? '1 active application in your pipeline.'
      : `${activeCount} active applications in your pipeline.`;

  return (
    <View style={styles.container}>
      <StorySectionKicker style={styles.kicker}>Admissions workspace</StorySectionKicker>
      <StoryDisplayHeading size="display">Applications</StoryDisplayHeading>
      <Text style={[styles.subtitle, { color: theme.muted }]}>{subtitle}</Text>
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
