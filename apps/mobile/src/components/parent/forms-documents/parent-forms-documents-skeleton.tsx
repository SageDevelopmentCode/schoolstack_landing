import { StyleSheet, View } from 'react-native';

import { SkeletonPulse } from '@/components/parent/messages/skeleton-pulse';
import { Story, StoryCardPadding } from '@/constants/story-theme';
import { SCREEN_HORIZONTAL_PADDING } from '@/constants/screen-layout';
import { Radius, Spacing } from '@/constants/theme';

const SKELETON_COLOR = '#E4E8E1';

export function ParentFormsDocumentsSkeleton({ rowCount = 3 }: { rowCount?: number }) {
  return (
    <View style={styles.container}>
      <SkeletonPulse style={styles.headerBar} backgroundColor={SKELETON_COLOR} />
      <SkeletonPulse style={styles.subheaderBar} backgroundColor={SKELETON_COLOR} />
      <SkeletonPulse style={styles.pillNav} backgroundColor={SKELETON_COLOR} />
      {Array.from({ length: rowCount }).map((_, index) => (
        <View key={index} style={styles.card}>
          <View style={styles.cardRow}>
            <SkeletonPulse style={styles.icon} backgroundColor={SKELETON_COLOR} />
            <View style={styles.cardBody}>
              <SkeletonPulse style={styles.titleBar} backgroundColor={SKELETON_COLOR} />
              <SkeletonPulse style={styles.subtitleBar} backgroundColor={SKELETON_COLOR} />
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Story.paper,
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingTop: Spacing.four,
    gap: Spacing.three,
  },
  headerBar: {
    height: 14,
    width: 160,
    borderRadius: Radius.sm,
  },
  subheaderBar: {
    height: 28,
    width: '70%',
    borderRadius: Radius.sm,
  },
  pillNav: {
    height: 40,
    borderRadius: Radius.pill,
  },
  card: {
    backgroundColor: Story.white,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Story.line,
    padding: StoryCardPadding,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.two,
  },
  icon: {
    width: 36,
    height: 36,
    borderRadius: 12,
  },
  cardBody: {
    flex: 1,
    gap: Spacing.two,
  },
  titleBar: {
    height: 18,
    width: '75%',
    borderRadius: Radius.sm,
  },
  subtitleBar: {
    height: 14,
    width: '100%',
    borderRadius: Radius.sm,
  },
});
