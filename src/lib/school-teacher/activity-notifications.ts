import type { SupabaseClient } from "@supabase/supabase-js";
import { ACTIVITY_ACTIONS } from "@/lib/activity-log";
import {
  filterBulletinPostsForViewer,
  teacherBulletinScope,
} from "@/lib/school-bulletin/bulletin-audience";
import {
  mapBulletinPostRow,
  type BulletinPostRow,
} from "@/lib/school-bulletin/mappers";
import type { BulletinPost } from "@/lib/school-bulletin/types";
import {
  mapOrganizationEventRow,
  type OrganizationEventRow,
} from "@/lib/school-events/mappers";
import {
  schoolTeacherPath,
  teacherClassroomSignupPath,
} from "@/lib/organization-settings/teacher-routes";
import {
  decodeActivityNotificationCursor,
  encodeActivityNotificationCursor,
  formatRelativeTime,
  getActivityNotificationRangeStart,
  isUnreadActivityNotificationEvent,
  type ActivityEventForNotification,
} from "@/lib/school-admin/activity-notifications";

export { formatRelativeTime };

export const TEACHER_NOTIFICATION_ACTIONS = [
  ACTIVITY_ACTIONS.MESSAGES_RECEIVED,
  ACTIVITY_ACTIONS.CLASSROOM_SIGNUP_RESPONSE_SUBMITTED,
  ACTIVITY_ACTIONS.STUDENT_HEALTH_ITEM_CREATED,
  ACTIVITY_ACTIONS.STUDENT_HEALTH_ITEM_UPDATED,
  ACTIVITY_ACTIONS.STUDENT_HEALTH_ITEM_DELETED,
] as const;

export const SYNTHETIC_BULLETIN_ACTION = "bulletin.post_published";
export const SYNTHETIC_EVENT_ACTION = "calendar.event_posted";

export type TeacherActivityNotificationCategory =
  | "messages"
  | "signups"
  | "health"
  | "announcements"
  | "events"
  | "other";

export type TeacherActivityNotification = {
  id: string;
  action: string;
  title: string;
  summary: string;
  detail: string;
  createdAt: string;
  href: string;
  ctaLabel: string;
  category: TeacherActivityNotificationCategory;
};

export type TeacherActivityNotificationsPage = {
  notifications: TeacherActivityNotification[];
  nextCursor: string | null;
  hasMore: boolean;
};

export type TeacherNotificationFetchOptions = {
  limit?: number;
  days?: number;
  cursor?: string | null;
  teacherBasePath?: string;
  viewerUserId?: string | null;
};

const DEFAULT_NOTIFICATION_DAYS = 30;
const DEFAULT_NOTIFICATION_PAGE_SIZE = 15;
const MAX_NOTIFICATION_PAGE_SIZE = 30;
export const MAX_UNREAD_BADGE_COUNT = 99;
const ACTIVITY_NOTIFICATION_BATCH_SIZE = 50;
const MAX_ACTIVITY_NOTIFICATION_BATCHES = 5;

type NotificationPageCursor = {
  createdAt: string;
  id: string;
};

type PageFetchOptions = {
  limit: number;
  cursor: NotificationPageCursor | null;
};

type TeacherActivityEvent = ActivityEventForNotification & {
  actor_type?: string | null;
  actor_user_id?: string | null;
  surface?: string | null;
};

type TeacherNotificationFilterContext = {
  staffMemberId: string;
  viewerUserId: string | null;
  enrolledStudentIds: Set<string>;
  threadStaffMemberIdsByThreadId: Map<string, Set<string>>;
};

const NOTIFICATION_TITLE_BY_ACTION: Partial<Record<string, string>> = {
  [ACTIVITY_ACTIONS.MESSAGES_RECEIVED]: "New message",
  [ACTIVITY_ACTIONS.CLASSROOM_SIGNUP_RESPONSE_SUBMITTED]: "Classroom signup response",
  [ACTIVITY_ACTIONS.STUDENT_HEALTH_ITEM_CREATED]: "Student health update",
  [ACTIVITY_ACTIONS.STUDENT_HEALTH_ITEM_UPDATED]: "Student health update",
  [ACTIVITY_ACTIONS.STUDENT_HEALTH_ITEM_DELETED]: "Student health update",
  [SYNTHETIC_BULLETIN_ACTION]: "New announcement",
  [SYNTHETIC_EVENT_ACTION]: "New calendar event",
};

