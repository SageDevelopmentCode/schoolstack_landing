import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { StoryCard } from '@/components/story/story-card';
import { StoryCardPadding } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';

export function ParentFridayBranchSkeleton() {
  return (
    <Animated.View entering={FadeInDown.duration(300)} style={styles.container}>
      <View style={styles.blockRow}>
        <StoryCard compact style={styles.blockCard} />
        <StoryCard compact style={styles.blockCard} />
      </View>
      <StoryCard style={styles.scheduleCard}>
        <View style={styles.line} />
        <View style={styles.lineShort} />
        <View style={styles.line} />
      </StoryCard>
      <StoryCard style={styles.scheduleCard}>
        <View style={styles.line} />
        <View style={styles.lineShort} />
      </StoryCard>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.four,
  },
  blockRow: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  blockCard: {
    width: 140,
    height: 72,
    padding: StoryCardPadding,
    opacity: 0.55,
  },
  scheduleCard: {
    padding: StoryCardPadding,
    gap: Spacing.three,
    opacity: 0.55,
  },
  line: {
    height: 14,
    borderRadius: 7,
    backgroundColor: '#E2E8F0',
  },
  lineShort: {
    height: 14,
    width: '60%',
    borderRadius: 7,
    backgroundColor: '#E2E8F0',
  },
});
