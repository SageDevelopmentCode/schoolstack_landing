import * as Notifications from 'expo-notifications';
import { type Href, useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';

import {
  parsePushNotificationData,
  type CommitteePushNotificationData,
  type MessagePushNotificationData,
  type PushNotificationData,
} from '@/lib/push-notifications';
import { parentCommitteeWorkspaceRoute, parentMessageThreadRoute } from '@/lib/parent/parent-nav';
import {
  schoolAdminCommitteesRoute,
  schoolAdminCommitteeWorkspaceRoute,
  schoolAdminMessageThreadRoute,
} from '@/lib/school-admin/school-admin-nav';
import { teacherCommitteeWorkspaceRoute, teacherMessageThreadRoute } from '@/lib/teacher/teacher-nav';

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

function committeeRoute(data: CommitteePushNotificationData): Href | null {
  const { organizationSlug, committeeId, section, portal, intent } = data;

  if (portal === 'admin' && intent === 'join_request') {
    return schoolAdminCommitteesRoute(organizationSlug) as Href;
  }

  if (portal === 'admin') {
    return schoolAdminCommitteeWorkspaceRoute(organizationSlug, committeeId, section) as Href;
  }

  if (portal === 'teacher') {
    return teacherCommitteeWorkspaceRoute(organizationSlug, committeeId, section) as Href;
  }

  if (portal === 'parent') {
    return parentCommitteeWorkspaceRoute(organizationSlug, committeeId, section) as Href;
  }

  return null;
}

function pushNotificationRoute(data: PushNotificationData): Href | null {
  if (data.kind === 'message') {
    return messageThreadRoute(data);
  }

  return committeeRoute(data);
}

function navigateToPushNotification(
  router: ReturnType<typeof useRouter>,
  data: Record<string, unknown> | undefined,
): void {
  const parsed = parsePushNotificationData(data);
  if (!parsed) return;

  const route = pushNotificationRoute(parsed);
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
      navigateToPushNotification(
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

      navigateToPushNotification(
        router,
        response.notification.request.content.data as Record<string, unknown> | undefined,
      );
    });
  }, [enabled, router]);
}
