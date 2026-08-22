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
      <View style={styles.cardHeader}>
        <SkeletonBlock style={styles.avatar} backgroundColor={backgroundColor} />
        <View style={styles.textColumn}>
          <SkeletonBlock style={styles.nameBar} backgroundColor={backgroundColor} />
          <SkeletonBlock style={styles.subtitleBar} backgroundColor={backgroundColor} />
          <SkeletonBlock style={styles.previewBar} backgroundColor={backgroundColor} />
        </View>
      </View>
    </View>
  );
}

type MessagesListSkeletonProps = {
  rowCount?: number;
};

export function MessagesListSkeleton({ rowCount = 6 }: MessagesListSkeletonProps) {
  const theme = useAdminTheme();

  return (
    <View style={styles.container}>
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
    paddingTop: Spacing.three,
  },
  list: {
    gap: Spacing.three,
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
    gap: Spacing.three,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  textColumn: {
    flex: 1,
    gap: Spacing.two,
  },
  nameBar: {
    height: 14,
    width: '55%',
    borderRadius: Radius.sm,
  },
  subtitleBar: {
    height: 12,
    width: '70%',
    borderRadius: Radius.sm,
  },
  previewBar: {
    height: 12,
    width: '90%',
    borderRadius: Radius.sm,
  },
});
