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
      <SkeletonBlock style={styles.pillNav} backgroundColor={skeletonColor} />
      <SkeletonBlock style={styles.heroCard} backgroundColor={skeletonColor} />
      <SkeletonBlock style={styles.summaryCard} backgroundColor={skeletonColor} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.four,
    paddingVertical: Spacing.two,
  },
  pillNav: {
    height: 44,
    borderRadius: 12,
  },
  heroCard: {
    height: 200,
    borderRadius: StoryCardPadding,
  },
  summaryCard: {
    height: 120,
    borderRadius: StoryCardPadding,
  },
});
