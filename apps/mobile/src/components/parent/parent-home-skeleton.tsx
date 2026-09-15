import { useEffect } from 'react';
import { ScrollView, StyleSheet, View, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

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

function ChildCardSkeleton({ backgroundColor }: { backgroundColor: string }) {
  return (
    <View style={[styles.storyCard, { borderColor: Story.line }]}>
      <View style={styles.childHeader}>
        <SkeletonBlock style={styles.childPhoto} backgroundColor={backgroundColor} />
        <View style={styles.childTextColumn}>
          <SkeletonBlock style={styles.nameBar} backgroundColor={backgroundColor} />
          <SkeletonBlock style={styles.subtitleBar} backgroundColor={backgroundColor} />
        </View>
      </View>
      <SkeletonBlock style={styles.childButton} backgroundColor={backgroundColor} />
    </View>
  );
}

export function ParentHomeSkeleton() {
  const blockColor = Story.line;

  return (
    <ScrollView
      style={{ backgroundColor: Story.paper }}
      contentContainerStyle={styles.content}
      scrollEnabled={false}>
      <View style={styles.header}>
        <SkeletonBlock style={styles.kickerBar} backgroundColor={blockColor} />
        <SkeletonBlock style={styles.greetingBar} backgroundColor={blockColor} />
        <SkeletonBlock style={styles.subtitleBar} backgroundColor={blockColor} />
      </View>

      <View style={[styles.storyCard, styles.startHereCard, { borderColor: Story.line }]}>
        <SkeletonBlock style={styles.cardKicker} backgroundColor={blockColor} />
        <SkeletonBlock style={styles.cardTitle} backgroundColor={blockColor} />
        <SkeletonBlock style={styles.attentionRow} backgroundColor={blockColor} />
        <SkeletonBlock style={styles.attentionRow} backgroundColor={blockColor} />
      </View>

      <View style={[styles.eventsCard, { backgroundColor: `${Story.primary}33` }]}>
        <SkeletonBlock style={styles.cardKicker} backgroundColor={`${Story.primary}55`} />
        <SkeletonBlock style={styles.eventPreview} backgroundColor={`${Story.primary}44`} />
        <SkeletonBlock style={styles.eventLink} backgroundColor={`${Story.primary}44`} />
      </View>

      <View style={styles.section}>
        <SkeletonBlock style={styles.sectionTitle} backgroundColor={blockColor} />
        <ChildCardSkeleton backgroundColor={blockColor} />
        <ChildCardSkeleton backgroundColor={blockColor} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.six,
    gap: Spacing.four,
  },
  header: {
    gap: Spacing.two,
  },
  kickerBar: {
    width: 140,
    height: 12,
    borderRadius: 6,
  },
  greetingBar: {
    width: '80%',
    height: 36,
    borderRadius: 8,
  },
  subtitleBar: {
    width: '90%',
    height: 14,
    borderRadius: 6,
  },
  storyCard: {
    borderRadius: StoryRadius.card,
    borderWidth: 1,
    backgroundColor: Story.white,
    padding: StoryCardPadding,
    gap: Spacing.three,
  },
  startHereCard: {
    backgroundColor: Story.cream,
  },
  cardKicker: {
    width: 80,
    height: 10,
    borderRadius: 5,
  },
  cardTitle: {
    width: '70%',
    height: 18,
    borderRadius: 6,
  },
  attentionRow: {
    width: '100%',
    height: 52,
    borderRadius: 10,
  },
  eventsCard: {
    borderRadius: StoryRadius.card,
    padding: StoryCardPadding,
    gap: Spacing.three,
  },
  eventPreview: {
    width: '100%',
    height: 56,
    borderRadius: 14,
  },
  eventLink: {
    width: 140,
    height: 14,
    borderRadius: 6,
  },
  section: {
    gap: Spacing.three,
  },
  sectionTitle: {
    width: 150,
    height: 28,
    borderRadius: 8,
  },
  childHeader: {
    flexDirection: 'row',
    gap: Spacing.three,
    marginBottom: Spacing.two,
  },
  childPhoto: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  childTextColumn: {
    flex: 1,
    gap: Spacing.two,
    paddingTop: Spacing.one,
  },
  nameBar: {
    width: '55%',
    height: 16,
    borderRadius: 6,
  },
  childButton: {
    width: '100%',
    height: 52,
    borderRadius: 12,
  },
});
