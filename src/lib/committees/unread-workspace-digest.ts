import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { logSettledNotificationFailures } from "@/lib/admissions/notification-logging";
import { digestEligibleSectionCounts } from "@/lib/committees/committee-unread-digest-eligibility";
import { COMMITTEE_UNREAD_SECTIONS } from "@/lib/committees/committee-unread";
import type {
  CommitteeUnreadSection,
  CommitteeSectionUnreadCounts,
} from "@/lib/committees/committee-unread-types";
import {
  resolveCommitteeMemberEmail,
  type AssigneeMemberRow,
} from "@/lib/committees/committee-notifications";
import {
  committeeMemberWorkspaceUrl,
  type CommitteePortalMember,
} from "@/lib/committees/committee-portal-urls";
import type { CommitteeWorkspaceSection } from "@/lib/committees/types";
import {
  buildMemberDisplayNameLookup,
  loadWorkspaceDigestSectionPreviews,
  type WorkspaceDigestSectionPreview,
} from "@/lib/committees/unread-workspace-digest-previews";
import {
  buildEmailNotificationContext,
  sendCommitteeUnreadWorkspaceDigestEmail,
} from "@/lib/emails";
import {
  releaseCommitteeSectionDigestClaim,
  tryClaimCommitteeSectionDigest,
  type MemberSectionPair,
} from "@/lib/committees/committee-member-section-read-stamps";
import { isCommitteeUnreadWorkspaceDigestEnabled } from "@/lib/notifications/org-notification-settings";

const SECTION_LABELS: Record<CommitteeUnreadSection, string> = {
  messages: "Messages",
  tasks: "Tasks",
  resources: "Resources",
  calendar: "Calendar",
};

type CommitteeMemberRow = AssigneeMemberRow & {
  committee_id: string;
  user_id: string | null;
};

type SectionReadDigestRow = {
  committee_member_id: string;
  section: string;
  read_at: string;
  last_unread_digest_notified_at: string | null;
};

export type CommitteeUnreadWorkspaceDigestCommitteeItem = {
  committeeId: string;
  committeeName: string;
  memberId: string;
  sections: CommitteeSectionUnreadCounts;
  sectionLabels: string[];
  sectionPreviews: WorkspaceDigestSectionPreview[];
  workspaceUrl: string;
};

export type CommitteeUnreadWorkspaceDigestResult = {
  membersConsidered: number;
  digestsSent: number;
  digestFailures: number;
  skippedNoEmail: number;
  skippedNoUnread: number;
  skippedDuplicateClaim: number;
};

type DigestClaimTarget = MemberSectionPair & {
  priorDigestNotifiedAt: string | null;
  hadReadRowAtLoad: boolean;
};

function stampTargetsFromBucket(
  stampSections: Array<{ memberId: string; sections: CommitteeUnreadSection[] }>,
  readDigestMap: Map<
    string,
    Partial<
      Record<
        CommitteeUnreadSection,
        { readAt: string | null; digestNotifiedAt: string | null }
      >
    >
  >,
): DigestClaimTarget[] {
  const targets: DigestClaimTarget[] = [];

  for (const stamp of stampSections) {
    const reads = readDigestMap.get(stamp.memberId) ?? {};
    for (const section of stamp.sections) {
      const state = reads[section];
      targets.push({
        memberId: stamp.memberId,
        section,
        priorDigestNotifiedAt: state?.digestNotifiedAt ?? null,
        hadReadRowAtLoad: state !== undefined,
      });
    }
  }

  return targets;
}

function markDigestClaimedInMap(
  readDigestMap: Map<
    string,
    Partial<
      Record<
        CommitteeUnreadSection,
        { readAt: string | null; digestNotifiedAt: string | null }
      >
    >
  >,
  targets: DigestClaimTarget[],
  claimAt: string,
): void {
  for (const target of targets) {
    const existing = readDigestMap.get(target.memberId) ?? {};
    const sectionState = existing[target.section];
    existing[target.section] = {
      readAt: sectionState?.readAt ?? null,
      digestNotifiedAt: claimAt,
    };
    readDigestMap.set(target.memberId, existing);
  }
}

