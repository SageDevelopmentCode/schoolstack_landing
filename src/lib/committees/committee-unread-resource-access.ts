import { canMemberAccessResourceByDutyRoles } from "@/lib/committees/permissions";
import type { CommitteeDutyRole } from "@/lib/committees/types";

export type CommitteeResourceAccessRow = {
  createdAt: string;
  allowedDutyRoleIds?: string[];
};

export function latestAccessibleResourceCreatedAt(
  resources: CommitteeResourceAccessRow[],
  dutyRoles: CommitteeDutyRole[],
  memberId: string,
): string | null {
  let latest: string | null = null;
  for (const row of resources) {
    if (
      !canMemberAccessResourceByDutyRoles(row.allowedDutyRoleIds, dutyRoles, memberId)
    ) {
      continue;
    }
    if (!latest || Date.parse(row.createdAt) > Date.parse(latest)) {
      latest = row.createdAt;
    }
  }
  return latest;
}
