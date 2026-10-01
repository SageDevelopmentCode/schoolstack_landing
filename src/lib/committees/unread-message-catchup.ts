import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { ACTIVITY_ACTIONS, logActivityEvent } from "@/lib/activity-log";
import { logSettledNotificationFailures } from "@/lib/admissions/notification-logging";
import { SCHOOL_ADMIN_ATTRIBUTION } from "@/lib/committees/attribution";
import {
  type CommitteeCatchUpMessageInput,
  summarizeEligibleCommitteeMessagesForMember,
} from "@/lib/committees/committee-unread-message-eligibility";
import {
  resolveCommitteeMemberEmail,
  type AssigneeMemberRow,
} from "@/lib/committees/committee-notifications";
import {
  committeeMemberWorkspaceUrl,
  type CommitteePortalMember,
} from "@/lib/committees/committee-portal-urls";
import { buildEmailNotificationContext, sendCommitteeUnreadCatchUpEmail } from "@/lib/emails";
import { fetchAllPostgrestRows } from "@/lib/supabase/fetch-all-rows";

type CommitteeMemberRow = AssigneeMemberRow & {
  committee_id: string;
};

type CommitteeRow = {
  id: string;
  name: string;
};

type SectionReadRow = {
  committee_member_id: string;
  read_at: string;
};

export type CommitteeUnreadCatchUpCommitteeItem = {
  committeeId: string;
  committeeName: string;
  memberId: string;
  latestMessageId: string;
  unreadCount: number;
  preview: string;
  senderName: string;
  messagesUrl: string;
};

export type CommitteeUnreadCatchUpResult = {
  membersConsidered: number;
  emailsSent: number;
  emailFailures: number;
  skippedNoEmail: number;
  skippedAlreadySent: number;
  skippedNoUnread: number;
  dryRun: boolean;
};

function messagePreview(body: string): string {
  const trimmed = body.trim();
  return trimmed || "New message";
}

function catchUpIdempotencyKey(memberId: string, committeeId: string): string {
  return `${memberId}:${committeeId}`;
}

async function loadCatchUpSentKeys(
  admin: SupabaseClient,
  organizationId: string,
): Promise<Set<string>> {
  const { data, error } = await admin
    .from("activity_events")
    .select("entity_id, metadata")
    .eq("organization_id", organizationId)
    .eq("action", ACTIVITY_ACTIONS.COMMITTEE_UNREAD_MESSAGES_CATCHUP_SENT)
    .eq("entity_type", "committee_member");

  if (error) throw new Error(error.message);

  const keys = new Set<string>();
  for (const row of data ?? []) {
    const memberId = String(row.entity_id);
    const metadata = row.metadata as Record<string, unknown> | null;
    const committeeId =
      metadata && typeof metadata.committeeId === "string"
        ? metadata.committeeId
        : null;
    if (committeeId) {
      keys.add(catchUpIdempotencyKey(memberId, committeeId));
    }
  }
  return keys;
}

async function recordCatchUpSent(
  admin: SupabaseClient,
  input: {
    organizationId: string;
    memberId: string;
    committeeId: string;
    committeeName: string;
    messageCount: number;
    latestMessageId: string;
    recipientEmail: string;
    dryRun: boolean;
  },
): Promise<void> {
  if (input.dryRun) return;

  await logActivityEvent(admin, {
    organizationId: input.organizationId,
    actorType: "system",
    actorName: "MudKitchen",
    surface: "system",
    action: ACTIVITY_ACTIONS.COMMITTEE_UNREAD_MESSAGES_CATCHUP_SENT,
    entityType: "committee_member",
    entityId: input.memberId,
    summary: `Unread committee messages catch-up sent for ${input.committeeName}`,
    metadata: {
      committeeId: input.committeeId,
      committeeName: input.committeeName,
      messageCount: input.messageCount,
      latestMessageId: input.latestMessageId,
      recipientEmail: input.recipientEmail,
      dryRun: false,
    },
  });
}

