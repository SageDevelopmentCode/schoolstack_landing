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

export type ParentActivityNotificationContext =
  | {
      mode: 'main';
      parentNavBasePath?: string;
      applyBasePath?: string;
    }
  | {
      mode: 'program';
      programId: string;
      programSlug: string;
      coopModeEnabled: boolean;
      parentNavBasePath?: string;
      applyBasePath?: string;
    };

type FetchActivityNotificationsOptions = {
  cursor?: string | null;
  limit?: number;
  notificationContext?: ParentActivityNotificationContext;
};

export function buildParentActivityNotificationSearchParams(
  organizationId: string,
  slug: string,
  options: {
    cursor?: string | null;
    limit?: number;
    notificationContext?: ParentActivityNotificationContext;
  } = {},
): URLSearchParams {
  const context = options.notificationContext ?? { mode: 'main' };
  const parentNavBasePath =
    context.parentNavBasePath ??
    (context.mode === 'program'
      ? `/school/${slug}/parent/p/${context.programSlug}`
      : `/school/${slug}/parent`);
  const applyBasePath = context.applyBasePath ?? `/school/${slug}/apply`;

  const params = new URLSearchParams({
    organizationId,
    slug,
    mode: context.mode,
    parentNavBasePath,
    applyBasePath,
  });

  if (options.cursor) {
    params.set('cursor', options.cursor);
  }
  if (options.limit != null) {
    params.set('limit', String(options.limit));
  }

  if (context.mode === 'program') {
    params.set('programId', context.programId);
    params.set('programSlug', context.programSlug);
    params.set('coopModeEnabled', context.coopModeEnabled ? 'true' : 'false');
  }

  return params;
}

export function buildParentActivityNotificationContext(input: {
  slug: string;
  programSlug?: string;
  programId?: string;
  coopModeEnabled?: boolean;
  parentNavBasePath?: string;
}): ParentActivityNotificationContext {
  const { slug, programSlug, programId, coopModeEnabled, parentNavBasePath } = input;
  const applyBasePath = `/school/${slug}/apply`;

  if (programSlug && programId) {
    return {
      mode: 'program',
      programId,
      programSlug,
      coopModeEnabled: Boolean(coopModeEnabled),
      parentNavBasePath: parentNavBasePath ?? `/school/${slug}/parent/p/${programSlug}`,
      applyBasePath,
    };
  }

  return {
    mode: 'main',
    parentNavBasePath: `/school/${slug}/parent`,
    applyBasePath,
  };
}

export async function fetchParentActivityNotifications(
  organizationId: string,
  slug: string,
  options: FetchActivityNotificationsOptions = {},
): Promise<ParentActivityNotificationsPage> {
  const params = buildParentActivityNotificationSearchParams(organizationId, slug, options);

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
  notificationContext?: ParentActivityNotificationContext,
): Promise<number> {
  const params = buildParentActivityNotificationSearchParams(organizationId, slug, {
    notificationContext,
  });
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
