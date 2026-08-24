import { useEffect } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { useAdminTheme } from '@/contexts/admin-theme-context';
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

function RowSkeleton({ backgroundColor }: { backgroundColor: string }) {
  return (
    <View style={styles.row}>
      <SkeletonBlock style={styles.avatar} backgroundColor={backgroundColor} />
      <View style={styles.copy}>
        <SkeletonBlock style={styles.nameBar} backgroundColor={backgroundColor} />
        <SkeletonBlock style={styles.gradeBar} backgroundColor={backgroundColor} />
      </View>
    </View>
  );
}

export function ParentChildrenSkeleton() {
  const theme = useAdminTheme();
  const blockColor = theme.border;

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <SkeletonBlock style={styles.titleBar} backgroundColor={blockColor} />
      <View style={styles.list}>
        <RowSkeleton backgroundColor={blockColor} />
        <View style={[styles.divider, { backgroundColor: theme.border, marginLeft: 68 }]} />
        <RowSkeleton backgroundColor={blockColor} />
        <View style={[styles.divider, { backgroundColor: theme.border, marginLeft: 68 }]} />
        <RowSkeleton backgroundColor={blockColor} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Spacing.four,
    gap: Spacing.four,
  },
  titleBar: {
    width: 140,
    height: 28,
    borderRadius: 8,
    marginHorizontal: Spacing.four,
  },
  list: {
    gap: 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  copy: {
    flex: 1,
    gap: Spacing.two,
  },
  nameBar: {
    width: '55%',
    height: 14,
    borderRadius: 6,
  },
  gradeBar: {
    width: '35%',
    height: 12,
    borderRadius: 6,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
  },
});
