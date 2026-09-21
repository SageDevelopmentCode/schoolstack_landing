import { fetchParentApi } from '@/lib/parent/parent-portal-api';

export type ParentActivityNotification = {
  id: string;
  action: string;
  title: string;
  summary: string;
  detail: string;
  createdAt: string;
  href: string;
  ctaLabel: string;
  category: string;
};

export type ParentActivityNotificationsPage = {
  notifications: ParentActivityNotification[];
  nextCursor: string | null;
  hasMore: boolean;
};

type FetchActivityNotificationsOptions = {
  cursor?: string | null;
  limit?: number;
};

export async function fetchParentActivityNotifications(
  organizationId: string,
  slug: string,
  options: FetchActivityNotificationsOptions = {},
): Promise<ParentActivityNotificationsPage> {
  const params = new URLSearchParams({ organizationId, slug });
  if (options.cursor) {
    params.set('cursor', options.cursor);
  }
  if (options.limit != null) {
    params.set('limit', String(options.limit));
  }

  const payload = await fetchParentApi<ParentActivityNotificationsPage>(
    `/api/parent-portal/activity-notifications?${params.toString()}`,
  );

  return {
    notifications: payload.notifications ?? [],
    nextCursor: payload.nextCursor ?? null,
    hasMore: Boolean(payload.hasMore),
  };
}

export async function fetchParentActivityNotificationUnreadCount(
  organizationId: string,
  slug: string,
): Promise<number> {
  const params = new URLSearchParams({ organizationId, slug });
  const payload = await fetchParentApi<{ unreadCount?: number }>(
    `/api/parent-portal/activity-notifications/unread-count?${params.toString()}`,
  );
  return payload.unreadCount ?? 0;
}

export async function markParentActivityNotificationsRead(
  organizationId: string,
): Promise<void> {
  await fetchParentApi('/api/parent-portal/activity-notifications/mark-read', {
    method: 'POST',
    body: { organizationId },
  });
}
