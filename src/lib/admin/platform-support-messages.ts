import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { PortalRouteError } from "@/lib/api/portal-route-errors";
import { logNotificationFailure } from "@/lib/admissions/notification-logging";
import { PORTAL_MESSAGE_DELETED_PREVIEW } from "@/lib/messages/constants";
import { dispatchMessageNotifications } from "@/lib/messages/message-notifications";
import { postPortalMessage } from "@/lib/messages/messages";
import type { ParticipantDisplayContext, PortalMessageRow } from "@/lib/messages/mappers";
import { threadHasPlatformSupport } from "@/lib/messages/platform-support";
import { mapThreadUnreadCountRows } from "@/lib/messages/thread-list-helpers";
import { getThreadDetail, markThreadRead } from "@/lib/messages/threads";
import type { MessageThreadDetail, PortalMessage } from "@/lib/messages/types";
import type { PlatformSupportConversation } from "@/lib/admin/platform-support-types";

export type { PlatformSupportConversation };

const SUPPORT_CONVERSATION_LIMIT = 200;
const ID_CHUNK_SIZE = 80;

type ThreadListRow = {
  id: string;
  organization_id: string;
  last_message_at: string | null;
};

function chunkIds(ids: string[]): string[][] {
  const chunks: string[][] = [];
  for (let index = 0; index < ids.length; index += ID_CHUNK_SIZE) {
    chunks.push(ids.slice(index, index + ID_CHUNK_SIZE));
  }
  return chunks;
}

function messagePreview(row: PortalMessageRow | undefined): string | null {
  if (!row) return null;
  if (row.deleted_at) return PORTAL_MESSAGE_DELETED_PREVIEW;
  const body = row.body.trim();
  return body || "Attachment";
}

function emptyDisplayContext(
  userId: string,
  schoolOfficeLabel: string,
): ParticipantDisplayContext {
  return {
    families: new Map(),
    staffMembers: new Map(),
    guardians: new Map(),
    familyPrimaryGuardianIds: new Map(),
    familyFirstGuardianIds: new Map(),
    familyEnrolledStudents: new Map(),
    schoolOfficeLabel,
    currentUserId: userId,
  };
}

async function listPlatformSupportThreadIds(admin: SupabaseClient): Promise<string[]> {
  const { data, error } = await admin
    .from("message_thread_participants")
    .select("thread_id")
    .eq("participant_kind", "platform_support");

  if (error) throw new Error(error.message);
  return [...new Set((data ?? []).map((row) => String(row.thread_id)))];
}

async function assertPlatformSupportThread(
  admin: SupabaseClient,
  threadId: string,
): Promise<{ organizationId: string; organizationName: string; organizationSlug: string }> {
  const { data: participants, error } = await admin
    .from("message_thread_participants")
    .select("participant_kind, organization_id")
    .eq("thread_id", threadId);

  if (error) throw new Error(error.message);

  const rows = participants ?? [];
  if (!threadHasPlatformSupport(rows.map((row) => ({ kind: String(row.participant_kind) })))) {
    throw new PortalRouteError("Support conversation not found.", 404, "not_found");
  }

  const organizationId = rows[0]?.organization_id ? String(rows[0].organization_id) : "";
  if (!organizationId) {
    throw new PortalRouteError("Support conversation not found.", 404, "not_found");
  }

  const { data: organization, error: organizationError } = await admin
    .from("organizations")
    .select("id, name, slug")
    .eq("id", organizationId)
    .maybeSingle();

  if (organizationError) throw new Error(organizationError.message);
  if (!organization?.name || !organization.slug) {
    throw new PortalRouteError("Support conversation not found.", 404, "not_found");
  }

  return {
    organizationId,
    organizationName: String(organization.name),
    organizationSlug: String(organization.slug),
  };
}

