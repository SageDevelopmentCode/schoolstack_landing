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

function SkeletonClassroomCardRow({ backgroundColor }: { backgroundColor: string }) {
  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <SkeletonBlock style={styles.titleBar} backgroundColor={backgroundColor} />
        <SkeletonBlock style={styles.chipPill} backgroundColor={backgroundColor} />
      </View>
      <SkeletonBlock style={styles.metaBar} backgroundColor={backgroundColor} />
      <SkeletonBlock style={styles.teacherBar} backgroundColor={backgroundColor} />
    </View>
  );
}

type ClassroomsListSkeletonProps = {
  rowCount?: number;
};

export function ClassroomsListSkeleton({ rowCount = 5 }: ClassroomsListSkeletonProps) {
  const skeletonColor = '#E4E8E1';

  return (
    <View style={styles.container}>
      <SkeletonBlock style={styles.headerBar} backgroundColor={skeletonColor} />
      <SkeletonBlock style={styles.addButton} backgroundColor={skeletonColor} />
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
            <SkeletonClassroomCardRow backgroundColor={skeletonColor} />
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
  addButton: {
    height: 44,
    borderRadius: Radius.pill,
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
    gap: Spacing.one,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  titleBar: {
    flex: 1,
    height: 18,
    borderRadius: 9,
  },
  chipPill: {
    width: 52,
    height: 22,
    borderRadius: Radius.pill,
  },
  metaBar: {
    height: 12,
    borderRadius: 6,
    width: '65%',
  },
  teacherBar: {
    height: 10,
    borderRadius: 5,
    width: '45%',
  },
});
