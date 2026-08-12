import type { SupabaseClient } from "@supabase/supabase-js";
import {
  mapParticipantRow,
  mapThreadSummary,
  type MessageThreadParticipantRow,
  type MessageThreadRow,
  type PortalMessageRow,
} from "@/lib/messages/mappers";
import { getThreadDetail, loadFamilyGuardianDisplayMaps } from "@/lib/messages/threads";
import type { MessageThreadDetail, MessageThreadSummary } from "@/lib/messages/types";

export const DEFAULT_PLATFORM_MESSAGE_THREAD_PAGE_SIZE = 25;
export const MAX_PLATFORM_MESSAGE_THREAD_PAGE_SIZE = 50;

export type PlatformMessageThreadsPage = {
  threads: MessageThreadSummary[];
  nextCursor: string | null;
  hasMore: boolean;
};

const NULL_CURSOR_SENTINEL = "__null__";

function encodeThreadCursor(
  lastMessageAt: string | null,
  id: string,
): string {
  return `${lastMessageAt ?? NULL_CURSOR_SENTINEL}|${id}`;
}

function decodeThreadCursor(
  cursor: string,
): { lastMessageAt: string | null; id: string } | null {
  const separatorIndex = cursor.indexOf("|");
  if (separatorIndex <= 0) return null;

  const lastMessageAtRaw = cursor.slice(0, separatorIndex);
  const id = cursor.slice(separatorIndex + 1);
  if (!id) return null;

  return {
    lastMessageAt:
      lastMessageAtRaw === NULL_CURSOR_SENTINEL ? null : lastMessageAtRaw,
    id,
  };
}

function parseThreadPageLimit(limit?: number): number {
  if (!limit || !Number.isFinite(limit) || limit < 1) {
    return DEFAULT_PLATFORM_MESSAGE_THREAD_PAGE_SIZE;
  }
  return Math.min(Math.floor(limit), MAX_PLATFORM_MESSAGE_THREAD_PAGE_SIZE);
}

async function hydrateThreadSummaries(
  admin: SupabaseClient,
  organizationId: string,
  viewerUserId: string,
  schoolOfficeLabel: string,
  threadRows: MessageThreadRow[],
): Promise<MessageThreadSummary[]> {
  const threadIds = threadRows.map((row) => String(row.id));
  if (threadIds.length === 0) return [];

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

  const familyIds = new Set<string>();
  const staffMemberIds = new Set<string>();
  for (const row of (participantRows ?? []) as MessageThreadParticipantRow[]) {
    if (row.family_id) familyIds.add(String(row.family_id));
    if (row.staff_member_id) staffMemberIds.add(String(row.staff_member_id));
  }

  const [guardianMaps, staffRowsResult] = await Promise.all([
    loadFamilyGuardianDisplayMaps(admin, organizationId, [...familyIds]),
    staffMemberIds.size > 0
      ? admin
          .from("staff_members")
          .select("id, first_name, last_name, role_title")
          .eq("organization_id", organizationId)
          .in("id", [...staffMemberIds])
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (staffRowsResult.error) throw new Error(staffRowsResult.error.message);

  const staffMembers = new Map<
    string,
    { firstName: string; lastName: string; roleTitle?: string | null }
  >();
  for (const row of staffRowsResult.data ?? []) {
    staffMembers.set(String(row.id), {
      firstName: String(row.first_name ?? ""),
      lastName: String(row.last_name ?? ""),
      roleTitle: typeof row.role_title === "string" ? row.role_title : null,
    });
  }

  const context = {
    families: guardianMaps.families,
    staffMembers,
    guardians: guardianMaps.guardians,
    familyPrimaryGuardianIds: guardianMaps.familyPrimaryGuardianIds,
    familyFirstGuardianIds: guardianMaps.familyFirstGuardianIds,
    familyEnrolledStudents: new Map(),
    schoolOfficeLabel,
    currentUserId: viewerUserId,
  };

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

  return threadRows.map((thread) => {
    const participants = (participantsByThread.get(String(thread.id)) ?? []).map(
      mapParticipantRow,
    );
    return mapThreadSummary(
      thread,
      participants,
      context,
      "admin",
      lastMessageByThread.get(String(thread.id)) ?? null,
      0,
    );
  });
}

export async function listPlatformMessageThreads(
  admin: SupabaseClient,
  organizationId: string,
  viewerUserId: string,
  schoolName: string,
  options?: { cursor?: string | null; limit?: number },
): Promise<PlatformMessageThreadsPage> {
  const limit = parseThreadPageLimit(options?.limit);
  const schoolOfficeLabel = `${schoolName} Office`;
  const decodedCursor = options?.cursor
    ? decodeThreadCursor(options.cursor)
    : null;

  let query = admin
    .from("message_threads")
    .select("*")
    .eq("organization_id", organizationId)
    .order("last_message_at", { ascending: false, nullsFirst: false })
    .order("id", { ascending: false })
    .limit(limit + 1);

  if (decodedCursor) {
    if (decodedCursor.lastMessageAt) {
      query = query.or(
        `last_message_at.lt.${decodedCursor.lastMessageAt},and(last_message_at.eq.${decodedCursor.lastMessageAt},id.lt.${decodedCursor.id}),last_message_at.is.null`,
      );
    } else {
      query = query.is("last_message_at", null).lt("id", decodedCursor.id);
    }
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  const rawRows = (data ?? []) as MessageThreadRow[];
  const hasMore = rawRows.length > limit;
  const pageRows = hasMore ? rawRows.slice(0, limit) : rawRows;
  const threads = await hydrateThreadSummaries(
    admin,
    organizationId,
    viewerUserId,
    schoolOfficeLabel,
    pageRows,
  );

  const lastRow = pageRows.at(-1);
  return {
    threads,
    nextCursor:
      hasMore && lastRow
        ? encodeThreadCursor(lastRow.last_message_at, String(lastRow.id))
        : null,
    hasMore,
  };
}

export async function getPlatformMessageThreadDetail(
  admin: SupabaseClient,
  organizationId: string,
  threadId: string,
  viewerUserId: string,
  schoolName: string,
): Promise<MessageThreadDetail | null> {
  const schoolOfficeLabel = `${schoolName} Office`;
  return getThreadDetail(
    admin,
    organizationId,
    threadId,
    viewerUserId,
    schoolOfficeLabel,
    "admin",
  );
}
