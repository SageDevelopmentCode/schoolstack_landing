import { StyleSheet, View } from 'react-native';

import { ADMIN_LIST_HORIZONTAL_PADDING } from '@/components/school-admin/admin-list-layout';
import { useAdminTheme } from '@/contexts/admin-theme-context';
import { Radius, Spacing } from '@/constants/theme';

function SkeletonBlock({ width, height }: { width: number | `${number}%`; height: number }) {
  const theme = useAdminTheme();
  return (
    <View
      style={{
        width,
        height,
        borderRadius: Radius.sm,
        backgroundColor: theme.elevated,
      }}
    />
  );
}

export function ScheduleScreenSkeleton() {
  return (
    <View style={styles.container}>
      <SkeletonBlock width="45%" height={28} />
      <SkeletonBlock width="70%" height={14} />
      <View style={styles.tabRow}>
        {[1, 2, 3, 4, 5].map((item) => (
          <SkeletonBlock key={item} width={72} height={28} />
        ))}
      </View>
      <SkeletonBlock width="100%" height={280} />
      <SkeletonBlock width="100%" height={120} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: ADMIN_LIST_HORIZONTAL_PADDING,
    paddingTop: Spacing.four,
    gap: Spacing.three,
  },
  tabRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
});
