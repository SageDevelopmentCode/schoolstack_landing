import { fetchParentApi } from '@/lib/parent/parent-portal-api';
import { fetchSchoolAdminApi } from '@/lib/school-admin-api';
import { fetchTeacherApi } from '@/lib/teacher/teacher-portal-api';

export type CommitteePortalApiNamespace =
  | 'parent-portal'
  | 'teacher-portal'
  | 'school-admin';

export function buildCommitteeTaskNotifyAssignmentPath(
  portalApiNamespace: CommitteePortalApiNamespace,
  taskId: string,
): string {
  if (portalApiNamespace === 'school-admin') {
    return `/api/school-admin/committees/tasks/${taskId}/notify-assignment`;
  }
  return `/api/${portalApiNamespace}/committees/tasks/${taskId}/notify-assignment`;
}

export type NotifyCommitteeTaskAssignmentInput = {
  portalApiNamespace: CommitteePortalApiNamespace;
  taskId: string;
  organizationId: string;
  previousAssigneeMemberId?: string | null;
};

export async function notifyCommitteeTaskAssignment(
  input: NotifyCommitteeTaskAssignmentInput,
): Promise<void> {
  const path = buildCommitteeTaskNotifyAssignmentPath(input.portalApiNamespace, input.taskId);
  const body = {
    organizationId: input.organizationId,
    previousAssigneeMemberId: input.previousAssigneeMemberId ?? null,
  };

  if (input.portalApiNamespace === 'school-admin') {
    await fetchSchoolAdminApi(path, { method: 'POST', body });
    return;
  }

  if (input.portalApiNamespace === 'teacher-portal') {
    await fetchTeacherApi(path, { method: 'POST', body });
    return;
  }

  await fetchParentApi(path, { method: 'POST', body });
}