function metadataString(
  metadata: Record<string, unknown>,
  key: string,
): string | null {
  const value = metadata[key];
  if (typeof value !== "string" || !value.trim()) return null;
  return value.trim();
}

function mapActivityEventRow(row: Record<string, unknown>): TeacherActivityEvent {
  return {
    id: String(row.id),
    action: String(row.action),
    entity_type:
      row.entity_type === null || row.entity_type === undefined
        ? null
        : String(row.entity_type),
    entity_id:
      row.entity_id === null || row.entity_id === undefined
        ? null
        : String(row.entity_id),
    summary: String(row.summary),
    metadata:
      row.metadata &&
      typeof row.metadata === "object" &&
      !Array.isArray(row.metadata)
        ? (row.metadata as Record<string, unknown>)
        : {},
    created_at: String(row.created_at),
    actor_type:
      row.actor_type === null || row.actor_type === undefined
        ? null
        : String(row.actor_type),
    actor_user_id:
      row.actor_user_id === null || row.actor_user_id === undefined
        ? null
        : String(row.actor_user_id),
    surface:
      row.surface === null || row.surface === undefined
        ? null
        : String(row.surface),
  };
}

function parseNotificationPageCursor(
  cursor: string | null | undefined,
): NotificationPageCursor | null {
  if (!cursor) return null;
  return decodeActivityNotificationCursor(cursor);
}

function compareNotificationsDesc(
  left: TeacherActivityNotification,
  right: TeacherActivityNotification,
): number {
  const leftCreated = new Date(left.createdAt).getTime();
  const rightCreated = new Date(right.createdAt).getTime();
  if (leftCreated !== rightCreated) {
    return rightCreated - leftCreated;
  }
  return right.id.localeCompare(right.id);
}

function notificationBeforePageCursor(
  notification: TeacherActivityNotification,
  cursor: NotificationPageCursor,
): boolean {
  const created = new Date(notification.createdAt).getTime();
  const cursorCreated = new Date(cursor.createdAt).getTime();
  if (created < cursorCreated) return true;
  if (created > cursorCreated) return false;
  return notification.id < cursor.id;
}

function applyNotificationTimestampCursorToQuery<
  T extends {
    lte: (column: string, value: string) => T;
  },
>(query: T, timestampColumn: string, cursor: NotificationPageCursor): T {
  return query.lte(timestampColumn, cursor.createdAt);
}

function mergeNotificationsById(
  notifications: TeacherActivityNotification[],
): TeacherActivityNotification[] {
  const seen = new Set<string>();
  const merged: TeacherActivityNotification[] = [];

  for (const notification of notifications) {
    if (seen.has(notification.id)) continue;
    seen.add(notification.id);
    merged.push(notification);
  }

  return merged.sort(compareNotificationsDesc);
}

function finalizeNotificationPage(
  notifications: TeacherActivityNotification[],
  limit: number,
): TeacherActivityNotificationsPage {
  const sorted = mergeNotificationsById(notifications);
  const pageItems = sorted.slice(0, limit);
  const hasMore = sorted.length > limit;
  const lastItem = pageItems.at(-1);

  return {
    notifications: pageItems,
    nextCursor:
      hasMore && lastItem
        ? encodeActivityNotificationCursor(lastItem.createdAt, lastItem.id)
        : null,
    hasMore,
  };
}

function capNotificationsForPage(
  notifications: TeacherActivityNotification[],
  pageFetch: PageFetchOptions,
): TeacherActivityNotification[] {
  const filtered = pageFetch.cursor
    ? notifications.filter((notification) =>
        notificationBeforePageCursor(notification, pageFetch.cursor!),
      )
    : notifications;

  return [...filtered]
    .sort(compareNotificationsDesc)
    .slice(0, pageFetch.limit + 1);
}

