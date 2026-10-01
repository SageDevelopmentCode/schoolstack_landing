import { schoolAdminPath } from "@/lib/organization-settings/admin-routes";
import { schoolParentRootPath } from "@/lib/organization-settings/parent-routes";
import { schoolTeacherPath } from "@/lib/organization-settings/teacher-routes";
import { SITE_URL } from "@/lib/site";
import type { CommitteeWorkspaceSection } from "@/lib/committees/types";

export type CommitteePortalMember = {
  user_id?: string | null;
  guardian_id?: string | null;
  staff_member_id?: string | null;
};

function committeeSectionQuery(
  committeeId: string,
  section: CommitteeWorkspaceSection,
): string {
  return new URLSearchParams({
    committee: committeeId,
    section,
  }).toString();
}

function committeeTaskQuery(committeeId: string): string {
  return committeeSectionQuery(committeeId, "tasks");
}

export function committeeMemberWorkspacePath(
  schoolSlug: string,
  committeeId: string,
  section: CommitteeWorkspaceSection,
  member: CommitteePortalMember,
): string {
  const query = committeeSectionQuery(committeeId, section);
  if (member.staff_member_id) {
    return `${schoolTeacherPath(schoolSlug, "committees")}?${query}`;
  }
  if (member.user_id != null || member.guardian_id) {
    return `${schoolParentRootPath(schoolSlug)}/committees?${query}`;
  }
  return `${schoolAdminPath(schoolSlug, "committees")}?${query}`;
}

export function committeeMemberWorkspaceUrl(
  schoolSlug: string,
  committeeId: string,
  section: CommitteeWorkspaceSection,
  member: CommitteePortalMember,
): string {
  return `${SITE_URL}${committeeMemberWorkspacePath(schoolSlug, committeeId, section, member)}`;
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
