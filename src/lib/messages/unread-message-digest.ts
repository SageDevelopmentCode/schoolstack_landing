import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { logSettledNotificationFailures } from "@/lib/admissions/notification-logging";
import { notifyUnreadMessageDigestSent } from "@/lib/discord";
import {
  buildEmailNotificationContext,
  sendUnreadMessagesDigestEmail,
} from "@/lib/emails";
import { resolveSenderDisplayName } from "@/lib/messages/message-notification-labels";
import { resolveThreadRecipients } from "@/lib/messages/message-notifications";
import { stampMessageThreadReadFields } from "@/lib/messages/message-thread-read-stamps";
import { isMessageEligibleForUnreadDigest } from "@/lib/messages/unread-message-digest-eligibility";
import { loadFamilyNotificationEmails } from "@/lib/notifications/family-notification-emails";
import { isUnreadMessagesDailyDigestEnabled } from "@/lib/notifications/org-notification-settings";
import { reportOperationalError } from "@/lib/operational-errors";
import type {
  UnreadDigestDiscordDelivery,
  UnreadMessageDigestResult,
} from "@/lib/messages/unread-message-digest-types";
import {
  chunkArray,
  fetchAllPostgrestRows,
} from "@/lib/supabase/fetch-all-rows";
import { SITE_URL } from "@/lib/site";

/** Keeps `thread_id` IN lists under PostgREST URL and row limits. */
const MESSAGE_THREAD_READS_THREAD_ID_CHUNK_SIZE = 300;

type PortalMessageRow = {
  id: string;
  thread_id: string;
  body: string;
  sender_user_id: string;
  created_at: string;
  deleted_at: string | null;
};

type ThreadReadRow = {
  thread_id: string;
  user_id: string;
  last_read_at: string | null;
  last_unread_digest_notified_at: string | null;
};

export type UnreadDigestThreadItem = {
  threadId: string;
  unreadCount: number;
  preview: string;
  senderName: string;
  threadUrl: string;
};

type DigestThreadAccumulator = {
  threadId: string;
  unreadCount: number;
  latestMessage: PortalMessageRow;
  participantUserIds: Set<string>;
};

type TeacherDigestBucket = {
  userId: string;
  email: string | null;
  threads: Map<string, DigestThreadAccumulator>;
};

type FamilyDigestBucket = {
  familyId: string;
  userIds: Set<string>;
  threads: Map<string, DigestThreadAccumulator>;
};

function portalPath(
  slug: string,
  portal: "parent" | "teacher",
  threadId?: string,
): string {
  const base = `/school/${slug}/${portal}/messages`;
  return threadId ? `${base}?thread=${threadId}` : base;
}

function messagePreview(message: PortalMessageRow): string {
  const body = message.body.trim();
  return body || "New message";
}

function staffLabelFromEmail(email: string | null): string {
  if (!email) return "Staff";
  const local = email.split("@")[0]?.trim();
  return local || "Staff";
}

async function loadFamilyDisplayNames(
  admin: SupabaseClient,
  organizationId: string,
  familyIds: string[],
): Promise<Map<string, string>> {
  const names = new Map<string, string>();
  if (familyIds.length === 0) return names;

  const { data, error } = await admin
    .from("families")
    .select("id, name")
    .eq("organization_id", organizationId)
    .in("id", familyIds);

  if (error) throw new Error(error.message);

  for (const row of data ?? []) {
    const id = String(row.id);
    const name = typeof row.name === "string" ? row.name.trim() : "";
    names.set(id, name || `Family (${id.slice(0, 8)})`);
  }

  for (const familyId of familyIds) {
    if (!names.has(familyId)) {
      names.set(familyId, `Family (${familyId.slice(0, 8)})`);
    }
  }

  return names;
}

async function loadStaffDisplayNames(
  admin: SupabaseClient,
  organizationId: string,
  userIds: string[],
): Promise<Map<string, string>> {
  const names = new Map<string, string>();
  if (userIds.length === 0) return names;

  const { data, error } = await admin
    .from("staff_members")
    .select("user_id, first_name, last_name")
    .eq("organization_id", organizationId)
    .in("user_id", userIds);

  if (error) throw new Error(error.message);

  for (const row of data ?? []) {
    const userId = row.user_id ? String(row.user_id) : null;
    if (!userId) continue;
    const fullName = [row.first_name, row.last_name]
      .map((part) => (typeof part === "string" ? part.trim() : ""))
      .filter(Boolean)
      .join(" ");
    if (fullName) {
      names.set(userId, fullName);
    }
  }

  return names;
}

