import type { SupabaseClient } from "@supabase/supabase-js";
import type { ActivityDatePreset } from "@/lib/activity-log";
import { getActivityDateRangeStart } from "@/lib/activity-log";
import type { MobilePushNotificationKind } from "@/lib/notifications/mobile-push-catalog";
import type { PushDeliveryStatus } from "@/lib/notifications/push-notification-deliveries";

export type AdminPushNotificationDelivery = {
  id: string;
  createdAt: string;
  status: PushDeliveryStatus;
  title: string;
  body: string;
  recipientPortal: "parent" | "teacher" | "admin";
  recipientEmail: string | null;
  recipientUserId: string;
  threadId: string | null;
  errorMessage: string | null;
  messageHref: string | null;
  notificationKind: MobilePushNotificationKind | null;
  organizationId: string | null;
  organizationName: string | null;
  organizationSlug: string | null;
};

export type AdminPushNotificationsPage = {
  deliveries: AdminPushNotificationDelivery[];
  nextCursor: string | null;
  hasMore: boolean;
};

export type AdminPushDeliveryFetchOptions = {
  limit?: number;
  cursor?: string | null;
  recipientUserId?: string | null;
  notificationKind?: MobilePushNotificationKind | null;
  datePreset?: ActivityDatePreset;
  recipientPortal?: "parent" | "teacher" | "admin" | null;
};

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 50;

const DELIVERY_SELECT_ORG =
  "id, created_at, status, title, body, recipient_portal, recipient_email, recipient_user_id, thread_id, error_message, notification_kind";

const DELIVERY_SELECT_GLOBAL = `${DELIVERY_SELECT_ORG}, organization_id, organizations(name, slug)`;

export function encodePushNotificationCursor(
  createdAt: string,
  id: string,
): string {
  return `${createdAt}|${id}`;
}

export function decodePushNotificationCursor(
  cursor: string,
): { createdAt: string; id: string } | null {
  const separatorIndex = cursor.indexOf("|");
  if (separatorIndex <= 0) return null;

  const createdAt = cursor.slice(0, separatorIndex);
  const id = cursor.slice(separatorIndex + 1);
  if (!createdAt || !id) return null;

  return { createdAt, id };
}

function buildMessageHref(
  organizationSlug: string,
  recipientPortal: AdminPushNotificationDelivery["recipientPortal"],
  threadId: string | null,
): string | null {
  if (!threadId) return null;

  return `/school/${organizationSlug}/${recipientPortal}/messages?thread=${encodeURIComponent(threadId)}`;
}

function parseOrganizationFromRow(
  row: Record<string, unknown>,
  fallbackSlug: string | null,
): { organizationId: string | null; organizationName: string | null; organizationSlug: string | null } {
  const orgRaw = row.organizations;
  if (orgRaw && typeof orgRaw === "object" && !Array.isArray(orgRaw)) {
    const org = orgRaw as Record<string, unknown>;
    return {
      organizationId: row.organization_id ? String(row.organization_id) : null,
      organizationName: typeof org.name === "string" ? org.name : null,
      organizationSlug: typeof org.slug === "string" ? org.slug : null,
    };
  }

  return {
    organizationId: row.organization_id ? String(row.organization_id) : null,
    organizationName: null,
    organizationSlug: fallbackSlug,
  };
}

function mapDeliveryRow(
  row: Record<string, unknown>,
  fallbackSlug: string | null,
): AdminPushNotificationDelivery {
  const recipientPortal = String(row.recipient_portal) as
    | "parent"
    | "teacher"
    | "admin";
  const threadId = row.thread_id ? String(row.thread_id) : null;
  const org = parseOrganizationFromRow(row, fallbackSlug);
  const organizationSlug = org.organizationSlug ?? fallbackSlug ?? "";

  return {
    id: String(row.id),
    createdAt: String(row.created_at),
    status: String(row.status) as PushDeliveryStatus,
    title: String(row.title),
    body: String(row.body),
    recipientPortal,
    recipientEmail:
      typeof row.recipient_email === "string" ? row.recipient_email : null,
    recipientUserId: String(row.recipient_user_id),
    threadId,
    errorMessage:
      typeof row.error_message === "string" ? row.error_message : null,
    messageHref: organizationSlug
      ? buildMessageHref(organizationSlug, recipientPortal, threadId)
      : null,
    notificationKind:
      typeof row.notification_kind === "string"
        ? (row.notification_kind as MobilePushNotificationKind)
        : null,
    organizationId: org.organizationId,
    organizationName: org.organizationName,
    organizationSlug: org.organizationSlug ?? fallbackSlug,
  };
}

