import { StyleSheet, View } from 'react-native';

import { StoryDisplayHeading } from '@/components/story/story-display-heading';
import { StorySectionKicker } from '@/components/story/story-section-kicker';
import { Spacing } from '@/constants/theme';

export function ParentFridayBranchStoryHeader() {
  return (
    <View style={styles.container}>
      <StorySectionKicker>Friday Branch</StorySectionKicker>
      <StoryDisplayHeading size="header">Friday classes</StoryDisplayHeading>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.two,
    marginBottom: Spacing.four,
  },
});
