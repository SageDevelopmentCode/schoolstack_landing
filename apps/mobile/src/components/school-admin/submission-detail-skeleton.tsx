import { useEffect } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { useAdminTheme } from '@/contexts/admin-theme-context';
import { Radius, Spacing } from '@/constants/theme';

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

  return (
    <Animated.View style={[style, { backgroundColor }, animatedStyle]} />
  );
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
  const theme = useAdminTheme();

  return (
    <View style={styles.sectionBody}>
      <SkeletonBlock style={styles.progressTrack} backgroundColor={theme.border} />
      {Array.from({ length: rowCount }, (_, index) => (
        <SkeletonTimelineRow
          key={index}
          backgroundColor={theme.border}
          rowSpacing={Spacing.five}
        />
      ))}
    </View>
  );
}

export function DetailRowListSkeleton({ rowCount = 3 }: { rowCount?: number }) {
  const theme = useAdminTheme();

  return (
    <View style={styles.sectionBody}>
      {Array.from({ length: rowCount }, (_, index) => (
        <View key={index} style={styles.listRow}>
          <SkeletonBlock style={styles.listTitleBar} backgroundColor={theme.border} />
          <SkeletonBlock style={styles.listMetaBar} backgroundColor={theme.border} />
        </View>
      ))}
    </View>
  );
}

export function DetailMetadataSectionSkeleton() {
  const theme = useAdminTheme();

  return (
    <View style={styles.sectionBody}>
      {Array.from({ length: 4 }, (_, index) => (
        <View key={index} style={styles.metadataRow}>
          <SkeletonBlock style={styles.metadataLabel} backgroundColor={theme.border} />
          <SkeletonBlock style={styles.metadataValue} backgroundColor={theme.border} />
        </View>
      ))}
    </View>
  );
}

export function SubmissionDetailScreenSkeleton() {
  const theme = useAdminTheme();

  return (
    <View style={styles.screen}>
      <View style={styles.summaryStrip}>
        <SkeletonBlock style={styles.summaryNameBar} backgroundColor={theme.border} />
        <SkeletonBlock style={styles.summaryBadgeBar} backgroundColor={theme.border} />
      </View>
      <View style={styles.tabRow}>
        {Array.from({ length: 4 }, (_, index) => (
          <SkeletonBlock key={index} style={styles.tabPill} backgroundColor={theme.border} />
        ))}
      </View>
      <View style={styles.overviewBody}>
        <SkeletonBlock style={styles.sectionTitleBar} backgroundColor={theme.border} />
        <DetailMetadataSectionSkeleton />
        <SkeletonBlock style={styles.sectionTitleBar} backgroundColor={theme.border} />
        <DetailTimelineSectionSkeleton />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    gap: 0,
  },
  summaryStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
  },
  summaryNameBar: {
    flex: 1,
    height: 20,
    borderRadius: Radius.sm,
    maxWidth: '55%',
  },
  summaryBadgeBar: {
    width: 72,
    height: 24,
    borderRadius: Radius.pill,
  },
  tabRow: {
    flexDirection: 'row',
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
  },
  tabPill: {
    width: 72,
    height: 14,
    borderRadius: Radius.sm,
  },
  overviewBody: {
    padding: Spacing.four,
    gap: Spacing.four,
  },
  sectionBody: {
    gap: Spacing.two,
  },
  sectionTitleBar: {
    width: 120,
    height: 12,
    borderRadius: Radius.sm,
  },
  metadataRow: {
    gap: 4,
  },
  metadataLabel: {
    width: 80,
    height: 10,
    borderRadius: Radius.sm,
  },
  metadataValue: {
    width: '75%',
    height: 14,
    borderRadius: Radius.sm,
  },
  progressTrack: {
    height: 6,
    borderRadius: Radius.pill,
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
    borderRadius: Radius.sm,
  },
  timelineMetaBar: {
    width: '45%',
    height: 10,
    borderRadius: Radius.sm,
  },
  listRow: {
    gap: 6,
    paddingVertical: Spacing.two,
  },
  listTitleBar: {
    width: '60%',
    height: 14,
    borderRadius: Radius.sm,
  },
  listMetaBar: {
    width: '40%',
    height: 10,
    borderRadius: Radius.sm,
  },
});
