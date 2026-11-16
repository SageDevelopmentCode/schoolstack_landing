import { ParentNotificationSettingsGardenScreen } from '@/components/parent/notifications/garden/parent-notification-settings-garden-screen';
import { useParentNotificationSettingsController } from '@/components/parent/notifications/garden/use-parent-notification-settings-controller';

/** More › Notification settings (Garden). Data and editor rules live in the controller hook. */
export function ParentNotificationSettingsScreen() {
  const controller = useParentNotificationSettingsController();
  return <ParentNotificationSettingsGardenScreen controller={controller} />;
}
