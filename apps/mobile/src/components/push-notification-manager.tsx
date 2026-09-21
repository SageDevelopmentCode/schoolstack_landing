import { useAuth } from '@/contexts/auth-context';
import { usePushNotificationRegistration } from '@/hooks/use-push-notification-registration';
import { usePushNotificationRouting } from '@/hooks/use-push-notification-routing';

export function PushNotificationManager() {
  const { user, isLoading } = useAuth();

  usePushNotificationRegistration();
  usePushNotificationRouting({ enabled: !isLoading && Boolean(user) });

  return null;
}
