import { StyleSheet, View } from 'react-native';

import { StoryDisplayHeading } from '@/components/story/story-display-heading';
import { StorySectionKicker } from '@/components/story/story-section-kicker';
import { Spacing } from '@/constants/theme';

export function SchoolAdminStaffHoursStoryHeader() {
  return (
    <View style={styles.container}>
      <StorySectionKicker style={styles.kicker}>My School</StorySectionKicker>
      <StoryDisplayHeading size="display">Staff hours</StoryDisplayHeading>
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
});
