import { useEffect } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { StoryCardPadding } from '@/constants/story-theme';
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

export function TeacherMyHoursSkeleton() {
  const skeletonColor = '#E4E8E1';

  return (
    <View style={styles.container} testID="teacher-my-hours-skeleton">
      <SkeletonBlock style={styles.titleBar} backgroundColor={skeletonColor} />
      <SkeletonBlock style={styles.subtitleBar} backgroundColor={skeletonColor} />
      <SkeletonBlock style={styles.dateNav} backgroundColor={skeletonColor} />
      <SkeletonBlock style={styles.pillNav} backgroundColor={skeletonColor} />
      <SkeletonBlock style={styles.heroCard} backgroundColor={skeletonColor} />
      <SkeletonBlock style={styles.summaryCard} backgroundColor={skeletonColor} />
      <SkeletonBlock style={styles.listCard} backgroundColor={skeletonColor} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.four,
    paddingVertical: Spacing.two,
  },
  titleBar: {
    height: 28,
    width: '55%',
    borderRadius: 8,
  },
  subtitleBar: {
    height: 16,
    width: '85%',
    borderRadius: 6,
  },
  dateNav: {
    height: 40,
    width: '60%',
    borderRadius: 10,
  },
  pillNav: {
    height: 44,
    borderRadius: 12,
  },
  heroCard: {
    height: 160,
    borderRadius: StoryCardPadding,
  },
  summaryCard: {
    height: 120,
    borderRadius: StoryCardPadding,
  },
  listCard: {
    height: 200,
    borderRadius: StoryCardPadding,
  },
});
