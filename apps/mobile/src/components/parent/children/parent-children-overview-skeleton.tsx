import { useEffect } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { StoryCard } from '@/components/story/story-card';
import { Story, StoryCardPadding, StoryRadius } from '@/constants/story-theme';
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

function OverviewCardSkeleton({ blockColor }: { blockColor: string }) {
  return (
    <StoryCard style={styles.card}>
      <SkeletonBlock style={styles.kickerBar} backgroundColor={blockColor} />
      <SkeletonBlock style={styles.titleBar} backgroundColor={blockColor} />
      <SkeletonBlock style={styles.lineFull} backgroundColor={blockColor} />
      <SkeletonBlock style={styles.lineShort} backgroundColor={blockColor} />
    </StoryCard>
  );
}

export function ParentChildrenOverviewSkeleton() {
  const blockColor = Story.line;

  return (
    <View style={styles.container} testID="parent-children-overview-skeleton">
      <OverviewCardSkeleton blockColor={blockColor} />
      <OverviewCardSkeleton blockColor={blockColor} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.three,
  },
  card: {
    padding: StoryCardPadding,
    gap: Spacing.two,
  },
  kickerBar: {
    width: 112,
    height: 12,
    borderRadius: 6,
  },
  titleBar: {
    width: 160,
    height: 20,
    borderRadius: 8,
  },
  lineFull: {
    width: '100%',
    height: 12,
    borderRadius: 6,
    marginTop: Spacing.one,
  },
  lineShort: {
    width: '80%',
    height: 12,
    borderRadius: 6,
  },
});
