import { PortalHomeHeaderGreeting } from '@/components/portal/portal-home-header-greeting';
import { PortalHomeHeaderShell } from '@/components/portal/portal-home-header-shell';
import { PortalHomeHeaderToolbar } from '@/components/portal/portal-home-header-toolbar';
import { firstName, greetingParts, todayLabel } from '@/lib/parent/parent-home-utils';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import { useParentTheme } from '@/contexts/parent-theme-context';

type ParentHomeHeaderProps = {
  displayName: string;
  programPortalLabel?: string;
  coopModeEnabled?: boolean;
  bulletinEnabled?: boolean;
  bulletinPostCount?: number;
  notificationUnreadCount?: number;
  onOpenBulletin?: () => void;
  profilePhotoUrl?: string | null;
  onPressProfile?: () => void;
  onPressNotifications?: () => void;
};

export function ParentHomeHeader({
  displayName,
  programPortalLabel,
  coopModeEnabled = false,
  bulletinEnabled = false,
  bulletinPostCount = 0,
  notificationUnreadCount = 0,
  onOpenBulletin,
  profilePhotoUrl,
  onPressProfile,
  onPressNotifications,
}: ParentHomeHeaderProps) {
  const theme = useParentTheme();
  const name = firstName(displayName);
  const { prefix: greetingPrefix, emoji: greetingEmoji } = greetingParts();

  const greeting = (
    <View style={styles.greetingRow}>
      <PortalHomeHeaderGreeting prefix={greetingPrefix} name={name} emoji={greetingEmoji} />
      {coopModeEnabled && programPortalLabel ? (
        <Ionicons
          name="leaf-outline"
          size={18}
          color={theme.primary}
          accessibilityLabel={`Co-op mode · ${programPortalLabel}`}
        />
      ) : null}
    </View>
  );

  return (
    <PortalHomeHeaderShell>
      <PortalHomeHeaderToolbar
        greeting={greeting}
        dateLabel={todayLabel()}
        bulletin={
          bulletinEnabled && onOpenBulletin
            ? { postCount: bulletinPostCount, onPress: onOpenBulletin }
            : undefined
        }
        profile={
          onPressProfile
            ? { displayName, photoUrl: profilePhotoUrl, onPress: onPressProfile }
            : undefined
        }
        notifications={
          onPressNotifications
            ? { unreadCount: notificationUnreadCount, onPress: onPressNotifications }
            : undefined
        }
      />
    </PortalHomeHeaderShell>
  );
}

const styles = StyleSheet.create({
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 1,
  },
});
