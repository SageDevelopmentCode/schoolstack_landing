import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { logSettledNotificationFailures } from "@/lib/admissions/notification-logging";
import { listOrganizationMemberships } from "@/lib/admin/organization-memberships";
import type { CommitteeWorkspaceSection } from "@/lib/committees/types";
import {
  sendExpoPushToUsers,
  type ExpoPushPortal,
} from "@/lib/notifications/expo-push";
import { resolveCommitteeNotificationEmails } from "@/lib/notifications/org-notification-settings";

export type CommitteePushMemberRef = {
  id: string;
  user_id: string | null;
  guardian_id: string | null;
  staff_member_id?: string | null;
  email: string | null;
};

export function resolveCommitteeMemberPushPortal(
  member: CommitteePushMemberRef,
): ExpoPushPortal {
  if (member.staff_member_id) return "teacher";
  if (member.user_id != null || member.guardian_id) return "parent";
  return "admin";
}

export async function resolveCommitteeMemberPushUserId(
  supabase: SupabaseClient,
  member: CommitteePushMemberRef,
): Promise<string | null> {
  if (member.user_id?.trim()) return member.user_id.trim();

  if (member.guardian_id) {
    const { data, error } = await supabase
      .from("guardians")
      .select("user_id")
      .eq("id", member.guardian_id)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (data?.user_id?.trim()) return data.user_id.trim();
  }

  return null;
}

export type CommitteeChannelAdminRecipient = {
  userId: string;
  email: string | null;
};

export async function resolveCommitteeChannelAdminPushRecipients(
  admin: SupabaseClient,
  organizationId: string,
): Promise<CommitteeChannelAdminRecipient[]> {
  const [channelEmails, memberships] = await Promise.all([
    resolveCommitteeNotificationEmails(admin, organizationId),
    listOrganizationMemberships(admin, organizationId),
  ]);

  const emailSet = new Set(
    channelEmails.map((email) => email.trim().toLowerCase()),
  );
  if (emailSet.size === 0) return [];

  const byUserId = new Map<string, CommitteeChannelAdminRecipient>();

  for (const membership of memberships) {
    if (membership.status !== "active") continue;
    const email = membership.email?.trim().toLowerCase() ?? "";
    if (!email || !emailSet.has(email)) continue;
    byUserId.set(membership.userId, {
      userId: membership.userId,
      email: membership.email,
    });
  }

  return [...byUserId.values()];
}

function truncatePushBody(text: string, maxLength = 160): string {
  const trimmed = text.trim();
  if (trimmed.length <= maxLength) return trimmed;
  return `${trimmed.slice(0, maxLength - 1)}…`;
}

export type CommitteeInstantPushRecipient = {
  userId: string;
  portal: ExpoPushPortal;
  email?: string | null;
};

async function resolveInstantPushRecipients(
  supabase: SupabaseClient,
  members: CommitteePushMemberRef[],
  options?: {
    excludeMemberIds?: string[];
    excludeUserIds?: string[];
  },
): Promise<CommitteeInstantPushRecipient[]> {
  const excludeMemberIds = new Set(options?.excludeMemberIds ?? []);
  const excludeUserIds = new Set(options?.excludeUserIds ?? []);
  const byUserId = new Map<string, CommitteeInstantPushRecipient>();

  for (const member of members) {
    if (excludeMemberIds.has(member.id)) continue;

    const userId = await resolveCommitteeMemberPushUserId(supabase, member);
    if (!userId || excludeUserIds.has(userId)) continue;

    byUserId.set(userId, {
      userId,
      portal: resolveCommitteeMemberPushPortal(member),
      email: member.email,
    });
  }

  return [...byUserId.values()];
}

