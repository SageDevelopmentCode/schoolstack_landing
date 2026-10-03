import { useEffect } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { StoryCard } from '@/components/story/story-card';
import { StoryMoreMenuItemsCard } from '@/components/story/more/story-more-menu-items-card';
import {
  PARENT_COOP_TAB_BAR_BANNER_HEIGHT,
} from '@/components/parent/parent-portal-coop-tab-bar-banner';
import { useParentTheme } from '@/contexts/parent-theme-context';
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

export function ParentPortalCoopTabBarBannerSkeleton() {
  const theme = useParentTheme();

  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel="Loading program portal"
      style={[
        styles.tabBarBanner,
        {
          backgroundColor: theme.primarySoft,
          borderColor: theme.line,
        },
      ]}>
      <SkeletonBlock
        style={styles.tabBarBannerLine}
        backgroundColor={theme.line}
      />
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

export function ParentPortalMoreMenuItemsSkeleton({ rowCount = 4 }: { rowCount?: number }) {
  const theme = useParentTheme();

  return (
    <StoryMoreMenuItemsCard>
      {Array.from({ length: rowCount }, (_, index) => (
        <View
          key={index}
          style={[
            styles.menuRow,
            index > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: Story.line },
          ]}>
          <SkeletonBlock style={styles.menuIcon} backgroundColor={theme.line} />
          <View style={styles.menuTextColumn}>
            <SkeletonBlock style={styles.menuTitle} backgroundColor={theme.line} />
            <SkeletonBlock style={styles.menuSubtitle} backgroundColor={theme.line} />
          </View>
        </View>
      ))}
    </StoryMoreMenuItemsCard>
  );
}

const styles = StyleSheet.create({
  tabBarBanner: {
    alignSelf: 'stretch',
    width: '100%',
    height: PARENT_COOP_TAB_BAR_BANNER_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.four,
  },
  tabBarBannerLine: {
    height: 12,
    width: '55%',
    borderRadius: StoryRadius.button,
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
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
  },
  menuTextColumn: {
    flex: 1,
    gap: Spacing.one,
  },
  menuTitle: {
    height: 14,
    width: '50%',
    borderRadius: StoryRadius.button,
  },
  menuSubtitle: {
    height: 12,
    width: '70%',
    borderRadius: StoryRadius.button,
  },
});
