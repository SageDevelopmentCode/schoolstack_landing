import { PortalHomeHeaderGreeting } from '@/components/portal/portal-home-header-greeting';
import { PortalHomeHeaderShell } from '@/components/portal/portal-home-header-shell';
import { PortalHomeHeaderToolbar } from '@/components/portal/portal-home-header-toolbar';
import { firstName, greetingParts, todayLabel } from '@/lib/parent/parent-home-utils';

type ParentHomeHeaderProps = {
  displayName: string;
  bulletinEnabled?: boolean;
  bulletinPostCount?: number;
  notificationUnreadCount?: number;
  onOpenBulletin?: () => void;
  onPressHelp?: () => void;
  onPressNotifications?: () => void;
};

export function ParentHomeHeader({
  displayName,
  bulletinEnabled = false,
  bulletinPostCount = 0,
  notificationUnreadCount = 0,
  onOpenBulletin,
  onPressHelp,
  onPressNotifications,
}: ParentHomeHeaderProps) {
  const name = firstName(displayName);
  const { prefix: greetingPrefix, emoji: greetingEmoji } = greetingParts();

  return (
    <PortalHomeHeaderShell>
      <PortalHomeHeaderToolbar
        greeting={
          <PortalHomeHeaderGreeting prefix={greetingPrefix} name={name} emoji={greetingEmoji} />
        }
        dateLabel={todayLabel()}
        bulletin={
          bulletinEnabled && onOpenBulletin
            ? { postCount: bulletinPostCount, onPress: onOpenBulletin }
            : undefined
        }
        help={onPressHelp ? { onPress: onPressHelp } : undefined}
        notifications={
          onPressNotifications
            ? { unreadCount: notificationUnreadCount, onPress: onPressNotifications }
            : undefined
        }
      />
    </PortalHomeHeaderShell>
  );
}
