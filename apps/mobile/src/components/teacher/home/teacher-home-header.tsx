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
  profilePhotoUrl?: string | null;
  onPressProfile?: () => void;
  onPressNotifications?: () => void;
};

export function TeacherHomeHeader({
  displayName,
  bulletinEnabled,
  bulletinPostCount,
  notificationUnreadCount = 0,
  onOpenBulletin,
  profilePhotoUrl,
  onPressProfile,
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
