import type { SupabaseClient } from "@supabase/supabase-js";
import {
  formatEnrolledStudentSubtitle,
  listFamilyEnrolledStudents,
  type AdminEnrolledStudentSummary,
} from "@/lib/school-admin/enrolled-students";
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
import { mapThreadUnreadCountRows } from "./thread-list-helpers";
import {
  applyMessageThreadAudienceScope,
  threadVisibleInProgramPortalInbox,
  type MessageThreadAudienceScope,
} from "./message-audience";
import type {
  MessageParticipantInput,
  MessageThreadDetail,
  MessageThreadSummary,
  PortalMessage,
} from "./types";

async function loadFamilyPrimaryGuardianIds(
  admin: SupabaseClient,
  organizationId: string,
  familyIds: string[],
): Promise<Map<string, string>> {
  const primaryByFamily = new Map<string, string>();
  if (familyIds.length === 0) return primaryByFamily;

  const { data, error } = await admin
    .from("applications")
    .select("family_id, primary_guardian_id, updated_at")
    .eq("organization_id", organizationId)
    .in("family_id", familyIds)
    .not("primary_guardian_id", "is", null)
    .order("updated_at", { ascending: false });

  if (error) throw new Error(error.message);

  for (const row of data ?? []) {
    const familyId = row.family_id ? String(row.family_id) : null;
    const guardianId = row.primary_guardian_id ? String(row.primary_guardian_id) : null;
    if (!familyId || !guardianId || primaryByFamily.has(familyId)) continue;
    primaryByFamily.set(familyId, guardianId);
  }

  return primaryByFamily;
}

export async function loadFamilyGuardianDisplayMaps(
  admin: SupabaseClient,
  organizationId: string,
  familyIds: string[],
): Promise<{
  families: Map<string, { name: string }>;
  guardians: Map<
    string,
    {
      firstName: string;
      lastName: string;
      familyId?: string | null;
      profilePhotoUrl?: string | null;
    }
  >;
  familyPrimaryGuardianIds: Map<string, string>;
  familyFirstGuardianIds: Map<string, string>;
}> {
  const families = new Map<string, { name: string }>();
  const guardians = new Map<
    string,
    {
      firstName: string;
      lastName: string;
      familyId?: string | null;
      profilePhotoUrl?: string | null;
    }
  >();
  const familyPrimaryGuardianIds = new Map<string, string>();
  const familyFirstGuardianIds = new Map<string, string>();

  if (familyIds.length === 0) {
    return { families, guardians, familyPrimaryGuardianIds, familyFirstGuardianIds };
  }

  const [
    { data: familyRows, error: familiesError },
    { data: guardianRows, error: guardiansError },
    primaryGuardianIds,
  ] = await Promise.all([
    admin
      .from("families")
      .select("id, name")
      .eq("organization_id", organizationId)
      .in("id", familyIds),
    admin
      .from("guardians")
      .select("id, first_name, last_name, family_id, created_at, profile_photo_url")
      .eq("organization_id", organizationId)
      .in("family_id", familyIds)
      .order("created_at", { ascending: true }),
    loadFamilyPrimaryGuardianIds(admin, organizationId, familyIds),
  ]);

  if (familiesError) throw new Error(familiesError.message);
  if (guardiansError) throw new Error(guardiansError.message);

  for (const row of familyRows ?? []) {
    families.set(String(row.id), {
      name: String(row.name ?? "Family"),
    });
  }

  for (const row of guardianRows ?? []) {
    const guardianId = String(row.id);
    const familyId = row.family_id ? String(row.family_id) : null;
    guardians.set(guardianId, {
      firstName: String(row.first_name ?? ""),
      lastName: String(row.last_name ?? ""),
      familyId,
      profilePhotoUrl:
        typeof row.profile_photo_url === "string" && row.profile_photo_url.trim()
          ? row.profile_photo_url.trim()
          : null,
    });
    if (familyId && !familyFirstGuardianIds.has(familyId)) {
      familyFirstGuardianIds.set(familyId, guardianId);
    }
  }

  for (const [familyId, guardianId] of primaryGuardianIds) {
    familyPrimaryGuardianIds.set(familyId, guardianId);
  }

  return { families, guardians, familyPrimaryGuardianIds, familyFirstGuardianIds };
}

export async function loadFamilyEnrolledStudentsForMessages(
  admin: SupabaseClient,
  organizationId: string,
  familyIds: string[],
): Promise<Map<string, AdminEnrolledStudentSummary[]>> {
  return listFamilyEnrolledStudents(admin, organizationId, familyIds);
}

