import { listBrowsableCommitteesForParent } from "@/lib/committees/parent-committees";
import type { ParentCommitteesInitialData } from "@/lib/committees/load-parent-committees-data";
import { createAdminClient } from "@/utils/supabase/admin";

/** Sentinel user id when preview has no linked guardian account. */
const NO_GUARDIAN_USER_ID = "00000000-0000-0000-0000-000000000000";

export async function loadProgramParentPortalCommitteesPreviewData(input: {
  organizationId: string;
}): Promise<ParentCommitteesInitialData> {
  const admin = createAdminClient();

  const browseCommittees = await listBrowsableCommitteesForParent(
    admin,
    input.organizationId,
    NO_GUARDIAN_USER_ID,
  );

  return {
    browseCommittees,
    myCommittees: [],
    workspacesByCommitteeId: {},
  };
}
