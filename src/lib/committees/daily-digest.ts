import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { logSettledNotificationFailures } from "@/lib/admissions/notification-logging";
import { COMMITTEE_DIGEST_ACTIONS } from "@/lib/committees/activity-feed";
import type { CommitteeActivityEventRow } from "@/lib/committees/activity-feed";
import {
  buildDigestCommitteeGroups,
  committeeIdFromEvent,
  filterDigestEventsForMember,
  type CommitteeDigestCommitteeGroup,
} from "@/lib/committees/daily-digest-utils";
import {
  resolveCommitteeMemberEmail,
  type AssigneeMemberRow,
} from "@/lib/committees/committee-notifications";
import { sendCommitteeDailyDigestEmail } from "@/lib/emails";
import {
  isCommitteeDailyDigestEnabled,
  resolveCommitteeNotificationEmails,
} from "@/lib/notifications/org-notification-settings";
import { schoolAdminPath } from "@/lib/organization-settings/admin-routes";
import { schoolParentRootPath } from "@/lib/organization-settings/parent-routes";
import { schoolTeacherPath } from "@/lib/organization-settings/teacher-routes";
import { SITE_URL } from "@/lib/site";

const DIGEST_WINDOW_HOURS = 24;

export type CommitteeDigestRecipientKind = "member" | "admin";

type CommitteeMemberRow = AssigneeMemberRow & {
  committee_id: string;
};

function digestWindowStartIso(referenceDate = new Date()): string {
  const start = new Date(referenceDate);
  start.setHours(start.getHours() - DIGEST_WINDOW_HOURS);
  return start.toISOString();
}

async function fetchDigestActivityEvents(
  admin: SupabaseClient,
  organizationId: string,
  referenceDate = new Date(),
): Promise<CommitteeActivityEventRow[]> {
  const { data, error } = await admin
    .from("activity_events")
    .select("id, organization_id, actor_name, action, summary, metadata, created_at")
    .eq("organization_id", organizationId)
    .in("action", COMMITTEE_DIGEST_ACTIONS)
    .gte("created_at", digestWindowStartIso(referenceDate))
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return ((data ?? []) as CommitteeActivityEventRow[]).filter((event) =>
    Boolean(committeeIdFromEvent(event)),
  );
}

async function loadActiveCommitteeMembers(
  admin: SupabaseClient,
  organizationId: string,
  committeeIds: string[],
): Promise<CommitteeMemberRow[]> {
  if (committeeIds.length === 0) return [];

  const { data, error } = await admin
    .from("committee_members")
    .select(
      "id, committee_id, display_name, email, user_id, guardian_id, staff_member_id",
    )
    .eq("organization_id", organizationId)
    .eq("status", "active")
    .in("committee_id", committeeIds);

  if (error) throw new Error(error.message);
  return (data ?? []) as CommitteeMemberRow[];
}

function memberPortalUrl(
  schoolSlug: string,
  member: CommitteeMemberRow,
): string {
  if (member.staff_member_id) {
    return `${SITE_URL}${schoolTeacherPath(schoolSlug, "committees")}?tab=mine`;
  }

  return `${SITE_URL}${schoolParentRootPath(schoolSlug)}/committees?tab=mine`;
}

function adminPortalUrl(schoolSlug: string): string {
  return `${SITE_URL}${schoolAdminPath(schoolSlug, "committees")}`;
}

function buildDigestSubject(
  schoolName: string,
  committees: CommitteeDigestCommitteeGroup[],
): string {
  if (committees.length === 1) {
    return `Committee update — ${committees[0].committeeName}`;
  }

  return `Committee update — ${schoolName}`;
}

async function sendDigestToRecipient(
  admin: SupabaseClient,
  input: {
    organizationId: string;
    email: string;
    schoolName: string;
    schoolSlug: string;
    recipientKind: CommitteeDigestRecipientKind;
    recipientName?: string | null;
    committees: CommitteeDigestCommitteeGroup[];
    committeesUrl: string;
  },
): Promise<boolean> {
  if (input.committees.length === 0) return false;

  const subject = buildDigestSubject(input.schoolName, input.committees);
  const result = await Promise.allSettled([
    sendCommitteeDailyDigestEmail({
      email: input.email,
      schoolName: input.schoolName,
      recipientName: input.recipientName ?? null,
      recipientKind: input.recipientKind,
      committees: input.committees,
      committeesUrl: input.committeesUrl,
      subject,
    }),
  ]);

  await logSettledNotificationFailures(
    admin,
    {
      organizationId: input.organizationId,
      operation: "committee.daily_digest.notify",
      entityType: "organization",
      entityId: input.organizationId,
      metadata: {
        recipientEmail: input.email,
        recipientKind: input.recipientKind,
        committeeCount: input.committees.length,
      },
    },
    result,
  );

  return result[0]?.status === "fulfilled";
}

