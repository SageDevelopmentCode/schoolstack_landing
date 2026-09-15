import { useEffect } from 'react';
import { ScrollView, StyleSheet, View, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { BILLING_PAGE_GAP } from '@/components/parent/billing/billing-layout';
import { Story, StoryRadius } from '@/constants/story-theme';
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

function ChargeRowSkeleton({ backgroundColor }: { backgroundColor: string }) {
  return (
    <View style={styles.chargeRow}>
      <View style={styles.chargeText}>
        <SkeletonBlock style={styles.chargeLabel} backgroundColor={backgroundColor} />
        <SkeletonBlock style={styles.chargeDue} backgroundColor={backgroundColor} />
      </View>
      <SkeletonBlock style={styles.chargeAmount} backgroundColor={backgroundColor} />
    </View>
  );
}

export function ParentBillingSkeleton() {
  const blockColor = Story.line;

  return (
    <ScrollView
      style={{ backgroundColor: Story.paper }}
      contentContainerStyle={styles.content}
      scrollEnabled={false}>
      <SkeletonBlock style={styles.title} backgroundColor={blockColor} />
      <SkeletonBlock style={styles.subtitle} backgroundColor={blockColor} />

      <View style={styles.pillTrack}>
        <SkeletonBlock style={styles.pill} backgroundColor={blockColor} />
        <SkeletonBlock style={styles.pill} backgroundColor={blockColor} />
        <SkeletonBlock style={styles.pill} backgroundColor={blockColor} />
        <SkeletonBlock style={styles.pill} backgroundColor={blockColor} />
      </View>

      <View style={[styles.heroCard, { backgroundColor: '#F2F8EF', borderColor: Story.line }]}>
        <SkeletonBlock style={styles.heroLabel} backgroundColor={blockColor} />
        <SkeletonBlock style={styles.heroAmount} backgroundColor={blockColor} />
        <SkeletonBlock style={styles.heroDue} backgroundColor={blockColor} />
        <SkeletonBlock style={styles.heroButton} backgroundColor={blockColor} />
      </View>

      <View style={styles.section}>
        <SkeletonBlock style={styles.sectionTitle} backgroundColor={blockColor} />
        <ChargeRowSkeleton backgroundColor={blockColor} />
        <ChargeRowSkeleton backgroundColor={blockColor} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.six,
    gap: BILLING_PAGE_GAP,
  },
  title: {
    width: '70%',
    height: 28,
    borderRadius: 8,
  },
  subtitle: {
    width: '85%',
    height: 14,
    borderRadius: 6,
  },
  pillTrack: {
    flexDirection: 'row',
    gap: 4,
    backgroundColor: '#EAF2EB',
    borderRadius: 12,
    padding: 4,
    width: '100%',
  },
  pill: {
    flex: 1,
    height: 38,
    borderRadius: 10,
  },
  heroCard: {
    borderRadius: StoryRadius.card,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.five,
    gap: Spacing.three,
    alignItems: 'center',
  },
  heroLabel: {
    width: 100,
    height: 14,
    borderRadius: 6,
  },
  heroAmount: {
    width: 160,
    height: 36,
    borderRadius: 8,
  },
  heroDue: {
    width: 140,
    height: 12,
    borderRadius: 6,
  },
  heroButton: {
    width: '100%',
    height: 48,
    borderRadius: StoryRadius.button,
    marginTop: Spacing.two,
  },
  section: {
    gap: Spacing.three,
  },
  sectionTitle: {
    width: 140,
    height: 22,
    borderRadius: 6,
  },
  chargeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
    paddingVertical: Spacing.two,
  },
  chargeText: {
    flex: 1,
    gap: Spacing.two,
  },
  chargeLabel: {
    width: '70%',
    height: 14,
    borderRadius: 6,
  },
  chargeDue: {
    width: '45%',
    height: 12,
    borderRadius: 6,
  },
  chargeAmount: {
    width: 64,
    height: 16,
    borderRadius: 6,
  },
});