export async function listPlatformSupportConversations(
  admin: SupabaseClient,
  userId: string,
): Promise<PlatformSupportConversation[]> {
  const supportThreadIds = await listPlatformSupportThreadIds(admin);
  if (supportThreadIds.length === 0) return [];

  const threadRows: ThreadListRow[] = [];
  for (const ids of chunkIds(supportThreadIds)) {
    const { data, error } = await admin
      .from("message_threads")
      .select("id, organization_id, last_message_at")
      .in("id", ids)
      .not("last_message_at", "is", null);

    if (error) throw new Error(error.message);
    threadRows.push(...((data ?? []) as ThreadListRow[]));
  }

  const threads = threadRows
    .sort((a, b) => String(b.last_message_at).localeCompare(String(a.last_message_at)))
    .slice(0, SUPPORT_CONVERSATION_LIMIT);

  if (threads.length === 0) return [];

  const threadIds = threads.map((thread) => String(thread.id));
  const organizationIds = [...new Set(threads.map((thread) => String(thread.organization_id)))];

  const [guardianParticipants, staffParticipants, organizations, latestMessages, unreadCounts] =
    await Promise.all([
    (async () => {
      const rows: { thread_id: string; guardian_id: string | null }[] = [];
      for (const ids of chunkIds(threadIds)) {
        const { data, error } = await admin
          .from("message_thread_participants")
          .select("thread_id, guardian_id")
          .eq("participant_kind", "guardian")
          .in("thread_id", ids);
        if (error) throw new Error(error.message);
        rows.push(...((data ?? []) as { thread_id: string; guardian_id: string | null }[]));
      }
      return rows;
    })(),
    (async () => {
      const rows: { thread_id: string; staff_member_id: string | null }[] = [];
      for (const ids of chunkIds(threadIds)) {
        const { data, error } = await admin
          .from("message_thread_participants")
          .select("thread_id, staff_member_id")
          .eq("participant_kind", "staff_member")
          .in("thread_id", ids);
        if (error) throw new Error(error.message);
        rows.push(
          ...((data ?? []) as { thread_id: string; staff_member_id: string | null }[]),
        );
      }
      return rows;
    })(),
    admin.from("organizations").select("id, name, slug").in("id", organizationIds),
    admin.rpc("latest_messages_for_threads", { p_thread_ids: threadIds }),
    admin.rpc("thread_unread_counts", { p_user_id: userId, p_thread_ids: threadIds }),
  ]);

  if (organizations.error) throw new Error(organizations.error.message);

  const organizationById = new Map(
    (organizations.data ?? []).map((row) => [
      String(row.id),
      {
        name: String(row.name ?? "School"),
        slug: String(row.slug ?? ""),
      },
    ]),
  );

  const guardianIdByThread = new Map<string, string>();
  for (const row of guardianParticipants) {
    if (!row.guardian_id) continue;
    guardianIdByThread.set(String(row.thread_id), String(row.guardian_id));
  }

  const staffIdByThread = new Map<string, string>();
  for (const row of staffParticipants) {
    if (!row.staff_member_id) continue;
    if (!guardianIdByThread.has(String(row.thread_id))) {
      staffIdByThread.set(String(row.thread_id), String(row.staff_member_id));
    }
  }

  const guardianIds = [...new Set(guardianIdByThread.values())];
  const guardiansById = new Map<
    string,
    { name: string; email: string | null; photoUrl: string | null }
  >();

  if (guardianIds.length > 0) {
    for (const ids of chunkIds(guardianIds)) {
      const { data, error } = await admin
        .from("guardians")
        .select("id, first_name, last_name, email, profile_photo_url")
        .in("id", ids);
      if (error) throw new Error(error.message);
      for (const row of data ?? []) {
        const name = [row.first_name, row.last_name].filter(Boolean).join(" ") || "Parent";
        guardiansById.set(String(row.id), {
          name,
          email: typeof row.email === "string" ? row.email : null,
          photoUrl:
            typeof row.profile_photo_url === "string" && row.profile_photo_url.trim()
              ? row.profile_photo_url.trim()
              : null,
        });
      }
    }
  }

  const staffIds = [...new Set(staffIdByThread.values())];
  const staffById = new Map<
    string,
    { name: string; email: string | null; photoUrl: string | null }
  >();

  if (staffIds.length > 0) {
    for (const ids of chunkIds(staffIds)) {
      const { data, error } = await admin
        .from("staff_members")
        .select("id, first_name, last_name, profile_photo_url")
        .in("id", ids);
      if (error) throw new Error(error.message);
      for (const row of data ?? []) {
        const name = [row.first_name, row.last_name].filter(Boolean).join(" ") || "Staff";
        staffById.set(String(row.id), {
          name,
          email: null,
          photoUrl:
            typeof row.profile_photo_url === "string" && row.profile_photo_url.trim()
              ? row.profile_photo_url.trim()
              : null,
        });
      }
    }
  }

  const latestByThread = new Map<string, PortalMessageRow>();
  if (!latestMessages.error && latestMessages.data != null) {
    for (const row of latestMessages.data as PortalMessageRow[]) {
      latestByThread.set(String(row.thread_id), row);
    }
  }

  const unreadByThread = !unreadCounts.error
    ? mapThreadUnreadCountRows(threadIds, unreadCounts.data as { thread_id: string; unread_count: number }[])
    : new Map<string, number>();

  return threads.map((thread) => {
    const threadId = String(thread.id);
    const organization = organizationById.get(String(thread.organization_id));
    const guardian = guardiansById.get(guardianIdByThread.get(threadId) ?? "");
    const staff = staffById.get(staffIdByThread.get(threadId) ?? "");
    const contact = guardian ?? staff;
    return {
      threadId,
      organizationId: String(thread.organization_id),
      organizationName: organization?.name ?? "School",
      organizationSlug: organization?.slug ?? "",
      parentName: contact?.name ?? "Contact",
      parentEmail: contact?.email ?? null,
      parentPhotoUrl: contact?.photoUrl ?? null,
      preview: messagePreview(latestByThread.get(threadId)),
      lastMessageAt: thread.last_message_at ? String(thread.last_message_at) : null,
      unreadCount: unreadByThread.get(threadId) ?? 0,
    };
  });
}