export function getTeacherActivityNotificationCategory(
  action: string,
): TeacherActivityNotificationCategory {
  if (action === ACTIVITY_ACTIONS.MESSAGES_RECEIVED) return "messages";
  if (action === ACTIVITY_ACTIONS.CLASSROOM_SIGNUP_RESPONSE_SUBMITTED) {
    return "signups";
  }
  if (
    action === ACTIVITY_ACTIONS.STUDENT_HEALTH_ITEM_CREATED ||
    action === ACTIVITY_ACTIONS.STUDENT_HEALTH_ITEM_UPDATED ||
    action === ACTIVITY_ACTIONS.STUDENT_HEALTH_ITEM_DELETED
  ) {
    return "health";
  }
  if (action === SYNTHETIC_BULLETIN_ACTION) return "announcements";
  if (action === SYNTHETIC_EVENT_ACTION) return "events";
  return "other";
}

function formatNotificationTitle(action: string): string {
  return NOTIFICATION_TITLE_BY_ACTION[action] ?? action;
}

function formatTeacherNotificationDetail(
  action: string,
  summary: string,
  context?: {
    studentName?: string | null;
    signupTitle?: string | null;
  },
): string {
  switch (action) {
    case ACTIVITY_ACTIONS.CLASSROOM_SIGNUP_RESPONSE_SUBMITTED:
      return context?.signupTitle
        ? `Response for "${context.signupTitle}"`
        : summary;
    case ACTIVITY_ACTIONS.STUDENT_HEALTH_ITEM_CREATED:
    case ACTIVITY_ACTIONS.STUDENT_HEALTH_ITEM_UPDATED:
    case ACTIVITY_ACTIONS.STUDENT_HEALTH_ITEM_DELETED:
      return context?.studentName
        ? `Health update for ${context.studentName}`
        : summary;
    case SYNTHETIC_BULLETIN_ACTION:
      return summary;
    case SYNTHETIC_EVENT_ACTION:
      return summary;
    default:
      return summary;
  }
}

function resolveTeacherBasePath(
  slug: string,
  teacherBasePath?: string,
): string {
  return teacherBasePath ?? schoolTeacherPath(slug, "dashboard").replace(/\/dashboard$/, "");
}

function resolveTeacherNotificationLink(
  slug: string,
  action: string,
  event: ActivityEventForNotification,
  options?: {
    teacherBasePath?: string;
    signupId?: string | null;
  },
): { href: string; ctaLabel: string } {
  const teacherBase = resolveTeacherBasePath(slug, options?.teacherBasePath);

  if (action === ACTIVITY_ACTIONS.MESSAGES_RECEIVED) {
    const threadId = metadataString(event.metadata, "threadId");
    return {
      href: threadId
        ? `${teacherBase}/messages?thread=${threadId}`
        : `${teacherBase}/messages`,
      ctaLabel: "View message",
    };
  }

  if (action === ACTIVITY_ACTIONS.CLASSROOM_SIGNUP_RESPONSE_SUBMITTED) {
    const signupId =
      options?.signupId ??
      metadataString(event.metadata, "signupId") ??
      event.entity_id;
    return {
      href: signupId
        ? teacherClassroomSignupPath(slug, signupId, `${teacherBase}/classroom_signups`)
        : `${teacherBase}/classroom_signups`,
      ctaLabel: "View signup",
    };
  }

  if (
    action === ACTIVITY_ACTIONS.STUDENT_HEALTH_ITEM_CREATED ||
    action === ACTIVITY_ACTIONS.STUDENT_HEALTH_ITEM_UPDATED ||
    action === ACTIVITY_ACTIONS.STUDENT_HEALTH_ITEM_DELETED
  ) {
    return {
      href: `${teacherBase}/my_students`,
      ctaLabel: "View students",
    };
  }

  if (action === SYNTHETIC_BULLETIN_ACTION) {
    return {
      href: `${teacherBase}/dashboard`,
      ctaLabel: "View announcement",
    };
  }

  if (action === SYNTHETIC_EVENT_ACTION) {
    return {
      href: `${teacherBase}/calendar`,
      ctaLabel: "View calendar",
    };
  }

  return {
    href: `${teacherBase}/dashboard`,
    ctaLabel: "View",
  };
}

