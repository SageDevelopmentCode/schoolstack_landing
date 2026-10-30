import { useEffect } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { useParentTheme } from '@/contexts/parent-theme-context';
import { Radius, Spacing } from '@/constants/theme';

function SkeletonBlock({ style, backgroundColor }: { style: ViewStyle; backgroundColor: string }) {
  const opacity = useSharedValue(0.45);

  useEffect(() => {
    opacity.value = withRepeat(withTiming(0.85, { duration: 900 }), -1, true);
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return <Animated.View style={[style, { backgroundColor }, animatedStyle]} />;
}

type StoryMoreMenuSectionTabsSkeletonProps = {
  tabCount?: number;
};

export function StoryMoreMenuSectionTabsSkeleton({
  tabCount = 3,
}: StoryMoreMenuSectionTabsSkeletonProps) {
  const theme = useParentTheme();
  const count = Math.max(2, Math.min(tabCount, 3));

  return (
    <View
      style={[styles.wrap, { backgroundColor: theme.line }]}
      accessibilityRole="progressbar"
      accessibilityLabel="Loading menu sections">
      {Array.from({ length: count }, (_, index) => (
        <View key={index} style={[styles.tab, { backgroundColor: theme.paper }]}>
          <SkeletonBlock style={styles.icon} backgroundColor={theme.line} />
          <SkeletonBlock style={styles.label} backgroundColor={theme.line} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    borderRadius: Radius.pill,
    padding: 3,
    gap: 2,
    marginBottom: Spacing.three,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: Radius.pill,
    minHeight: 44,
    gap: 4,
  },
  icon: {
    width: 16,
    height: 16,
    borderRadius: 4,
  },
  label: {
    width: '55%',
    height: 11,
    borderRadius: 4,
  },
});
