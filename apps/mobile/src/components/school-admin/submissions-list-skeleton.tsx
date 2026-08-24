import { useEffect } from 'react';
import { ScrollView, StyleSheet, View, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { useAdminTheme } from '@/contexts/admin-theme-context';
import { ADMIN_LIST_HORIZONTAL_PADDING } from '@/components/school-admin/admin-list-layout';
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

function SkeletonCardRow({ backgroundColor }: { backgroundColor: string }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <SkeletonBlock style={styles.avatar} backgroundColor={backgroundColor} />
        <View style={styles.textColumn}>
          <SkeletonBlock style={styles.nameBar} backgroundColor={backgroundColor} />
          <SkeletonBlock style={styles.subtitleBar} backgroundColor={backgroundColor} />
        </View>
      </View>
      <View style={styles.badgeRow}>
        <SkeletonBlock style={styles.badgePill} backgroundColor={backgroundColor} />
        <SkeletonBlock style={styles.badgePillWide} backgroundColor={backgroundColor} />
      </View>
    </View>
  );
}

type SubmissionsListSkeletonProps = {
  rowCount?: number;
};

const FILTER_CHIP_COUNT = 5;

export function SubmissionsListSkeleton({ rowCount = 6 }: SubmissionsListSkeletonProps) {
  const theme = useAdminTheme();

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filters}>
        {Array.from({ length: FILTER_CHIP_COUNT }, (_, index) => (
          <SkeletonBlock
            key={index}
            style={styles.filterChip}
            backgroundColor={theme.border}
          />
        ))}
      </ScrollView>
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
            <SkeletonCardRow backgroundColor={theme.border} />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Spacing.two,
    gap: Spacing.two,
  },
  filters: {
    paddingHorizontal: ADMIN_LIST_HORIZONTAL_PADDING,
    gap: Spacing.one,
  },
  filterChip: {
    height: 32,
    width: 72,
    borderRadius: Radius.pill,
  },
  list: {
    paddingHorizontal: ADMIN_LIST_HORIZONTAL_PADDING,
    gap: Spacing.two,
  },
  cardWrap: {
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.three,
  },
  card: {
    gap: Spacing.two,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  textColumn: {
    flex: 1,
    gap: 6,
  },
  nameBar: {
    height: 14,
    borderRadius: 7,
    width: '55%',
  },
  subtitleBar: {
    height: 11,
    borderRadius: 6,
    width: '40%',
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.one,
  },
  badgePill: {
    height: 22,
    width: 88,
    borderRadius: Radius.pill,
  },
  badgePillWide: {
    height: 22,
    width: 64,
    borderRadius: Radius.pill,
  },
});
