export type PushPortal = 'parent' | 'teacher' | 'admin';

export type CommitteePushSection =
  | 'home'
  | 'about'
  | 'resources'
  | 'calendar'
  | 'tasks'
  | 'messages'
  | 'members'
  | 'activity'
  | 'settings';

export type MessagePushNotificationData = {
  kind: 'message';
  portal: PushPortal;
  organizationSlug: string;
  threadId: string;
};

export type CommitteePushNotificationData = {
  kind: 'committee';
  portal: PushPortal;
  organizationSlug: string;
  committeeId: string;
  section?: CommitteePushSection;
  intent?: 'join_request';
};

export type PushNotificationData = MessagePushNotificationData | CommitteePushNotificationData;

function parsePushPortal(value: unknown): PushPortal | null {
  if (value === 'parent' || value === 'teacher' || value === 'admin') {
    return value;
  }
  return null;
}

function parseCommitteeSection(value: unknown): CommitteePushSection | undefined {
  if (
    value === 'home' ||
    value === 'about' ||
    value === 'resources' ||
    value === 'calendar' ||
    value === 'tasks' ||
    value === 'messages' ||
    value === 'members' ||
    value === 'activity' ||
    value === 'settings'
  ) {
    return value;
  }
  return undefined;
}

export function parseMessagePushNotificationData(
  data: Record<string, unknown> | undefined,
): MessagePushNotificationData | null {
  const parsed = parsePushNotificationData(data);
  if (!parsed || parsed.kind !== 'message') return null;
  return parsed;
}

export function parseCommitteePushNotificationData(
  data: Record<string, unknown> | undefined,
): CommitteePushNotificationData | null {
  const parsed = parsePushNotificationData(data);
  if (!parsed || parsed.kind !== 'committee') return null;
  return parsed;
}

export function parsePushNotificationData(
  data: Record<string, unknown> | undefined,
): PushNotificationData | null {
  if (!data) return null;

  const portal = parsePushPortal(data.portal);
  const organizationSlug = data.organizationSlug;
  if (
    !portal ||
    typeof organizationSlug !== 'string' ||
    !organizationSlug.trim()
  ) {
    return null;
  }

  const kind = data.kind;
  const committeeId = data.committeeId;
  const threadId = data.threadId;

  if (kind === 'committee' || (kind !== 'message' && typeof committeeId === 'string')) {
    if (typeof committeeId !== 'string' || !committeeId.trim()) return null;

    const intent = data.intent === 'join_request' ? 'join_request' : undefined;

    return {
      kind: 'committee',
      portal,
      organizationSlug: organizationSlug.trim(),
      committeeId: committeeId.trim(),
      section: parseCommitteeSection(data.section),
      intent,
    };
  }

  if (kind === 'message' || typeof threadId === 'string') {
    if (typeof threadId !== 'string' || !threadId.trim()) return null;

    return {
      kind: 'message',
      portal,
      organizationSlug: organizationSlug.trim(),
      threadId: threadId.trim(),
    };
  }

  return null;
}