export async function sendCommitteeInstantPushToMembers(
  admin: SupabaseClient,
  input: {
    organizationId: string;
    organizationName: string;
    organizationSlug: string;
    committeeId: string;
    title: string;
    body: string;
    section?: CommitteeWorkspaceSection;
    members: CommitteePushMemberRef[];
    excludeMemberIds?: string[];
    excludeUserIds?: string[];
    failureOperation: string;
  },
): Promise<void> {
  const recipients = await resolveInstantPushRecipients(admin, input.members, {
    excludeMemberIds: input.excludeMemberIds,
    excludeUserIds: input.excludeUserIds,
  });

  if (recipients.length === 0) return;

  const body = truncatePushBody(input.body);

  const results = await Promise.allSettled(
    recipients.map((recipient) =>
      sendExpoPushToUsers(admin, {
        organizationId: input.organizationId,
        organizationName: input.organizationName,
        userIds: [recipient.userId],
        title: input.title,
        body,
        channelId: "committees",
        recipientPortal: recipient.portal,
        recipientEmail: recipient.email ?? null,
        failureOperation: input.failureOperation,
        data: {
          kind: "committee",
          portal: recipient.portal,
          organizationSlug: input.organizationSlug,
          committeeId: input.committeeId,
          section: input.section,
        },
      }),
    ),
  );

  await logSettledNotificationFailures(
    admin,
    {
      organizationId: input.organizationId,
      operation: input.failureOperation,
      entityType: "committee",
      entityId: input.committeeId,
      metadata: { recipientCount: recipients.length },
    },
    results,
  );
}

export async function sendCommitteeInstantPushToUser(
  admin: SupabaseClient,
  input: {
    organizationId: string;
    organizationName: string;
    organizationSlug: string;
    committeeId: string;
    userId: string;
    portal: ExpoPushPortal;
    recipientEmail?: string | null;
    title: string;
    body: string;
    section?: CommitteeWorkspaceSection;
    intent?: "join_request";
    failureOperation: string;
  },
): Promise<void> {
  const result = await Promise.allSettled([
    sendExpoPushToUsers(admin, {
      organizationId: input.organizationId,
      organizationName: input.organizationName,
      userIds: [input.userId],
      title: input.title,
      body: truncatePushBody(input.body),
      channelId: "committees",
      recipientPortal: input.portal,
      recipientEmail: input.recipientEmail ?? null,
      failureOperation: input.failureOperation,
      data: {
        kind: "committee",
        portal: input.portal,
        organizationSlug: input.organizationSlug,
        committeeId: input.committeeId,
        section: input.section,
        intent: input.intent,
      },
    }),
  ]);

  await logSettledNotificationFailures(
    admin,
    {
      organizationId: input.organizationId,
      operation: input.failureOperation,
      entityType: "committee",
      entityId: input.committeeId,
      metadata: { recipientUserId: input.userId },
    },
    result,
  );
}

export async function sendCommitteeJoinRequestAdminPush(
  admin: SupabaseClient,
  input: {
    organizationId: string;
    organizationName: string;
    organizationSlug: string;
    committeeId: string;
    requesterName: string;
    committeeName: string;
  },
): Promise<void> {
  const admins = await resolveCommitteeChannelAdminPushRecipients(
    admin,
    input.organizationId,
  );
  if (admins.length === 0) return;

  const title = `${input.organizationName} — Committee join request`;
  const body = `${input.requesterName} requested to join ${input.committeeName}`;

  const results = await Promise.allSettled(
    admins.map((recipient) =>
      sendExpoPushToUsers(admin, {
        organizationId: input.organizationId,
        organizationName: input.organizationName,
        userIds: [recipient.userId],
        title,
        body: truncatePushBody(body),
        channelId: "committees",
        recipientPortal: "admin",
        recipientEmail: recipient.email,
        failureOperation: "committee.join_request.expo_push",
        data: {
          kind: "committee",
          portal: "admin",
          organizationSlug: input.organizationSlug,
          committeeId: input.committeeId,
          intent: "join_request",
        },
      }),
    ),
  );

  await logSettledNotificationFailures(
    admin,
    {
      organizationId: input.organizationId,
      operation: "committee.join_request.expo_push",
      entityType: "committee_join_request",
      entityId: input.committeeId,
      metadata: { recipientCount: admins.length },
    },
    results,
  );
}
