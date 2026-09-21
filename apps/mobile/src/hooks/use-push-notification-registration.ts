import { useEffect } from 'react';

import { useAuth } from '@/contexts/auth-context';
import { syncPushNotificationsForSession } from '@/lib/push-notifications';

export function usePushNotificationRegistration(): void {
  const { user, selectedSchool, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading || !user || !selectedSchool) return;

    void syncPushNotificationsForSession(selectedSchool.id).catch(() => {
      // Push registration is best-effort; failures should not block sign-in.
    });
  }, [isLoading, selectedSchool, user]);
}