function resolveSenderName(
  senderMemberId: string | null,
  membersById: Map<string, CommitteeMemberRow>,
): string {
  if (!senderMemberId) return SCHOOL_ADMIN_ATTRIBUTION;
  const sender = membersById.get(senderMemberId);
  const name = sender?.display_name?.trim();
  return name || SCHOOL_ADMIN_ATTRIBUTION;
}

export async function sendCommitteeUnreadMessageCatchUpForOrganization(
  admin: SupabaseClient,
  organizationId: string,
  options?: {
    committeeIds?: string[];
    dryRun?: boolean;
  },
): Promise<CommitteeUnreadCatchUpResult> {
  const dryRun = options?.dryRun ?? false;
  const committeeIdFilter = options?.committeeIds?.filter(Boolean) ?? null;

  const result: CommitteeUnreadCatchUpResult = {
    membersConsidered: 0,
    emailsSent: 0,
    emailFailures: 0,
    skippedNoEmail: 0,
    skippedAlreadySent: 0,
    skippedNoUnread: 0,
    dryRun,
  };

  const { data: organization, error: organizationError } = await admin
    .from("organizations")
    .select("name, slug")
    .eq("id", organizationId)
    .maybeSingle();

  if (organizationError) throw new Error(organizationError.message);
  if (!organization?.slug || !organization.name) {
    return result;
  }

  const schoolName = String(organization.name);
  const schoolSlug = String(organization.slug);

  let membersQuery = admin
    .from("committee_members")
    .select(
      "id, committee_id, display_name, email, user_id, guardian_id, staff_member_id",
    )
    .eq("organization_id", organizationId)
    .eq("status", "active");

  if (committeeIdFilter && committeeIdFilter.length > 0) {
    membersQuery = membersQuery.in("committee_id", committeeIdFilter);
  }

  const { data: memberRows, error: membersError } = await membersQuery;
  if (membersError) throw new Error(membersError.message);

  const members = (memberRows ?? []) as CommitteeMemberRow[];
  result.membersConsidered = members.length;
  if (members.length === 0) {
    return result;
  }

  const committeeIds = [...new Set(members.map((member) => member.committee_id))];

  const { data: committeeRows, error: committeesError } = await admin
    .from("committees")
    .select("id, name")
    .eq("organization_id", organizationId)
    .in("id", committeeIds);

  if (committeesError) throw new Error(committeesError.message);

  const committeeNameById = new Map<string, string>();
  for (const row of (committeeRows ?? []) as CommitteeRow[]) {
    committeeNameById.set(String(row.id), String(row.name));
  }

  const memberIds = members.map((member) => member.id);
  const { data: readRows, error: readsError } = await admin
    .from("committee_member_section_reads")
    .select("committee_member_id, read_at")
    .in("committee_member_id", memberIds)
    .eq("section", "messages");

  if (readsError) throw new Error(readsError.message);

  const messagesReadAtByMemberId = new Map<string, string>();
  for (const row of (readRows ?? []) as SectionReadRow[]) {
    messagesReadAtByMemberId.set(String(row.committee_member_id), String(row.read_at));
  }

  const messageRows = await fetchAllPostgrestRows(async (from, to) =>
    admin
      .from("committee_messages")
      .select("id, committee_id, sender_member_id, body, created_at")
      .in("committee_id", committeeIds)
      .order("created_at", { ascending: true })
      .order("id", { ascending: true })
      .range(from, to),
  );

  const messages: CommitteeCatchUpMessageInput[] = messageRows.map((row) => ({
    id: String(row.id),
    committeeId: String(row.committee_id),
    senderMemberId: row.sender_member_id ? String(row.sender_member_id) : null,
    body: String(row.body ?? ""),
    createdAt: String(row.created_at),
  }));

  const membersById = new Map(members.map((member) => [member.id, member]));
  const catchUpSentKeys = await loadCatchUpSentKeys(admin, organizationId);

  const emailContext = buildEmailNotificationContext({
    organizationId,
    organizationSlug: schoolSlug,
    surface: "system",
    entityType: "organization",
    entityId: organizationId,
  });

  type RecipientBucket = {
    email: string;
    portalMember: CommitteePortalMember;
    committees: CommitteeUnreadCatchUpCommitteeItem[];
  };

  const bucketsByEmail = new Map<string, RecipientBucket>();

  for (const member of members) {
    const committeeId = member.committee_id;
    const committeeName = committeeNameById.get(committeeId) ?? "Committee";

    if (catchUpSentKeys.has(catchUpIdempotencyKey(member.id, committeeId))) {
      result.skippedAlreadySent += 1;
      continue;
    }

    const lastReadAt = messagesReadAtByMemberId.get(member.id) ?? null;
    const summary = summarizeEligibleCommitteeMessagesForMember(messages, {
      committeeId,
      recipientMemberId: member.id,
      lastReadAt,
    });

    if (!summary.latestEligible || summary.unreadCount === 0) {
      result.skippedNoUnread += 1;
      continue;
    }

    const email = await resolveCommitteeMemberEmail(admin, member);
    if (!email) {
      result.skippedNoEmail += 1;
      continue;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const senderName = resolveSenderName(
      summary.latestEligible.senderMemberId,
      membersById,
    );

    const item: CommitteeUnreadCatchUpCommitteeItem = {
      committeeId,
      committeeName,
      memberId: member.id,
      latestMessageId: summary.latestEligible.id,
      unreadCount: summary.unreadCount,
      preview: messagePreview(summary.latestEligible.body),
      senderName,
      messagesUrl: committeeMemberWorkspaceUrl(
        schoolSlug,
        committeeId,
        "messages",
        member,
      ),
    };

    const existing = bucketsByEmail.get(normalizedEmail);
    if (existing) {
      existing.committees.push(item);
    } else {
      bucketsByEmail.set(normalizedEmail, {
        email,
        portalMember: member,
        committees: [item],
      });
    }
  }

  for (const bucket of bucketsByEmail.values()) {
    const totalUnread = bucket.committees.reduce(
      (sum, committee) => sum + committee.unreadCount,
      0,
    );

    if (dryRun) {
      console.info(
        `[committee-unread-catchup] DRY_RUN would email ${bucket.email}: ${bucket.committees.length} committee(s), ${totalUnread} unread message(s)`,
      );
      for (const committee of bucket.committees) {
        console.info(
          `  - ${committee.committeeName}: ${committee.unreadCount} unread, latest from ${committee.senderName}`,
        );
      }
      continue;
    }

    const sendResult = await Promise.allSettled([
      sendCommitteeUnreadCatchUpEmail({
        email: bucket.email,
        schoolName,
        committees: bucket.committees.map((committee) => ({
          committeeName: committee.committeeName,
          unreadCount: committee.unreadCount,
          preview: committee.preview,
          senderName: committee.senderName,
          messagesUrl: committee.messagesUrl,
        })),
        totalUnread,
        recipientPortal: bucket.portalMember.staff_member_id ? "teacher" : "parent",
        notificationContext: emailContext,
      }),
    ]);

    await logSettledNotificationFailures(
      admin,
      {
        organizationId,
        operation: "committee.unread_messages.catchup.notify",
        entityType: "organization",
        entityId: organizationId,
        metadata: {
          recipientEmail: bucket.email,
          committeeCount: bucket.committees.length,
        },
      },
      sendResult,
    );

    const fulfilled = sendResult[0];
    if (fulfilled?.status === "fulfilled" && fulfilled.value) {
      result.emailsSent += 1;
      for (const committee of bucket.committees) {
        await recordCatchUpSent(admin, {
          organizationId,
          memberId: committee.memberId,
          committeeId: committee.committeeId,
          committeeName: committee.committeeName,
          messageCount: committee.unreadCount,
          latestMessageId: committee.latestMessageId,
          recipientEmail: bucket.email,
          dryRun: false,
        });
      }
    } else {
      result.emailFailures += 1;
    }
  }

  return result;
}
