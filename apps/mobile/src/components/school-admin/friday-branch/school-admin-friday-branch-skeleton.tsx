import { StyleSheet, View } from 'react-native';

import { StoryCard } from '@/components/story/story-card';
import { StoryCardPadding } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';

function SkeletonLine({ width = '100%' as const }: { width?: `${number}%` | number }) {
  return <View style={[styles.line, { width }]} />;
}

export function SchoolAdminFridayBranchSkeleton() {
  return (
    <View style={styles.container}>
      <View style={styles.strip}>
        <SkeletonLine width="38%" />
        <SkeletonLine width="38%" />
      </View>
      <StoryCard style={styles.card}>
        <SkeletonLine width="45%" />
        <SkeletonLine width="72%" />
        <SkeletonLine width="60%" />
      </StoryCard>
      <StoryCard style={styles.card}>
        <SkeletonLine width="55%" />
        <SkeletonLine width="80%" />
      </StoryCard>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.four,
  },
  strip: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  card: {
    padding: StoryCardPadding,
    gap: Spacing.three,
  },
  line: {
    height: 14,
    borderRadius: 7,
    backgroundColor: '#E8EDEA',
  },
});
