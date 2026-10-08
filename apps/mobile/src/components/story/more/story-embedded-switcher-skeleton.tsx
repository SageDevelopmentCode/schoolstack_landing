import { useEffect } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { StoryEmbeddedSwitcherSection } from '@/components/story/more/story-embedded-switcher-section';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { Spacing } from '@/constants/theme';

function SkeletonBlock({ style, backgroundColor }: { style: ViewStyle; backgroundColor: string }) {
  const opacity = useSharedValue(0.45);

  useEffect(() => {
    opacity.value = withRepeat(withTiming(0.85, { duration: 900 }), -1, true);
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return <Animated.View style={[style, { backgroundColor }, animatedStyle]} />;
}

type StoryEmbeddedSwitcherSkeletonProps = {
  kicker?: string;
  rowCount?: number;
};

export function StoryEmbeddedSwitcherSkeleton({
  kicker,
  rowCount = 3,
}: StoryEmbeddedSwitcherSkeletonProps) {
  const theme = useParentTheme();

  return (
    <StoryEmbeddedSwitcherSection kicker={kicker}>
      {Array.from({ length: rowCount }, (_, index) => (
        <View
          key={index}
          style={[
            styles.menuRow,
            index > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: theme.line },
          ]}>
          <SkeletonBlock style={styles.menuIcon} backgroundColor={theme.line} />
          <View style={styles.menuTextColumn}>
            <SkeletonBlock style={styles.menuTitle} backgroundColor={theme.line} />
            <SkeletonBlock style={styles.menuSubtitle} backgroundColor={theme.line} />
          </View>
        </View>
      ))}
    </StoryEmbeddedSwitcherSection>
  );
}

const styles = StyleSheet.create({
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.three,
  },
  menuIcon: {
    width: 38,
    height: 38,
    borderRadius: 13,
    marginLeft: 18 + Spacing.two,
  },
  menuTextColumn: {
    flex: 1,
    gap: 6,
    paddingRight: Spacing.two,
  },
  menuTitle: {
    height: 14,
    width: '55%',
    borderRadius: 6,
  },
  menuSubtitle: {
    height: 12,
    width: '72%',
    borderRadius: 6,
  },
});
