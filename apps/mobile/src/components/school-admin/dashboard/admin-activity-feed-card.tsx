import { StyleSheet, View } from 'react-native';

import { AdminActivityFeedRow } from '@/components/school-admin/dashboard/admin-activity-feed-row';
import { AdminCard } from '@/components/admin/admin-card';
import { ThemedText } from '@/components/themed-text';
import { useAdminTheme } from '@/contexts/admin-theme-context';
import { SCREEN_HORIZONTAL_PADDING } from '@/constants/screen-layout';
import { Spacing } from '@/constants/theme';
import type { SchoolAdminActivityNotification } from '@/lib/school-admin/dashboard-summary-types';

type AdminActivityFeedCardProps = {
  items: SchoolAdminActivityNotification[];
  onPressItem: (item: SchoolAdminActivityNotification) => void;
};

export function AdminActivityFeedCard({ items, onPressItem }: AdminActivityFeedCardProps) {
  const theme = useAdminTheme();

  return (
    <AdminCard style={styles.card}>
      <View style={styles.header}>
        <ThemedText type="smallBold" style={{ color: theme.textPrimary }}>
          Recent school activity
        </ThemedText>
        <ThemedText type="small" style={{ color: theme.textSecondary, marginTop: 2 }}>
          Important changes across families and operations.
        </ThemedText>
      </View>

      {items.length === 0 ? (
        <ThemedText type="small" style={{ color: theme.textSecondary, paddingVertical: Spacing.three }}>
          No recent activity yet.
        </ThemedText>
      ) : (
        <View>
          {items.map((item, index) => (
            <AdminActivityFeedRow
              key={item.id}
              item={item}
              showDivider={index > 0}
              onPress={() => onPressItem(item)}
            />
          ))}
        </View>
      )}
    </AdminCard>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingHorizontal: 0,
    paddingVertical: 0,
    overflow: 'hidden',
  },
  header: {
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.three,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#EDF1ED',
  },
});
