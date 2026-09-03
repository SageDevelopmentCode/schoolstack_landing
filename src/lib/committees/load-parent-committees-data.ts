import { cookies } from "next/headers";
import { getFamilyPreviewGuardianUserId } from "@/lib/admissions/family-preview-access";
import {
  getParentCommitteeWorkspace,
  listBrowsableCommitteesForParent,
  listParentCommitteeMemberships,
} from "@/lib/committees/parent-committees";
import type {
  Committee,
  ParentCommitteeBrowseItem,
  ParentCommitteeListItem,
} from "@/lib/committees/types";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

/** Sentinel user id when the previewed guardian has no linked auth account. */
const NO_GUARDIAN_USER_ID = "00000000-0000-0000-0000-000000000000";

export type ParentCommitteesInitialData = {
  browseCommittees: ParentCommitteeBrowseItem[];
  myCommittees: ParentCommitteeListItem[];
  workspacesByCommitteeId: Record<string, Committee>;
};

export async function loadParentCommitteesInitialData(input: {
  organizationId: string;
  userId: string;
  selectedCommitteeId?: string | null;
}): Promise<ParentCommitteesInitialData> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const [browseCommittees, myCommittees] = await Promise.all([
    listBrowsableCommitteesForParent(
      supabase,
      input.organizationId,
      input.userId,
    ),
    listParentCommitteeMemberships(
      supabase,
      input.organizationId,
      input.userId,
    ),
  ]);

  const workspacesByCommitteeId: Record<string, Committee> = {};
  if (input.selectedCommitteeId) {
    try {
      workspacesByCommitteeId[input.selectedCommitteeId] =
        await getParentCommitteeWorkspace(
          supabase,
          input.organizationId,
          input.userId,
          input.selectedCommitteeId,
        );
    } catch {
      // Workspace loads on selection when deep-link fetch fails.
    }
  }

  return {
    browseCommittees,
    myCommittees,
    workspacesByCommitteeId,
  };
}

export async function loadParentCommitteesPreviewData(input: {
  organizationId: string;
  familyId: string;
  selectedCommitteeId?: string | null;
}): Promise<ParentCommitteesInitialData> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const admin = createAdminClient();

  const guardianUserId = await getFamilyPreviewGuardianUserId(
    supabase,
    input.organizationId,
    input.familyId,
  );
  const browseUserId = guardianUserId ?? NO_GUARDIAN_USER_ID;

  const [browseCommittees, myCommittees] = await Promise.all([
    listBrowsableCommitteesForParent(admin, input.organizationId, browseUserId),
    guardianUserId
      ? listParentCommitteeMemberships(admin, input.organizationId, guardianUserId)
      : Promise.resolve([]),
  ]);

  const workspacesByCommitteeId: Record<string, Committee> = {};
  if (guardianUserId && input.selectedCommitteeId) {
    try {
      workspacesByCommitteeId[input.selectedCommitteeId] =
        await getParentCommitteeWorkspace(
          admin,
          input.organizationId,
          guardianUserId,
          input.selectedCommitteeId,
        );
    } catch {
      // Workspace loads on selection when deep-link fetch fails.
    }
  }

  return {
    browseCommittees,
    myCommittees,
    workspacesByCommitteeId,
  };
}
