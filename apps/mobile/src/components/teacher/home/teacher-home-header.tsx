import { PortalHomeHeaderGreeting } from '@/components/portal/portal-home-header-greeting';
import { PortalHomeHeaderShell } from '@/components/portal/portal-home-header-shell';
import { PortalHomeHeaderToolbar } from '@/components/portal/portal-home-header-toolbar';
import { firstName, greetingParts, todayLabel } from '@/lib/teacher/teacher-home-utils';

type TeacherHomeHeaderProps = {
  displayName: string;
  bulletinEnabled: boolean;
  bulletinPostCount: number;
  notificationUnreadCount?: number;
  onOpenBulletin?: () => void;
  onPressHelp?: () => void;
  onPressNotifications?: () => void;
};

export function TeacherHomeHeader({
  displayName,
  bulletinEnabled,
  bulletinPostCount,
  notificationUnreadCount = 0,
  onOpenBulletin,
  onPressHelp,
  onPressNotifications,
}: TeacherHomeHeaderProps) {
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