function mapActivityEventToTeacherNotification(
  event: TeacherActivityEvent,
  slug: string,
  options?: Pick<TeacherNotificationFetchOptions, "teacherBasePath">,
): TeacherActivityNotification {
  const signupTitle = metadataString(event.metadata, "signupTitle");
  const studentName = metadataString(event.metadata, "studentName");
  const link = resolveTeacherNotificationLink(slug, event.action, event, {
    teacherBasePath: options?.teacherBasePath,
    signupId: metadataString(event.metadata, "signupId") ?? event.entity_id,
  });

  return {
    id: event.id,
    action: event.action,
    title: formatNotificationTitle(event.action),
    summary: event.summary,
    detail: formatTeacherNotificationDetail(event.action, event.summary, {
      signupTitle,
      studentName,
    }),
    createdAt: event.created_at,
    href: link.href,
    ctaLabel: link.ctaLabel,
    category: getTeacherActivityNotificationCategory(event.action),
  };
}

export function isTeacherActivityEventVisible(
  event: TeacherActivityEvent,
  context: TeacherNotificationFilterContext,
): boolean {
  if (event.action === ACTIVITY_ACTIONS.MESSAGES_RECEIVED) {
    if (metadataString(event.metadata, "recipientPortal") === "parent") {
      return false;
    }

    const senderUserId = metadataString(event.metadata, "senderUserId");
    if (
      senderUserId &&
      context.viewerUserId &&
      senderUserId === context.viewerUserId
    ) {
      return false;
    }

    const threadId = metadataString(event.metadata, "threadId");
    if (!threadId) return false;

    const staffIds = context.threadStaffMemberIdsByThreadId.get(threadId);
    return Boolean(staffIds?.has(context.staffMemberId));
  }

  if (event.action === ACTIVITY_ACTIONS.CLASSROOM_SIGNUP_RESPONSE_SUBMITTED) {
    const eventStaffMemberId = metadataString(event.metadata, "staffMemberId");
    return eventStaffMemberId === context.staffMemberId;
  }

  if (
    event.action === ACTIVITY_ACTIONS.STUDENT_HEALTH_ITEM_CREATED ||
    event.action === ACTIVITY_ACTIONS.STUDENT_HEALTH_ITEM_UPDATED ||
    event.action === ACTIVITY_ACTIONS.STUDENT_HEALTH_ITEM_DELETED
  ) {
    if (
      context.viewerUserId &&
      event.actor_user_id &&
      event.actor_user_id === context.viewerUserId
    ) {
      return false;
    }

    const studentId = metadataString(event.metadata, "studentId");
    return Boolean(studentId && context.enrolledStudentIds.has(studentId));
  }

  return false;
}

async function loadEnrolledStudentIds(
  supabase: SupabaseClient,
  organizationId: string,
): Promise<Set<string>> {
  const { data, error } = await supabase
    .from("enrollments")
    .select("student_id")
    .eq("organization_id", organizationId)
    .eq("status", "enrolled");

  if (error) throw error;

  return new Set(
    (data ?? []).map((row) => String(row.student_id)).filter(Boolean),
  );
}

async function resolveThreadStaffMemberIds(
  supabase: SupabaseClient,
  organizationId: string,
  events: TeacherActivityEvent[],
): Promise<Map<string, Set<string>>> {
  const threadIds = events
    .filter((event) => event.action === ACTIVITY_ACTIONS.MESSAGES_RECEIVED)
    .map((event) => metadataString(event.metadata, "threadId"))
    .filter((value): value is string => Boolean(value));

  const threadStaffMemberIdsByThreadId = new Map<string, Set<string>>();
  if (threadIds.length === 0) return threadStaffMemberIdsByThreadId;

  const { data, error } = await supabase
    .from("message_thread_participants")
    .select("thread_id, staff_member_id")
    .eq("organization_id", organizationId)
    .in("thread_id", [...new Set(threadIds)]);

  if (error) throw error;

  for (const row of data ?? []) {
    if (!row.staff_member_id) continue;
    const threadId = String(row.thread_id);
    const staffMemberId = String(row.staff_member_id);
    const existing = threadStaffMemberIdsByThreadId.get(threadId) ?? new Set<string>();
    existing.add(staffMemberId);
    threadStaffMemberIdsByThreadId.set(threadId, existing);
  }

  return threadStaffMemberIdsByThreadId;
}

