import type { SupabaseClient } from "@supabase/supabase-js";
import { ACTIVITY_ACTIONS } from "@/lib/activity-log";
import { extractStudentLabel } from "@/lib/admissions/application-submissions";
import { isProgramParentPortalCoopMode } from "@/lib/admissions/program-parent-portal";
import { listEnrolledProgramsForFamily } from "@/lib/admissions/program-parent-portal-access";
import {
  decodeActivityNotificationCursor,
  encodeActivityNotificationCursor,
  formatRelativeTime,
  getActivityNotificationRangeStart,
  isUnreadActivityNotificationEvent,
  type ActivityEventForNotification,
} from "@/lib/school-admin/activity-notifications";
import {
  filterBulletinPostsForViewer,
  parentMainPortalBulletinScope,
  parentProgramPortalBulletinScope,
  type BulletinViewerScope,
} from "@/lib/school-bulletin/bulletin-audience";
import {
  mainPortalAudienceScope,
  programPortalAudienceScope,
} from "@/lib/school-events/event-audience";
import {
  COOP_CURRICULUM_UPDATED_ACTION,
  COOP_SUPPLY_ITEM_ADDED_ACTION,
  COOP_SUPPLY_ITEM_ASSIGNED_ACTION,
  COOP_TEACHING_WEEK_ADDED_ACTION,
  COOP_TEACHING_WEEK_SCHEDULED_ACTION,
  COOP_TEACHING_WEEK_UPDATED_ACTION,
  fetchCoopProgramNotifications,
} from "@/lib/parent-portal/parent-coop-notifications";
import {
  buildMainParentNotificationContext,
  type ParentNotificationContext,
  resolveParentNotificationContexts,
} from "@/lib/parent-portal/parent-notification-context";
import {
  mapBulletinPostRow,
  type BulletinPostRow,
} from "@/lib/school-bulletin/mappers";
import type { BulletinPost } from "@/lib/school-bulletin/types";
import type { OrganizationEventAudienceScope } from "@/lib/school-events/events";
import { mapOrganizationEventRow, type OrganizationEventRow } from "@/lib/school-events/mappers";
import type { OrganizationEvent } from "@/lib/school-events/types";
import { schoolParentRootPath } from "@/lib/organization-settings/parent-routes";
import { formatCents } from "@/lib/tuition/pricing";

export { formatRelativeTime };
export type { ParentNotificationContext };
export {
  buildMainParentNotificationContext,
  buildProgramParentNotificationContext,
  parseParentNotificationContextFromSearchParams,
  resolveParentNotificationContexts,
} from "@/lib/parent-portal/parent-notification-context";

export const PARENT_NOTIFICATION_ACTIONS = [
  ACTIVITY_ACTIONS.APPLICATION_UNDER_REVIEW,
  ACTIVITY_ACTIONS.APPLICATION_OBSERVATION,
  ACTIVITY_ACTIONS.APPLICATION_ACCEPTED,
  ACTIVITY_ACTIONS.APPLICATION_DECLINED,
  ACTIVITY_ACTIONS.APPLICATION_WITHDRAWN,
  ACTIVITY_ACTIONS.POST_SUBMIT_VISIT_SCHEDULED,
  ACTIVITY_ACTIONS.ENROLLMENT_COMPLETED,
  ACTIVITY_ACTIONS.ENROLLMENT_CHECKLIST_ITEM_COMPLETED,
  ACTIVITY_ACTIONS.ENROLLMENT_CHECKLIST_ITEM_FAILED,
  ACTIVITY_ACTIONS.MESSAGES_RECEIVED,
  ACTIVITY_ACTIONS.TUITION_CHARGE_INVOICE_SENT,
  ACTIVITY_ACTIONS.TUITION_AUTOPAY_SUCCEEDED,
  ACTIVITY_ACTIONS.TUITION_AUTOPAY_FAILED,
  ACTIVITY_ACTIONS.TUITION_PAYMENT_COMPLETED,
  ACTIVITY_ACTIONS.TUITION_PAYMENT_REFUNDED,
  ACTIVITY_ACTIONS.TUITION_LATE_FEE_APPLIED,
  ACTIVITY_ACTIONS.COMMITTEE_JOIN_APPROVED,
  ACTIVITY_ACTIONS.COMMITTEE_JOIN_DECLINED,
  ACTIVITY_ACTIONS.CLASSROOM_SIGNUP_PUBLISHED,
  ACTIVITY_ACTIONS.CLASSROOM_SIGNUP_CLOSED,
] as const;

export type ParentActivityNotificationCategory =
  | "applications"
  | "enrollment"
  | "payments"
  | "messages"
  | "announcements"
  | "events"
  | "committees"
  | "coop"
  | "other";

export type ParentActivityNotification = {
  id: string;
  action: string;
  title: string;
  summary: string;
  detail: string;
  createdAt: string;
  href: string;
  ctaLabel: string;
  category: ParentActivityNotificationCategory;
};

export type ParentActivityNotificationsPage = {
  notifications: ParentActivityNotification[];
  nextCursor: string | null;
  hasMore: boolean;
};