async function tryClaimDigestTargets(
  admin: SupabaseClient,
  targets: DigestClaimTarget[],
  claimAt: string,
): Promise<DigestClaimTarget[]> {
  const claimed: DigestClaimTarget[] = [];

  for (const target of targets) {
    const won = await tryClaimCommitteeSectionDigest(admin, target, {
      claimAt,
      expectedDigestNotifiedAt: target.priorDigestNotifiedAt,
      hadReadRowAtLoad: target.hadReadRowAtLoad,
    });

    if (!won) {
      for (const prior of claimed) {
        await releaseCommitteeSectionDigestClaim(admin, prior, {
          claimAt,
          priorDigestNotifiedAt: prior.priorDigestNotifiedAt,
        });
      }
      return [];
    }

    claimed.push(target);
  }

  return claimed;
}

async function releaseDigestClaims(
  admin: SupabaseClient,
  claimed: DigestClaimTarget[],
  claimAt: string,
): Promise<void> {
  for (const target of claimed) {
    await releaseCommitteeSectionDigestClaim(admin, target, {
      claimAt,
      priorDigestNotifiedAt: target.priorDigestNotifiedAt,
    });
  }
}

async function loadOrgActiveMembers(
  admin: SupabaseClient,
  organizationId: string,
): Promise<CommitteeMemberRow[]> {
  const { data, error } = await admin
    .from("committee_members")
    .select(
      "id, committee_id, user_id, display_name, email, guardian_id, staff_member_id",
    )
    .eq("organization_id", organizationId)
    .eq("status", "active");

  if (error) throw new Error(error.message);
  return (data ?? []) as CommitteeMemberRow[];
}

async function loadSectionReadDigestMap(
  admin: SupabaseClient,
  memberIds: string[],
): Promise<
  Map<
    string,
    Partial<
      Record<
        CommitteeUnreadSection,
        { readAt: string | null; digestNotifiedAt: string | null }
      >
    >
  >
> {
  const map = new Map<
    string,
    Partial<
      Record<
        CommitteeUnreadSection,
        { readAt: string | null; digestNotifiedAt: string | null }
      >
    >
  >();
  if (memberIds.length === 0) return map;

  const { data, error } = await admin
    .from("committee_member_section_reads")
    .select(
      "committee_member_id, section, read_at, last_unread_digest_notified_at",
    )
    .in("committee_member_id", memberIds);

  if (error) throw new Error(error.message);

  for (const row of (data ?? []) as SectionReadDigestRow[]) {
    const memberId = String(row.committee_member_id);
    const section = String(row.section) as CommitteeUnreadSection;
    const existing = map.get(memberId) ?? {};
    existing[section] = {
      readAt: row.read_at ? String(row.read_at) : null,
      digestNotifiedAt: row.last_unread_digest_notified_at
        ? String(row.last_unread_digest_notified_at)
        : null,
    };
    map.set(memberId, existing);
  }
  return map;
}