function toDiscordThreadSummaries(
  threads: UnreadDigestThreadItem[],
): UnreadDigestDiscordDelivery["threads"] {
  return threads.map((thread) => ({
    senderName: thread.senderName,
    unreadCount: thread.unreadCount,
  }));
}

async function stampUnreadDigestNotified(
  admin: SupabaseClient,
  pairs: Array<{ threadId: string; userId: string }>,
  notifiedAt: string,
): Promise<void> {
  await stampMessageThreadReadFields(admin, pairs, {
    last_unread_digest_notified_at: notifiedAt,
  });
}

async function resolveLatestSenderName(
  admin: SupabaseClient,
  organizationId: string,
  message: PortalMessageRow,
  schoolOfficeLabel: string,
  recipientPortal: "parent" | "teacher",
): Promise<string> {
  const viewer =
    recipientPortal === "teacher" ? "teacher" : "parent";
  return resolveSenderDisplayName(
    admin,
    organizationId,
    String(message.sender_user_id),
    viewer,
    schoolOfficeLabel,
  );
}

function accumulateThreadEntry(
  threads: Map<string, DigestThreadAccumulator>,
  threadId: string,
  userId: string,
  eligible: PortalMessageRow[],
): void {
  if (eligible.length === 0) return;

  const sorted = [...eligible].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
  const latestMessage = sorted[0];
  const existing = threads.get(threadId);

  if (!existing) {
    threads.set(threadId, {
      threadId,
      unreadCount: eligible.length,
      latestMessage,
      participantUserIds: new Set([userId]),
    });
    return;
  }

  existing.participantUserIds.add(userId);
  if (eligible.length > existing.unreadCount) {
    existing.unreadCount = eligible.length;
  }
  if (
    new Date(latestMessage.created_at).getTime() >
    new Date(existing.latestMessage.created_at).getTime()
  ) {
    existing.latestMessage = latestMessage;
  }
}

export type { UnreadMessageDigestResult } from "@/lib/messages/unread-message-digest-types";

