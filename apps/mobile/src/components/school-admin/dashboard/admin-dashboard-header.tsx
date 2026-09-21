import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useAdminTheme } from '@/contexts/admin-theme-context';
import { Radius, Spacing } from '@/constants/theme';
import { greetingParts } from '@/lib/school-admin/greeting';

type AdminDashboardHeaderProps = {
  schoolName: string;
  userFirstName?: string | null;
  unreadCount?: number;
  onPressNotifications?: () => void;
};

export function AdminDashboardHeader({
  schoolName,
  userFirstName,
  unreadCount = 0,
  onPressNotifications,
}: AdminDashboardHeaderProps) {
  const theme = useAdminTheme();
  const greetingName = userFirstName?.trim() || 'there';
  const { prefix: greetingPrefix, emoji: greetingEmoji } = greetingParts();
  const dayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const dateLabel = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const showUnreadBadge = unreadCount > 0;

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={[styles.datePill, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            {dateLabel}
          </ThemedText>
        </View>

        {onPressNotifications ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              showUnreadBadge
                ? `Open activity notifications, ${unreadCount} unread`
                : 'Open activity notifications'
            }
            onPress={onPressNotifications}
            style={({ pressed }) => [
              styles.bellButton,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
              },
              pressed && { opacity: 0.85 },
            ]}>
            <Ionicons name="notifications-outline" size={20} color={theme.textSecondary} />
            {showUnreadBadge ? (
              <View style={[styles.unreadBadge, { backgroundColor: theme.accent }]}>
                <ThemedText type="badge" style={styles.unreadBadgeText}>
                  {unreadCount > 9 ? '9+' : String(unreadCount)}
                </ThemedText>
              </View>
            ) : null}
          </Pressable>
        ) : null}
      </View>

      <ThemedText type="title" style={[styles.greeting, { color: theme.textPrimary }]}>
        {greetingPrefix}, {greetingName}. {greetingEmoji}
      </ThemedText>
      <ThemedText type="small" style={{ color: theme.textSecondary }}>
        Here is {schoolName}&apos;s operating picture for {dayName}.
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.two,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  datePill: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    flexShrink: 1,
  },
  bellButton: {
    width: 40,
    height: 40,
    borderRadius: Radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: Radius.pill,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    lineHeight: 12,
  },
  greeting: {
    marginTop: Spacing.one,
  },
});