export function formatFamilyEnrolledStudentSubtitle(
  students: AdminEnrolledStudentSummary[],
): string {
  return formatEnrolledStudentSubtitle(students);
}

type LoadDisplayContextOptions = {
  viewer?: "parent" | "teacher" | "admin";
  currentStaffMemberId?: string | null;
  viewerGuardianId?: string | null;
};

async function loadDisplayContext(
  admin: SupabaseClient,
  organizationId: string,
  currentUserId: string,
  schoolOfficeLabel: string,
  familyIds: string[],
  staffMemberIds: string[],
  guardianIds: string[],
  options: LoadDisplayContextOptions = {},
): Promise<ParticipantDisplayContext> {
  const families = new Map<string, { name: string }>();
  const staffMembers = new Map<
    string,
    { firstName: string; lastName: string; roleTitle?: string | null; profilePhotoUrl?: string | null }
  >();
  const guardians = new Map<
    string,
    {
      firstName: string;
      lastName: string;
      familyId?: string | null;
      profilePhotoUrl?: string | null;
    }
  >();
  const familyPrimaryGuardianIds = new Map<string, string>();
  const familyFirstGuardianIds = new Map<string, string>();
  const familyEnrolledStudents = new Map<string, AdminEnrolledStudentSummary[]>();
  const familyIdSet = new Set(familyIds);

  if (guardianIds.length > 0) {
    const { data, error } = await admin
      .from("guardians")
      .select("id, first_name, last_name, family_id, profile_photo_url")
      .eq("organization_id", organizationId)
      .in("id", guardianIds);

    if (error) throw new Error(error.message);

    for (const row of data ?? []) {
      const guardianId = String(row.id);
      const familyId = row.family_id ? String(row.family_id) : null;
      guardians.set(guardianId, {
        firstName: String(row.first_name ?? ""),
        lastName: String(row.last_name ?? ""),
        familyId,
        profilePhotoUrl:
          typeof row.profile_photo_url === "string" && row.profile_photo_url.trim()
            ? row.profile_photo_url.trim()
            : null,
      });
      if (familyId) familyIdSet.add(familyId);
    }
  }

  const mergedFamilyIds = [...familyIdSet];

  if (mergedFamilyIds.length > 0) {
    const guardianMaps = await loadFamilyGuardianDisplayMaps(
      admin,
      organizationId,
      mergedFamilyIds,
    );

    for (const [familyId, family] of guardianMaps.families) {
      families.set(familyId, family);
    }
    for (const [guardianId, guardian] of guardianMaps.guardians) {
      guardians.set(guardianId, guardian);
    }
    for (const [familyId, guardianId] of guardianMaps.familyPrimaryGuardianIds) {
      familyPrimaryGuardianIds.set(familyId, guardianId);
    }
    for (const [familyId, guardianId] of guardianMaps.familyFirstGuardianIds) {
      familyFirstGuardianIds.set(familyId, guardianId);
    }
  }

  if (staffMemberIds.length > 0) {
    const { data, error } = await admin
      .from("staff_members")
      .select("id, first_name, last_name, role_title, profile_photo_url")
      .eq("organization_id", organizationId)
      .in("id", staffMemberIds);

    if (error) throw new Error(error.message);
    for (const row of data ?? []) {
      staffMembers.set(String(row.id), {
        firstName: String(row.first_name ?? ""),
        lastName: String(row.last_name ?? ""),
        roleTitle:
          typeof row.role_title === "string" ? row.role_title : null,
        profilePhotoUrl:
          typeof row.profile_photo_url === "string" && row.profile_photo_url.trim()
            ? row.profile_photo_url.trim()
            : null,
      });
    }
  }

  if (options.viewer === "teacher" && mergedFamilyIds.length > 0) {
    const studentsByFamily = await loadFamilyEnrolledStudentsForMessages(
      admin,
      organizationId,
      mergedFamilyIds,
    );
    for (const [familyId, students] of studentsByFamily) {
      familyEnrolledStudents.set(familyId, students);
    }
  }

  return {
    families,
    staffMembers,
    guardians,
    familyPrimaryGuardianIds,
    familyFirstGuardianIds,
    familyEnrolledStudents,
    schoolOfficeLabel,
    currentUserId,
    viewerGuardianId: options.viewerGuardianId ?? null,
  };
}

function collectIdsFromParticipants(
  participants: MessageThreadParticipantRow[],
): { familyIds: string[]; staffMemberIds: string[]; guardianIds: string[] } {
  const familyIds = new Set<string>();
  const staffMemberIds = new Set<string>();
  const guardianIds = new Set<string>();

  for (const participant of participants) {
    if (participant.family_id) familyIds.add(String(participant.family_id));
    if (participant.guardian_id) guardianIds.add(String(participant.guardian_id));
    if (participant.staff_member_id) {
      staffMemberIds.add(String(participant.staff_member_id));
    }
  }

  return {
    familyIds: [...familyIds],
    staffMemberIds: [...staffMemberIds],
    guardianIds: [...guardianIds],
  };
}

