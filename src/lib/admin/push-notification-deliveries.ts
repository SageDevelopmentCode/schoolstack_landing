import type { SupabaseClient } from "@supabase/supabase-js";
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
};

export type AdminPushNotificationsPage = {
  deliveries: AdminPushNotificationDelivery[];
  nextCursor: string | null;
  hasMore: boolean;
};

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 50;

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

function mapDeliveryRow(
  row: Record<string, unknown>,
  organizationSlug: string,
): AdminPushNotificationDelivery {
  const recipientPortal = String(row.recipient_portal) as
    | "parent"
    | "teacher"
    | "admin";
  const threadId = row.thread_id ? String(row.thread_id) : null;

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
    messageHref: buildMessageHref(organizationSlug, recipientPortal, threadId),
  };
}

export async function fetchAdminPushNotificationDeliveries(
  admin: SupabaseClient,
  organizationId: string,
  organizationSlug: string,
  options?: { limit?: number; cursor?: string | null },
): Promise<AdminPushNotificationsPage> {
  const requestedLimit = options?.limit ?? DEFAULT_PAGE_SIZE;
  const limit = Math.min(Math.max(requestedLimit, 1), MAX_PAGE_SIZE);

  let query = admin
    .from("push_notification_deliveries")
    .select(
      "id, created_at, status, title, body, recipient_portal, recipient_email, recipient_user_id, thread_id, error_message",
    )
    .eq("organization_id", organizationId)
    .eq("channel", "expo_push")
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
