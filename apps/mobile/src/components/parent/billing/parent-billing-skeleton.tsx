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
  const theme = useAdminTheme();
  const blockColor = theme.border;

  return (
    <ScrollView
      style={{ backgroundColor: theme.bg }}
      contentContainerStyle={styles.content}
      scrollEnabled={false}>
      <View style={styles.pillRow}>
        <SkeletonBlock style={styles.pill} backgroundColor={blockColor} />
        <SkeletonBlock style={styles.pillWide} backgroundColor={blockColor} />
        <SkeletonBlock style={styles.pill} backgroundColor={blockColor} />
      </View>

      <View style={[styles.heroCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
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
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.six,
    gap: Spacing.five,
  },
  heroCard: {
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.five,
    gap: Spacing.three,
    alignItems: 'center',
  },
  heroLabel: {
    width: 100,
    height: 14,
    borderRadius: Radius.sm,
  },
  heroAmount: {
    width: 160,
    height: 36,
    borderRadius: Radius.md,
  },
  heroDue: {
    width: 140,
    height: 12,
    borderRadius: Radius.sm,
  },
  heroButton: {
    width: '100%',
    height: 48,
    borderRadius: Radius.lg,
    marginTop: Spacing.two,
  },
  pillRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  pill: {
    width: 72,
    height: 32,
    borderRadius: Radius.pill,
  },
  pillWide: {
    width: 96,
    height: 32,
    borderRadius: Radius.pill,
  },
  section: {
    gap: Spacing.three,
  },
  sectionTitle: {
    width: 140,
    height: 18,
    borderRadius: Radius.sm,
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
    borderRadius: Radius.sm,
  },
  chargeDue: {
    width: '45%',
    height: 12,
    borderRadius: Radius.sm,
  },
  chargeAmount: {
    width: 64,
    height: 16,
    borderRadius: Radius.sm,
  },
});
