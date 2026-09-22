import * as Notifications from 'expo-notifications';
import { type Href, useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';

import {
  parseMessagePushNotificationData,
  type MessagePushNotificationData,
} from '@/lib/push-notifications';
import { parentMessageThreadRoute } from '@/lib/parent/parent-nav';
import { schoolAdminMessageThreadRoute } from '@/lib/school-admin/school-admin-nav';
import { teacherMessageThreadRoute } from '@/lib/teacher/teacher-nav';

function messageThreadRoute(data: MessagePushNotificationData): Href | null {
  if (data.portal === 'parent') {
    return parentMessageThreadRoute(data.organizationSlug, data.threadId);
  }

  if (data.portal === 'teacher') {
    return teacherMessageThreadRoute(data.organizationSlug, data.threadId);
  }

  if (data.portal === 'admin') {
    return schoolAdminMessageThreadRoute(data.organizationSlug, data.threadId) as Href;
  }

  return null;
}

function navigateToMessageNotification(
  router: ReturnType<typeof useRouter>,
  data: Record<string, unknown> | undefined,
): void {
  const parsed = parseMessagePushNotificationData(data);
  if (!parsed) return;

  const route = messageThreadRoute(parsed);
  if (!route) return;

  router.push(route);
}

type UsePushNotificationRoutingOptions = {
  enabled: boolean;
};

export function usePushNotificationRouting({ enabled }: UsePushNotificationRoutingOptions): void {
  const router = useRouter();
  const handledInitialNotificationRef = useRef(false);

  useEffect(() => {
    if (!enabled) return;

    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      navigateToMessageNotification(
        router,
        response.notification.request.content.data as Record<string, unknown> | undefined,
      );
    });

    return () => {
      subscription.remove();
    };
  }, [enabled, router]);

  useEffect(() => {
    if (!enabled || handledInitialNotificationRef.current) return;

    handledInitialNotificationRef.current = true;

    void Notifications.getLastNotificationResponseAsync().then((response) => {
      if (!response) return;

      navigateToMessageNotification(
        router,
        response.notification.request.content.data as Record<string, unknown> | undefined,
      );
    });
  }, [enabled, router]);
}
