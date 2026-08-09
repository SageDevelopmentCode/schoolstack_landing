import type { SupabaseClient } from "@supabase/supabase-js";
import {
  mapMessageRow,
  mapParticipantRow,
  mapThreadSummary,
  type MessageThreadParticipantRow,
  type MessageThreadRow,
  type ParticipantDisplayContext,
  type PortalMessageRow,
} from "./mappers";
import {
  buildParticipantSignature,
  validateParticipantSet,
} from "./participant-signature";
import { loadAttachmentsForMessages, getMessageAttachmentSignedUrl } from "./message-attachment-storage";
import type {
  MessageParticipantInput,
  MessageThreadDetail,
  MessageThreadSummary,
  PortalMessage,
} from "./types";

async function loadDisplayContext(
  admin: SupabaseClient,
  organizationId: string,
  currentUserId: string,
  schoolOfficeLabel: string,
  familyIds: string[],
  staffMemberIds: string[],
): Promise<ParticipantDisplayContext> {
  const families = new Map<string, { name: string }>();
  const staffMembers = new Map<
    string,
    { firstName: string; lastName: string; roleTitle?: string | null }
  >();

  if (familyIds.length > 0) {
    const { data, error } = await admin
      .from("families")
      .select("id, name")
      .eq("organization_id", organizationId)
      .in("id", familyIds);

    if (error) throw new Error(error.message);
    for (const row of data ?? []) {
      families.set(String(row.id), {
        name: String(row.name ?? "Family"),
      });
    }
  }

  if (staffMemberIds.length > 0) {
    const { data, error } = await admin
      .from("staff_members")
      .select("id, first_name, last_name, role_title")
      .eq("organization_id", organizationId)
      .in("id", staffMemberIds);

    if (error) throw new Error(error.message);
    for (const row of data ?? []) {
      staffMembers.set(String(row.id), {
        firstName: String(row.first_name ?? ""),
        lastName: String(row.last_name ?? ""),
        roleTitle:
          typeof row.role_title === "string" ? row.role_title : null,
      });
    }
  }

  return {
    families,
    staffMembers,
    schoolOfficeLabel,
    currentUserId,
  };
}

function collectIdsFromParticipants(
  participants: MessageThreadParticipantRow[],
): { familyIds: string[]; staffMemberIds: string[] } {
  const familyIds = new Set<string>();
  const staffMemberIds = new Set<string>();

  for (const participant of participants) {
    if (participant.family_id) familyIds.add(String(participant.family_id));
    if (participant.staff_member_id) {
      staffMemberIds.add(String(participant.staff_member_id));
    }
  }

  return {
    familyIds: [...familyIds],
    staffMemberIds: [...staffMemberIds],
  };
}

async function getUnreadCounts(
  admin: SupabaseClient,
  threadIds: string[],
  userId: string,
): Promise<Map<string, number>> {
  const counts = new Map<string, number>();
  if (threadIds.length === 0) return counts;

  const { data: reads, error: readsError } = await admin
    .from("message_thread_reads")
    .select("thread_id, last_read_at")
    .eq("user_id", userId)
    .in("thread_id", threadIds);

  if (readsError) throw new Error(readsError.message);

  const readMap = new Map(
    (reads ?? []).map((row) => [String(row.thread_id), String(row.last_read_at)]),
  );

  const { data: messages, error: messagesError } = await admin
    .from("portal_messages")
    .select("thread_id, created_at, sender_user_id")
    .in("thread_id", threadIds)
    .order("created_at", { ascending: false });

  if (messagesError) throw new Error(messagesError.message);

  for (const threadId of threadIds) {
    const lastReadAt = readMap.get(threadId);
    const unread = (messages ?? []).filter((message) => {
      if (String(message.thread_id) !== threadId) return false;
      if (String(message.sender_user_id) === userId) return false;
      if (!lastReadAt) return true;
      return new Date(String(message.created_at)) > new Date(lastReadAt);
    }).length;
    counts.set(threadId, unread);
  }

  return counts;
}

export async function getTotalUnreadCount(
  admin: SupabaseClient,
  organizationId: string,
  userId: string,
  schoolOfficeLabel: string,
  viewer: "parent" | "teacher" | "admin",
  filter:
    | { type: "family"; familyIds: string[] }
    | { type: "staff"; staffMemberId: string }
    | { type: "admin" },
): Promise<number> {
  const threads = await listThreadsForOrganization(
    admin,
    organizationId,
    userId,
    schoolOfficeLabel,
    viewer,
    filter,
  );
  return threads.reduce((sum, thread) => sum + thread.unreadCount, 0);
}

