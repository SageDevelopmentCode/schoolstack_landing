import { useEffect } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { Story, StoryCardPadding } from '@/constants/story-theme';
import { Radius, Spacing } from '@/constants/theme';

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

function SkeletonRow({ backgroundColor }: { backgroundColor: string }) {
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: Story.white, borderColor: Story.line },
      ]}>
      <View style={styles.rowMain}>
        <SkeletonBlock style={styles.avatar} backgroundColor={backgroundColor} />
        <View style={styles.textColumn}>
          <SkeletonBlock style={styles.nameBar} backgroundColor={backgroundColor} />
          <SkeletonBlock style={styles.metaBar} backgroundColor={backgroundColor} />
        </View>
      </View>
      <SkeletonBlock style={styles.removeBar} backgroundColor={backgroundColor} />
    </View>
  );
}

type StaffAssignedStudentsSkeletonProps = {
  rowCount?: number;
};

export function StaffAssignedStudentsSkeleton({ rowCount = 4 }: StaffAssignedStudentsSkeletonProps) {
  return (
    <View style={styles.list}>
      {Array.from({ length: rowCount }, (_, index) => (
        <SkeletonRow key={index} backgroundColor={SKELETON_COLOR} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: Spacing.two,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: StoryCardPadding,
    gap: Spacing.two,
  },
  rowMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
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
  metaBar: {
    height: 11,
    borderRadius: 6,
    width: '70%',
  },
  removeBar: {
    width: 52,
    height: 12,
    borderRadius: 6,
  },
});
