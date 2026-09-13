import { useEffect } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { Story, StoryCardPadding } from '@/constants/story-theme';
import { SCREEN_HORIZONTAL_PADDING } from '@/constants/screen-layout';
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

  return <Animated.View style={[style, { backgroundColor }, animatedStyle]} />;
}

function SkeletonCardRow({ backgroundColor }: { backgroundColor: string }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <SkeletonBlock style={styles.avatar} backgroundColor={backgroundColor} />
        <View style={styles.textColumn}>
          <SkeletonBlock style={styles.nameBar} backgroundColor={backgroundColor} />
          <View style={styles.badgeRow}>
            <SkeletonBlock style={styles.badgePill} backgroundColor={backgroundColor} />
            <SkeletonBlock style={styles.badgePillWide} backgroundColor={backgroundColor} />
          </View>
        </View>
      </View>
      <SkeletonBlock style={styles.metaBar} backgroundColor={backgroundColor} />
    </View>
  );
}

type StudentsListSkeletonProps = {
  rowCount?: number;
};

export function StudentsListSkeleton({ rowCount = 5 }: StudentsListSkeletonProps) {
  const skeletonColor = '#E4E8E1';

  return (
    <View style={styles.container}>
      <SkeletonBlock style={styles.headerBar} backgroundColor={skeletonColor} />
      <View style={styles.metricsRow}>
        <SkeletonBlock style={styles.metricCard} backgroundColor={skeletonColor} />
        <SkeletonBlock style={styles.metricCard} backgroundColor={skeletonColor} />
      </View>
      <SkeletonBlock style={styles.filterBar} backgroundColor={skeletonColor} />
      <SkeletonBlock style={styles.searchBar} backgroundColor={skeletonColor} />
      <View style={styles.list}>
        {Array.from({ length: rowCount }, (_, index) => (
          <View
            key={index}
            style={[
              styles.cardWrap,
              {
                backgroundColor: Story.white,
                borderColor: Story.line,
              },
            ]}>
            <SkeletonCardRow backgroundColor={skeletonColor} />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Story.paper,
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingTop: Spacing.two,
    gap: Spacing.three,
  },
  headerBar: {
    height: 72,
    borderRadius: Radius.md,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  metricCard: {
    flex: 1,
    height: 88,
    borderRadius: Radius.lg,
  },
  filterBar: {
    height: 36,
    borderRadius: Radius.pill,
    width: '70%',
  },
  searchBar: {
    height: 44,
    borderRadius: Radius.pill,
  },
  list: {
    gap: Spacing.two,
  },
  cardWrap: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: StoryCardPadding,
  },
  card: {
    gap: Spacing.two,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  textColumn: {
    flex: 1,
    gap: 6,
  },
  nameBar: {
    height: 14,
    borderRadius: 7,
    width: '55%',
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.one,
  },
  badgePill: {
    height: 22,
    width: 72,
    borderRadius: Radius.pill,
  },
  badgePillWide: {
    height: 22,
    width: 100,
    borderRadius: Radius.pill,
  },
  metaBar: {
    height: 64,
    borderRadius: 12,
    width: '100%',
  },
});
