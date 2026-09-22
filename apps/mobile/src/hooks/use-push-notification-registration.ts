import { useEffect } from 'react';

import { useAuth } from '@/contexts/auth-context';
import { syncPushNotificationsForSession } from '@/lib/push-notifications';

export function usePushNotificationRegistration(): void {
  const { user, isLoading, previewSession } = useAuth();

  useEffect(() => {
    if (isLoading || !user || previewSession) return;

    void syncPushNotificationsForSession().catch(() => {
      // Push registration is best-effort; failures should not block sign-in.
    });
  }, [isLoading, previewSession, user]);
}