async function getUnreadCountsFallback(
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

async function getUnreadCounts(
  admin: SupabaseClient,
  threadIds: string[],
  userId: string,
): Promise<Map<string, number>> {
  if (threadIds.length === 0) return new Map();

  const { data, error } = await admin.rpc("thread_unread_counts", {
    p_user_id: userId,
    p_thread_ids: threadIds,
  });

  if (!error && data != null) {
    return mapThreadUnreadCountRows(threadIds, data);
  }

  return getUnreadCountsFallback(admin, threadIds, userId);
}

async function getLatestMessagesForThreads(
  admin: SupabaseClient,
  threadIds: string[],
): Promise<Map<string, PortalMessageRow>> {
  const lastMessageByThread = new Map<string, PortalMessageRow>();
  if (threadIds.length === 0) return lastMessageByThread;

  const { data, error } = await admin.rpc("latest_messages_for_threads", {
    p_thread_ids: threadIds,
  });

  if (!error && data != null) {
    for (const message of data as PortalMessageRow[]) {
      lastMessageByThread.set(String(message.thread_id), message);
    }
    return lastMessageByThread;
  }

  const { data: latestMessages, error: latestError } = await admin
    .from("portal_messages")
    .select("*")
    .in("thread_id", threadIds)
    .order("created_at", { ascending: false });

  if (latestError) throw new Error(latestError.message);

  for (const message of (latestMessages ?? []) as PortalMessageRow[]) {
    const threadId = String(message.thread_id);
    if (!lastMessageByThread.has(threadId)) {
      lastMessageByThread.set(threadId, message);
    }
  }

  return lastMessageByThread;
}

export async function countAdminUnreadMessages(
  admin: SupabaseClient,
  organizationId: string,
  userId: string,
): Promise<number> {
  const { data, error } = await admin.rpc("count_admin_unread_messages", {
    p_organization_id: organizationId,
    p_user_id: userId,
  });

  if (!error && data != null) {
    return Number(data);
  }

  const { data: threads, error: threadsError } = await admin
    .from("message_threads")
    .select("id")
    .eq("organization_id", organizationId);

  if (threadsError) throw new Error(threadsError.message);

  const threadIds = (threads ?? []).map((row) => String(row.id));
  if (threadIds.length === 0) return 0;

  const unreadCounts = await getUnreadCounts(admin, threadIds, userId);
  return [...unreadCounts.values()].reduce((sum, count) => sum + count, 0);
}

export async function getTotalUnreadCount(
  admin: SupabaseClient,
  organizationId: string,
  userId: string,
  schoolOfficeLabel: string,
  viewer: "parent" | "teacher" | "admin",
  filter:
    | { type: "guardian"; guardianIds: string[] }
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
  options?: {
    subject?: string | null;
    programId?: string | null;
  },
): Promise<string> {
  validateParticipantSet(participants);
  const signature = buildParticipantSignature(participants);
  const programId = options?.programId ?? null;

  let existingQuery = admin
    .from("message_threads")
    .select("id")
    .eq("organization_id", organizationId)
    .eq("participant_signature", signature);

  existingQuery = programId
    ? existingQuery.eq("program_id", programId)
    : existingQuery.is("program_id", null);

  const { data: existing, error: existingError } = await existingQuery.maybeSingle();

  if (existingError) throw new Error(existingError.message);
  if (existing?.id) return String(existing.id);

  const { data: thread, error: threadError } = await admin
    .from("message_threads")
    .insert({
      organization_id: organizationId,
      participant_signature: signature,
      subject: options?.subject?.trim() || null,
      program_id: programId,
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
        guardian_id: null,
        staff_member_id: null,
      };
    }
    if (participant.kind === "guardian") {
      return {
        thread_id: threadId,
        organization_id: organizationId,
        participant_kind: participant.kind,
        family_id: null,
        guardian_id: participant.guardianId,
        staff_member_id: null,
      };
    }
    if (participant.kind === "staff_member") {
      return {
        thread_id: threadId,
        organization_id: organizationId,
        participant_kind: participant.kind,
        family_id: null,
        guardian_id: null,
        staff_member_id: participant.staffMemberId,
      };
    }
    return {
      thread_id: threadId,
      organization_id: organizationId,
      participant_kind: participant.kind,
      family_id: null,
      guardian_id: null,
      staff_member_id: null,
    };
  });

  const { error: participantsError } = await admin
    .from("message_thread_participants")
    .insert(participantRows);

  if (participantsError) throw new Error(participantsError.message);

  return threadId;
}

