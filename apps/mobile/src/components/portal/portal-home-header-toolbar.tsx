import { Ionicons } from '@expo/vector-icons';
import { type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { PortalHomeHeaderDateBadge } from '@/components/portal/portal-home-header-date-badge';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { StoryFonts } from '@/constants/story-theme';
import { Radius, Spacing } from '@/constants/theme';

const ON_PRIMARY_BUTTON_BG = 'rgba(255, 255, 255, 0.18)';
const ON_PRIMARY_BUTTON_BORDER = 'rgba(255, 255, 255, 0.35)';

type PortalHomeHeaderToolbarProps = {
  greeting?: ReactNode;
  dateLabel?: string;
  bulletin?: {
    postCount?: number;
    onPress: () => void;
  };
  help?: {
    onPress: () => void;
  };
  notifications?: {
    unreadCount: number;
    onPress: () => void;
  };
};

function formatCountBadge(count: number): string {
  return count > 9 ? '9+' : String(count);
}

export function PortalHomeHeaderToolbar({
  greeting,
  dateLabel,
  bulletin,
  help,
  notifications,
}: PortalHomeHeaderToolbarProps) {
  const theme = useParentTheme();
  const showBulletinBadge = (bulletin?.postCount ?? 0) > 0;
  const showUnreadBadge = (notifications?.unreadCount ?? 0) > 0;
  const hasActions = Boolean(bulletin) || Boolean(help) || Boolean(notifications);

  if (!greeting && !hasActions && !dateLabel) {
    return null;
  }

  return (
    <View style={styles.container}>
      {dateLabel ? <PortalHomeHeaderDateBadge label={dateLabel} /> : null}

      <View style={styles.row}>
        {greeting ? <View style={styles.greeting}>{greeting}</View> : null}

        {hasActions ? (
          <View style={styles.actions}>
            {help ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Get help"
                onPress={help.onPress}
                style={({ pressed }) => [
                  styles.iconButton,
                  {
                    backgroundColor: ON_PRIMARY_BUTTON_BG,
                    borderColor: ON_PRIMARY_BUTTON_BORDER,
                  },
                  pressed && styles.pressed,
                ]}>
                <Ionicons name="help-circle-outline" size={20} color={theme.white} />
              </Pressable>
            ) : null}

            {bulletin ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`School bulletin${bulletin.postCount ? `, ${bulletin.postCount} posts` : ''}`}
                onPress={bulletin.onPress}
                style={({ pressed }) => [
                  styles.iconButton,
                  {
                    backgroundColor: ON_PRIMARY_BUTTON_BG,
                    borderColor: ON_PRIMARY_BUTTON_BORDER,
                  },
                  pressed && styles.pressed,
                ]}>
                <Ionicons name="megaphone-outline" size={20} color={theme.white} />
                {showBulletinBadge ? (
                  <View style={[styles.countBadge, { backgroundColor: theme.white }]}>
                    <Text style={[styles.countBadgeText, { color: theme.primaryDark }]}>
                      {formatCountBadge(bulletin.postCount ?? 0)}
                    </Text>
                  </View>
                ) : null}
              </Pressable>
            ) : null}

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
                  styles.iconButton,
                  {
                    backgroundColor: ON_PRIMARY_BUTTON_BG,
                    borderColor: ON_PRIMARY_BUTTON_BORDER,
                  },
                  pressed && styles.pressed,
                ]}>
                <Ionicons name="notifications-outline" size={20} color={theme.white} />
                {showUnreadBadge ? (
                  <View style={[styles.countBadge, { backgroundColor: theme.white }]}>
                    <Text style={[styles.countBadgeText, { color: theme.primaryDark }]}>
                      {formatCountBadge(notifications.unreadCount)}
                    </Text>
                  </View>
                ) : null}
              </Pressable>
            ) : null}
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.two,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  greeting: {
    flex: 1,
    minWidth: 0,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    flexShrink: 0,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: Radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countBadge: {
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
  countBadgeText: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 10,
    lineHeight: 12,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.9,
  },
});