export async function sendUnreadMessageDigestsForOrganization(
  admin: SupabaseClient,
  organizationId: string,
  referenceDate = new Date(),
): Promise<UnreadMessageDigestResult> {
  const enabled = await isUnreadMessagesDailyDigestEnabled(admin, organizationId);
  if (!enabled) {
    return {
      threadsConsidered: 0,
      digestsSent: 0,
      digestFailures: 0,
      parentDigestsSent: 0,
      teacherDigestsSent: 0,
    };
  }

  const { data: organization, error: organizationError } = await admin
    .from("organizations")
    .select("name, slug")
    .eq("id", organizationId)
    .maybeSingle();

  if (organizationError) throw new Error(organizationError.message);
  if (!organization?.slug || !organization.name) {
    return {
      threadsConsidered: 0,
      digestsSent: 0,
      digestFailures: 0,
      parentDigestsSent: 0,
      teacherDigestsSent: 0,
    };
  }

  const schoolName = String(organization.name);
  const schoolSlug = String(organization.slug);
  const schoolOfficeLabel = `${schoolName} Office`;
  const digestEmailContext = buildEmailNotificationContext({
    organizationId,
    organizationSlug: schoolSlug,
    surface: "cron",
    entityType: "organization",
    entityId: organizationId,
  });

  const threadRows = await fetchAllPostgrestRows(async (from, to) =>
    admin
      .from("message_threads")
      .select("id")
      .eq("organization_id", organizationId)
      .order("id", { ascending: true })
      .range(from, to),
  );

  const threadIds = threadRows.map((row) => String(row.id));
  if (threadIds.length === 0) {
    return {
      threadsConsidered: 0,
      digestsSent: 0,
      digestFailures: 0,
      parentDigestsSent: 0,
      teacherDigestsSent: 0,
    };
  }

  const messageRows = await fetchAllPostgrestRows(async (from, to) =>
    admin
      .from("portal_messages")
      .select("id, thread_id, body, sender_user_id, created_at, deleted_at")
      .eq("organization_id", organizationId)
      .is("deleted_at", null)
      .order("created_at", { ascending: true })
      .order("id", { ascending: true })
      .range(from, to),
  );

  const messagesByThread = new Map<string, PortalMessageRow[]>();
  for (const row of messageRows as PortalMessageRow[]) {
    const threadId = String(row.thread_id);
    const list = messagesByThread.get(threadId) ?? [];
    list.push(row);
    messagesByThread.set(threadId, list);
  }

  const readRows: ThreadReadRow[] = [];
  for (const threadIdChunk of chunkArray(
    threadIds,
    MESSAGE_THREAD_READS_THREAD_ID_CHUNK_SIZE,
  )) {
    const chunkRows = await fetchAllPostgrestRows(async (from, to) =>
      admin
        .from("message_thread_reads")
        .select(
          "thread_id, user_id, last_read_at, last_unread_digest_notified_at",
        )
        .in("thread_id", threadIdChunk)
        .order("thread_id", { ascending: true })
        .order("user_id", { ascending: true })
        .range(from, to),
    );
    readRows.push(...(chunkRows as ThreadReadRow[]));
  }

  const readStateByThreadUser = new Map<string, ThreadReadRow>();
  for (const row of readRows) {
    const key = `${row.thread_id}:${row.user_id}`;
    readStateByThreadUser.set(key, row);
  }

  const teacherBuckets = new Map<string, TeacherDigestBucket>();
  const familyBuckets = new Map<string, FamilyDigestBucket>();

  for (const threadId of threadIds) {
    const recipients = await resolveThreadRecipients(
      admin,
      organizationId,
      threadId,
      "00000000-0000-0000-0000-000000000000",
    );

    const threadMessages = messagesByThread.get(threadId) ?? [];

    for (const recipient of recipients) {
      if (recipient.portal === "admin") continue;

      const readKey = `${threadId}:${recipient.userId}`;
      const readState = readStateByThreadUser.get(readKey);
      const lastReadAt = readState?.last_read_at
        ? String(readState.last_read_at)
        : null;
      const lastDigestNotifiedAt = readState?.last_unread_digest_notified_at
        ? String(readState.last_unread_digest_notified_at)
        : null;

      const eligible = threadMessages.filter((message) =>
        isMessageEligibleForUnreadDigest({
          messageCreatedAt: String(message.created_at),
          senderUserId: String(message.sender_user_id),
          recipientUserId: recipient.userId,
          lastReadAt,
          lastDigestNotifiedAt,
        }),
      );

      if (eligible.length === 0) continue;

      if (recipient.portal === "teacher") {
        let bucket = teacherBuckets.get(recipient.userId);
        if (!bucket) {
          bucket = {
            userId: recipient.userId,
            email: recipient.email,
            threads: new Map(),
          };
          teacherBuckets.set(recipient.userId, bucket);
        }
        accumulateThreadEntry(
          bucket.threads,
          threadId,
          recipient.userId,
          eligible,
        );
        continue;
      }

      if (!recipient.familyId) continue;

      let familyBucket = familyBuckets.get(recipient.familyId);
      if (!familyBucket) {
        familyBucket = {
          familyId: recipient.familyId,
          userIds: new Set(),
          threads: new Map(),
        };
        familyBuckets.set(recipient.familyId, familyBucket);
      }
      familyBucket.userIds.add(recipient.userId);
      accumulateThreadEntry(
        familyBucket.threads,
        threadId,
        recipient.userId,
        eligible,
      );
    }
  }

  const notifiedAt = referenceDate.toISOString();
  let digestsSent = 0;
  let digestFailures = 0;
  let parentDigestsSent = 0;
  let teacherDigestsSent = 0;
  const discordDeliveries: UnreadDigestDiscordDelivery[] = [];

  const [familyDisplayNames, staffDisplayNames] = await Promise.all([
    loadFamilyDisplayNames(admin, organizationId, [...familyBuckets.keys()]),
    loadStaffDisplayNames(admin, organizationId, [...teacherBuckets.keys()]),
  ]);

  async function buildThreadItems(
    threads: Map<string, DigestThreadAccumulator>,
    portal: "parent" | "teacher",
  ): Promise<UnreadDigestThreadItem[]> {
    const items: UnreadDigestThreadItem[] = [];

    for (const entry of threads.values()) {
      const senderName = await resolveLatestSenderName(
        admin,
        organizationId,
        entry.latestMessage,
        schoolOfficeLabel,
        portal,
      );
      items.push({
        threadId: entry.threadId,
        unreadCount: entry.unreadCount,
        preview: messagePreview(entry.latestMessage),
        senderName,
        threadUrl: portalPath(schoolSlug, portal, entry.threadId),
      });
    }

    items.sort(
      (a, b) =>
        b.unreadCount - a.unreadCount || a.senderName.localeCompare(b.senderName),
    );

    return items;
  }

  for (const bucket of teacherBuckets.values()) {
    if (bucket.threads.size === 0 || !bucket.email) continue;

    const threads = await buildThreadItems(bucket.threads, "teacher");
    if (threads.length === 0) continue;

    const totalUnread = threads.reduce((sum, thread) => sum + thread.unreadCount, 0);
    const messagesUrl = `${SITE_URL}${portalPath(schoolSlug, "teacher")}`;

    const result = await Promise.allSettled([
      sendUnreadMessagesDigestEmail({
        email: bucket.email,
        schoolName,
        recipientPortal: "teacher",
        threads,
        totalUnread,
        messagesUrl,
        notificationContext: digestEmailContext,
      }),
    ]);

    await logSettledNotificationFailures(
      admin,
      {
        organizationId,
        operation: "messages.unread_digest.notify",
        entityType: "organization",
        entityId: organizationId,
        metadata: {
          recipientPortal: "teacher",
          recipientEmail: bucket.email,
          threadCount: threads.length,
        },
      },
      result,
    );

    if (result[0]?.status === "fulfilled" && result[0].value) {
      digestsSent += 1;
      teacherDigestsSent += 1;
      discordDeliveries.push({
        recipientPortal: "teacher",
        recipientLabel:
          staffDisplayNames.get(bucket.userId) ??
          staffLabelFromEmail(bucket.email),
        staffUserId: bucket.userId,
        totalUnread,
        threads: toDiscordThreadSummaries(threads),
      });

      const stampPairs: Array<{ threadId: string; userId: string }> = [];
      for (const entry of bucket.threads.values()) {
        for (const userId of entry.participantUserIds) {
          stampPairs.push({ threadId: entry.threadId, userId });
        }
      }
      await stampUnreadDigestNotified(admin, stampPairs, notifiedAt);
    } else {
      digestFailures += 1;
    }
  }

  const familyEmailCache = new Map<string, string[]>();

  for (const bucket of familyBuckets.values()) {
    if (bucket.threads.size === 0) continue;

    if (!familyEmailCache.has(bucket.familyId)) {
      familyEmailCache.set(
        bucket.familyId,
        await loadFamilyNotificationEmails(admin, bucket.familyId),
      );
    }

    const emails = familyEmailCache.get(bucket.familyId) ?? [];
    if (emails.length === 0) continue;

    const threads = await buildThreadItems(bucket.threads, "parent");
    if (threads.length === 0) continue;

    const totalUnread = threads.reduce((sum, thread) => sum + thread.unreadCount, 0);
    const messagesUrl = `${SITE_URL}${portalPath(schoolSlug, "parent")}`;

    let emailed = false;
    for (const email of emails) {
      const result = await Promise.allSettled([
        sendUnreadMessagesDigestEmail({
          email,
          schoolName,
          recipientPortal: "parent",
          threads,
          totalUnread,
          messagesUrl,
          notificationContext: digestEmailContext,
        }),
      ]);

      await logSettledNotificationFailures(
        admin,
        {
          organizationId,
          operation: "messages.unread_digest.notify",
          entityType: "organization",
          entityId: organizationId,
          metadata: {
            recipientPortal: "parent",
            recipientEmail: email,
            familyId: bucket.familyId,
            threadCount: threads.length,
          },
        },
        result,
      );

      if (result[0]?.status === "fulfilled" && result[0].value) {
        emailed = true;
      }
    }

    if (emailed) {
      digestsSent += 1;
      parentDigestsSent += 1;
      discordDeliveries.push({
        recipientPortal: "parent",
        recipientLabel:
          familyDisplayNames.get(bucket.familyId) ??
          `Family (${bucket.familyId.slice(0, 8)})`,
        familyId: bucket.familyId,
        totalUnread,
        threads: toDiscordThreadSummaries(threads),
      });

      const stampPairs: Array<{ threadId: string; userId: string }> = [];
      for (const entry of bucket.threads.values()) {
        for (const userId of entry.participantUserIds) {
          stampPairs.push({ threadId: entry.threadId, userId });
        }
      }
      await stampUnreadDigestNotified(admin, stampPairs, notifiedAt);
    } else {
      digestFailures += 1;
    }
  }

  if (digestsSent > 0) {
    try {
      await notifyUnreadMessageDigestSent({
        organizationId,
        schoolName,
        schoolSlug,
        digestsSent,
        digestFailures,
        parentDigestsSent,
        teacherDigestsSent,
        deliveries: discordDeliveries,
      });
    } catch (error) {
      void reportOperationalError({
        supabase: admin,
        surface: "system",
        organizationId,
        organizationName: schoolName,
        organizationSlug: schoolSlug,
        operation: "messages.unread_digest.discord_notification",
        error: "Failed to send unread message digest Discord notification",
        actor: { type: "system" },
        cause: error,
      });
    }
  }

  return {
    threadsConsidered: threadIds.length,
    digestsSent,
    digestFailures,
    parentDigestsSent,
    teacherDigestsSent,
  };
}
