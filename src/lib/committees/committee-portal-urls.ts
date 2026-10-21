import { schoolAdminPath } from "@/lib/organization-settings/admin-routes";
import { schoolParentRootPath } from "@/lib/organization-settings/parent-routes";
import { schoolTeacherPath } from "@/lib/organization-settings/teacher-routes";
import { getRuntimeSiteUrl } from "@/lib/site";
import type { CommitteeWorkspaceSection } from "@/lib/committees/types";

export type CommitteePortalMember = {
  user_id?: string | null;
  guardian_id?: string | null;
  staff_member_id?: string | null;
};

export type CommitteeWorkspaceLinkFocus = {
  eventId?: string | null;
  eventDate?: string | null;
  resourceId?: string | null;
  taskId?: string | null;
};

function committeeSectionQuery(
  committeeId: string,
  section: CommitteeWorkspaceSection,
  focus?: CommitteeWorkspaceLinkFocus,
): string {
  const params = new URLSearchParams({
    committee: committeeId,
    section,
  });
  const eventId = focus?.eventId?.trim();
  if (eventId) {
    params.set("event", eventId);
  }
  const eventDate = focus?.eventDate?.trim();
  if (eventDate) {
    params.set("date", eventDate);
  }
  const resourceId = focus?.resourceId?.trim();
  if (resourceId) {
    params.set("resource", resourceId);
  }
  const taskId = focus?.taskId?.trim();
  if (taskId) {
    params.set("task", taskId);
  }
  return params.toString();
}

function committeeTaskQuery(committeeId: string): string {
  return committeeSectionQuery(committeeId, "tasks");
}

export function committeeMemberWorkspacePath(
  schoolSlug: string,
  committeeId: string,
  section: CommitteeWorkspaceSection,
  member: CommitteePortalMember,
  focus?: CommitteeWorkspaceLinkFocus,
): string {
  const query = committeeSectionQuery(committeeId, section, focus);
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
  focus?: CommitteeWorkspaceLinkFocus,
): string {
  return `${getRuntimeSiteUrl()}${committeeMemberWorkspacePath(
    schoolSlug,
    committeeId,
    section,
    member,
    focus,
  )}`;
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
  return `${getRuntimeSiteUrl()}${committeeTaskAssigneeTasksPath(schoolSlug, committeeId, member)}`;
}
