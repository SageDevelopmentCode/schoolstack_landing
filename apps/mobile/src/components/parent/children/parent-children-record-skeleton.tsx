import { useEffect } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

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

export function ParentChildrenRecordSkeleton() {
  const blockColor = Story.line;

  return (
    <View style={styles.card} testID="parent-children-record-skeleton">
      <View style={styles.header}>
        <SkeletonBlock style={styles.kickerBar} backgroundColor={blockColor} />
        <View style={styles.heroRow}>
          <SkeletonBlock style={styles.avatar} backgroundColor={blockColor} />
          <View style={styles.heroCopy}>
            <SkeletonBlock style={styles.nameBar} backgroundColor={blockColor} />
            <View style={styles.pillRow}>
              <SkeletonBlock style={styles.pill} backgroundColor={blockColor} />
              <SkeletonBlock style={styles.pillWide} backgroundColor={blockColor} />
            </View>
          </View>
        </View>
      </View>

      <View style={styles.body}>
        <SkeletonBlock style={styles.tabBar} backgroundColor={blockColor} />
        <View style={styles.contentCard}>
          <SkeletonBlock style={styles.lineFull} backgroundColor={blockColor} />
          <SkeletonBlock style={styles.lineFull} backgroundColor={blockColor} />
          <SkeletonBlock style={styles.lineShort} backgroundColor={blockColor} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: Story.line,
    borderRadius: StoryRadius.card,
    backgroundColor: Story.white,
    overflow: 'hidden',
  },
  header: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Story.line,
    padding: StoryCardPadding,
    gap: Spacing.three,
  },
  kickerBar: {
    width: 96,
    height: 12,
    borderRadius: 6,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.four,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 18,
  },
  heroCopy: {
    flex: 1,
    gap: Spacing.two,
  },
  nameBar: {
    width: '70%',
    height: 24,
    borderRadius: 8,
  },
  pillRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  pill: {
    width: 64,
    height: 20,
    borderRadius: 999,
  },
  pillWide: {
    width: 80,
    height: 20,
    borderRadius: 999,
  },
  body: {
    padding: StoryCardPadding,
    gap: Spacing.three,
  },
  tabBar: {
    width: '100%',
    height: 40,
    borderRadius: 12,
  },
  contentCard: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Story.line,
    borderRadius: StoryRadius.cardCompact,
    padding: StoryCardPadding,
    gap: Spacing.three,
  },
  lineFull: {
    width: '100%',
    height: 40,
    borderRadius: 8,
  },
  lineShort: {
    width: '80%',
    height: 40,
    borderRadius: 8,
  },
});