function applyDeliveryFilters<
  T extends {
    eq: (column: string, value: string) => T;
    gte: (column: string, value: string) => T;
  },
>(
  query: T,
  options: AdminPushDeliveryFetchOptions | undefined,
): T {
  let next = query;

  if (options?.recipientUserId) {
    next = next.eq("recipient_user_id", options.recipientUserId);
  }

  if (options?.notificationKind) {
    next = next.eq("notification_kind", options.notificationKind);
  }

  if (options?.recipientPortal) {
    next = next.eq("recipient_portal", options.recipientPortal);
  }

  if (options?.datePreset) {
    const rangeStart = getActivityDateRangeStart(options.datePreset);
    if (rangeStart) {
      next = next.gte("created_at", rangeStart);
    }
  }

  return next;
}

export async function fetchAdminPushNotificationDeliveries(
  admin: SupabaseClient,
  organizationId: string,
  organizationSlug: string,
  options?: AdminPushDeliveryFetchOptions,
): Promise<AdminPushNotificationsPage> {
  const requestedLimit = options?.limit ?? DEFAULT_PAGE_SIZE;
  const limit = Math.min(Math.max(requestedLimit, 1), MAX_PAGE_SIZE);

  let query = admin
    .from("push_notification_deliveries")
    .select(DELIVERY_SELECT_ORG)
    .eq("organization_id", organizationId)
    .eq("channel", "expo_push");

  query = applyDeliveryFilters(query, options);

  query = query
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(limit + 1);

  const decodedCursor = options?.cursor
    ? decodePushNotificationCursor(options.cursor)
    : null;
  if (decodedCursor) {
    query = query.or(
      `created_at.lt.${decodedCursor.createdAt},and(created_at.eq.${decodedCursor.createdAt},id.lt.${decodedCursor.id})`,
    );
  }

  const { data, error } = await query;
  if (error) throw error;

  const rows = (data ?? []) as Record<string, unknown>[];
  const hasMore = rows.length > limit;
  const pageRows = hasMore ? rows.slice(0, limit) : rows;
  const lastRow = pageRows.at(-1);

  return {
    deliveries: pageRows.map((row) => mapDeliveryRow(row, organizationSlug)),
    nextCursor:
      hasMore && lastRow
        ? encodePushNotificationCursor(String(lastRow.created_at), String(lastRow.id))
        : null,
    hasMore,
  };
}

export async function fetchAdminPushNotificationDeliveriesGlobal(
  admin: SupabaseClient,
  options: AdminPushDeliveryFetchOptions & {
    organizationId?: string | null;
    organizationSlug?: string | null;
  },
): Promise<AdminPushNotificationsPage> {
  const requestedLimit = options.limit ?? DEFAULT_PAGE_SIZE;
  const limit = Math.min(Math.max(requestedLimit, 1), MAX_PAGE_SIZE);

  let query = admin
    .from("push_notification_deliveries")
    .select(DELIVERY_SELECT_GLOBAL)
    .eq("channel", "expo_push");

  if (options.organizationId) {
    query = query.eq("organization_id", options.organizationId);
  }

  query = applyDeliveryFilters(query, options);

  query = query
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(limit + 1);

  const decodedCursor = options.cursor
    ? decodePushNotificationCursor(options.cursor)
    : null;
  if (decodedCursor) {
    query = query.or(
      `created_at.lt.${decodedCursor.createdAt},and(created_at.eq.${decodedCursor.createdAt},id.lt.${decodedCursor.id})`,
    );
  }

  const { data, error } = await query;
  if (error) throw error;

  const rows = (data ?? []) as Record<string, unknown>[];
  const hasMore = rows.length > limit;
  const pageRows = hasMore ? rows.slice(0, limit) : rows;
  const lastRow = pageRows.at(-1);
  const fallbackSlug = options.organizationSlug ?? null;

  return {
    deliveries: pageRows.map((row) => mapDeliveryRow(row, fallbackSlug)),
    nextCursor:
      hasMore && lastRow
        ? encodePushNotificationCursor(String(lastRow.created_at), String(lastRow.id))
        : null,
    hasMore,
  };
}
