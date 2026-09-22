import { useEffect } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { useParentTheme } from '@/contexts/parent-theme-context';
import { Story } from '@/constants/story-theme';
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

type PortalActivityNotificationsSkeletonProps = {
  rowCount?: number;
};

export function PortalActivityNotificationsSkeleton({
  rowCount = 5,
}: PortalActivityNotificationsSkeletonProps) {
  const theme = useParentTheme();
  const blockColor = theme.line;

  return (
    <View style={styles.container}>
      {Array.from({ length: rowCount }, (_, index) => (
        <View
          key={index}
          style={[
            styles.row,
            index > 0 && {
              borderTopWidth: StyleSheet.hairlineWidth,
              borderTopColor: Story.line,
            },
          ]}>
          <View style={styles.topRow}>
            <SkeletonBlock style={styles.iconBar} backgroundColor={blockColor} />
            <SkeletonBlock style={styles.ctaBar} backgroundColor={blockColor} />
          </View>
          <SkeletonBlock style={styles.titleBar} backgroundColor={blockColor} />
          <SkeletonBlock style={styles.detailBar} backgroundColor={blockColor} />
          <SkeletonBlock style={styles.timestampBar} backgroundColor={blockColor} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: Spacing.two,
  },
  row: {
    gap: Spacing.two,
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingVertical: Spacing.three,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  iconBar: {
    width: 32,
    height: 32,
    borderRadius: Radius.pill,
  },
  ctaBar: {
    width: 56,
    height: 14,
    borderRadius: Radius.sm,
  },
  titleBar: {
    width: '70%',
    height: 14,
    borderRadius: Radius.sm,
  },
  detailBar: {
    width: '92%',
    height: 12,
    borderRadius: Radius.sm,
  },
  timestampBar: {
    width: 48,
    height: 10,
    borderRadius: Radius.sm,
  },
});
