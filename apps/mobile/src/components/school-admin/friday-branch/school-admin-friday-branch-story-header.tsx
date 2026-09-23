import { StyleSheet, View } from 'react-native';

import { StorySectionKicker } from '@/components/story/story-section-kicker';
import { Spacing } from '@/constants/theme';

export function SchoolAdminFridayBranchStoryHeader() {
  return (
    <View style={styles.header}>
      <StorySectionKicker>Friday Branch</StorySectionKicker>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: Spacing.two,
  },
});