async function buildTeacherNotificationFilterContext(
  supabase: SupabaseClient,
  organizationId: string,
  staffMemberId: string,
  events: TeacherActivityEvent[],
  viewerUserId?: string | null,
): Promise<TeacherNotificationFilterContext> {
  const [enrolledStudentIds, threadStaffMemberIdsByThreadId] = await Promise.all([
    loadEnrolledStudentIds(supabase, organizationId),
    resolveThreadStaffMemberIds(supabase, organizationId, events),
  ]);

  return {
    staffMemberId,
    viewerUserId: viewerUserId ?? null,
    enrolledStudentIds,
    threadStaffMemberIdsByThreadId,
  };
}

async function filterRawActivityEventsForTeacher(
  supabase: SupabaseClient,
  organizationId: string,
  staffMemberId: string,
  rawEvents: TeacherActivityEvent[],
  viewerUserId?: string | null,
): Promise<TeacherActivityEvent[]> {
  const context = await buildTeacherNotificationFilterContext(
    supabase,
    organizationId,
    staffMemberId,
    rawEvents,
    viewerUserId,
  );

  return rawEvents.filter((event) => isTeacherActivityEventVisible(event, context));
}

async function fetchBulletinNotifications(
  supabase: SupabaseClient,
  slug: string,
  organizationId: string,
  rangeStart: Date,
  teacherBasePath?: string,
  pageFetch?: PageFetchOptions,
): Promise<TeacherActivityNotification[]> {
  let query = supabase
    .from("school_bulletin_posts")
    .select("*")
    .eq("organization_id", organizationId)
    .eq("status", "published")
    .gte("published_at", rangeStart.toISOString())
    .order("published_at", { ascending: false });

  if (pageFetch?.cursor) {
    query = applyNotificationTimestampCursorToQuery(
      query,
      "published_at",
      pageFetch.cursor,
    );
  }

  if (pageFetch) {
    query = query.limit(pageFetch.limit * 3);
  }

  const { data, error } = await query;
  if (error) throw error;

  const posts = filterBulletinPostsForViewer(
    (data as BulletinPostRow[]).map((row) => mapBulletinPostRow(row)),
    teacherBulletinScope(),
  );

  const notifications = posts.map((post: BulletinPost) => {
    const createdAt = post.publishedAt ?? post.createdAt;
    const syntheticEvent: ActivityEventForNotification = {
      id: post.id,
      action: SYNTHETIC_BULLETIN_ACTION,
      entity_type: "bulletin_post",
      entity_id: post.id,
      summary: post.title,
      metadata: { postId: post.id },
      created_at: createdAt,
    };
    const link = resolveTeacherNotificationLink(
      slug,
      SYNTHETIC_BULLETIN_ACTION,
      syntheticEvent,
      { teacherBasePath },
    );

    return {
      id: `bulletin:${post.id}`,
      action: SYNTHETIC_BULLETIN_ACTION,
      title: formatNotificationTitle(SYNTHETIC_BULLETIN_ACTION),
      summary: post.title,
      detail: formatTeacherNotificationDetail(
        SYNTHETIC_BULLETIN_ACTION,
        post.title,
      ),
      createdAt,
      href: link.href,
      ctaLabel: link.ctaLabel,
      category: "announcements" as const,
    };
  });

  return pageFetch ? capNotificationsForPage(notifications, pageFetch) : notifications;
}