function filterThreadsForAudienceScope(
  threads: MessageThreadRow[],
  participantsByThread: Map<string, MessageThreadParticipantRow[]>,
  audienceScope?: MessageThreadAudienceScope,
): MessageThreadRow[] {
  if (audienceScope?.mode !== "program_portal") {
    return threads;
  }

  return threads.filter((thread) =>
    threadVisibleInProgramPortalInbox({
      threadProgramId: thread.program_id,
      participants: (participantsByThread.get(String(thread.id)) ?? []).map(
        mapParticipantRow,
      ),
      programId: audienceScope.programId,
    }),
  );
}

export async function listThreadsForOrganization(
  admin: SupabaseClient,
  organizationId: string,
  currentUserId: string,
  schoolOfficeLabel: string,
  viewer: "parent" | "teacher" | "admin",
  filter:
    | { type: "guardian"; guardianIds: string[] }
    | { type: "staff"; staffMemberId: string }
    | { type: "admin" },
  audienceScope?: MessageThreadAudienceScope,
): Promise<MessageThreadSummary[]> {
  let threadIds: string[] = [];

  if (filter.type === "guardian") {
    if (filter.guardianIds.length === 0) return [];
    const { data, error } = await admin
      .from("message_thread_participants")
      .select("thread_id")
      .eq("organization_id", organizationId)
      .eq("participant_kind", "guardian")
      .in("guardian_id", filter.guardianIds);

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
    let adminQuery = admin
      .from("message_threads")
      .select("*")
      .eq("organization_id", organizationId)
      .order("last_message_at", { ascending: false, nullsFirst: false });

    adminQuery = applyMessageThreadAudienceScope(adminQuery, audienceScope);

    const { data, error } = await adminQuery;

    if (error) throw new Error(error.message);

    const threads = (data ?? []) as MessageThreadRow[];
    if (threads.length === 0) return [];

    const threadIds = threads.map((row) => String(row.id));

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

    const { familyIds, staffMemberIds, guardianIds } = collectIdsFromParticipants(
      (participantRows ?? []) as MessageThreadParticipantRow[],
    );

    const [context, unreadCounts, lastMessageByThread] = await Promise.all([
      loadDisplayContext(
        admin,
        organizationId,
        currentUserId,
        schoolOfficeLabel,
        familyIds,
        staffMemberIds,
        guardianIds,
        { viewer, currentStaffMemberId: null },
      ),
      getUnreadCounts(admin, threadIds, currentUserId),
      getLatestMessagesForThreads(admin, threadIds),
    ]);

    const visibleThreads = filterThreadsForAudienceScope(
      threads,
      participantsByThread,
      audienceScope,
    );

    return visibleThreads.map((thread) => {
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

  if (threadIds.length === 0) return [];

  let threadsQuery = admin
    .from("message_threads")
    .select("*")
    .in("id", threadIds)
    .order("last_message_at", { ascending: false, nullsFirst: false });

  threadsQuery = applyMessageThreadAudienceScope(threadsQuery, audienceScope);

  const { data: threads, error: threadsError } = await threadsQuery;

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

  const { familyIds, staffMemberIds, guardianIds } = collectIdsFromParticipants(
    (participantRows ?? []) as MessageThreadParticipantRow[],
  );

  const context = await loadDisplayContext(
    admin,
    organizationId,
    currentUserId,
    schoolOfficeLabel,
    familyIds,
    staffMemberIds,
    guardianIds,
    {
      viewer,
      currentStaffMemberId: filter.type === "staff" ? filter.staffMemberId : null,
      viewerGuardianId: filter.type === "guardian" ? filter.guardianIds[0] ?? null : null,
    },
  );

  const unreadCounts = await getUnreadCounts(admin, threadIds, currentUserId);

  const lastMessageByThread = await getLatestMessagesForThreads(admin, threadIds);

  const visibleThreads = filterThreadsForAudienceScope(
    (threads ?? []) as MessageThreadRow[],
    participantsByThread,
    audienceScope,
  );

  return visibleThreads.map((thread) => {
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
  options: { currentStaffMemberId?: string | null } = {},
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

  const { familyIds, staffMemberIds, guardianIds } = collectIdsFromParticipants(
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
      guardianIds,
      { viewer, currentStaffMemberId: options.currentStaffMemberId ?? null },
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
    (messageRows ?? []) as PortalMessageRow[],
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
