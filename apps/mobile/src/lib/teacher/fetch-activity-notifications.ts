import { fetchTeacherApi } from '@/lib/teacher/teacher-portal-api';

export type TeacherActivityNotification = {
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

export type TeacherActivityNotificationsPage = {
  notifications: TeacherActivityNotification[];
  nextCursor: string | null;
  hasMore: boolean;
};

type FetchActivityNotificationsOptions = {
  cursor?: string | null;
  limit?: number;
};

export async function fetchTeacherActivityNotifications(
  organizationId: string,
  slug: string,
  options: FetchActivityNotificationsOptions = {},
): Promise<TeacherActivityNotificationsPage> {
  const params = new URLSearchParams({ organizationId, slug });
  if (options.cursor) {
    params.set('cursor', options.cursor);
  }
  if (options.limit != null) {
    params.set('limit', String(options.limit));
  }

  const payload = await fetchTeacherApi<TeacherActivityNotificationsPage>(
    `/api/teacher-portal/activity-notifications?${params.toString()}`,
  );

  return {
    notifications: payload.notifications ?? [],
    nextCursor: payload.nextCursor ?? null,
    hasMore: Boolean(payload.hasMore),
  };
}

export async function fetchTeacherActivityNotificationUnreadCount(
  organizationId: string,
  slug: string,
): Promise<number> {
  const params = new URLSearchParams({ organizationId, slug });
  const payload = await fetchTeacherApi<{ unreadCount?: number }>(
    `/api/teacher-portal/activity-notifications/unread-count?${params.toString()}`,
  );
  return payload.unreadCount ?? 0;
}

export async function markTeacherActivityNotificationsRead(
  organizationId: string,
): Promise<void> {
  await fetchTeacherApi('/api/teacher-portal/activity-notifications/mark-read', {
    method: 'POST',
    body: { organizationId },
  });
}