async function fetchCalendarNotifications(
  supabase: SupabaseClient,
  slug: string,
  organizationId: string,
  rangeStart: Date,
  teacherBasePath?: string,
  pageFetch?: PageFetchOptions,
): Promise<TeacherActivityNotification[]> {
  let query = supabase
    .from("organization_events")
    .select("*")
    .eq("organization_id", organizationId)
    .is("program_id", null)
    .gte("created_at", rangeStart.toISOString())
    .order("created_at", { ascending: false });

  if (pageFetch?.cursor) {
    query = applyNotificationTimestampCursorToQuery(
      query,
      "created_at",
      pageFetch.cursor,
    );
  }

  if (pageFetch) {
    query = query.limit(pageFetch.limit + 1);
  }

  const { data, error } = await query;
  if (error) throw error;

  const notifications = (data as OrganizationEventRow[]).map((row) => {
    const event = mapOrganizationEventRow(row);
    const createdAt = row.created_at ?? row.event_date;
    const syntheticEvent: ActivityEventForNotification = {
      id: event.id,
      action: SYNTHETIC_EVENT_ACTION,
      entity_type: "organization_event",
      entity_id: event.id,
      summary: event.title,
      metadata: { eventId: event.id },
      created_at: createdAt,
    };
    const link = resolveTeacherNotificationLink(
      slug,
      SYNTHETIC_EVENT_ACTION,
      syntheticEvent,
      { teacherBasePath },
    );

    return {
      id: `event:${event.id}`,
      action: SYNTHETIC_EVENT_ACTION,
      title: formatNotificationTitle(SYNTHETIC_EVENT_ACTION),
      summary: event.title,
      detail: formatTeacherNotificationDetail(
        SYNTHETIC_EVENT_ACTION,
        event.title,
      ),
      createdAt,
      href: link.href,
      ctaLabel: link.ctaLabel,
      category: "events" as const,
    };
  });

  return pageFetch ? capNotificationsForPage(notifications, pageFetch) : notifications;
}

async function fetchActivityNotificationsForPage(
  supabase: SupabaseClient,
  organizationId: string,
  slug: string,
  staffMemberId: string,
  rangeStart: Date,
  pageFetch: PageFetchOptions,
  options?: TeacherNotificationFetchOptions,
): Promise<TeacherActivityNotification[]> {
  const targetCount = pageFetch.limit + 1;
  const collected: TeacherActivityNotification[] = [];
  let batchCursor = pageFetch.cursor;
  let batches = 0;

  while (collected.length < targetCount && batches < MAX_ACTIVITY_NOTIFICATION_BATCHES) {
    batches += 1;

    let query = supabase
      .from("activity_events")
      .select(
        "id, action, entity_type, entity_id, summary, metadata, created_at, actor_type, actor_user_id, surface",
      )
      .eq("organization_id", organizationId)
      .in("action", [...TEACHER_NOTIFICATION_ACTIONS])
      .gte("created_at", rangeStart.toISOString())
      .order("created_at", { ascending: false })
      .order("id", { ascending: false })
      .limit(ACTIVITY_NOTIFICATION_BATCH_SIZE);

    if (batchCursor) {
      if (batches === 1 && pageFetch.cursor) {
        query = applyNotificationTimestampCursorToQuery(
          query,
          "created_at",
          batchCursor,
        );
      } else {
        query = query.or(
          `created_at.lt.${batchCursor.createdAt},and(created_at.eq.${batchCursor.createdAt},id.lt.${batchCursor.id})`,
        );
      }
    }

    const { data, error } = await query;
    if (error) throw error;
    if (!data?.length) break;

    const rawEvents = data.map((row) =>
      mapActivityEventRow(row as Record<string, unknown>),
    );

    const filteredEvents = await filterRawActivityEventsForTeacher(
      supabase,
      organizationId,
      staffMemberId,
      rawEvents,
      options?.viewerUserId,
    );

    collected.push(
      ...filteredEvents.map((event) =>
        mapActivityEventToTeacherNotification(event, slug, options),
      ),
    );

    const lastRow = data.at(-1);
    if (!lastRow) break;

    batchCursor = {
      createdAt: String(lastRow.created_at),
      id: String(lastRow.id),
    };

    if (data.length < ACTIVITY_NOTIFICATION_BATCH_SIZE) break;
  }

  return capNotificationsForPage(collected, pageFetch);
}

