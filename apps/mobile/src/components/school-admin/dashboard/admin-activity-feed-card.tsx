import { Pressable, StyleSheet, View } from 'react-native';

import { AdminCard } from '@/components/admin/admin-card';
import { ThemedText } from '@/components/themed-text';
import { useAdminTheme } from '@/contexts/admin-theme-context';
import { Radius, Spacing } from '@/constants/theme';
import {
  activityCategoryChipTone,
  activityCategoryLabel,
} from '@/lib/school-admin/activity-category';
import type { SchoolAdminActivityNotification } from '@/lib/school-admin/dashboard-summary-types';

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
              <View
                key={item.id}
                style={[
                  styles.row,
                  index > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#EDF1ED' },
                ]}>
                <View style={[styles.chip, { backgroundColor: chipStyle.backgroundColor }]}>
                  <ThemedText type="badge" style={{ color: chipStyle.color, fontSize: 10 }}>
                    {activityCategoryLabel(item.category)}
                  </ThemedText>
                </View>
                <View style={styles.copy}>
                  {item.category === 'payments' ? (
                    <ThemedText type="small" numberOfLines={2} style={{ color: theme.textPrimary }}>
                      {item.detail}
                    </ThemedText>
                  ) : (
                    <>
                      <ThemedText type="smallBold" style={{ color: theme.textPrimary }}>
                        {item.title}
                      </ThemedText>
                      <ThemedText
                        type="small"
                        numberOfLines={2}
                        style={{ color: theme.textSecondary, marginTop: 2 }}>
                        {item.detail}
                      </ThemedText>
                    </>
                  )}
                </View>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => onPressItem(item)}
                  style={({ pressed }) => [styles.cta, pressed && { opacity: 0.7 }]}>
                  <ThemedText type="smallBold" style={{ color: theme.accent }}>
                    {item.ctaLabel} →
                  </ThemedText>
                </Pressable>
              </View>
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
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.three,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#EDF1ED',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
  },
  chip: {
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.two,
    paddingVertical: 4,
  },
  copy: {
    flex: 1,
    minWidth: 0,
  },
  cta: {
    paddingLeft: Spacing.one,
  },
});
