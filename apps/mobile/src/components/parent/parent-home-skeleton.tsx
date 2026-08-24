import { useEffect } from 'react';
import { ScrollView, StyleSheet, View, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { useAdminTheme } from '@/contexts/admin-theme-context';
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

function ChildCardSkeleton({ backgroundColor }: { backgroundColor: string }) {
  return (
    <View style={styles.childCard}>
      <SkeletonBlock style={styles.avatar} backgroundColor={backgroundColor} />
      <View style={styles.childTextColumn}>
        <SkeletonBlock style={styles.nameBar} backgroundColor={backgroundColor} />
        <SkeletonBlock style={styles.gradeBar} backgroundColor={backgroundColor} />
        <SkeletonBlock style={styles.linkBar} backgroundColor={backgroundColor} />
      </View>
      <SkeletonBlock style={styles.badgePill} backgroundColor={backgroundColor} />
    </View>
  );
}

export function ParentHomeSkeleton() {
  const theme = useAdminTheme();
  const blockColor = theme.border;

  return (
    <ScrollView
      style={{ backgroundColor: theme.bg }}
      contentContainerStyle={styles.content}
      scrollEnabled={false}>
      <View style={styles.greeting}>
        <SkeletonBlock style={styles.greetingSubtitle} backgroundColor={blockColor} />
        <SkeletonBlock style={styles.greetingName} backgroundColor={blockColor} />
      </View>

      <View
        style={[
          styles.onboardingCard,
          { backgroundColor: theme.surface, borderColor: theme.border },
        ]}>
        <SkeletonBlock style={styles.onboardingIcon} backgroundColor={blockColor} />
        <View style={styles.onboardingText}>
          <SkeletonBlock style={styles.onboardingTitle} backgroundColor={blockColor} />
          <SkeletonBlock style={styles.onboardingSubtitle} backgroundColor={blockColor} />
        </View>
      </View>

      <View style={styles.section}>
        <SkeletonBlock style={styles.sectionTitle} backgroundColor={blockColor} />
        <ChildCardSkeleton backgroundColor={blockColor} />
        <ChildCardSkeleton backgroundColor={blockColor} />
        <ChildCardSkeleton backgroundColor={blockColor} />
      </View>

      <View style={styles.section}>
        <SkeletonBlock style={styles.sectionTitle} backgroundColor={blockColor} />
        <View style={styles.quickActionsRow}>
          <View style={[styles.quickActionChip, { borderColor: theme.border }]}>
            <SkeletonBlock style={styles.quickActionIcon} backgroundColor={blockColor} />
            <SkeletonBlock style={styles.quickActionLabel} backgroundColor={blockColor} />
          </View>
          <View style={[styles.quickActionChip, { borderColor: theme.border }]}>
            <SkeletonBlock style={styles.quickActionIcon} backgroundColor={blockColor} />
            <SkeletonBlock style={styles.quickActionLabelWide} backgroundColor={blockColor} />
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <SkeletonBlock style={styles.sectionTitle} backgroundColor={blockColor} />
        <View
          style={[
            styles.eventsCard,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}>
          <SkeletonBlock style={styles.eventsIcon} backgroundColor={blockColor} />
          <SkeletonBlock style={styles.eventsTitle} backgroundColor={blockColor} />
          <SkeletonBlock style={styles.eventsSubtitle} backgroundColor={blockColor} />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.six,
    gap: Spacing.five,
  },
  greeting: {
    gap: Spacing.two,
  },
  greetingSubtitle: {
    width: 120,
    height: 14,
    borderRadius: Radius.sm,
  },
  greetingName: {
    width: '55%',
    height: 40,
    borderRadius: Radius.md,
  },
  section: {
    gap: Spacing.three,
  },
  sectionTitle: {
    width: 120,
    height: 18,
    borderRadius: Radius.sm,
  },
  onboardingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.four,
  },
  onboardingIcon: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
  },
  onboardingText: {
    flex: 1,
    gap: Spacing.two,
  },
  onboardingTitle: {
    width: '75%',
    height: 14,
    borderRadius: Radius.sm,
  },
  onboardingSubtitle: {
    width: '45%',
    height: 12,
    borderRadius: Radius.sm,
  },
  childCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'transparent',
    padding: Spacing.three,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  childTextColumn: {
    flex: 1,
    gap: Spacing.two,
  },
  nameBar: {
    width: '50%',
    height: 14,
    borderRadius: Radius.sm,
  },
  gradeBar: {
    width: '35%',
    height: 12,
    borderRadius: Radius.sm,
  },
  linkBar: {
    width: '40%',
    height: 12,
    borderRadius: Radius.sm,
  },
  badgePill: {
    width: 72,
    height: 22,
    borderRadius: Radius.pill,
  },
  quickActionsRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  quickActionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
  },
  quickActionIcon: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
  },
  quickActionLabel: {
    width: 56,
    height: 14,
    borderRadius: Radius.sm,
  },
  quickActionLabelWide: {
    width: 88,
    height: 14,
    borderRadius: Radius.sm,
  },
  eventsCard: {
    alignItems: 'center',
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.five,
    gap: Spacing.two,
  },
  eventsIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  eventsTitle: {
    width: 140,
    height: 14,
    borderRadius: Radius.sm,
  },
  eventsSubtitle: {
    width: 200,
    height: 12,
    borderRadius: Radius.sm,
  },
});
