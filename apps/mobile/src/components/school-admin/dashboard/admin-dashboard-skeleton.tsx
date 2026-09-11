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

export function AdminDashboardSkeleton() {
  const theme = useAdminTheme();
  const blockColor = theme.border;

  return (
    <ScrollView
      style={{ backgroundColor: theme.bg }}
      contentContainerStyle={styles.content}
      accessibilityLabel="Loading dashboard">
      <SkeletonBlock style={styles.kicker} backgroundColor={blockColor} />
      <SkeletonBlock style={styles.title} backgroundColor={blockColor} />
      <SkeletonBlock style={styles.subtitle} backgroundColor={blockColor} />
      <SkeletonBlock style={styles.cta} backgroundColor={blockColor} />

      <View style={styles.cardRow}>
        <View style={[styles.card, { borderColor: theme.border }]}>
          <SkeletonBlock style={styles.cardKicker} backgroundColor={blockColor} />
          <SkeletonBlock style={styles.cardTitle} backgroundColor={blockColor} />
          <SkeletonBlock style={styles.cardLine} backgroundColor={blockColor} />
          <SkeletonBlock style={styles.cardLine} backgroundColor={blockColor} />
        </View>
        <View style={[styles.card, { borderColor: theme.border }]}>
          <SkeletonBlock style={styles.cardKicker} backgroundColor={blockColor} />
          <SkeletonBlock style={styles.cardTitle} backgroundColor={blockColor} />
          <SkeletonBlock style={styles.cardSubtitle} backgroundColor={blockColor} />
        </View>
      </View>

      <View style={styles.metricsRow}>
        {Array.from({ length: 4 }).map((_, index) => (
          <View key={index} style={[styles.metricCard, { borderColor: theme.border }]}>
            <SkeletonBlock style={styles.metricValue} backgroundColor={blockColor} />
            <SkeletonBlock style={styles.metricLabel} backgroundColor={blockColor} />
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: Spacing.four,
    gap: Spacing.four,
  },
  kicker: {
    width: 120,
    height: 10,
    borderRadius: Radius.sm,
  },
  title: {
    width: '80%',
    height: 28,
    borderRadius: Radius.sm,
    marginTop: Spacing.two,
  },
  subtitle: {
    width: '95%',
    height: 14,
    borderRadius: Radius.sm,
    marginTop: Spacing.two,
  },
  cta: {
    width: '100%',
    height: 44,
    borderRadius: Radius.md,
    marginTop: Spacing.two,
  },
  cardRow: {
    gap: Spacing.three,
  },
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.lg,
    padding: Spacing.four,
    gap: Spacing.two,
  },
  cardKicker: {
    width: 90,
    height: 10,
    borderRadius: Radius.sm,
  },
  cardTitle: {
    width: '75%',
    height: 22,
    borderRadius: Radius.sm,
  },
  cardLine: {
    width: '100%',
    height: 40,
    borderRadius: Radius.sm,
  },
  cardSubtitle: {
    width: '60%',
    height: 14,
    borderRadius: Radius.sm,
  },
  metricsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  metricCard: {
    width: '47%',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.lg,
    padding: Spacing.three,
    gap: Spacing.one,
  },
  metricValue: {
    width: 48,
    height: 24,
    borderRadius: Radius.sm,
  },
  metricLabel: {
    width: '80%',
    height: 12,
    borderRadius: Radius.sm,
  },
});