export async function findOrCreateThread(
  admin: SupabaseClient,
  organizationId: string,
  participants: MessageParticipantInput[],
  subject?: string | null,
): Promise<string> {
  validateParticipantSet(participants);
  const signature = buildParticipantSignature(participants);

  const { data: existing, error: existingError } = await admin
    .from("message_threads")
    .select("id")
    .eq("organization_id", organizationId)
    .eq("participant_signature", signature)
    .maybeSingle();

  if (existingError) throw new Error(existingError.message);
  if (existing?.id) return String(existing.id);

  const { data: thread, error: threadError } = await admin
    .from("message_threads")
    .insert({
      organization_id: organizationId,
      participant_signature: signature,
      subject: subject?.trim() || null,
    })
    .select("id")
    .single();

  if (threadError) throw new Error(threadError.message);

  const threadId = String(thread.id);
  const participantRows = participants.map((participant) => {
    if (participant.kind === "family") {
      return {
        thread_id: threadId,
        organization_id: organizationId,
        participant_kind: participant.kind,
        family_id: participant.familyId,
        staff_member_id: null,
      };
    }
    if (participant.kind === "staff_member") {
      return {
        thread_id: threadId,
        organization_id: organizationId,
        participant_kind: participant.kind,
        family_id: null,
        staff_member_id: participant.staffMemberId,
      };
    }
    return {
      thread_id: threadId,
      organization_id: organizationId,
      participant_kind: participant.kind,
      family_id: null,
      staff_member_id: null,
    };
  });

  const { error: participantsError } = await admin
    .from("message_thread_participants")
    .insert(participantRows);

  if (participantsError) throw new Error(participantsError.message);

  return threadId;
}

export async function listThreadsForOrganization(
  admin: SupabaseClient,
  organizationId: string,
  currentUserId: string,
  schoolOfficeLabel: string,
  viewer: "parent" | "teacher" | "admin",
  filter:
    | { type: "family"; familyIds: string[] }
    | { type: "staff"; staffMemberId: string }
    | { type: "admin" },
): Promise<MessageThreadSummary[]> {
  let threadIds: string[] = [];

  if (filter.type === "family") {
    if (filter.familyIds.length === 0) return [];
    const { data, error } = await admin
      .from("message_thread_participants")
      .select("thread_id")
      .eq("organization_id", organizationId)
      .eq("participant_kind", "family")
      .in("family_id", filter.familyIds);

    if (error) throw new Error(error.message);
    threadIds = [...new Set((data ?? []).map((row) => String(row.thread_id)))];
  } else if (filter.type === "staff") {
    const [{ data: staffThreads, error: staffError }, { data: officeThreads, error: officeError }] =
      await Promise.all([
        admin
          .from("message_thread_participants")
          .select("thread_id")
          .eq("organization_id", organizationId)
          .eq("participant_kind", "staff_member")
          .eq("staff_member_id", filter.staffMemberId),
        admin
          .from("message_thread_participants")
          .select("thread_id")
          .eq("organization_id", organizationId)
          .eq("participant_kind", "school_office"),
      ]);

    if (staffError) throw new Error(staffError.message);
    if (officeError) throw new Error(officeError.message);

    const officeThreadIds = new Set(
      (officeThreads ?? []).map((row) => String(row.thread_id)),
    );

    const combined = new Set<string>();
    for (const row of staffThreads ?? []) {
      combined.add(String(row.thread_id));
    }

    if (officeThreadIds.size > 0) {
      const { data: officeStaffLinks, error: linkError } = await admin
        .from("message_thread_participants")
        .select("thread_id")
        .eq("organization_id", organizationId)
        .eq("participant_kind", "staff_member")
        .eq("staff_member_id", filter.staffMemberId)
        .in("thread_id", [...officeThreadIds]);

      if (linkError) throw new Error(linkError.message);
      for (const row of officeStaffLinks ?? []) {
        combined.add(String(row.thread_id));
      }
    }

    threadIds = [...combined];
  } else {
    const { data, error } = await admin
      .from("message_threads")
      .select("id")
      .eq("organization_id", organizationId);

    if (error) throw new Error(error.message);
    threadIds = (data ?? []).map((row) => String(row.id));
  }

  if (threadIds.length === 0) return [];

  const { data: threads, error: threadsError } = await admin
    .from("message_threads")
    .select("*")
    .in("id", threadIds)
    .order("last_message_at", { ascending: false, nullsFirst: false });

  if (threadsError) throw new Error(threadsError.message);

  const { data: participantRows, error: participantsError } = await admin
    .from("message_thread_participants")
    .select("*")
    .in("thread_id", threadIds);

  if (participantsError) throw new Error(participantsError.message);

  const participantsByThread = new Map<string, MessageThreadParticipantRow[]>();
  for (const row of (participantRows ?? []) as MessageThreadParticipantRow[]) {
    const threadId = String(row.thread_id);
    const list = participantsByThread.get(threadId) ?? [];
    list.push(row);
    participantsByThread.set(threadId, list);
  }

  const { familyIds, staffMemberIds } = collectIdsFromParticipants(
    (participantRows ?? []) as MessageThreadParticipantRow[],
  );

  const context = await loadDisplayContext(
    admin,
    organizationId,
    currentUserId,
    schoolOfficeLabel,
    familyIds,
    staffMemberIds,
  );

  const unreadCounts = await getUnreadCounts(admin, threadIds, currentUserId);

  const { data: latestMessages, error: latestError } = await admin
    .from("portal_messages")
    .select("*")
    .in("thread_id", threadIds)
    .order("created_at", { ascending: false });

  if (latestError) throw new Error(latestError.message);

  const lastMessageByThread = new Map<string, PortalMessageRow>();
  for (const message of (latestMessages ?? []) as PortalMessageRow[]) {
    const threadId = String(message.thread_id);
    if (!lastMessageByThread.has(threadId)) {
      lastMessageByThread.set(threadId, message);
    }
  }

  return ((threads ?? []) as MessageThreadRow[]).map((thread) => {
    const participants = (participantsByThread.get(String(thread.id)) ?? []).map(
      mapParticipantRow,
    );
    return mapThreadSummary(
      thread,
      participants,
      context,
      viewer,
      lastMessageByThread.get(String(thread.id)) ?? null,
      unreadCounts.get(String(thread.id)) ?? 0,
    );
  });
}