export type ParentNotificationFetchOptions = {
  limit?: number;
  days?: number;
  cursor?: string | null;
  lastReadAt?: string | null;
  parentNavBasePath?: string;
  applyBasePath?: string;
  bulletinScope?: BulletinViewerScope;
  eventAudienceScope?: OrganizationEventAudienceScope;
  notificationContext?: ParentNotificationContext;
  aggregateAllContexts?: boolean;
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

type NotificationSinceBound = {
  since: Date;
  exclusive: boolean;
};

type ParentNotificationCountOptions = Pick<
  ParentNotificationFetchOptions,
  "bulletinScope" | "parentNavBasePath" | "applyBasePath"
>;

export function resolveNotificationSince(
  lastReadAt: string | null,
  rangeStart: Date,
): NotificationSinceBound {
  if (!lastReadAt) {
    return { since: rangeStart, exclusive: false };
  }

  const read = new Date(lastReadAt);
  if (Number.isNaN(read.getTime())) {
    return { since: rangeStart, exclusive: false };
  }

  if (read >= rangeStart) {
    return { since: read, exclusive: true };
  }

  return { since: rangeStart, exclusive: false };
}

function countUnreadFromNotifications(
  notifications: ParentActivityNotification[],
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

function parseNotificationPageCursor(
  cursor: string | null | undefined,
): NotificationPageCursor | null {
  if (!cursor) return null;
  return decodeActivityNotificationCursor(cursor);
}

function compareNotificationsDesc(
  left: ParentActivityNotification,
  right: ParentActivityNotification,
): number {
  const leftCreated = new Date(left.createdAt).getTime();
  const rightCreated = new Date(right.createdAt).getTime();
  if (leftCreated !== rightCreated) {
    return rightCreated - leftCreated;
  }
  return right.id.localeCompare(left.id);
}

function notificationBeforePageCursor(
  notification: ParentActivityNotification,
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

function finalizeNotificationPage(
  notifications: ParentActivityNotification[],
  limit: number,
): ParentActivityNotificationsPage {
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
  notifications: ParentActivityNotification[],
  pageFetch: PageFetchOptions,
): ParentActivityNotification[] {
  const filtered = pageFetch.cursor
    ? notifications.filter((notification) =>
        notificationBeforePageCursor(notification, pageFetch.cursor!),
      )
    : notifications;

  return [...filtered]
    .sort(compareNotificationsDesc)
    .slice(0, pageFetch.limit + 1);
}

export const PARENT_ACTIVITY_NOTIFICATION_DAYS = DEFAULT_NOTIFICATION_DAYS;

const SYNTHETIC_BULLETIN_ACTION = "bulletin.post_published";
const SYNTHETIC_EVENT_ACTION = "calendar.event_posted";

const NOTIFICATION_TITLE_BY_ACTION: Partial<Record<string, string>> = {
  [ACTIVITY_ACTIONS.APPLICATION_UNDER_REVIEW]: "Application under review",
  [ACTIVITY_ACTIONS.APPLICATION_OBSERVATION]: "Application update",
  [ACTIVITY_ACTIONS.APPLICATION_ACCEPTED]: "Application accepted",
  [ACTIVITY_ACTIONS.APPLICATION_DECLINED]: "Application update",
  [ACTIVITY_ACTIONS.APPLICATION_WITHDRAWN]: "Application withdrawn",
  [ACTIVITY_ACTIONS.POST_SUBMIT_VISIT_SCHEDULED]: "Visit scheduled",
  [ACTIVITY_ACTIONS.ENROLLMENT_COMPLETED]: "Enrollment completed",
  [ACTIVITY_ACTIONS.ENROLLMENT_CHECKLIST_ITEM_COMPLETED]: "Enrollment step completed",
  [ACTIVITY_ACTIONS.ENROLLMENT_CHECKLIST_ITEM_FAILED]: "Enrollment step needs attention",
  [ACTIVITY_ACTIONS.MESSAGES_RECEIVED]: "New message",
  [ACTIVITY_ACTIONS.TUITION_CHARGE_INVOICE_SENT]: "Tuition invoice",
  [ACTIVITY_ACTIONS.TUITION_AUTOPAY_SUCCEEDED]: "Autopay succeeded",
  [ACTIVITY_ACTIONS.TUITION_AUTOPAY_FAILED]: "Autopay failed",
  [ACTIVITY_ACTIONS.TUITION_PAYMENT_COMPLETED]: "Payment received",
  [ACTIVITY_ACTIONS.TUITION_PAYMENT_REFUNDED]: "Payment refunded",
  [ACTIVITY_ACTIONS.TUITION_LATE_FEE_APPLIED]: "Late fee applied",
  [ACTIVITY_ACTIONS.COMMITTEE_JOIN_APPROVED]: "Committee request approved",
  [ACTIVITY_ACTIONS.COMMITTEE_JOIN_DECLINED]: "Committee request declined",
  [ACTIVITY_ACTIONS.CLASSROOM_SIGNUP_PUBLISHED]: "Classroom signup open",
  [ACTIVITY_ACTIONS.CLASSROOM_SIGNUP_CLOSED]: "Classroom signup closed",
  [SYNTHETIC_BULLETIN_ACTION]: "New announcement",
  [SYNTHETIC_EVENT_ACTION]: "New calendar event",
  [COOP_SUPPLY_ITEM_ADDED_ACTION]: "New supply list item",
  [COOP_SUPPLY_ITEM_ASSIGNED_ACTION]: "Supply list assignment",
  [COOP_TEACHING_WEEK_ADDED_ACTION]: "Teaching schedule week added",
  [COOP_TEACHING_WEEK_UPDATED_ACTION]: "Teaching schedule updated",
  [COOP_TEACHING_WEEK_SCHEDULED_ACTION]: "Teaching schedule assignment",
  [COOP_CURRICULUM_UPDATED_ACTION]: "Curriculum updated",
};

function metadataString(
  metadata: Record<string, unknown>,
  key: string,
): string | null {
  const value = metadata[key];
  if (typeof value !== "string" || !value.trim()) return null;
  return value.trim();
}

function metadataNumber(
  metadata: Record<string, unknown>,
  key: string,
): number | null {
  const value = metadata[key];
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

function parseStringRecord(value: unknown): Record<string, string> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  const result: Record<string, string> = {};
  for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
    if (typeof entry === "string") {
      result[key] = entry;
    } else if (entry != null) {
      result[key] = String(entry);
    }
  }
  return result;
}

function mapActivityEventRow(row: Record<string, unknown>): ActivityEventForNotification & {
  actor_type?: string | null;
  actor_user_id?: string | null;
  surface?: string | null;
} {
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

export function getParentActivityNotificationCategory(
  action: string,
): ParentActivityNotificationCategory {
  if (action.startsWith("coop.")) return "coop";
  if (action === SYNTHETIC_BULLETIN_ACTION) return "announcements";
  if (action === SYNTHETIC_EVENT_ACTION) return "events";
  if (action === ACTIVITY_ACTIONS.MESSAGES_RECEIVED) return "messages";
  if (
    action.startsWith("application.") ||
    action === ACTIVITY_ACTIONS.POST_SUBMIT_VISIT_SCHEDULED
  ) {
    return "applications";
  }
  if (
    action.startsWith("enrollment.") ||
    action === ACTIVITY_ACTIONS.ENROLLMENT_COMPLETED
  ) {
    return "enrollment";
  }
  if (action.startsWith("tuition.")) {
    return "payments";
  }
  if (action.startsWith("committee.")) {
    return "committees";
  }
  return "other";
}

function formatNotificationTitle(action: string): string {
  return NOTIFICATION_TITLE_BY_ACTION[action] ?? "Update";
}

function resolveParentNavBasePath(
  slug: string,
  parentNavBasePath?: string,
): string {
  return parentNavBasePath ?? schoolParentRootPath(slug);
}

function resolveApplyBasePath(
  slug: string,
  applyBasePath?: string,
): string {
  return applyBasePath ?? `/school/${slug}/apply`;
}

function formatParentNotificationDetail(
  action: string,
  summary: string,
  context?: {
    studentLabel?: string | null;
    committeeName?: string | null;
    signupTitle?: string | null;
    bulletinTitle?: string | null;
    eventTitle?: string | null;
    amountLabel?: string | null;
  },
): string {
  const student = context?.studentLabel;
  switch (action) {
    case ACTIVITY_ACTIONS.APPLICATION_ACCEPTED:
      return student
        ? `${student}'s application was accepted`
        : "Your application was accepted";
    case ACTIVITY_ACTIONS.APPLICATION_DECLINED:
      return student
        ? `Update on ${student}'s application`
        : "Update on your application";
    case ACTIVITY_ACTIONS.APPLICATION_UNDER_REVIEW:
      return student
        ? `${student}'s application is under review`
        : "Your application is under review";
    case ACTIVITY_ACTIONS.APPLICATION_OBSERVATION:
      return student
        ? `${student}'s application moved to observation`
        : "Your application moved to observation";
    case ACTIVITY_ACTIONS.APPLICATION_WITHDRAWN:
      return student
        ? `${student}'s application was withdrawn`
        : "Your application was withdrawn";
    case ACTIVITY_ACTIONS.POST_SUBMIT_VISIT_SCHEDULED:
      return student
        ? `Visit scheduled for ${student}`
        : "Your visit was scheduled";
    case ACTIVITY_ACTIONS.ENROLLMENT_COMPLETED:
      return student
        ? `${student} finished enrollment`
        : "Enrollment completed";
    case ACTIVITY_ACTIONS.ENROLLMENT_CHECKLIST_ITEM_COMPLETED:
      return student
        ? `Enrollment step completed for ${student}`
        : "An enrollment step was completed";
    case ACTIVITY_ACTIONS.ENROLLMENT_CHECKLIST_ITEM_FAILED:
      return student
        ? `Enrollment step needs attention for ${student}`
        : "An enrollment step needs attention";
    case ACTIVITY_ACTIONS.MESSAGES_RECEIVED:
      return summary;
    case ACTIVITY_ACTIONS.TUITION_CHARGE_INVOICE_SENT:
      return context?.amountLabel
        ? `New tuition invoice for ${context.amountLabel}`
        : "New tuition invoice available";
    case ACTIVITY_ACTIONS.TUITION_AUTOPAY_FAILED:
      return "Your autopay charge failed";
    case ACTIVITY_ACTIONS.TUITION_AUTOPAY_SUCCEEDED:
      return context?.amountLabel
        ? `Autopay charge of ${context.amountLabel} succeeded`
        : "Autopay charge succeeded";
    case ACTIVITY_ACTIONS.TUITION_PAYMENT_COMPLETED:
      return context?.amountLabel
        ? `Payment of ${context.amountLabel} received`
        : "Payment received";
    case ACTIVITY_ACTIONS.TUITION_PAYMENT_REFUNDED:
      return "A tuition payment was refunded";
    case ACTIVITY_ACTIONS.TUITION_LATE_FEE_APPLIED:
      return "A late fee was applied to your account";
    case ACTIVITY_ACTIONS.COMMITTEE_JOIN_APPROVED:
      return context?.committeeName
        ? `Approved to join ${context.committeeName}`
        : "Committee join request approved";
    case ACTIVITY_ACTIONS.COMMITTEE_JOIN_DECLINED:
      return context?.committeeName
        ? `Request declined for ${context.committeeName}`
        : "Committee join request declined";
    case ACTIVITY_ACTIONS.CLASSROOM_SIGNUP_PUBLISHED:
      return context?.signupTitle
        ? `"${context.signupTitle}" is open for sign-up`
        : "A classroom signup is open";
    case ACTIVITY_ACTIONS.CLASSROOM_SIGNUP_CLOSED:
      return context?.signupTitle
        ? `"${context.signupTitle}" closed`
        : "A classroom signup closed";
    case SYNTHETIC_BULLETIN_ACTION:
      return context?.bulletinTitle
        ? `New announcement: ${context.bulletinTitle}`
        : "New school announcement posted";
    case SYNTHETIC_EVENT_ACTION:
      return context?.eventTitle
        ? `New event: ${context.eventTitle}`
        : "New calendar event posted";
    case COOP_SUPPLY_ITEM_ADDED_ACTION:
    case COOP_SUPPLY_ITEM_ASSIGNED_ACTION:
    case COOP_TEACHING_WEEK_ADDED_ACTION:
    case COOP_TEACHING_WEEK_UPDATED_ACTION:
    case COOP_TEACHING_WEEK_SCHEDULED_ACTION:
    case COOP_CURRICULUM_UPDATED_ACTION:
      return summary;
    default:
      return summary;
  }
}

function isOrgWideParentNotificationAction(action: string): boolean {
  return (
    action === ACTIVITY_ACTIONS.CLASSROOM_SIGNUP_PUBLISHED ||
    action === ACTIVITY_ACTIONS.CLASSROOM_SIGNUP_CLOSED ||
    action === SYNTHETIC_BULLETIN_ACTION ||
    action === SYNTHETIC_EVENT_ACTION
  );
}

function shouldExcludeParentActorEvent(
  event: ActivityEventForNotification & {
    actor_type?: string | null;
    surface?: string | null;
  },
): boolean {
  if (event.action === ACTIVITY_ACTIONS.MESSAGES_RECEIVED) {
    return false;
  }
  return event.actor_type === "parent" && event.surface === "parent_portal";
}

async function fetchFamilyGuardianUserIds(
  supabase: SupabaseClient,
  familyId: string,
): Promise<Set<string>> {
  const { data, error } = await supabase
    .from("guardians")
    .select("user_id")
    .eq("family_id", familyId);

  if (error) throw error;

  return new Set(
    (data ?? [])
      .map((row) => (row.user_id ? String(row.user_id) : null))
      .filter((value): value is string => Boolean(value)),
  );
}

async function resolveApplicationIdsForEvents(
  supabase: SupabaseClient,
  events: ActivityEventForNotification[],
): Promise<Map<string, string | null>> {
  const eventResults = new Map<string, string | null>();
  const enrollmentIds = new Set<string>();
  const checklistItemIds = new Set<string>();
  const paymentIds = new Set<string>();
  const deferredEvents: ActivityEventForNotification[] = [];

  for (const event of events) {
    const fromMetadata = metadataString(event.metadata, "applicationId");
    if (fromMetadata) {
      eventResults.set(event.id, fromMetadata);
      continue;
    }

    if (event.entity_type === "application" && event.entity_id) {
      eventResults.set(event.id, event.entity_id);
      continue;
    }

    const paymentIdFromMetadata = metadataString(event.metadata, "paymentId");
    if (paymentIdFromMetadata) {
      paymentIds.add(paymentIdFromMetadata);
    }

    if (!event.entity_id) {
      deferredEvents.push(event);
      continue;
    }

    if (event.entity_type === "enrollment") {
      enrollmentIds.add(event.entity_id);
    } else if (event.entity_type === "enrollment_checklist_item") {
      checklistItemIds.add(event.entity_id);
    } else if (event.entity_type === "payment") {
      paymentIds.add(event.entity_id);
    }

    deferredEvents.push(event);
  }

  const [enrollmentResult, checklistResult, paymentResult] = await Promise.all([
    enrollmentIds.size > 0
      ? supabase
          .from("enrollments")
          .select("id, application_id")
          .in("id", [...enrollmentIds])
      : Promise.resolve({ data: [], error: null }),
    checklistItemIds.size > 0
      ? supabase
          .from("enrollment_checklist_items")
          .select("id, enrollment:enrollment_id(application_id)")
          .in("id", [...checklistItemIds])
      : Promise.resolve({ data: [], error: null }),
    paymentIds.size > 0
      ? supabase
          .from("application_payments")
          .select("id, application_id")
          .in("id", [...paymentIds])
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (enrollmentResult.error) throw enrollmentResult.error;
  if (checklistResult.error) throw checklistResult.error;
  if (paymentResult.error) throw paymentResult.error;

  const entityCache = new Map<string, string | null>();

  for (const row of enrollmentResult.data ?? []) {
    entityCache.set(
      `enrollment:${row.id}`,
      row.application_id ? String(row.application_id) : null,
    );
  }

  for (const row of checklistResult.data ?? []) {
    const enrollment = row.enrollment as
      | { application_id?: string | null }
      | { application_id?: string | null }[]
      | null;
    const enrollmentRow = Array.isArray(enrollment) ? enrollment[0] : enrollment;
    entityCache.set(
      `enrollment_checklist_item:${row.id}`,
      enrollmentRow?.application_id ? String(enrollmentRow.application_id) : null,
    );
  }

  for (const row of paymentResult.data ?? []) {
    entityCache.set(
      `payment:${row.id}`,
      row.application_id ? String(row.application_id) : null,
    );
  }

  for (const event of deferredEvents) {
    if (eventResults.has(event.id)) continue;
    if (!event.entity_id) {
      eventResults.set(event.id, null);
      continue;
    }
    const cacheKey = `${event.entity_type}:${event.entity_id}`;
    eventResults.set(event.id, entityCache.get(cacheKey) ?? null);
  }

  return eventResults;
}

async function resolveFamilyIdsForEvents(
  supabase: SupabaseClient,
  organizationId: string,
  events: ActivityEventForNotification[],
): Promise<Map<string, string | null>> {
  const familyByEventId = new Map<string, string | null>();
  const applicationIdByEventId = await resolveApplicationIdsForEvents(
    supabase,
    events,
  );

  const applicationIds = [
    ...new Set(
      [...applicationIdByEventId.values()].filter(
        (value): value is string => Boolean(value),
      ),
    ),
  ];
  const applicationFamilyById = new Map<string, string | null>();
  if (applicationIds.length > 0) {
    const { data, error } = await supabase
      .from("applications")
      .select("id, family_id")
      .eq("organization_id", organizationId)
      .in("id", applicationIds);
    if (error) throw error;
    for (const row of data ?? []) {
      applicationFamilyById.set(
        String(row.id),
        row.family_id ? String(row.family_id) : null,
      );
    }
  }

  const chargeIds = events
    .filter((event) => event.entity_type === "tuition_charge" && event.entity_id)
    .map((event) => String(event.entity_id));
  const chargeFamilyById = new Map<string, string | null>();
  if (chargeIds.length > 0) {
    const { data, error } = await supabase
      .from("tuition_charges")
      .select("id, family_id")
      .in("id", chargeIds);
    if (error) throw error;
    for (const row of data ?? []) {
      chargeFamilyById.set(
        String(row.id),
        row.family_id ? String(row.family_id) : null,
      );
    }
  }

  const committeeRequestIds = events
    .filter(
      (event) =>
        event.entity_type === "committee_join_request" && event.entity_id,
    )
    .map((event) => String(event.entity_id));
  const committeeFamilyById = new Map<string, string | null>();
  if (committeeRequestIds.length > 0) {
    const { data, error } = await supabase
      .from("committee_join_requests")
      .select("id, guardians(family_id)")
      .in("id", committeeRequestIds);
    if (error) throw error;
    for (const row of data ?? []) {
      const guardian = row.guardians as { family_id?: string | null } | null;
      committeeFamilyById.set(
        String(row.id),
        guardian?.family_id ? String(guardian.family_id) : null,
      );
    }
  }

  const threadIds = events
    .filter((event) => event.action === ACTIVITY_ACTIONS.MESSAGES_RECEIVED)
    .map((event) => metadataString(event.metadata, "threadId"))
    .filter((value): value is string => Boolean(value));
  const threadFamilyById = new Map<string, string | null>();
  if (threadIds.length > 0) {
    const { data, error } = await supabase
      .from("message_thread_participants")
      .select("thread_id, family_id, guardian_id")
      .eq("organization_id", organizationId)
      .in("thread_id", [...new Set(threadIds)]);
    if (error) throw error;

    const guardianIds = (data ?? [])
      .map((row) => (row.guardian_id ? String(row.guardian_id) : null))
      .filter((value): value is string => Boolean(value));
    const guardianFamilyById = new Map<string, string>();
    if (guardianIds.length > 0) {
      const { data: guardians, error: guardianError } = await supabase
        .from("guardians")
        .select("id, family_id")
        .in("id", guardianIds);
      if (guardianError) throw guardianError;
      for (const guardian of guardians ?? []) {
        guardianFamilyById.set(String(guardian.id), String(guardian.family_id));
      }
    }

    for (const row of data ?? []) {
      const threadId = String(row.thread_id);
      if (threadFamilyById.has(threadId)) continue;
      const familyId =
        (row.family_id ? String(row.family_id) : null) ??
        (row.guardian_id
          ? guardianFamilyById.get(String(row.guardian_id)) ?? null
          : null);
      threadFamilyById.set(threadId, familyId);
    }
  }

  for (const event of events) {
    const metadataFamilyId = metadataString(event.metadata, "familyId");
    if (metadataFamilyId) {
      familyByEventId.set(event.id, metadataFamilyId);
      continue;
    }

    if (event.entity_type === "tuition_charge" && event.entity_id) {
      familyByEventId.set(
        event.id,
        chargeFamilyById.get(String(event.entity_id)) ?? null,
      );
      continue;
    }

    if (event.entity_type === "committee_join_request" && event.entity_id) {
      familyByEventId.set(
        event.id,
        committeeFamilyById.get(String(event.entity_id)) ?? null,
      );
      continue;
    }

    if (event.action === ACTIVITY_ACTIONS.MESSAGES_RECEIVED) {
      const threadId = metadataString(event.metadata, "threadId");
      familyByEventId.set(
        event.id,
        threadId ? threadFamilyById.get(threadId) ?? null : null,
      );
      continue;
    }

    const applicationId = applicationIdByEventId.get(event.id) ?? null;
    if (applicationId) {
      familyByEventId.set(
        event.id,
        applicationFamilyById.get(applicationId) ?? null,
      );
      continue;
    }

    if (isOrgWideParentNotificationAction(event.action)) {
      familyByEventId.set(event.id, null);
      continue;
    }

    familyByEventId.set(event.id, null);
  }

  return familyByEventId;
}

async function fetchApplicationStudentLabels(
  supabase: SupabaseClient,
  applicationIds: string[],
): Promise<Map<string, string | null>> {
  const uniqueIds = [...new Set(applicationIds.filter(Boolean))];
  if (uniqueIds.length === 0) return new Map();

  const { data, error } = await supabase
    .from("applications")
    .select("id, responses, students:student_id(first_name, last_name)")
    .in("id", uniqueIds);

  if (error) throw error;

  const labels = new Map<string, string | null>();
  for (const row of data ?? []) {
    const student = row.students as
      | { first_name?: string; last_name?: string }
      | { first_name?: string; last_name?: string }[]
      | null;
    const studentRow = Array.isArray(student) ? student[0] : student;
    const fromStudent =
      studentRow?.first_name || studentRow?.last_name
        ? [studentRow.first_name, studentRow.last_name]
            .filter(Boolean)
            .join(" ")
            .trim()
        : null;
    const fromResponses = extractStudentLabel(parseStringRecord(row.responses));
    labels.set(String(row.id), fromStudent ?? fromResponses ?? null);
  }

  return labels;
}

function resolveParentNotificationLink(
  slug: string,
  action: string,
  event: ActivityEventForNotification,
  options?: {
    parentNavBasePath?: string;
    applyBasePath?: string;
    applicationId?: string | null;
    chargeId?: string | null;
    bulletinPostId?: string | null;
    eventId?: string | null;
  },
): { href: string; ctaLabel: string } {
  const parentBase = resolveParentNavBasePath(slug, options?.parentNavBasePath);
  const applyBase = resolveApplyBasePath(slug, options?.applyBasePath);

  if (action === ACTIVITY_ACTIONS.MESSAGES_RECEIVED) {
    const threadId = metadataString(event.metadata, "threadId");
    return {
      href: threadId
        ? `${parentBase}/messages?thread=${threadId}`
        : `${parentBase}/messages`,
      ctaLabel: "View message",
    };
  }

  if (action.startsWith("tuition.")) {
    const chargeId =
      options?.chargeId ??
      (event.entity_type === "tuition_charge" ? event.entity_id : null);
    return {
      href: chargeId
        ? `${parentBase}/billing?charge=${chargeId}`
        : `${parentBase}/billing`,
      ctaLabel: "View billing",
    };
  }

  if (action.startsWith("committee.")) {
    return {
      href: `${parentBase}/committees`,
      ctaLabel: "View committees",
    };
  }

  if (
    action === ACTIVITY_ACTIONS.CLASSROOM_SIGNUP_PUBLISHED ||
    action === ACTIVITY_ACTIONS.CLASSROOM_SIGNUP_CLOSED
  ) {
    const signupId =
      metadataString(event.metadata, "signupId") ?? event.entity_id;
    return {
      href: signupId
        ? `${parentBase}/classroom_signups/${signupId}`
        : `${parentBase}/classroom_signups`,
      ctaLabel: "View signup",
    };
  }

  if (action === SYNTHETIC_BULLETIN_ACTION) {
    return {
      href: parentBase,
      ctaLabel: "View announcement",
    };
  }

  if (action === SYNTHETIC_EVENT_ACTION) {
    return {
      href: `${parentBase}/calendar`,
      ctaLabel: "View calendar",
    };
  }

  if (options?.applicationId) {
    if (
      action.startsWith("enrollment.") ||
      action === ACTIVITY_ACTIONS.ENROLLMENT_COMPLETED
    ) {
      return {
        href: `${applyBase}/${options.applicationId}/enrollment`,
        ctaLabel: "View enrollment",
      };
    }
    return {
      href: `${applyBase}/${options.applicationId}`,
      ctaLabel: "View application",
    };
  }

  return {
    href: parentBase,
    ctaLabel: "View",
  };
}

async function fetchBulletinNotifications(
  supabase: SupabaseClient,
  organizationId: string,
  slug: string,
  rangeStart: Date,
  bulletinScope: BulletinViewerScope,
  parentNavBasePath?: string,
  pageFetch?: PageFetchOptions,
): Promise<ParentActivityNotification[]> {
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
    bulletinScope,
  );

  const notifications = posts.map((post: BulletinPost) => ({
    id: `bulletin:${post.id}`,
    action: SYNTHETIC_BULLETIN_ACTION,
    title: formatNotificationTitle(SYNTHETIC_BULLETIN_ACTION),
    summary: post.title,
    detail: formatParentNotificationDetail(SYNTHETIC_BULLETIN_ACTION, post.title, {
      bulletinTitle: post.title,
    }),
    createdAt: post.publishedAt ?? post.createdAt,
    ...resolveParentNotificationLink(slug, SYNTHETIC_BULLETIN_ACTION, {
      id: post.id,
      action: SYNTHETIC_BULLETIN_ACTION,
      entity_type: "bulletin_post",
      entity_id: post.id,
      summary: post.title,
      metadata: { postId: post.id },
      created_at: post.publishedAt ?? post.createdAt,
    }, { parentNavBasePath, bulletinPostId: post.id }),
    category: "announcements" as const,
  }));

  return pageFetch ? capNotificationsForPage(notifications, pageFetch) : notifications;
}

async function fetchCalendarNotifications(
  supabase: SupabaseClient,
  organizationId: string,
  slug: string,
  rangeStart: Date,
  audienceScope?: OrganizationEventAudienceScope,
  parentNavBasePath?: string,
  pageFetch?: PageFetchOptions,
): Promise<ParentActivityNotification[]> {
  let query = supabase
    .from("organization_events")
    .select("*")
    .eq("organization_id", organizationId)
    .gte("created_at", rangeStart.toISOString())
    .order("created_at", { ascending: false });

  if (audienceScope?.mode === "main_portal") {
    query = query.is("program_id", null);
  } else if (audienceScope?.mode === "program_portal") {
    query = query.eq("program_id", audienceScope.programId);
  }

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
    return {
      id: `event:${event.id}`,
      action: SYNTHETIC_EVENT_ACTION,
      title: formatNotificationTitle(SYNTHETIC_EVENT_ACTION),
      summary: event.title,
      detail: formatParentNotificationDetail(SYNTHETIC_EVENT_ACTION, event.title, {
        eventTitle: event.title,
      }),
      createdAt,
      ...resolveParentNotificationLink(
        slug,
        SYNTHETIC_EVENT_ACTION,
        {
          id: event.id,
          action: SYNTHETIC_EVENT_ACTION,
          entity_type: "organization_event",
          entity_id: event.id,
          summary: event.title,
          metadata: { eventId: event.id },
          created_at: createdAt,
        },
        { parentNavBasePath, eventId: event.id },
      ),
      category: "events" as const,
    };
  });

  return pageFetch ? capNotificationsForPage(notifications, pageFetch) : notifications;
}

function mapActivityEventToParentNotification(
  event: ActivityEventForNotification & {
    actor_type?: string | null;
    surface?: string | null;
  },
  slug: string,
  applicationId: string | null,
  studentLabel: string | null,
  options?: Pick<
    ParentNotificationFetchOptions,
    "parentNavBasePath" | "applyBasePath"
  >,
): ParentActivityNotification {
  const committeeName = metadataString(event.metadata, "committeeName");
  const signupTitle = metadataString(event.metadata, "signupTitle");
  const amountCents = metadataNumber(event.metadata, "amountCents");
  const amountLabel =
    amountCents != null && amountCents > 0 ? formatCents(amountCents) : null;
  const chargeId =
    event.entity_type === "tuition_charge" ? event.entity_id : null;

  const link = resolveParentNotificationLink(slug, event.action, event, {
    parentNavBasePath: options?.parentNavBasePath,
    applyBasePath: options?.applyBasePath,
    applicationId,
    chargeId,
  });

  return {
    id: event.id,
    action: event.action,
    title: formatNotificationTitle(event.action),
    summary: event.summary,
    detail: formatParentNotificationDetail(event.action, event.summary, {
      studentLabel,
      committeeName,
      signupTitle,
      amountLabel,
    }),
    createdAt: event.created_at,
    href: link.href,
    ctaLabel: link.ctaLabel,
    category: getParentActivityNotificationCategory(event.action),
  };
}

async function filterRawActivityEventsForFamily(
  supabase: SupabaseClient,
  organizationId: string,
  familyId: string,
  rawEvents: ActivityEventForNotification[],
): Promise<ActivityEventForNotification[]> {
  const familyByEventId = await resolveFamilyIdsForEvents(
    supabase,
    organizationId,
    rawEvents,
  );
  const guardianUserIds = await fetchFamilyGuardianUserIds(supabase, familyId);

  return rawEvents.filter((event) => {
    if (shouldExcludeParentActorEvent(event)) return false;

    const eventFamilyId = familyByEventId.get(event.id);
    if (isOrgWideParentNotificationAction(event.action)) {
      return true;
    }
    if (eventFamilyId !== familyId) return false;

    if (event.action === ACTIVITY_ACTIONS.MESSAGES_RECEIVED) {
      const senderUserId = metadataString(event.metadata, "senderUserId");
      if (senderUserId && guardianUserIds.has(senderUserId)) {
        return false;
      }
    }

    return true;
  });
}

function applyActivityEventSinceBound<
  T extends {
    gte: (column: string, value: string) => T;
    gt: (column: string, value: string) => T;
  },
>(query: T, sinceBound: NotificationSinceBound): T {
  if (sinceBound.exclusive) {
    return query.gt("created_at", sinceBound.since.toISOString());
  }

  return query.gte("created_at", sinceBound.since.toISOString());
}

async function countActivityNotificationsForFamily(
  supabase: SupabaseClient,
  organizationId: string,
  familyId: string,
  sinceBound: NotificationSinceBound,
  lastReadAt: string | null,
  rangeStart: Date,
  remainingCap: number,
  seenIds?: Set<string>,
): Promise<number> {
  if (remainingCap <= 0) return 0;

  let count = 0;
  let batchCursor: NotificationPageCursor | null = null;
  let batches = 0;

  while (count < remainingCap && batches < MAX_ACTIVITY_NOTIFICATION_BATCHES) {
    batches += 1;

    let query = applyActivityEventSinceBound(
      supabase
        .from("activity_events")
        .select(
          "id, action, entity_type, entity_id, summary, metadata, created_at, actor_type, actor_user_id, surface",
        )
        .eq("organization_id", organizationId)
        .in("action", [...PARENT_NOTIFICATION_ACTIONS]),
      sinceBound,
    )
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
    const filteredEvents = await filterRawActivityEventsForFamily(
      supabase,
      organizationId,
      familyId,
      rawEvents,
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

async function fetchActivityNotificationsForPage(
  supabase: SupabaseClient,
  organizationId: string,
  slug: string,
  familyId: string,
  rangeStart: Date,
  fetchOptions: Pick<
    ParentNotificationFetchOptions,
    "parentNavBasePath" | "applyBasePath"
  >,
  pageFetch: PageFetchOptions,
): Promise<ParentActivityNotification[]> {
  const targetCount = pageFetch.limit + 1;
  const collected: ParentActivityNotification[] = [];
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
      .in("action", [...PARENT_NOTIFICATION_ACTIONS])
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

    const filteredEvents = await filterRawActivityEventsForFamily(
      supabase,
      organizationId,
      familyId,
      rawEvents,
    );

    const applicationIdByEventId = await resolveApplicationIdsForEvents(
      supabase,
      filteredEvents,
    );
    const applicationIds = [
      ...new Set(
        [...applicationIdByEventId.values()].filter(
          (value): value is string => Boolean(value),
        ),
      ),
    ];
    const studentLabels = await fetchApplicationStudentLabels(
      supabase,
      applicationIds,
    );

    collected.push(
      ...filteredEvents.map((event) =>
        mapActivityEventToParentNotification(
          event,
          slug,
          applicationIdByEventId.get(event.id) ?? null,
          applicationIdByEventId.get(event.id)
            ? studentLabels.get(applicationIdByEventId.get(event.id)!) ?? null
            : null,
          fetchOptions,
        ),
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

async function buildParentActivityNotificationsPageForContext(
  supabase: SupabaseClient,
  organizationId: string,
  familyId: string,
  context: ParentNotificationContext,
  pageFetch: PageFetchOptions,
  options?: ParentNotificationFetchOptions,
): Promise<ParentActivityNotificationsPage> {
  const days = options?.days ?? DEFAULT_NOTIFICATION_DAYS;
  const rangeStart = getActivityNotificationRangeStart(days);
  const slug = context.slug;
  const fetchOptions: Pick<
    ParentNotificationFetchOptions,
    "parentNavBasePath" | "applyBasePath"
  > = {
    parentNavBasePath: context.parentNavBasePath,
    applyBasePath: context.applyBasePath,
  };

  const activityPromise = fetchActivityNotificationsForPage(
    supabase,
    organizationId,
    slug,
    familyId,
    rangeStart,
    fetchOptions,
    pageFetch,
  );

  if (context.mode === "program") {
    const [activityNotifications, bulletinNotifications, calendarNotifications, coopNotifications] =
      await Promise.all([
        activityPromise,
        fetchBulletinNotifications(
          supabase,
          organizationId,
          slug,
          rangeStart,
          parentProgramPortalBulletinScope(context.programId),
          context.parentNavBasePath,
          pageFetch,
        ),
        fetchCalendarNotifications(
          supabase,
          organizationId,
          slug,
          rangeStart,
          programPortalAudienceScope(context.programId),
          context.parentNavBasePath,
          pageFetch,
        ),
        fetchCoopProgramNotifications(
          supabase,
          organizationId,
          context,
          familyId,
          rangeStart,
          pageFetch,
        ),
      ]);

    return finalizeNotificationPage(
      [
        ...activityNotifications,
        ...bulletinNotifications,
        ...calendarNotifications,
        ...coopNotifications,
      ],
      pageFetch.limit,
    );
  }

  const coopProgramContexts = await listCoopProgramContextsForMainPortal(
    supabase,
    organizationId,
    slug,
    familyId,
    context.applyBasePath,
    context.parentNavBasePath === schoolParentRootPath(slug)
      ? undefined
      : context.parentNavBasePath,
  );

  const calendarPromises = [
    fetchCalendarNotifications(
      supabase,
      organizationId,
      slug,
      rangeStart,
      mainPortalAudienceScope(),
      context.parentNavBasePath,
      pageFetch,
    ),
    ...coopProgramContexts.map((programContext) =>
      fetchCalendarNotifications(
        supabase,
        organizationId,
        slug,
        rangeStart,
        programPortalAudienceScope(programContext.programId),
        programContext.parentNavBasePath,
        pageFetch,
      ),
    ),
  ];

  const coopNotificationsPromise = Promise.all(
    coopProgramContexts.map((programContext) =>
      fetchCoopProgramNotifications(
        supabase,
        organizationId,
        programContext,
        familyId,
        rangeStart,
        pageFetch,
      ),
    ),
  );

  const [activityNotifications, bulletinNotifications, coopNotifications, ...calendarResults] =
    await Promise.all([
      activityPromise,
      fetchBulletinNotifications(
        supabase,
        organizationId,
        slug,
        rangeStart,
        options?.bulletinScope ?? parentMainPortalBulletinScope(),
        context.parentNavBasePath,
        pageFetch,
      ),
      coopNotificationsPromise,
      ...calendarPromises,
    ]);

  return finalizeNotificationPage(
    [
      ...activityNotifications,
      ...bulletinNotifications,
      ...calendarResults.flat(),
      ...coopNotifications.flat(),
    ],
    pageFetch.limit,
  );
}

async function countUnreadParentActivityNotificationsForContext(
  supabase: SupabaseClient,
  organizationId: string,
  familyId: string,
  context: ParentNotificationContext,
  lastReadAt: string | null,
  rangeStart: Date,
  options?: ParentNotificationCountOptions,
  remainingCap: number = MAX_UNREAD_BADGE_COUNT,
  seenIds?: Set<string>,
): Promise<number> {
  if (remainingCap <= 0) return 0;

  const sinceBound = resolveNotificationSince(lastReadAt, rangeStart);
  const slug = context.slug;
  const pageFetch: PageFetchOptions = {
    limit: remainingCap,
    cursor: null,
  };

  let total = await countActivityNotificationsForFamily(
    supabase,
    organizationId,
    familyId,
    sinceBound,
    lastReadAt,
    rangeStart,
    remainingCap,
    seenIds,
  );
  if (total >= remainingCap) return total;

  const countFetchedNotifications = (
    notifications: ParentActivityNotification[],
  ): number => {
    const added = countUnreadFromNotifications(
      notifications,
      lastReadAt,
      rangeStart,
      remainingCap - total,
      seenIds,
    );
    total += added;
    return added;
  };

  if (context.mode === "program") {
    const [bulletinNotifications, calendarNotifications, coopNotifications] =
      await Promise.all([
        fetchBulletinNotifications(
          supabase,
          organizationId,
          slug,
          sinceBound.since,
          parentProgramPortalBulletinScope(context.programId),
          context.parentNavBasePath,
          pageFetch,
        ),
        fetchCalendarNotifications(
          supabase,
          organizationId,
          slug,
          sinceBound.since,
          programPortalAudienceScope(context.programId),
          context.parentNavBasePath,
          pageFetch,
        ),
        fetchCoopProgramNotifications(
          supabase,
          organizationId,
          context,
          familyId,
          sinceBound.since,
          pageFetch,
        ),
      ]);

    countFetchedNotifications(bulletinNotifications);
    if (total >= remainingCap) return remainingCap;
    countFetchedNotifications(calendarNotifications);
    if (total >= remainingCap) return remainingCap;
    countFetchedNotifications(coopNotifications);
    return Math.min(total, remainingCap);
  }

  const coopProgramContexts = await listCoopProgramContextsForMainPortal(
    supabase,
    organizationId,
    slug,
    familyId,
    context.applyBasePath,
    context.parentNavBasePath === schoolParentRootPath(slug)
      ? undefined
      : context.parentNavBasePath,
  );

  const calendarPromises = [
    fetchCalendarNotifications(
      supabase,
      organizationId,
      slug,
      sinceBound.since,
      mainPortalAudienceScope(),
      context.parentNavBasePath,
      pageFetch,
    ),
    ...coopProgramContexts.map((programContext) =>
      fetchCalendarNotifications(
        supabase,
        organizationId,
        slug,
        sinceBound.since,
        programPortalAudienceScope(programContext.programId),
        programContext.parentNavBasePath,
        pageFetch,
      ),
    ),
  ];

  const coopNotificationsPromise = Promise.all(
    coopProgramContexts.map((programContext) =>
      fetchCoopProgramNotifications(
        supabase,
        organizationId,
        programContext,
        familyId,
        sinceBound.since,
        pageFetch,
      ),
    ),
  );

  const [bulletinNotifications, coopNotifications, ...calendarResults] =
    await Promise.all([
      fetchBulletinNotifications(
        supabase,
        organizationId,
        slug,
        sinceBound.since,
        options?.bulletinScope ?? parentMainPortalBulletinScope(),
        context.parentNavBasePath,
        pageFetch,
      ),
      coopNotificationsPromise,
      ...calendarPromises,
    ]);

  countFetchedNotifications(bulletinNotifications);
  if (total >= remainingCap) return remainingCap;

  for (const calendarNotifications of calendarResults) {
    countFetchedNotifications(calendarNotifications);
    if (total >= remainingCap) return remainingCap;
  }

  for (const coopNotificationsForProgram of coopNotifications) {
    countFetchedNotifications(coopNotificationsForProgram);
    if (total >= remainingCap) return remainingCap;
  }

  return Math.min(total, remainingCap);
}

async function listCoopProgramContextsForMainPortal(
  supabase: SupabaseClient,
  organizationId: string,
  slug: string,
  familyId: string,
  applyBasePath: string,
  previewParentBasePath?: string,
): Promise<Array<Extract<ParentNotificationContext, { mode: "program" }>>> {
  const enrolledPrograms = await listEnrolledProgramsForFamily(
    supabase,
    organizationId,
    familyId,
  );

  return enrolledPrograms
    .filter((program) =>
      isProgramParentPortalCoopMode(program.parent_portal_settings),
    )
    .map((program) => ({
      mode: "program" as const,
      slug,
      programId: program.id,
      programSlug: program.portal_slug,
      parentNavBasePath: previewParentBasePath
        ? `${previewParentBasePath}/p/${program.portal_slug}`
        : `/school/${slug}/parent/p/${program.portal_slug}`,
      applyBasePath,
      coopModeEnabled: true,
    }));
}

function mergeNotificationsById(
  notifications: ParentActivityNotification[],
): ParentActivityNotification[] {
  const seen = new Set<string>();
  const merged: ParentActivityNotification[] = [];

  for (const notification of notifications) {
    if (seen.has(notification.id)) continue;
    seen.add(notification.id);
    merged.push(notification);
  }

  return merged.sort(
    (left, right) =>
      new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
  );
}

function resolveNotificationContext(
  slug: string,
  options?: ParentNotificationFetchOptions,
): ParentNotificationContext {
  if (options?.notificationContext) {
    return options.notificationContext;
  }

  return buildMainParentNotificationContext(slug, {
    parentNavBasePath: options?.parentNavBasePath,
    applyBasePath: options?.applyBasePath,
  });
}

async function fetchAggregatedParentActivityNotifications(
  supabase: SupabaseClient,
  organizationId: string,
  slug: string,
  familyId: string,
  pageFetch: PageFetchOptions,
  options?: ParentNotificationFetchOptions,
): Promise<ParentActivityNotificationsPage> {
  const contexts = await resolveParentNotificationContexts(supabase, {
    organizationId,
    slug,
    familyId,
    applyBasePath: options?.applyBasePath,
    previewParentBasePath:
      options?.parentNavBasePath &&
      options.parentNavBasePath !== schoolParentRootPath(slug)
        ? options.parentNavBasePath
        : undefined,
  });

  const contextList =
    contexts.length > 0
      ? contexts
      : [resolveNotificationContext(slug, options)];

  const pages = await Promise.all(
    contextList.map((context) =>
      buildParentActivityNotificationsPageForContext(
        supabase,
        organizationId,
        familyId,
        context,
        pageFetch,
        options,
      ),
    ),
  );

  return finalizeNotificationPage(
    mergeNotificationsById(pages.flatMap((page) => page.notifications)),
    pageFetch.limit,
  );
}

export async function fetchParentActivityNotifications(
  supabase: SupabaseClient,
  organizationId: string,
  slug: string,
  familyId: string,
  options?: ParentNotificationFetchOptions,
): Promise<ParentActivityNotificationsPage> {
  const requestedLimit = options?.limit ?? DEFAULT_NOTIFICATION_PAGE_SIZE;
  const limit = Math.min(
    Math.max(requestedLimit, 1),
    MAX_NOTIFICATION_PAGE_SIZE,
  );
  const pageFetch: PageFetchOptions = {
    limit,
    cursor: parseNotificationPageCursor(options?.cursor),
  };

  if (options?.aggregateAllContexts) {
    return fetchAggregatedParentActivityNotifications(
      supabase,
      organizationId,
      slug,
      familyId,
      pageFetch,
      options,
    );
  }

  const context = resolveNotificationContext(slug, options);
  return buildParentActivityNotificationsPageForContext(
    supabase,
    organizationId,
    familyId,
    context,
    pageFetch,
    options,
  );
}

export async function getParentActivityNotificationReadWatermark(
  supabase: SupabaseClient,
  userId: string,
  organizationId: string,
): Promise<string | null> {
  const { data, error } = await supabase
    .from("parent_activity_notification_reads")
    .select("last_read_at")
    .eq("user_id", userId)
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (error) throw error;
  return data?.last_read_at ? String(data.last_read_at) : null;
}

export async function markParentActivityNotificationsRead(
  supabase: SupabaseClient,
  userId: string,
  organizationId: string,
  readAt: Date = new Date(),
): Promise<string> {
  const lastReadAt = readAt.toISOString();
  const { data, error } = await supabase
    .from("parent_activity_notification_reads")
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

export async function countUnreadParentActivityNotifications(
  supabase: SupabaseClient,
  organizationId: string,
  slug: string,
  familyId: string,
  lastReadAt: string | null,
  options?: Pick<
    ParentNotificationFetchOptions,
    | "days"
    | "parentNavBasePath"
    | "applyBasePath"
    | "bulletinScope"
    | "eventAudienceScope"
    | "notificationContext"
    | "aggregateAllContexts"
  >,
): Promise<number> {
  const days = options?.days ?? DEFAULT_NOTIFICATION_DAYS;
  const rangeStart = getActivityNotificationRangeStart(days);

  if (options?.aggregateAllContexts) {
    const contexts = await resolveParentNotificationContexts(supabase, {
      organizationId,
      slug,
      familyId,
      applyBasePath: options.applyBasePath,
      previewParentBasePath:
        options.parentNavBasePath &&
        options.parentNavBasePath !== schoolParentRootPath(slug)
          ? options.parentNavBasePath
          : undefined,
    });

    const contextList =
      contexts.length > 0
        ? contexts
        : [resolveNotificationContext(slug, options)];

    const seenIds = new Set<string>();
    let total = 0;

    for (const context of contextList) {
      const added = await countUnreadParentActivityNotificationsForContext(
        supabase,
        organizationId,
        familyId,
        context,
        lastReadAt,
        rangeStart,
        options,
        MAX_UNREAD_BADGE_COUNT - total,
        seenIds,
      );
      total += added;
      if (total >= MAX_UNREAD_BADGE_COUNT) {
        return MAX_UNREAD_BADGE_COUNT;
      }
    }

    return total;
  }

  const context =
    options?.notificationContext ?? resolveNotificationContext(slug, options);

  return countUnreadParentActivityNotificationsForContext(
    supabase,
    organizationId,
    familyId,
    context,
    lastReadAt,
    rangeStart,
    options,
    MAX_UNREAD_BADGE_COUNT,
  );
}

export async function fetchUnreadParentActivityNotificationCount(
  supabase: SupabaseClient,
  userId: string,
  organizationId: string,
  slug: string,
  familyId: string,
  options?: Pick<
    ParentNotificationFetchOptions,
    | "days"
    | "parentNavBasePath"
    | "applyBasePath"
    | "bulletinScope"
    | "eventAudienceScope"
    | "notificationContext"
    | "aggregateAllContexts"
  >,
): Promise<number> {
  const lastReadAt = await getParentActivityNotificationReadWatermark(
    supabase,
    userId,
    organizationId,
  );
  return countUnreadParentActivityNotifications(
    supabase,
    organizationId,
    slug,
    familyId,
    lastReadAt,
    options,
  );
}

export async function getPrimaryGuardianUserIdForFamily(
  supabase: SupabaseClient,
  familyId: string,
  organizationId: string,
): Promise<string | null> {
  const { data, error } = await supabase
    .from("guardians")
    .select("user_id")
    .eq("family_id", familyId)
    .eq("organization_id", organizationId)
    .not("user_id", "is", null)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data?.user_id ? String(data.user_id) : null;
}
