import { ScrollView, StyleSheet, View } from 'react-native';

import { SkeletonPulse } from '@/components/parent/messages/skeleton-pulse';
import { Story, StoryRadius } from '@/constants/story-theme';
import { SCREEN_HORIZONTAL_PADDING } from '@/constants/screen-layout';
import { Radius, Spacing } from '@/constants/theme';

const SKELETON_COLOR = Story.line;
const PILL_NAV_TRACK = '#EAF2EB';

export function CommitteeProjectDetailSkeleton() {
  return (
    <View style={[styles.container, { backgroundColor: Story.paper }]}>
      <View style={styles.header}>
        <SkeletonPulse style={styles.backRow} backgroundColor={SKELETON_COLOR} />
        <SkeletonPulse style={styles.title} backgroundColor={SKELETON_COLOR} />
        <View style={styles.pillNavTrack}>
          <SkeletonPulse style={styles.pillNavActive} backgroundColor={Story.white} />
          <SkeletonPulse style={styles.pillNavInactive} backgroundColor={PILL_NAV_TRACK} />
        </View>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {[0, 1, 2].map((index) => (
          <SkeletonPulse
            key={index}
            style={[
              styles.contentBlock,
              index === 0 ? styles.contentBlockTall : styles.contentBlockMedium,
            ]}
            backgroundColor={SKELETON_COLOR}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.three,
    gap: Spacing.two,
  },
  backRow: {
    width: 88,
    height: 14,
    borderRadius: Radius.sm,
  },
  title: {
    width: '60%',
    height: 26,
    borderRadius: StoryRadius.cardCompact,
  },
  pillNavTrack: {
    flexDirection: 'row',
    gap: 4,
    padding: 4,
    borderRadius: 12,
    backgroundColor: PILL_NAV_TRACK,
  },
  pillNavActive: {
    flex: 1,
    height: 36,
    borderRadius: 10,
  },
  pillNavInactive: {
    flex: 1,
    height: 36,
    borderRadius: 10,
    opacity: 0.35,
  },
  scrollContent: {
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingBottom: Spacing.six,
    gap: Spacing.three,
  },
  contentBlock: {
    width: '100%',
    borderRadius: StoryRadius.card,
  },
  contentBlockTall: {
    height: 140,
  },
  contentBlockMedium: {
    height: 88,
  },
});
