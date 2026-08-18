import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { Brand, Radius, Spacing } from '@/constants/theme';

type OrganizationSelectorSkeletonProps = {
  rowCount?: number;
};

function SkeletonRow() {
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    opacity.value = withRepeat(withTiming(1, { duration: 900 }), -1, true);
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.row, animatedStyle]}>
      <View style={styles.logoPlaceholder} />
      <View style={styles.namePlaceholder} />
    </Animated.View>
  );
}

export function OrganizationSelectorSkeleton({
  rowCount = 3,
}: OrganizationSelectorSkeletonProps) {
  return (
    <View style={styles.wrapper}>
      {Array.from({ length: rowCount }, (_, index) => (
        <View key={index}>
          <SkeletonRow />
          {index < rowCount - 1 ? <View style={styles.separator} /> : null}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Brand.border,
    backgroundColor: Brand.surface,
  },
  logoPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Brand.border,
  },
  namePlaceholder: {
    flex: 1,
    height: 14,
    borderRadius: 7,
    backgroundColor: Brand.border,
    maxWidth: '70%',
  },
  separator: {
    height: Spacing.two,
  },
});
