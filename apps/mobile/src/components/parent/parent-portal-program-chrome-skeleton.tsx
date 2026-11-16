import { useEffect } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { StoryCard } from '@/components/story/story-card';
import { GSkeleton } from '@/components/parent/garden/ui';
import {
  PARENT_COOP_TAB_BAR_BANNER_HEIGHT,
} from '@/components/parent/parent-portal-coop-tab-bar-banner';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { StoryCardPadding, StoryRadius } from '@/constants/story-theme';
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

export function ParentPortalCoopTabBarBannerSkeleton() {
  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel="Loading program portal"
      pointerEvents="none"
      style={styles.tabBarBanner}>
      <GSkeleton style={styles.tabBarBannerChip} />
    </View>
  );
}

export function ParentPortalProgramSwitcherCardSkeleton() {
  const theme = useParentTheme();

  return (
    <StoryCard compact style={styles.programCard}>
      <SkeletonBlock style={styles.programKicker} backgroundColor={theme.line} />
      <SkeletonBlock style={styles.programRow} backgroundColor={theme.line} />
      <SkeletonBlock style={styles.programRow} backgroundColor={theme.line} />
    </StoryCard>
  );
}

const styles = StyleSheet.create({
  tabBarBanner: {
    alignSelf: 'stretch',
    width: '100%',
    height: PARENT_COOP_TAB_BAR_BANNER_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabBarBannerChip: {
    height: 26,
    width: 180,
    borderRadius: 13,
  },
  programCard: {
    padding: StoryCardPadding,
    gap: Spacing.two,
    marginBottom: Spacing.two,
  },
  programKicker: {
    height: 10,
    width: 72,
    borderRadius: StoryRadius.button,
  },
  programRow: {
    height: 36,
    borderRadius: 8,
  },
});
