import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { AdminCard } from '@/components/admin/admin-card';
import { ThemedText } from '@/components/themed-text';
import { useAdminTheme } from '@/contexts/admin-theme-context';
import { Radius, Spacing } from '@/constants/theme';
import type { DashboardFocusItem } from '@/lib/school-admin/dashboard-summary-types';

type AdminFocusQueueCardProps = {
  items: DashboardFocusItem[];
  onPressItem: (item: DashboardFocusItem) => void;
};

const ICONS: Record<DashboardFocusItem['icon'], keyof typeof Ionicons.glyphMap> = {
  application: 'clipboard-outline',
  schedule: 'calendar-outline',
  message: 'chatbubble-outline',
  setup: 'settings-outline',
};

export function AdminFocusQueueCard({ items, onPressItem }: AdminFocusQueueCardProps) {
  const theme = useAdminTheme();

  return (
    <AdminCard
      style={[
        styles.card,
        {
          backgroundColor: '#FFFDF8',
          borderColor: '#E9EFEA',
        },
      ]}>
      <ThemedText type="badge" style={{ color: theme.textTertiary, letterSpacing: 1.2 }}>
        TODAY&apos;S FOCUS
      </ThemedText>
      <ThemedText type="title" style={{ color: theme.textPrimary }}>
        {items.length > 0
          ? `${items.length} thing${items.length === 1 ? '' : 's'} need your attention`
          : "You're caught up for now"}
      </ThemedText>
      {items.length > 0 ? (
        <ThemedText type="small" style={{ color: theme.textSecondary }}>
          Prioritize the work only you can do, then let the rest of the system stay organized in
          the background.
        </ThemedText>
      ) : null}

      {items.length > 0 ? (
        <View style={styles.list}>
          {items.map((item, index) => (
            <View
              key={item.id}
              style={[
                styles.row,
                index > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#E9EFEA' },
              ]}>
              <View style={[styles.iconWrap, { backgroundColor: '#F8E5DE' }]}>
                <Ionicons name={ICONS[item.icon]} size={16} color={theme.accent} />
              </View>
              <View style={styles.copy}>
                <ThemedText type="smallBold" style={{ color: theme.textPrimary }}>
                  {item.title}
                </ThemedText>
                <ThemedText type="small" style={{ color: theme.textSecondary, marginTop: 2 }}>
                  {item.subtitle}
                </ThemedText>
              </View>
              <Pressable
                accessibilityRole="button"
                onPress={() => onPressItem(item)}
                style={({ pressed }) => [styles.cta, pressed && { opacity: 0.7 }]}>
                <ThemedText type="smallBold" style={{ color: theme.accent }}>
                  {item.ctaLabel}
                </ThemedText>
              </Pressable>
            </View>
          ))}
        </View>
      ) : null}
    </AdminCard>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.two,
  },
  list: {
    marginTop: Spacing.two,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.three,
  },
  iconWrap: {
    width: 31,
    height: 31,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
    minWidth: 0,
  },
  cta: {
    paddingLeft: Spacing.one,
  },
});
