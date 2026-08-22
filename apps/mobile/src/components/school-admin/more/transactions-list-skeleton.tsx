import { useEffect } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { ADMIN_LIST_HORIZONTAL_PADDING } from '@/components/school-admin/admin-list-layout';
import { useAdminTheme } from '@/contexts/admin-theme-context';
import { adminCardShadow } from '@/lib/organization-settings/build-admin-theme';
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
  const theme = useAdminTheme();

  return (
    <View style={styles.container}>
      <View style={styles.summaryGrid}>
        {Array.from({ length: 2 }, (_, row) => (
          <View key={row} style={styles.summaryRow}>
            {Array.from({ length: 2 }, (_, col) => (
              <View
                key={col}
                style={[
                  styles.summaryCard,
                  { backgroundColor: theme.elevated, borderColor: theme.border },
                ]}>
                <SkeletonBlock style={styles.summaryLabel} backgroundColor={theme.border} />
                <SkeletonBlock style={styles.summaryValue} backgroundColor={theme.border} />
              </View>
            ))}
          </View>
        ))}
      </View>
      <View style={styles.list}>
        {Array.from({ length: rowCount }, (_, index) => (
          <View
            key={index}
            style={[
              styles.cardWrap,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
              },
              adminCardShadow(theme),
            ]}>
            <SkeletonBlock style={styles.titleBar} backgroundColor={theme.border} />
            <View style={styles.badgeRow}>
              <SkeletonBlock style={styles.badgePill} backgroundColor={theme.border} />
              <SkeletonBlock style={styles.badgePillWide} backgroundColor={theme.border} />
            </View>
            <SkeletonBlock style={styles.metaBar} backgroundColor={theme.border} />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: ADMIN_LIST_HORIZONTAL_PADDING,
    paddingTop: Spacing.two,
    gap: Spacing.three,
  },
  summaryGrid: {
    gap: Spacing.two,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  summaryCard: {
    flex: 1,
    borderRadius: Radius.sm,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.two,
    gap: 8,
  },
  summaryLabel: {
    height: 10,
    width: '70%',
    borderRadius: Radius.sm,
  },
  summaryValue: {
    height: 16,
    width: '50%',
    borderRadius: Radius.sm,
  },
  list: {
    gap: Spacing.two,
  },
  cardWrap: {
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  titleBar: {
    height: 14,
    width: '60%',
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
    width: '45%',
    borderRadius: Radius.sm,
  },
});
