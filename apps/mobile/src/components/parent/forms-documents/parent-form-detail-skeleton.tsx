import { StyleSheet, View } from 'react-native';

import { SkeletonPulse } from '@/components/parent/messages/skeleton-pulse';
import { Story, StoryCardPadding } from '@/constants/story-theme';
import { SCREEN_HORIZONTAL_PADDING } from '@/constants/screen-layout';
import { Radius, Spacing } from '@/constants/theme';

const SKELETON_COLOR = '#E4E8E1';

export function ParentFormDetailSkeleton() {
  return (
    <View style={styles.container}>
      <SkeletonPulse style={styles.kickerBar} backgroundColor={SKELETON_COLOR} />
      <View style={styles.titleRow}>
        <SkeletonPulse style={styles.titleBar} backgroundColor={SKELETON_COLOR} />
        <SkeletonPulse style={styles.chip} backgroundColor={SKELETON_COLOR} />
      </View>
      <SkeletonPulse style={styles.metaBar} backgroundColor={SKELETON_COLOR} />

      <View style={styles.previewCard}>
        <SkeletonPulse style={styles.previewBlock} backgroundColor={SKELETON_COLOR} />
      </View>

      <View style={styles.signCard}>
        <SkeletonPulse style={styles.labelBar} backgroundColor={SKELETON_COLOR} />
        <SkeletonPulse style={styles.inputBar} backgroundColor={SKELETON_COLOR} />
        <SkeletonPulse style={styles.previewTextBar} backgroundColor={SKELETON_COLOR} />
        <SkeletonPulse style={styles.buttonBar} backgroundColor={SKELETON_COLOR} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Story.paper,
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.six,
    gap: Spacing.three,
  },
  kickerBar: {
    height: 12,
    width: 140,
    borderRadius: Radius.sm,
  },
  titleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: Spacing.two,
  },
  titleBar: {
    height: 28,
    width: '60%',
    borderRadius: Radius.sm,
  },
  chip: {
    height: 24,
    width: 88,
    borderRadius: Radius.pill,
  },
  metaBar: {
    height: 14,
    width: '40%',
    borderRadius: Radius.sm,
  },
  previewCard: {
    backgroundColor: Story.white,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Story.line,
    overflow: 'hidden',
    minHeight: 360,
  },
  previewBlock: {
    flex: 1,
    minHeight: 360,
    borderRadius: Radius.lg,
  },
  signCard: {
    backgroundColor: Story.white,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Story.line,
    padding: StoryCardPadding,
    gap: Spacing.three,
    marginTop: Spacing.two,
  },
  labelBar: {
    height: 12,
    width: 160,
    borderRadius: Radius.sm,
  },
  inputBar: {
    height: 44,
    width: '100%',
    borderRadius: 12,
  },
  previewTextBar: {
    height: 32,
    width: '55%',
    borderRadius: Radius.sm,
  },
  buttonBar: {
    height: 52,
    width: '100%',
    borderRadius: Radius.lg,
    marginTop: Spacing.one,
  },
});
