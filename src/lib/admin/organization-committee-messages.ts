import type { SupabaseClient } from "@supabase/supabase-js";
import {
  mapMemberRow,
  mapMessageRow,
  type CommitteeMemberRow,
  type CommitteeMessageRow,
} from "@/lib/committees/mappers";
import type { CommitteeMessage } from "@/lib/committees/types";

export type OrganizationCommitteeMessageSummary = {
  id: string;
  name: string;
  memberCount: number;
  lastMessageAt: string | null;
  lastMessagePreview: string | null;
  messageCount: number;
};

export type OrganizationCommitteeMessageDetail = {
  committee: {
    id: string;
    name: string;
    memberCount: number;
  };
  messages: CommitteeMessage[];
};

function previewBody(body: string, maxLength = 80): string {
  const trimmed = body.trim();
  if (trimmed.length <= maxLength) return trimmed;
  return `${trimmed.slice(0, maxLength - 1)}…`;
}

export async function listOrganizationCommitteeMessageSummaries(
  admin: SupabaseClient,
  organizationId: string,
): Promise<OrganizationCommitteeMessageSummary[]> {
  const { data: committees, error: committeesError } = await admin
    .from("committees")
    .select("id, name")
    .eq("organization_id", organizationId)
    .order("name", { ascending: true });

  if (committeesError) throw new Error(committeesError.message);
  if (!committees?.length) return [];

  const committeeIds = committees.map((row) => String(row.id));

  const [memberCountsResult, messagesResult] = await Promise.all([
    admin
      .from("committee_members")
      .select("committee_id")
      .in("committee_id", committeeIds)
      .eq("status", "active"),
    admin
      .from("committee_messages")
      .select("id, committee_id, body, created_at")
      .in("committee_id", committeeIds)
      .order("created_at", { ascending: false }),
  ]);

  if (memberCountsResult.error) throw new Error(memberCountsResult.error.message);
  if (messagesResult.error) throw new Error(messagesResult.error.message);

  const memberCountByCommittee = new Map<string, number>();
  for (const row of memberCountsResult.data ?? []) {
    const committeeId = String(row.committee_id);
    memberCountByCommittee.set(
      committeeId,
      (memberCountByCommittee.get(committeeId) ?? 0) + 1,
    );
  }

  const latestByCommittee = new Map<
    string,
    { createdAt: string; preview: string }
  >();
  const messageCountByCommittee = new Map<string, number>();

  for (const row of messagesResult.data ?? []) {
    const committeeId = String(row.committee_id);
    messageCountByCommittee.set(
      committeeId,
      (messageCountByCommittee.get(committeeId) ?? 0) + 1,
    );

    if (!latestByCommittee.has(committeeId)) {
      latestByCommittee.set(committeeId, {
        createdAt: String(row.created_at),
        preview: previewBody(String(row.body ?? "")),
      });
    }
  }

  const summaries = committees.map((committee) => {
    const id = String(committee.id);
    const latest = latestByCommittee.get(id);
    return {
      id,
      name: String(committee.name),
      memberCount: memberCountByCommittee.get(id) ?? 0,
      lastMessageAt: latest?.createdAt ?? null,
      lastMessagePreview: latest?.preview ?? null,
      messageCount: messageCountByCommittee.get(id) ?? 0,
    };
  });

  return summaries.sort((a, b) => {
    if (a.lastMessageAt && b.lastMessageAt) {
      return b.lastMessageAt.localeCompare(a.lastMessageAt);
    }
    if (a.lastMessageAt) return -1;
    if (b.lastMessageAt) return 1;
    return a.name.localeCompare(b.name);
  });
}

export async function getOrganizationCommitteeMessages(
  admin: SupabaseClient,
  organizationId: string,
  committeeId: string,
): Promise<OrganizationCommitteeMessageDetail | null> {
  const { data: committee, error: committeeError } = await admin
    .from("committees")
    .select("id, name")
    .eq("id", committeeId)
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (committeeError) throw new Error(committeeError.message);
  if (!committee) return null;

  const [membersResult, messagesResult] = await Promise.all([
    admin
      .from("committee_members")
      .select("*")
      .eq("committee_id", committeeId)
      .order("display_name"),
    admin
      .from("committee_messages")
      .select("*")
      .eq("committee_id", committeeId)
      .order("created_at", { ascending: true }),
  ]);

  if (membersResult.error) throw new Error(membersResult.error.message);
  if (messagesResult.error) throw new Error(messagesResult.error.message);

  const members = (membersResult.data ?? []).map((row) =>
    mapMemberRow(row as CommitteeMemberRow),
  );
  const activeMemberCount = members.filter((member) => member.status === "active").length;
  const messages = (messagesResult.data ?? []).map((row) =>
    mapMessageRow(row as CommitteeMessageRow, members),
  );

  return {
    committee: {
      id: String(committee.id),
      name: String(committee.name),
      memberCount: activeMemberCount,
    },
    messages,
  };
}
