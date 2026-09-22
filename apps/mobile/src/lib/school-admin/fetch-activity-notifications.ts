import type { SchoolAdminActivityNotification } from '@/lib/school-admin/dashboard-summary-types';
import { fetchSchoolAdminApi } from '@/lib/school-admin-api';

export type ActivityNotificationsPage = {
  notifications: SchoolAdminActivityNotification[];
  nextCursor: string | null;
  hasMore: boolean;
};

type FetchActivityNotificationsOptions = {
  cursor?: string | null;
  limit?: number;
};

export async function fetchSchoolAdminActivityNotifications(
  organizationId: string,
  options: FetchActivityNotificationsOptions = {},
): Promise<ActivityNotificationsPage> {
  const params = new URLSearchParams({ organizationId });
  if (options.cursor) {
    params.set('cursor', options.cursor);
  }
  if (options.limit != null) {
    params.set('limit', String(options.limit));
  }

  const payload = await fetchSchoolAdminApi<ActivityNotificationsPage>(
    `/api/school-admin/activity-notifications?${params.toString()}`,
  );

  return {
    notifications: payload.notifications ?? [],
    nextCursor: payload.nextCursor ?? null,
    hasMore: Boolean(payload.hasMore),
  };
}

export async function fetchActivityNotificationUnreadCount(
  organizationId: string,
): Promise<number> {
  const params = new URLSearchParams({ organizationId });
  const payload = await fetchSchoolAdminApi<{ unreadCount?: number }>(
    `/api/school-admin/activity-notifications/unread-count?${params.toString()}`,
  );
  return payload.unreadCount ?? 0;
}

export async function markActivityNotificationsRead(
  organizationId: string,
): Promise<void> {
  await fetchSchoolAdminApi('/api/school-admin/activity-notifications/mark-read', {
    method: 'POST',
    body: { organizationId },
  });
}