export async function fetchTeacherActivityNotifications(
  supabase: SupabaseClient,
  organizationId: string,
  slug: string,
  staffMemberId: string,
  options?: TeacherNotificationFetchOptions,
): Promise<TeacherActivityNotificationsPage> {
  const requestedLimit = options?.limit ?? DEFAULT_NOTIFICATION_PAGE_SIZE;
  const limit = Math.min(
    Math.max(requestedLimit, 1),
    MAX_NOTIFICATION_PAGE_SIZE,
  );
  const days = options?.days ?? DEFAULT_NOTIFICATION_DAYS;
  const rangeStart = getActivityNotificationRangeStart(days);
  const pageFetch: PageFetchOptions = {
    limit,
    cursor: parseNotificationPageCursor(options?.cursor),
  };

  const [activityNotifications, bulletinNotifications, calendarNotifications] =
    await Promise.all([
      fetchActivityNotificationsForPage(
        supabase,
        organizationId,
        slug,
        staffMemberId,
        rangeStart,
        pageFetch,
        options,
      ),
      fetchBulletinNotifications(
        supabase,
        slug,
        organizationId,
        rangeStart,
        options?.teacherBasePath,
        pageFetch,
      ),
      fetchCalendarNotifications(
        supabase,
        slug,
        organizationId,
        rangeStart,
        options?.teacherBasePath,
        pageFetch,
      ),
    ]);

  return finalizeNotificationPage(
    [
      ...activityNotifications,
      ...bulletinNotifications,
      ...calendarNotifications,
    ],
    limit,
  );
}

function countUnreadFromNotifications(
  notifications: TeacherActivityNotification[],
  lastReadAt: string | null,
  rangeStart: Date,
  cap: number,
  seenIds?: Set<string>,
): number {
  let count = 0;

  for (const notification of notifications) {
    if (seenIds?.has(notification.id)) continue;
    if (
      !isUnreadActivityNotificationEvent(
        notification.createdAt,
        lastReadAt,
        rangeStart,
      )
    ) {
      continue;
    }

    seenIds?.add(notification.id);
    count += 1;
    if (count >= cap) return cap;
  }

  return count;
}

async function countUnreadActivityNotificationsForTeacher(
  supabase: SupabaseClient,
  organizationId: string,
  slug: string,
  staffMemberId: string,
  lastReadAt: string | null,
  rangeStart: Date,
  remainingCap: number,
  options?: TeacherNotificationFetchOptions,
  seenIds?: Set<string>,
): Promise<number> {
  if (remainingCap <= 0) return 0;

  let count = 0;
  let batchCursor: NotificationPageCursor | null = null;
  let batches = 0;

  while (count < remainingCap && batches < MAX_ACTIVITY_NOTIFICATION_BATCHES) {
    batches += 1;

    let query = supabase
      .from("activity_events")
      .select(
        "id, action, entity_type, entity_id, summary, metadata, created_at, actor_type, actor_user_id, surface",
      )
      .eq("organization_id", organizationId)
      .in("action", [...TEACHER_NOTIFICATION_ACTIONS])
      .gte("created_at", rangeStart.toISOString())
      .order("created_at", { ascending: false })
      .order("id", { ascending: false })
      .limit(ACTIVITY_NOTIFICATION_BATCH_SIZE);

    if (batchCursor) {
      query = query.or(
        `created_at.lt.${batchCursor.createdAt},and(created_at.eq.${batchCursor.createdAt},id.lt.${batchCursor.id})`,
      );
    }

    const { data, error } = await query;
    if (error) throw error;
    if (!data?.length) break;

    const rawEvents = data.map((row) =>
      mapActivityEventRow(row as Record<string, unknown>),
    );
    const filteredEvents = await filterRawActivityEventsForTeacher(
      supabase,
      organizationId,
      staffMemberId,
      rawEvents,
      options?.viewerUserId,
    );

    for (const event of filteredEvents) {
      if (seenIds?.has(event.id)) continue;
      if (
        !isUnreadActivityNotificationEvent(
          event.created_at,
          lastReadAt,
          rangeStart,
        )
      ) {
        continue;
      }

      seenIds?.add(event.id);
      count += 1;
      if (count >= remainingCap) return count;
    }

    const lastRow = data.at(-1);
    if (!lastRow) break;

    batchCursor = {
      createdAt: String(lastRow.created_at),
      id: String(lastRow.id),
    };

    if (data.length < ACTIVITY_NOTIFICATION_BATCH_SIZE) break;
  }

  return count;
}

