import { useEffect } from 'react';
import { ScrollView, StyleSheet, View, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { ParentChildrenRecordSkeleton } from '@/components/parent/children/parent-children-record-skeleton';
import { PARENT_FLOATING_TAB_BAR_HEIGHT } from '@/components/parent/parent-floating-tab-bar';
import { Story, StoryCardPadding, StoryRadius } from '@/constants/story-theme';
import { SCREEN_HORIZONTAL_PADDING } from '@/constants/screen-layout';
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

function OverviewCardSkeleton({ blockColor }: { blockColor: string }) {
  return (
    <View style={styles.overviewCard}>
      <SkeletonBlock style={styles.kickerBar} backgroundColor={blockColor} />
      <SkeletonBlock style={styles.cardTitleBar} backgroundColor={blockColor} />
      <SkeletonBlock style={styles.lineFull} backgroundColor={blockColor} />
      <SkeletonBlock style={styles.lineShort} backgroundColor={blockColor} />
    </View>
  );
}

export function ParentChildrenSkeleton() {
  const blockColor = Story.line;

  return (
    <ScrollView
      style={{ backgroundColor: Story.paper }}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: PARENT_FLOATING_TAB_BAR_HEIGHT + Spacing.six },
      ]}>
      <SkeletonBlock style={styles.kickerBar} backgroundColor={blockColor} />
      <SkeletonBlock style={styles.titleBar} backgroundColor={blockColor} />
      <SkeletonBlock style={styles.subtitleBar} backgroundColor={blockColor} />

      <View style={styles.learnerStrip}>
        <SkeletonBlock style={styles.learnerCard} backgroundColor={blockColor} />
        <SkeletonBlock style={styles.learnerCard} backgroundColor={blockColor} />
      </View>

      <OverviewCardSkeleton blockColor={blockColor} />
      <OverviewCardSkeleton blockColor={blockColor} />
      <ParentChildrenRecordSkeleton />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingTop: Spacing.four,
    gap: Spacing.four,
  },
  kickerBar: {
    width: 180,
    height: 12,
    borderRadius: 6,
  },
  titleBar: {
    width: '70%',
    height: 28,
    borderRadius: 8,
  },
  subtitleBar: {
    width: '55%',
    height: 14,
    borderRadius: 6,
  },
  learnerStrip: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  learnerCard: {
    width: 155,
    height: 60,
    borderRadius: 14,
  },
  overviewCard: {
    borderWidth: 1,
    borderColor: Story.line,
    borderRadius: StoryRadius.card,
    backgroundColor: Story.white,
    padding: StoryCardPadding,
    gap: Spacing.two,
  },
  cardTitleBar: {
    width: 160,
    height: 20,
    borderRadius: 8,
  },
  lineFull: {
    width: '100%',
    height: 12,
    borderRadius: 6,
    marginTop: Spacing.one,
  },
  lineShort: {
    width: '80%',
    height: 12,
    borderRadius: 6,
  },
});