async function loadLatestTimestampsForCommittees(
  admin: SupabaseClient,
  committeeIds: string[],
): Promise<{
  messagesAt: Map<string, string>;
  tasksAt: Map<string, string>;
  resourcesAt: Map<string, string>;
  eventsAt: Map<string, string>;
}> {
  const messagesAt = new Map<string, string>();
  const tasksAt = new Map<string, string>();
  const resourcesAt = new Map<string, string>();
  const eventsAt = new Map<string, string>();

  for (const committeeId of committeeIds) {
    const [message, task, resource, event] = await Promise.all([
      admin
        .from("committee_messages")
        .select("created_at")
        .eq("committee_id", committeeId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      admin
        .from("committee_tasks")
        .select("created_at")
        .eq("committee_id", committeeId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      admin
        .from("committee_resources")
        .select("created_at")
        .eq("committee_id", committeeId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      admin
        .from("committee_events")
        .select("created_at")
        .eq("committee_id", committeeId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

    if (message.error) throw new Error(message.error.message);
    if (task.error) throw new Error(task.error.message);
    if (resource.error) throw new Error(resource.error.message);
    if (event.error) throw new Error(event.error.message);

    if (message.data?.created_at) {
      messagesAt.set(committeeId, String(message.data.created_at));
    }
    if (task.data?.created_at) {
      tasksAt.set(committeeId, String(task.data.created_at));
    }
    if (resource.data?.created_at) {
      resourcesAt.set(committeeId, String(resource.data.created_at));
    }
    if (event.data?.created_at) {
      eventsAt.set(committeeId, String(event.data.created_at));
    }
  }

  return { messagesAt, tasksAt, resourcesAt, eventsAt };
}

function sectionLabelsFromCounts(sections: CommitteeSectionUnreadCounts): string[] {
  return COMMITTEE_UNREAD_SECTIONS.filter((section) => sections[section] > 0).map(
    (section) => SECTION_LABELS[section],
  );
}

function totalSectionUnread(sections: CommitteeSectionUnreadCounts): number {
  return Object.values(sections).reduce((sum, count) => sum + count, 0);
}

function primaryWorkspaceSection(
  sections: CommitteeSectionUnreadCounts,
): CommitteeWorkspaceSection {
  if (sections.messages > 0) return "messages";
  if (sections.tasks > 0) return "tasks";
  if (sections.resources > 0) return "resources";
  if (sections.calendar > 0) return "calendar";
  return "home";
}

export async function sendCommitteeUnreadWorkspaceDigestsForOrganization(
  admin: SupabaseClient,
  organizationId: string,
): Promise<CommitteeUnreadWorkspaceDigestResult> {
  const result: CommitteeUnreadWorkspaceDigestResult = {
    membersConsidered: 0,
    digestsSent: 0,
    digestFailures: 0,
    skippedNoEmail: 0,
    skippedNoUnread: 0,
    skippedDuplicateClaim: 0,
  };

  const enabled = await isCommitteeUnreadWorkspaceDigestEnabled(admin, organizationId);
  if (!enabled) {
    return result;
  }

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
  const members = await loadOrgActiveMembers(admin, organizationId);
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
  for (const row of committeeRows ?? []) {
    committeeNameById.set(String(row.id), String(row.name));
  }

  const memberIds = members.map((member) => member.id);
  const readDigestMap = await loadSectionReadDigestMap(admin, memberIds);
  const { messagesAt, tasksAt, resourcesAt, eventsAt } =
    await loadLatestTimestampsForCommittees(admin, committeeIds);

  const emailContext = buildEmailNotificationContext({
    organizationId,
    organizationSlug: schoolSlug,
    surface: "cron",
    entityType: "organization",
    entityId: organizationId,
  });

  const memberDisplayNameById = buildMemberDisplayNameLookup(
    members.map((member) => ({
      id: member.id,
      display_name: member.display_name,
    })),
  );

  type RecipientBucket = {
    email: string;
    portalMember: CommitteePortalMember;
    committees: CommitteeUnreadWorkspaceDigestCommitteeItem[];
    stampSections: Array<{ memberId: string; sections: CommitteeUnreadSection[] }>;
  };

  const bucketsByEmail = new Map<string, RecipientBucket>();
  const notifiedAt = new Date().toISOString();

  for (const member of members) {
    const committeeId = member.committee_id;
    const reads = readDigestMap.get(member.id) ?? {};
    const readAt: Partial<Record<CommitteeUnreadSection, string | null>> = {};
    const digestNotifiedAt: Partial<Record<CommitteeUnreadSection, string | null>> =
      {};
    for (const section of COMMITTEE_UNREAD_SECTIONS) {
      readAt[section] = reads[section]?.readAt ?? null;
      digestNotifiedAt[section] = reads[section]?.digestNotifiedAt ?? null;
    }

    const sections = digestEligibleSectionCounts({
      latestAt: {
        messages: messagesAt.get(committeeId) ?? null,
        tasks: tasksAt.get(committeeId) ?? null,
        resources: resourcesAt.get(committeeId) ?? null,
        calendar: eventsAt.get(committeeId) ?? null,
      },
      readAt,
      digestNotifiedAt,
    });

    if (totalSectionUnread(sections) === 0) {
      result.skippedNoUnread += 1;
      continue;
    }

    const eligibleStampSections = COMMITTEE_UNREAD_SECTIONS.filter(
      (section) => sections[section] > 0,
    );

    const email = await resolveCommitteeMemberEmail(admin, member);
    if (!email) {
      result.skippedNoEmail += 1;
      continue;
    }

    const committeeName = committeeNameById.get(committeeId) ?? "Committee";
    const primarySection = primaryWorkspaceSection(sections);
    const sectionPreviews = await loadWorkspaceDigestSectionPreviews(admin, {
      committeeId,
      eligibleSections: eligibleStampSections,
      readAt,
      memberDisplayNameById,
    });
    const item: CommitteeUnreadWorkspaceDigestCommitteeItem = {
      committeeId,
      committeeName,
      memberId: member.id,
      sections,
      sectionLabels: sectionLabelsFromCounts(sections),
      sectionPreviews,
      workspaceUrl: committeeMemberWorkspaceUrl(
        schoolSlug,
        committeeId,
        primarySection,
        member,
      ),
    };

    const normalizedEmail = email.trim().toLowerCase();
    const existing = bucketsByEmail.get(normalizedEmail);
    if (existing) {
      existing.committees.push(item);
      existing.stampSections.push({
        memberId: member.id,
        sections: eligibleStampSections,
      });
    } else {
      bucketsByEmail.set(normalizedEmail, {
        email,
        portalMember: member,
        committees: [item],
        stampSections: [
          { memberId: member.id, sections: eligibleStampSections },
        ],
      });
    }
  }

  for (const bucket of bucketsByEmail.values()) {
    const claimTargets = stampTargetsFromBucket(
      bucket.stampSections,
      readDigestMap,
    );
    const claimedTargets = await tryClaimDigestTargets(
      admin,
      claimTargets,
      notifiedAt,
    );
    if (claimedTargets.length !== claimTargets.length) {
      result.skippedDuplicateClaim += 1;
      continue;
    }

    const totalUnread = bucket.committees.reduce(
      (sum, committee) => sum + totalSectionUnread(committee.sections),
      0,
    );

    const sendResult = await Promise.allSettled([
      sendCommitteeUnreadWorkspaceDigestEmail({
        email: bucket.email,
        schoolName,
        recipientPortal: bucket.portalMember.staff_member_id ? "teacher" : "parent",
        committees: bucket.committees.map((committee) => ({
          committeeName: committee.committeeName,
          sectionLabels: committee.sectionLabels,
          sectionPreviews: committee.sectionPreviews,
          workspaceUrl: committee.workspaceUrl,
          unreadCount: totalSectionUnread(committee.sections),
        })),
        totalUnread,
        notificationContext: emailContext,
      }),
    ]);

    await logSettledNotificationFailures(
      admin,
      {
        organizationId,
        operation: "committee.unread_workspace_digest.notify",
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
      result.digestsSent += 1;
      markDigestClaimedInMap(readDigestMap, claimedTargets, notifiedAt);
    } else {
      await releaseDigestClaims(admin, claimedTargets, notifiedAt);
      result.digestFailures += 1;
    }
  }

  return result;
}
