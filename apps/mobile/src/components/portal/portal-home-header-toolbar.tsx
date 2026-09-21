import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useParentTheme } from '@/contexts/parent-theme-context';
import { Story, StoryFonts } from '@/constants/story-theme';
import { Radius, Spacing } from '@/constants/theme';

type PortalHomeHeaderToolbarProps = {
  bulletin?: {
    postCount?: number;
    onPress: () => void;
  };
  notifications?: {
    unreadCount: number;
    onPress: () => void;
  };
};

export function PortalHomeHeaderToolbar({
  bulletin,
  notifications,
}: PortalHomeHeaderToolbarProps) {
  const theme = useParentTheme();
  const showUnreadBadge = (notifications?.unreadCount ?? 0) > 0;

  if (!bulletin && !notifications) {
    return null;
  }

  return (
    <View style={styles.row}>
      {bulletin ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`School bulletin${bulletin.postCount ? `, ${bulletin.postCount} posts` : ''}`}
          onPress={bulletin.onPress}
          style={({ pressed }) => [
            styles.bulletinButton,
            {
              backgroundColor: theme.info,
              shadowColor: theme.info,
            },
            pressed && styles.pressed,
          ]}>
          <Ionicons name="megaphone-outline" size={16} color={theme.white} />
          <Text style={[styles.bulletinLabel, { color: theme.white }]}>
            School bulletin{bulletin.postCount ? ` (${bulletin.postCount})` : ''}
          </Text>
          <Ionicons name="chevron-forward" size={14} color={theme.white} />
        </Pressable>
      ) : (
        <View style={styles.spacer} />
      )}

      {notifications ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            showUnreadBadge
              ? `Open notifications, ${notifications.unreadCount} unread`
              : 'Open notifications'
          }
          onPress={notifications.onPress}
          style={({ pressed }) => [
            styles.bellButton,
            {
              backgroundColor: Story.white,
              borderColor: Story.line,
            },
            pressed && styles.pressed,
          ]}>
          <Ionicons name="notifications-outline" size={20} color={theme.muted} />
          {showUnreadBadge ? (
            <View style={[styles.unreadBadge, { backgroundColor: theme.primary }]}>
              <Text style={styles.unreadBadgeText}>
                {notifications.unreadCount > 9 ? '9+' : String(notifications.unreadCount)}
              </Text>
            </View>
          ) : null}
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  spacer: {
    flex: 1,
  },
  bulletinButton: {
    flexShrink: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 3,
  },
  bulletinLabel: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
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
    color: Story.white,
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 10,
    lineHeight: 12,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.9,
  },
});
