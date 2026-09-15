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
      <SkeletonBlock style={styles.titleBar} backgroundColor={backgroundColor} />
      <SkeletonBlock style={styles.subtitleBar} backgroundColor={backgroundColor} />
      <View style={styles.badgeRow}>
        <SkeletonBlock style={styles.badgePill} backgroundColor={backgroundColor} />
      </View>
    </View>
  );
}

type ParentCommitteesSkeletonProps = {
  rowCount?: number;
};

export function ParentCommitteesSkeleton({ rowCount = 4 }: ParentCommitteesSkeletonProps) {
  const skeletonColor = '#E4E8E1';

  return (
    <View style={styles.container}>
      <SkeletonBlock style={styles.headerBar} backgroundColor={skeletonColor} />
      <SkeletonBlock style={styles.subheaderBar} backgroundColor={skeletonColor} />
      <SkeletonBlock style={styles.pillNav} backgroundColor={skeletonColor} />
      {Array.from({ length: rowCount }).map((_, index) => (
        <SkeletonCardRow key={index} backgroundColor={skeletonColor} />
      ))}
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
  badgeRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  badgePill: {
    height: 22,
    width: 72,
    borderRadius: Radius.pill,
  },
});
