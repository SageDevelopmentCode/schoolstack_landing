import { useEffect } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { Story } from '@/constants/story-theme';
import { SCREEN_HORIZONTAL_PADDING } from '@/constants/screen-layout';
import { Spacing } from '@/constants/theme';

const SKELETON_COLOR = '#E4E8E1';

function SkeletonBlock({
  style,
  backgroundColor,
}: {
  style: ViewStyle;
  backgroundColor: string;
}) {
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    opacity.value = withRepeat(withTiming(1, { duration: 900 }), -1, true);
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return <Animated.View style={[style, { backgroundColor }, animatedStyle]} />;
}

function SkeletonTimelineRow({
  backgroundColor,
  rowSpacing,
}: {
  backgroundColor: string;
  rowSpacing: number;
}) {
  return (
    <View style={[styles.timelineRow, { paddingBottom: rowSpacing }]}>
      <SkeletonBlock style={styles.timelineDot} backgroundColor={backgroundColor} />
      <View style={styles.timelineTextColumn}>
        <SkeletonBlock style={styles.timelineTitleBar} backgroundColor={backgroundColor} />
        <SkeletonBlock style={styles.timelineMetaBar} backgroundColor={backgroundColor} />
      </View>
    </View>
  );
}

export function DetailTimelineSectionSkeleton({ rowCount = 5 }: { rowCount?: number }) {
  return (
    <View style={styles.sectionBody}>
      <SkeletonBlock style={styles.progressTrack} backgroundColor={SKELETON_COLOR} />
      {Array.from({ length: rowCount }, (_, index) => (
        <SkeletonTimelineRow
          key={index}
          backgroundColor={SKELETON_COLOR}
          rowSpacing={Spacing.five}
        />
      ))}
    </View>
  );
}

export function DetailRowListSkeleton({ rowCount = 3 }: { rowCount?: number }) {
  return (
    <View style={styles.sectionBody}>
      {Array.from({ length: rowCount }, (_, index) => (
        <View key={index} style={styles.listRow}>
          <SkeletonBlock style={styles.listTitleBar} backgroundColor={SKELETON_COLOR} />
          <SkeletonBlock style={styles.listMetaBar} backgroundColor={SKELETON_COLOR} />
        </View>
      ))}
    </View>
  );
}

export function DetailMetadataSectionSkeleton() {
  return (
    <View style={styles.sectionBody}>
      {Array.from({ length: 4 }, (_, index) => (
        <View key={index} style={styles.metadataRow}>
          <SkeletonBlock style={styles.metadataLabel} backgroundColor={SKELETON_COLOR} />
          <SkeletonBlock style={styles.metadataValue} backgroundColor={SKELETON_COLOR} />
        </View>
      ))}
    </View>
  );
}

export function SubmissionDetailScreenSkeleton() {
  return (
    <View style={[styles.screen, { backgroundColor: Story.paper }]}>
      <View style={styles.header}>
        <SkeletonBlock style={styles.backBar} backgroundColor={SKELETON_COLOR} />
        <SkeletonBlock style={styles.kickerBar} backgroundColor={SKELETON_COLOR} />
        <SkeletonBlock style={styles.titleBar} backgroundColor={SKELETON_COLOR} />
      </View>
      <View style={styles.tabRow}>
        {Array.from({ length: 4 }, (_, index) => (
          <SkeletonBlock key={index} style={styles.tabPill} backgroundColor={SKELETON_COLOR} />
        ))}
      </View>
      <View style={styles.overviewBody}>
        <SkeletonBlock style={styles.sectionCard} backgroundColor={SKELETON_COLOR} />
        <SkeletonBlock style={styles.sectionCardTall} backgroundColor={SKELETON_COLOR} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    gap: 0,
  },
  header: {
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingTop: Spacing.two,
    gap: Spacing.two,
  },
  backBar: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  kickerBar: {
    width: 120,
    height: 10,
    borderRadius: 5,
  },
  titleBar: {
    width: '70%',
    height: 24,
    borderRadius: 8,
  },
  tabRow: {
    flexDirection: 'row',
    gap: Spacing.three,
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingVertical: Spacing.two,
  },
  tabPill: {
    width: 72,
    height: 14,
    borderRadius: 7,
  },
  overviewBody: {
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.four,
    gap: Spacing.three,
  },
  sectionCard: {
    height: 120,
    borderRadius: 16,
  },
  sectionCardTall: {
    height: 200,
    borderRadius: 16,
  },
  sectionBody: {
    gap: Spacing.two,
  },
  metadataRow: {
    gap: 4,
  },
  metadataLabel: {
    width: 80,
    height: 10,
    borderRadius: 5,
  },
  metadataValue: {
    width: '75%',
    height: 14,
    borderRadius: 7,
  },
  progressTrack: {
    height: 6,
    borderRadius: 999,
    marginBottom: Spacing.two,
  },
  timelineRow: {
    flexDirection: 'row',
    gap: 12,
  },
  timelineDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  timelineTextColumn: {
    flex: 1,
    gap: 6,
    paddingTop: 4,
  },
  timelineTitleBar: {
    width: '70%',
    height: 14,
    borderRadius: 7,
  },
  timelineMetaBar: {
    width: '45%',
    height: 10,
    borderRadius: 5,
  },
  listRow: {
    gap: 6,
    paddingVertical: Spacing.two,
  },
  listTitleBar: {
    width: '60%',
    height: 14,
    borderRadius: 7,
  },
  listMetaBar: {
    width: '40%',
    height: 10,
    borderRadius: 5,
  },
});
