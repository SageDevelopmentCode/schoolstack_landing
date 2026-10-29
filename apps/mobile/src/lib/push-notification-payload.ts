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

export type BulletinPushNotificationData = {
  kind: 'bulletin';
  portal: PushPortal;
  organizationSlug: string;
  postId: string;
};

export type GalleryPushNotificationData = {
  kind: 'gallery';
  portal: 'parent';
  organizationSlug: string;
  uploadBatchId?: string;
};

export type AttendancePushNotificationData = {
  kind: 'attendance';
  portal: 'parent';
  organizationSlug: string;
  studentId: string;
  intent: 'present' | 'pickup';
};

export type PushNotificationData =
  | MessagePushNotificationData
  | CommitteePushNotificationData
  | BulletinPushNotificationData
  | GalleryPushNotificationData
  | AttendancePushNotificationData;

function parsePushPortal(value: unknown): PushPortal | null {
  if (value === 'parent' || value === 'teacher' || value === 'admin') {
    return value;
  }
  return null;
}

function parseOrganizationSlug(value: unknown): string | null {
  if (typeof value !== 'string' || !value.trim()) return null;
  return value.trim();
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

function parseAttendanceIntent(value: unknown): 'present' | 'pickup' | null {
  if (value === 'present' || value === 'pickup') return value;
  return null;
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

  const organizationSlug = parseOrganizationSlug(data.organizationSlug);
  if (!organizationSlug) return null;

  const kind = data.kind;

  if (kind === 'bulletin') {
    const portal = parsePushPortal(data.portal);
    const postId = data.postId;
    if (!portal || typeof postId !== 'string' || !postId.trim()) return null;
    return {
      kind: 'bulletin',
      portal,
      organizationSlug,
      postId: postId.trim(),
    };
  }

  if (kind === 'gallery') {
    if (data.portal !== 'parent') return null;
    const uploadBatchId =
      typeof data.uploadBatchId === 'string' && data.uploadBatchId.trim()
        ? data.uploadBatchId.trim()
        : undefined;
    return {
      kind: 'gallery',
      portal: 'parent',
      organizationSlug,
      uploadBatchId,
    };
  }

  if (kind === 'attendance') {
    if (data.portal !== 'parent') return null;
    const studentId = data.studentId;
    const intent = parseAttendanceIntent(data.intent);
    if (typeof studentId !== 'string' || !studentId.trim() || !intent) return null;
    return {
      kind: 'attendance',
      portal: 'parent',
      organizationSlug,
      studentId: studentId.trim(),
      intent,
    };
  }

  const portal = parsePushPortal(data.portal);
  if (!portal) return null;

  const committeeId = data.committeeId;
  const threadId = data.threadId;

  if (kind === 'committee' || (kind !== 'message' && typeof committeeId === 'string')) {
    if (typeof committeeId !== 'string' || !committeeId.trim()) return null;

    const intent = data.intent === 'join_request' ? 'join_request' : undefined;

    return {
      kind: 'committee',
      portal,
      organizationSlug,
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
      organizationSlug,
      threadId: threadId.trim(),
    };
  }

  return null;
}
