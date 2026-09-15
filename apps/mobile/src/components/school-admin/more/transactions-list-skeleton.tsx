import { useEffect } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { SCREEN_HORIZONTAL_PADDING } from '@/constants/screen-layout';
import { Story, StoryCardPadding } from '@/constants/story-theme';
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

type TransactionsListSkeletonProps = {
  rowCount?: number;
};

export function TransactionsListSkeleton({ rowCount = 5 }: TransactionsListSkeletonProps) {
  const skeletonColor = '#DCE4DC';

  return (
    <View style={styles.container}>
      <SkeletonBlock style={styles.kicker} backgroundColor={skeletonColor} />
      <SkeletonBlock style={styles.title} backgroundColor={skeletonColor} />
      <SkeletonBlock style={styles.subtitle} backgroundColor={skeletonColor} />

      <View style={styles.metricGrid}>
        {Array.from({ length: 4 }, (_, index) => (
          <View key={index} style={styles.metricCard}>
            <SkeletonBlock style={styles.metricValue} backgroundColor={skeletonColor} />
            <SkeletonBlock style={styles.metricLabel} backgroundColor={skeletonColor} />
          </View>
        ))}
      </View>

      <View style={styles.pillRow}>
        {Array.from({ length: 4 }, (_, index) => (
          <SkeletonBlock key={index} style={styles.pill} backgroundColor={skeletonColor} />
        ))}
      </View>

      <View style={styles.list}>
        {Array.from({ length: rowCount }, (_, index) => (
          <View key={index} style={styles.cardWrap}>
            <SkeletonBlock style={styles.cardTitle} backgroundColor={skeletonColor} />
            <View style={styles.badgeRow}>
              <SkeletonBlock style={styles.badgePill} backgroundColor={skeletonColor} />
              <SkeletonBlock style={styles.badgePillWide} backgroundColor={skeletonColor} />
            </View>
            <SkeletonBlock style={styles.metaBar} backgroundColor={skeletonColor} />
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
    paddingTop: Spacing.four,
    gap: Spacing.four,
  },
  kicker: {
    height: 10,
    width: 120,
    borderRadius: Radius.sm,
  },
  title: {
    height: 28,
    width: '55%',
    borderRadius: Radius.sm,
  },
  subtitle: {
    height: 14,
    width: '85%',
    borderRadius: Radius.sm,
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  metricCard: {
    flexGrow: 1,
    flexBasis: '46%',
    minWidth: '46%',
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E0E7E0',
    backgroundColor: '#FFFFFF',
    padding: StoryCardPadding,
    gap: Spacing.one,
  },
  metricValue: {
    height: 24,
    width: '50%',
    borderRadius: Radius.sm,
  },
  metricLabel: {
    height: 12,
    width: '70%',
    borderRadius: Radius.sm,
  },
  pillRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  pill: {
    height: 32,
    width: 72,
    borderRadius: 9,
  },
  list: {
    gap: Spacing.three,
  },
  cardWrap: {
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E0E7E0',
    backgroundColor: '#FFFFFF',
    padding: StoryCardPadding,
    gap: Spacing.two,
  },
  cardTitle: {
    height: 18,
    width: '65%',
    borderRadius: Radius.sm,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: Spacing.one,
  },
  badgePill: {
    height: 22,
    width: 72,
    borderRadius: Radius.pill,
  },
  badgePillWide: {
    height: 22,
    width: 100,
    borderRadius: Radius.pill,
  },
  metaBar: {
    height: 11,
    width: '75%',
    borderRadius: Radius.sm,
  },
});
