import { Pressable, StyleSheet, View } from 'react-native';

import { AdminCard } from '@/components/admin/admin-card';
import { ThemedText } from '@/components/themed-text';
import { useAdminTheme } from '@/contexts/admin-theme-context';
import { SCREEN_HORIZONTAL_PADDING } from '@/constants/screen-layout';
import { Radius, Spacing } from '@/constants/theme';
import {
  activityCategoryChipTone,
  activityCategoryLabel,
} from '@/lib/school-admin/activity-category';
import type { SchoolAdminActivityNotification } from '@/lib/school-admin/dashboard-summary-types';
import { formatRelativeTime } from '@/lib/school-admin/format-relative-time';

type AdminActivityFeedCardProps = {
  items: SchoolAdminActivityNotification[];
  onPressItem: (item: SchoolAdminActivityNotification) => void;
};

function chipColors(
  tone: ReturnType<typeof activityCategoryChipTone>,
  theme: ReturnType<typeof useAdminTheme>,
): { backgroundColor: string; color: string } {
  switch (tone) {
    case 'success':
      return { backgroundColor: theme.successBg, color: theme.success };
    case 'warning':
      return { backgroundColor: theme.warningBg, color: theme.warning };
    case 'purple':
      return { backgroundColor: `${theme.accent}14`, color: theme.accent };
    case 'info':
    default:
      return { backgroundColor: theme.infoBg, color: theme.info };
  }
}

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
          {items.map((item, index) => {
            const tone = activityCategoryChipTone(item.category);
            const chipStyle = chipColors(tone, theme);

            return (
              <Pressable
                key={item.id}
                accessibilityRole="button"
                onPress={() => onPressItem(item)}
                style={({ pressed }) => [
                  styles.row,
                  index > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#EDF1ED' },
                  pressed && { opacity: 0.85 },
                ]}>
                <View style={styles.topRow}>
                  <View style={[styles.chip, { backgroundColor: chipStyle.backgroundColor }]}>
                    <ThemedText type="badge" style={{ color: chipStyle.color, fontSize: 10 }}>
                      {activityCategoryLabel(item.category)}
                    </ThemedText>
                  </View>
                  <ThemedText type="smallBold" style={[styles.cta, { color: theme.accent }]}>
                    {item.ctaLabel} →
                  </ThemedText>
                </View>
                <ThemedText type="small" numberOfLines={3} style={{ color: theme.textPrimary }}>
                  {item.detail}
                </ThemedText>
                <ThemedText type="small" style={{ color: theme.textTertiary, marginTop: 2 }}>
                  {formatRelativeTime(item.createdAt)}
                </ThemedText>
              </Pressable>
            );
          })}
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
  row: {
    gap: Spacing.two,
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingVertical: Spacing.three,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  chip: {
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.two,
    paddingVertical: 4,
    flexShrink: 1,
  },
  cta: {
    flexShrink: 0,
  },
});
