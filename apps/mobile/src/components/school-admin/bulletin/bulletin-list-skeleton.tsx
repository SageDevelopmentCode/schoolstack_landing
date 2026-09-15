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

type BulletinListSkeletonProps = {
  rowCount?: number;
};

export function BulletinListSkeleton({ rowCount = 4 }: BulletinListSkeletonProps) {
  const skeletonColor = '#E4E8E1';

  return (
    <View style={styles.container}>
      <SkeletonBlock style={styles.headerBar} backgroundColor={skeletonColor} />
      <View style={styles.metricsRow}>
        <SkeletonBlock style={styles.metricCard} backgroundColor={skeletonColor} />
        <SkeletonBlock style={styles.metricCard} backgroundColor={skeletonColor} />
      </View>
      <View style={styles.metricsRow}>
        <SkeletonBlock style={styles.metricCard} backgroundColor={skeletonColor} />
        <SkeletonBlock style={styles.metricCard} backgroundColor={skeletonColor} />
      </View>
      <SkeletonBlock style={styles.addButton} backgroundColor={skeletonColor} />
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
            <SkeletonBlock style={styles.cardTitle} backgroundColor={skeletonColor} />
            <SkeletonBlock style={styles.cardSubtitle} backgroundColor={skeletonColor} />
            <SkeletonBlock style={styles.cardMeta} backgroundColor={skeletonColor} />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingTop: Spacing.four,
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
    borderRadius: Radius.md,
  },
  addButton: {
    height: 44,
    borderRadius: Radius.md,
    width: 140,
    alignSelf: 'flex-end',
  },
  list: {
    gap: Spacing.two,
  },
  cardWrap: {
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: StoryCardPadding,
    gap: Spacing.two,
  },
  cardTitle: {
    height: 20,
    width: '75%',
    borderRadius: Radius.sm,
  },
  cardSubtitle: {
    height: 16,
    width: '55%',
    borderRadius: Radius.sm,
  },
  cardMeta: {
    height: 14,
    width: '40%',
    borderRadius: Radius.sm,
  },
});