export type CommitteeDailyDigestResult = {
  activityCount: number;
  digestsSent: number;
  digestFailures: number;
};

export async function sendCommitteeDailyDigestsForOrganization(
  admin: SupabaseClient,
  organizationId: string,
  referenceDate = new Date(),
): Promise<CommitteeDailyDigestResult> {
  const enabled = await isCommitteeDailyDigestEnabled(admin, organizationId);
  if (!enabled) {
    return { activityCount: 0, digestsSent: 0, digestFailures: 0 };
  }

  const events = await fetchDigestActivityEvents(
    admin,
    organizationId,
    referenceDate,
  );

  if (events.length === 0) {
    return { activityCount: 0, digestsSent: 0, digestFailures: 0 };
  }

  const { data: organization, error: organizationError } = await admin
    .from("organizations")
    .select("name, slug")
    .eq("id", organizationId)
    .maybeSingle();

  if (organizationError) throw new Error(organizationError.message);
  if (!organization?.slug || !organization.name) {
    return { activityCount: events.length, digestsSent: 0, digestFailures: 0 };
  }

  const schoolName = String(organization.name);
  const schoolSlug = String(organization.slug);
  const committeeIds = [
    ...new Set(
      events
        .map((event) => committeeIdFromEvent(event))
        .filter((committeeId): committeeId is string => Boolean(committeeId)),
    ),
  ];

  let digestsSent = 0;
  let digestFailures = 0;

  const members = await loadActiveCommitteeMembers(
    admin,
    organizationId,
    committeeIds,
  );

  type MemberDigestRecipient = {
    email: string;
    memberIds: string[];
    committeeIds: string[];
    displayName: string;
    portalMember: CommitteeMemberRow;
  };

  const recipientsByEmail = new Map<string, MemberDigestRecipient>();

  for (const member of members) {
    const email = await resolveCommitteeMemberEmail(admin, member);
    if (!email) continue;

    const normalizedEmail = email.trim().toLowerCase();
    const existing = recipientsByEmail.get(normalizedEmail);

    if (existing) {
      if (!existing.memberIds.includes(member.id)) {
        existing.memberIds.push(member.id);
      }
      if (!existing.committeeIds.includes(member.committee_id)) {
        existing.committeeIds.push(member.committee_id);
      }
      if (member.staff_member_id && !existing.portalMember.staff_member_id) {
        existing.portalMember = member;
      }
      continue;
    }

    recipientsByEmail.set(normalizedEmail, {
      email,
      memberIds: [member.id],
      committeeIds: [member.committee_id],
      displayName: member.display_name,
      portalMember: member,
    });
  }

  const sentEmails = new Set<string>();

  for (const recipient of recipientsByEmail.values()) {
    const normalizedEmail = recipient.email.trim().toLowerCase();
    if (sentEmails.has(normalizedEmail)) continue;

    const filteredEvents = filterDigestEventsForMember(events, {
      memberIds: recipient.memberIds,
      committeeIds: recipient.committeeIds,
    });
    const committees = buildDigestCommitteeGroups(filteredEvents, referenceDate);
    if (committees.length === 0) continue;

    const sent = await sendDigestToRecipient(admin, {
      organizationId,
      email: recipient.email,
      schoolName,
      schoolSlug,
      recipientKind: "member",
      recipientName: recipient.displayName,
      committees,
      committeesUrl: memberPortalUrl(schoolSlug, recipient.portalMember),
    });

    sentEmails.add(normalizedEmail);
    if (sent) {
      digestsSent += 1;
    } else {
      digestFailures += 1;
    }
  }

  const adminEmails = await resolveCommitteeNotificationEmails(admin, organizationId);
  const adminCommittees = buildDigestCommitteeGroups(events);

  for (const email of adminEmails) {
    const normalizedEmail = email.trim().toLowerCase();
    if (sentEmails.has(normalizedEmail)) continue;

    const sent = await sendDigestToRecipient(admin, {
      organizationId,
      email,
      schoolName,
      schoolSlug,
      recipientKind: "admin",
      committees: adminCommittees,
      committeesUrl: adminPortalUrl(schoolSlug),
    });

    sentEmails.add(normalizedEmail);
    if (sent) {
      digestsSent += 1;
    } else {
      digestFailures += 1;
    }
  }

  return {
    activityCount: events.length,
    digestsSent,
    digestFailures,
  };
}
