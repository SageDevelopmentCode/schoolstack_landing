import { PortalHomeHeaderGreeting } from '@/components/portal/portal-home-header-greeting';
import { PortalHomeHeaderShell } from '@/components/portal/portal-home-header-shell';
import { PortalHomeHeaderToolbar } from '@/components/portal/portal-home-header-toolbar';
import { todayLabel } from '@/lib/parent/parent-home-utils';
import { greetingParts } from '@/lib/school-admin/greeting';

type AdminDashboardHeaderProps = {
  userFirstName?: string | null;
  unreadCount?: number;
  onPressBulletin?: () => void;
  onPressHelp?: () => void;
  onPressNotifications?: () => void;
};

export function AdminDashboardHeader({
  userFirstName,
  unreadCount = 0,
  onPressBulletin,
  onPressHelp,
  onPressNotifications,
}: AdminDashboardHeaderProps) {
  const greetingName = userFirstName?.trim() || 'there';
  const { prefix: greetingPrefix, emoji: greetingEmoji } = greetingParts();

  return (
    <PortalHomeHeaderShell>
      <PortalHomeHeaderToolbar
        greeting={
          <PortalHomeHeaderGreeting
            prefix={greetingPrefix}
            name={greetingName}
            emoji={greetingEmoji}
          />
        }
        dateLabel={todayLabel()}
        bulletin={onPressBulletin ? { onPress: onPressBulletin } : undefined}
        help={onPressHelp ? { onPress: onPressHelp } : undefined}
        notifications={
          onPressNotifications
            ? { unreadCount, onPress: onPressNotifications }
            : undefined
        }
      />
    </PortalHomeHeaderShell>
  );
}
