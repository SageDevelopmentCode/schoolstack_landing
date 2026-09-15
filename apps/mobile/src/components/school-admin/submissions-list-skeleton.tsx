import { useEffect } from 'react';
import { ScrollView, StyleSheet, View, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { Story } from '@/constants/story-theme';
import { SCREEN_HORIZONTAL_PADDING } from '@/constants/screen-layout';
import { Spacing } from '@/constants/theme';

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

const SKELETON_COLOR = '#E4E8E1';
const FILTER_CHIP_COUNT = 5;
const METRIC_COUNT = 4;

export function SubmissionsListSkeleton({ rowCount = 6 }: { rowCount?: number }) {
  return (
    <View style={[styles.container, { backgroundColor: Story.paper }]}>
      <View style={styles.headerBlock}>
        <SkeletonBlock style={styles.kickerBar} backgroundColor={SKELETON_COLOR} />
        <SkeletonBlock style={styles.titleBar} backgroundColor={SKELETON_COLOR} />
        <SkeletonBlock style={styles.subtitleBar} backgroundColor={SKELETON_COLOR} />

        <View style={styles.metricsGrid}>
          {Array.from({ length: METRIC_COUNT }, (_, index) => (
            <SkeletonBlock
              key={index}
              style={styles.metricCard}
              backgroundColor={SKELETON_COLOR}
            />
          ))}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filters}>
          {Array.from({ length: FILTER_CHIP_COUNT }, (_, index) => (
            <SkeletonBlock
              key={index}
              style={styles.filterChip}
              backgroundColor={SKELETON_COLOR}
            />
          ))}
        </ScrollView>
      </View>

      <View style={styles.list}>
        {Array.from({ length: rowCount }, (_, index) => (
          <SkeletonBlock key={index} style={styles.card} backgroundColor={SKELETON_COLOR} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingTop: Spacing.four,
  },
  headerBlock: {
    gap: Spacing.three,
    marginBottom: Spacing.three,
  },
  kickerBar: {
    width: 140,
    height: 10,
    borderRadius: 5,
  },
  titleBar: {
    width: '60%',
    height: 28,
    borderRadius: 8,
  },
  subtitleBar: {
    width: '80%',
    height: 14,
    borderRadius: 7,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  metricCard: {
    flexGrow: 1,
    flexBasis: '46%',
    height: 72,
    borderRadius: 16,
  },
  filters: {
    gap: Spacing.two,
  },
  filterChip: {
    width: 88,
    height: 32,
    borderRadius: 9,
  },
  list: {
    gap: Spacing.three,
    paddingBottom: Spacing.six,
  },
  card: {
    height: 140,
    borderRadius: 16,
  },
});
