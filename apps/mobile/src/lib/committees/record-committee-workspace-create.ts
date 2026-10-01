import { ACTIVITY_ACTIONS } from '@/lib/activity-log';
import { fetchParentApi } from '@/lib/parent/parent-portal-api';
import { fetchSchoolAdminApi } from '@/lib/school-admin-api';
import { fetchTeacherApi } from '@/lib/teacher/teacher-portal-api';

import type { CommitteePortalApiNamespace } from './notify-committee-task-assignment';

export function buildCommitteeRecordActivityPath(
  portalApiNamespace: CommitteePortalApiNamespace,
  committeeId: string,
): string {
  return `/api/${portalApiNamespace}/committees/${committeeId}/record-activity`;
}

export type RecordCommitteeWorkspaceCreateInput = {
  portalApiNamespace: CommitteePortalApiNamespace;
  committeeId: string;
  organizationId: string;
  action:
    | typeof ACTIVITY_ACTIONS.COMMITTEE_TASK_CREATED
    | typeof ACTIVITY_ACTIONS.COMMITTEE_RESOURCE_CREATED
    | typeof ACTIVITY_ACTIONS.COMMITTEE_EVENT_CREATED;
  entityId: string;
};

export async function recordCommitteeWorkspaceCreate(
  input: RecordCommitteeWorkspaceCreateInput,
): Promise<void> {
  const path = buildCommitteeRecordActivityPath(
    input.portalApiNamespace,
    input.committeeId,
  );
  const body = {
    organizationId: input.organizationId,
    action: input.action,
    entityId: input.entityId,
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
