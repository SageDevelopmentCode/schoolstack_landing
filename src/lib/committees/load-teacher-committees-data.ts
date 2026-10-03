import {
  fetchCommitteeActivityEvents,
  mapCommitteeActivityItems,
  type CommitteeActivityItem,
} from "@/lib/committees/activity-feed";
import { getCommitteeUnreadSummaryForUser } from "@/lib/committees/committee-unread";
import type { CommitteeUnreadSummary } from "@/lib/committees/committee-unread-types";
import {
  getTeacherCommitteeWorkspace,
  listBrowsableCommitteesForTeacher,
  listTeacherCommitteeMemberships,
} from "@/lib/committees/teacher-committees";
import { getStaffPreviewContext } from "@/lib/staff/staff-preview-access";
import type {
  Committee,
  ParentCommitteeBrowseItem,
  ParentCommitteeListItem,
} from "@/lib/committees/types";
import { createAdminClient } from "@/utils/supabase/admin";

/** Sentinel user id when previewed staff has no linked auth account. */
const NO_STAFF_USER_ID = "00000000-0000-0000-0000-000000000000";

export type TeacherCommitteesInitialData = {
  browseCommittees: ParentCommitteeBrowseItem[];
  myCommittees: ParentCommitteeListItem[];
  workspacesByCommitteeId: Record<string, Committee>;
  committeeUnreadSummary?: CommitteeUnreadSummary;
  committeeActivityByCommitteeId?: Record<string, CommitteeActivityItem[]>;
  previewGuardianUserId?: string | null;
};

export async function loadTeacherCommitteesInitialData(input: {
  organizationId: string;
  userId: string;
  selectedCommitteeId?: string | null;
}): Promise<TeacherCommitteesInitialData> {
  const admin = createAdminClient();

  const [browseCommittees, myCommittees] = await Promise.all([
    listBrowsableCommitteesForTeacher(admin, input.organizationId, input.userId),
    listTeacherCommitteeMemberships(admin, input.organizationId, input.userId),
  ]);

  const workspacesByCommitteeId: Record<string, Committee> = {};
  const workspaceIds = new Set<string>();
  if (input.selectedCommitteeId) workspaceIds.add(input.selectedCommitteeId);
  for (const committee of myCommittees) workspaceIds.add(committee.id);

  await Promise.all(
    [...workspaceIds].map(async (committeeId) => {
      try {
        workspacesByCommitteeId[committeeId] = await getTeacherCommitteeWorkspace(
          admin,
          input.organizationId,
          input.userId,
          committeeId,
        );
      } catch {
        // Workspace loads on selection when preload fails.
      }
    }),
  );

  return {
    browseCommittees,
    myCommittees,
    workspacesByCommitteeId,
  };
}

export async function loadTeacherCommitteesPreviewData(input: {
  organizationId: string;
  staffMemberId: string;
  schoolSlug: string;
  selectedCommitteeId?: string | null;
}): Promise<TeacherCommitteesInitialData> {
  const admin = createAdminClient();

  const previewContext = await getStaffPreviewContext(
    admin,
    input.organizationId,
    input.staffMemberId,
  );
  const browseUserId = previewContext.userId ?? NO_STAFF_USER_ID;

  const [browseCommittees, myCommittees] = await Promise.all([
    listBrowsableCommitteesForTeacher(admin, input.organizationId, browseUserId),
    previewContext.userId
      ? listTeacherCommitteeMemberships(
          admin,
          input.organizationId,
          previewContext.userId,
        )
      : Promise.resolve([]),
  ]);

  const workspacesByCommitteeId: Record<string, Committee> = {};
  const committeeActivityByCommitteeId: Record<string, CommitteeActivityItem[]> = {};
  let committeeUnreadSummary: CommitteeUnreadSummary | undefined;

  if (previewContext.userId) {
    const workspaceIds = new Set<string>();
    if (input.selectedCommitteeId) workspaceIds.add(input.selectedCommitteeId);
    for (const committee of myCommittees) workspaceIds.add(committee.id);

    committeeUnreadSummary = await getCommitteeUnreadSummaryForUser(
      admin,
      input.organizationId,
      previewContext.userId,
    );

    await Promise.all(
      [...workspaceIds].map(async (committeeId) => {
        try {
          workspacesByCommitteeId[committeeId] = await getTeacherCommitteeWorkspace(
            admin,
            input.organizationId,
            previewContext.userId!,
            committeeId,
          );
        } catch {
          // Workspace loads on selection when preload fails.
        }

        try {
          const rows = await fetchCommitteeActivityEvents(admin, {
            organizationId: input.organizationId,
            committeeId,
            limit: 8,
            audience: "parent",
          });
          committeeActivityByCommitteeId[committeeId] = mapCommitteeActivityItems(rows, {
            slug: input.schoolSlug,
            committeeId,
            staffMemberId: input.staffMemberId,
            linkSurface: "teacherPreview",
            includeHref: true,
          });
        } catch {
          committeeActivityByCommitteeId[committeeId] = [];
        }
      }),
    );
  }

  return {
    browseCommittees,
    myCommittees,
    workspacesByCommitteeId,
    committeeUnreadSummary,
    committeeActivityByCommitteeId,
    previewGuardianUserId: previewContext.userId,
  };
}