export async function getPlatformSupportThread(
  admin: SupabaseClient,
  threadId: string,
  userId: string,
): Promise<{
  organizationName: string;
  organizationSlug: string;
  thread: MessageThreadDetail;
}> {
  const organization = await assertPlatformSupportThread(admin, threadId);
  const thread = await getThreadDetail(
    admin,
    organization.organizationId,
    threadId,
    userId,
    `${organization.organizationName} Office`,
    "admin",
  );

  if (!thread) {
    throw new PortalRouteError("Support conversation not found.", 404, "not_found");
  }

  await markThreadRead(admin, threadId, userId);
  return {
    organizationName: organization.organizationName,
    organizationSlug: organization.organizationSlug,
    thread,
  };
}

export async function sendPlatformSupportReply(
  admin: SupabaseClient,
  input: {
    threadId: string;
    userId: string;
    body: string;
    files?: File[];
  },
): Promise<PortalMessage> {
  const organization = await assertPlatformSupportThread(admin, input.threadId);
  const schoolOfficeLabel = `${organization.organizationName} Office`;
  const message = await postPortalMessage(
    admin,
    {
      organizationId: organization.organizationId,
      threadId: input.threadId,
      body: input.body,
      senderUserId: input.userId,
      senderKind: "platform_support",
      files: input.files,
    },
    emptyDisplayContext(input.userId, schoolOfficeLabel),
  );

  await markThreadRead(admin, input.threadId, input.userId);

  void dispatchMessageNotifications(admin, {
    organizationId: organization.organizationId,
    organizationSlug: organization.organizationSlug,
    schoolName: organization.organizationName,
    threadId: input.threadId,
    senderUserId: input.userId,
    senderName: message.senderName,
    message,
    viewer: "admin",
  }).catch((err) => {
    void logNotificationFailure(admin, {
      organizationId: organization.organizationId,
      operation: "messages.dispatch_notification",
      error: err,
      entityType: "message_thread",
      entityId: input.threadId,
    });
  });

  return message;
}
