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

function SkeletonCardRow({ backgroundColor }: { backgroundColor: string }) {
  return (
    <View style={styles.card}>
      <SkeletonBlock style={styles.nameBar} backgroundColor={backgroundColor} />
      <SkeletonBlock style={styles.subtitleBar} backgroundColor={backgroundColor} />
      <SkeletonBlock style={styles.badgePill} backgroundColor={backgroundColor} />
    </View>
  );
}

type StaffListSkeletonProps = {
  rowCount?: number;
};

export function StaffListSkeleton({ rowCount = 6 }: StaffListSkeletonProps) {
  const theme = useAdminTheme();

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.searchBarWrap,
          {
            backgroundColor: theme.input,
            borderColor: theme.inputBorder,
          },
        ]}>
        <SkeletonBlock style={styles.searchBar} backgroundColor={theme.border} />
      </View>
      <SkeletonBlock style={styles.addButton} backgroundColor={theme.border} />
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
    paddingHorizontal: ADMIN_LIST_HORIZONTAL_PADDING,
    paddingTop: Spacing.two,
    gap: Spacing.three,
  },
  searchBarWrap: {
    borderRadius: Radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.three,
    paddingVertical: 10,
  },
  searchBar: {
    height: 20,
    borderRadius: Radius.pill,
  },
  addButton: {
    height: 40,
    borderRadius: Radius.md,
  },
  list: {
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
  badgePill: {
    height: 22,
    width: 88,
    borderRadius: Radius.pill,
  },
});
