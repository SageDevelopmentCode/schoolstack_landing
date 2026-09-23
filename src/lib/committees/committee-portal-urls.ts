import { schoolAdminPath } from "@/lib/organization-settings/admin-routes";
import { schoolParentRootPath } from "@/lib/organization-settings/parent-routes";
import { schoolTeacherPath } from "@/lib/organization-settings/teacher-routes";
import { SITE_URL } from "@/lib/site";

export type CommitteePortalMember = {
  user_id?: string | null;
  guardian_id?: string | null;
  staff_member_id?: string | null;
};

function committeeTaskQuery(committeeId: string): string {
  return new URLSearchParams({
    committee: committeeId,
    section: "tasks",
    tab: "mine",
  }).toString();
}

export function committeeTaskAssigneeTasksPath(
  schoolSlug: string,
  committeeId: string,
  member: CommitteePortalMember,
): string {
  if (member.staff_member_id) {
    return `${schoolTeacherPath(schoolSlug, "committees")}?${committeeTaskQuery(committeeId)}`;
  }

  if (member.user_id != null || member.guardian_id) {
    return `${schoolParentRootPath(schoolSlug)}/committees?${committeeTaskQuery(committeeId)}`;
  }

  return `${schoolAdminPath(schoolSlug, "committees")}?committee=${encodeURIComponent(committeeId)}&section=tasks`;
}

export function committeeTaskAssigneeTasksUrl(
  schoolSlug: string,
  committeeId: string,
  member: CommitteePortalMember,
): string {
  return `${SITE_URL}${committeeTaskAssigneeTasksPath(schoolSlug, committeeId, member)}`;
}