export async function getThreadDetail(
  admin: SupabaseClient,
  organizationId: string,
  threadId: string,
  currentUserId: string,
  schoolOfficeLabel: string,
  viewer: "parent" | "teacher" | "admin",
): Promise<MessageThreadDetail | null> {
  const { data: thread, error: threadError } = await admin
    .from("message_threads")
    .select("*")
    .eq("id", threadId)
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (threadError) throw new Error(threadError.message);
  if (!thread) return null;

  const [
    { data: participantRows, error: participantsError },
    { data: messageRows, error: messagesError },
  ] = await Promise.all([
    admin.from("message_thread_participants").select("*").eq("thread_id", threadId),
    admin
      .from("portal_messages")
      .select("*")
      .eq("thread_id", threadId)
      .order("created_at", { ascending: true }),
  ]);

  if (participantsError) throw new Error(participantsError.message);
  if (messagesError) throw new Error(messagesError.message);

  const participants = ((participantRows ?? []) as MessageThreadParticipantRow[]).map(
    mapParticipantRow,
  );

  const { familyIds, staffMemberIds } = collectIdsFromParticipants(
    (participantRows ?? []) as MessageThreadParticipantRow[],
  );

  const messageIds = ((messageRows ?? []) as PortalMessageRow[]).map((row) =>
    String(row.id),
  );

  const [context, attachmentsByMessage] = await Promise.all([
    loadDisplayContext(
      admin,
      organizationId,
      currentUserId,
      schoolOfficeLabel,
      familyIds,
      staffMemberIds,
    ),
    loadAttachmentsForMessages(admin, messageIds),
  ]);

  const allRawAttachments = [...attachmentsByMessage.values()].flat();
  const [signedUrlEntries, unreadCounts] = await Promise.all([
    Promise.all(
      allRawAttachments.map(async (attachment) => [
        attachment.storagePath,
        await getMessageAttachmentSignedUrl(admin, attachment.storagePath),
      ] as const),
    ),
    getUnreadCounts(admin, [threadId], currentUserId),
  ]);
  const signedUrlByPath = new Map(signedUrlEntries);

  const messages: PortalMessage[] = [];
  for (const row of (messageRows ?? []) as PortalMessageRow[]) {
    const message = mapMessageRow(row, context);
    const rawAttachments = attachmentsByMessage.get(String(row.id)) ?? [];
    message.attachments = rawAttachments.map((attachment) => ({
      id: attachment.id,
      fileName: attachment.fileName,
      mimeType: attachment.mimeType,
      sizeBytes: attachment.sizeBytes,
      url: signedUrlByPath.get(attachment.storagePath) ?? null,
    }));
    messages.push(message);
  }

  const lastMessage = (messageRows ?? []).at(-1) as PortalMessageRow | undefined;

  const summary = mapThreadSummary(
    thread as MessageThreadRow,
    participants,
    context,
    viewer,
    lastMessage ?? null,
    unreadCounts.get(threadId) ?? 0,
  );

  return { ...summary, messages };
}

export async function markThreadRead(
  admin: SupabaseClient,
  threadId: string,
  userId: string,
): Promise<void> {
  const { error } = await admin.from("message_thread_reads").upsert(
    {
      thread_id: threadId,
      user_id: userId,
      last_read_at: new Date().toISOString(),
    },
    { onConflict: "thread_id,user_id" },
  );

  if (error) throw new Error(error.message);
}
