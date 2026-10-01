import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { CommitteeWorkspaceSection } from "@/lib/committees/types";
import type {
  CommitteeSectionUnreadCounts,
  CommitteeUnreadSection,
  CommitteeUnreadSummary,
  CommitteeUnreadSummaryItem,
} from "@/lib/committees/committee-unread-types";

export type {
  CommitteeSectionUnreadCounts,
  CommitteeUnreadSection,
  CommitteeUnreadSummary,
  CommitteeUnreadSummaryItem,
} from "@/lib/committees/committee-unread-types";

export const COMMITTEE_UNREAD_SECTIONS = [
  "messages",
  "tasks",
  "resources",
  "calendar",
] as const;

type MemberRow = {
  id: string;
  committee_id: string;
};

async function loadUserCommitteeMemberships(
  admin: SupabaseClient,
  organizationId: string,
  userId: string,
): Promise<MemberRow[]> {
  const { data, error } = await admin
    .from("committee_members")
    .select("id, committee_id")
    .eq("organization_id", organizationId)
    .eq("user_id", userId)
    .eq("status", "active");

  if (error) throw new Error(error.message);
  return (data ?? []) as MemberRow[];
}

async function loadSectionReadMap(
  admin: SupabaseClient,
  memberIds: string[],
): Promise<Map<string, Partial<Record<CommitteeUnreadSection, string>>>> {
  if (memberIds.length === 0) return new Map();

  const { data, error } = await admin
    .from("committee_member_section_reads")
    .select("committee_member_id, section, read_at")
    .in("committee_member_id", memberIds);

  if (error) throw new Error(error.message);

  const map = new Map<string, Partial<Record<CommitteeUnreadSection, string>>>();
  for (const row of data ?? []) {
    const memberId = String(row.committee_member_id);
    const section = String(row.section) as CommitteeUnreadSection;
    const existing = map.get(memberId) ?? {};
    existing[section] = String(row.read_at);
    map.set(memberId, existing);
  }
  return map;
}

function isUnread(latestIso: string | null, readAtIso: string | undefined): boolean {
  if (!latestIso) return false;
  const latestMs = Date.parse(latestIso);
  if (Number.isNaN(latestMs)) return false;
  if (!readAtIso) return true;
  const readMs = Date.parse(readAtIso);
  if (Number.isNaN(readMs)) return true;
  return latestMs > readMs;
}

async function loadLatestMessageAt(
  admin: SupabaseClient,
  committeeIds: string[],
): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  for (const committeeId of committeeIds) {
    const { data, error } = await admin
      .from("committee_messages")
      .select("created_at")
      .eq("committee_id", committeeId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (data?.created_at) map.set(committeeId, String(data.created_at));
  }
  return map;
}

async function loadLatestTaskAt(
  admin: SupabaseClient,
  committeeIds: string[],
): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  for (const committeeId of committeeIds) {
    const { data, error } = await admin
      .from("committee_tasks")
      .select("created_at")
      .eq("committee_id", committeeId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (data?.created_at) map.set(committeeId, String(data.created_at));
  }
  return map;
}

async function loadLatestResourceAt(
  admin: SupabaseClient,
  committeeIds: string[],
): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  for (const committeeId of committeeIds) {
    const { data, error } = await admin
      .from("committee_resources")
      .select("created_at")
      .eq("committee_id", committeeId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (data?.created_at) map.set(committeeId, String(data.created_at));
  }
  return map;
}

async function loadLatestEventAt(
  admin: SupabaseClient,
  committeeIds: string[],
): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  for (const committeeId of committeeIds) {
    const { data, error } = await admin
      .from("committee_events")
      .select("created_at")
      .eq("committee_id", committeeId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (data?.created_at) map.set(committeeId, String(data.created_at));
  }
  return map;
}

export async function getCommitteeUnreadSummaryForUser(
  admin: SupabaseClient,
  organizationId: string,
  userId: string,
): Promise<CommitteeUnreadSummary> {
  const memberships = await loadUserCommitteeMemberships(admin, organizationId, userId);
  if (memberships.length === 0) {
    return { totalUnread: 0, byCommittee: [] };
  }

  const committeeIds = [...new Set(memberships.map((m) => m.committee_id))];
  const memberIds = memberships.map((m) => m.id);
  const readMap = await loadSectionReadMap(admin, memberIds);

  const [messagesAt, tasksAt, resourcesAt, eventsAt] = await Promise.all([
    loadLatestMessageAt(admin, committeeIds),
    loadLatestTaskAt(admin, committeeIds),
    loadLatestResourceAt(admin, committeeIds),
    loadLatestEventAt(admin, committeeIds),
  ]);

  const byCommittee: CommitteeUnreadSummaryItem[] = memberships.map((member) => {
    const reads = readMap.get(member.id) ?? {};
    const committeeId = member.committee_id;
    const sections: CommitteeSectionUnreadCounts = {
      messages: isUnread(messagesAt.get(committeeId) ?? null, reads.messages) ? 1 : 0,
      tasks: isUnread(tasksAt.get(committeeId) ?? null, reads.tasks) ? 1 : 0,
      resources: isUnread(resourcesAt.get(committeeId) ?? null, reads.resources) ? 1 : 0,
      calendar: isUnread(eventsAt.get(committeeId) ?? null, reads.calendar) ? 1 : 0,
    };
    const unread = Object.values(sections).reduce((sum, n) => sum + n, 0);
    return {
      committeeId,
      memberId: member.id,
      unread,
      sections,
    };
  });

  const totalUnread = byCommittee.reduce((sum, row) => sum + row.unread, 0);
  return { totalUnread, byCommittee };
}

export async function markCommitteeSectionRead(
  admin: SupabaseClient,
  memberId: string,
  section: CommitteeWorkspaceSection,
): Promise<void> {
  if (!COMMITTEE_UNREAD_SECTIONS.includes(section as CommitteeUnreadSection)) {
    return;
  }

  const now = new Date().toISOString();
  const { error } = await admin.from("committee_member_section_reads").upsert(
    {
      committee_member_id: memberId,
      section,
      read_at: now,
      updated_at: now,
    },
    { onConflict: "committee_member_id,section" },
  );

  if (error) throw new Error(error.message);
}