export async function countUnreadTeacherActivityNotifications(
  supabase: SupabaseClient,
  organizationId: string,
  slug: string,
  staffMemberId: string,
  lastReadAt: string | null,
  options?: TeacherNotificationFetchOptions,
): Promise<number> {
  const days = options?.days ?? DEFAULT_NOTIFICATION_DAYS;
  const rangeStart = getActivityNotificationRangeStart(days);
  const seenIds = new Set<string>();

  let total = await countUnreadActivityNotificationsForTeacher(
    supabase,
    organizationId,
    slug,
    staffMemberId,
    lastReadAt,
    rangeStart,
    MAX_UNREAD_BADGE_COUNT,
    options,
    seenIds,
  );

  if (total >= MAX_UNREAD_BADGE_COUNT) {
    return MAX_UNREAD_BADGE_COUNT;
  }

  const pageFetch: PageFetchOptions = {
    limit: MAX_UNREAD_BADGE_COUNT,
    cursor: null,
  };

  const [bulletinNotifications, calendarNotifications] = await Promise.all([
    fetchBulletinNotifications(
      supabase,
      slug,
      organizationId,
      rangeStart,
      options?.teacherBasePath,
      pageFetch,
    ),
    fetchCalendarNotifications(
      supabase,
      slug,
      organizationId,
      rangeStart,
      options?.teacherBasePath,
      pageFetch,
    ),
  ]);

  total += countUnreadFromNotifications(
    bulletinNotifications,
    lastReadAt,
    rangeStart,
    MAX_UNREAD_BADGE_COUNT - total,
    seenIds,
  );

  if (total >= MAX_UNREAD_BADGE_COUNT) {
    return MAX_UNREAD_BADGE_COUNT;
  }

  total += countUnreadFromNotifications(
    calendarNotifications,
    lastReadAt,
    rangeStart,
    MAX_UNREAD_BADGE_COUNT - total,
    seenIds,
  );

  return total;
}

export async function getTeacherActivityNotificationReadWatermark(
  supabase: SupabaseClient,
  userId: string,
  organizationId: string,
): Promise<string | null> {
  const { data, error } = await supabase
    .from("teacher_activity_notification_reads")
    .select("last_read_at")
    .eq("user_id", userId)
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (error) throw error;
  return data?.last_read_at ? String(data.last_read_at) : null;
}

export async function markTeacherActivityNotificationsRead(
  supabase: SupabaseClient,
  userId: string,
  organizationId: string,
  readAt: Date = new Date(),
): Promise<string> {
  const lastReadAt = readAt.toISOString();
  const { data, error } = await supabase
    .from("teacher_activity_notification_reads")
    .upsert(
      {
        user_id: userId,
        organization_id: organizationId,
        last_read_at: lastReadAt,
      },
      { onConflict: "user_id,organization_id" },
    )
    .select("last_read_at")
    .single();

  if (error) throw error;
  return String(data.last_read_at);
}

export async function getStaffUserIdForMember(
  supabase: SupabaseClient,
  staffMemberId: string,
): Promise<string | null> {
  const { data, error } = await supabase
    .from("staff_members")
    .select("user_id")
    .eq("id", staffMemberId)
    .maybeSingle();

  if (error) throw error;
  return data?.user_id ? String(data.user_id) : null;
}

export async function fetchUnreadTeacherActivityNotificationCount(
  supabase: SupabaseClient,
  userId: string,
  organizationId: string,
  slug: string,
  staffMemberId: string,
  options?: TeacherNotificationFetchOptions,
): Promise<number> {
  const lastReadAt = await getTeacherActivityNotificationReadWatermark(
    supabase,
    userId,
    organizationId,
  );

  return countUnreadTeacherActivityNotifications(
    supabase,
    organizationId,
    slug,
    staffMemberId,
    lastReadAt,
    { ...options, viewerUserId: userId },
  );
}
