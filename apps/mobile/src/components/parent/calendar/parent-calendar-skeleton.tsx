import { useEffect } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { Story, StoryCardPadding, StoryRadius } from '@/constants/story-theme';
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

export function ParentCalendarSkeleton() {
  const blockColor = Story.line;

  return (
    <View style={styles.container}>
      <View style={styles.calendarCard}>
        <View style={styles.toolbarTop}>
          <View style={styles.periodNav}>
            <SkeletonBlock style={styles.navButton} backgroundColor={blockColor} />
            <SkeletonBlock style={styles.navButton} backgroundColor={blockColor} />
            <SkeletonBlock style={styles.periodBar} backgroundColor={blockColor} />
          </View>
          <SkeletonBlock style={styles.todayPill} backgroundColor={blockColor} />
        </View>

        <SkeletonBlock style={styles.pillTrack} backgroundColor={blockColor} />

        <View style={styles.dayGrid}>
          <SkeletonBlock style={styles.dayHeader} backgroundColor={blockColor} />
          <View style={styles.dayGridBody}>
            <SkeletonBlock style={styles.dayGridGutter} backgroundColor={blockColor} />
            <SkeletonBlock style={styles.dayGridColumn} backgroundColor={blockColor} />
          </View>
        </View>
      </View>

      <View style={styles.agendaCard}>
        <SkeletonBlock style={styles.kicker} backgroundColor={blockColor} />
        <SkeletonBlock style={styles.agendaTitle} backgroundColor={blockColor} />
        {Array.from({ length: 3 }, (_, index) => (
          <SkeletonBlock key={index} style={styles.agendaRow} backgroundColor={blockColor} />
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
  calendarCard: {
    backgroundColor: Story.white,
    borderRadius: StoryRadius.cardCompact,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Story.line,
    padding: StoryCardPadding,
    gap: Spacing.three,
  },
  toolbarTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  periodNav: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  navButton: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
  },
  periodBar: {
    flex: 1,
    height: 18,
    borderRadius: Radius.sm,
  },
  todayPill: {
    width: 64,
    height: 34,
    borderRadius: Radius.pill,
  },
  pillTrack: {
    height: 44,
    borderRadius: 12,
  },
  dayGrid: {
    gap: Spacing.two,
  },
  dayHeader: {
    height: 52,
    borderRadius: Radius.md,
  },
  dayGridBody: {
    flexDirection: 'row',
    gap: Spacing.two,
    height: 400,
  },
  dayGridGutter: {
    width: 44,
    borderRadius: Radius.md,
  },
  dayGridColumn: {
    flex: 1,
    borderRadius: Radius.md,
  },
  agendaCard: {
    backgroundColor: Story.white,
    borderRadius: StoryRadius.cardCompact,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Story.line,
    padding: StoryCardPadding,
    gap: Spacing.two,
  },
  kicker: {
    width: 56,
    height: 10,
    borderRadius: Radius.sm,
  },
  agendaTitle: {
    width: 140,
    height: 22,
    borderRadius: Radius.sm,
  },
  agendaRow: {
    height: 56,
    borderRadius: Radius.md,
    marginTop: Spacing.one,
  },
});
