import type { CommitteePortalApiNamespace } from '@/lib/committees/notify-committee-task-assignment';
import type { StagedMessageFile } from '@/lib/messages/types';
import { fetchParentApiFormData } from '@/lib/parent/parent-portal-api';
import { fetchSchoolAdminApiFormData } from '@/lib/school-admin-api';
import { fetchTeacherApiFormData } from '@/lib/teacher/teacher-portal-api';

export function resolveCommitteeMessagesPortalNamespace(
  portalApiNamespace: CommitteePortalApiNamespace,
  isAdmin?: boolean,
): CommitteePortalApiNamespace {
  return isAdmin ? 'school-admin' : portalApiNamespace;
}

export function buildCommitteeMessagesPath(
  portalApiNamespace: CommitteePortalApiNamespace,
  committeeId: string,
): string {
  if (portalApiNamespace === 'school-admin') {
    return `/api/school-admin/committees/${committeeId}/messages`;
  }
  return `/api/${portalApiNamespace}/committees/${committeeId}/messages`;
}

function buildCommitteeMessageFormData(
  organizationId: string,
  body: string,
  files: StagedMessageFile[],
): FormData {
  const formData = new FormData();
  formData.append('organizationId', organizationId);
  formData.append('body', body);
  for (const file of files) {
    formData.append('files', {
      uri: file.uri,
      name: file.name,
      type: file.mimeType ?? 'application/octet-stream',
    } as unknown as Blob);
  }
  return formData;
}

type MessagePostPayload = { message: { id: string } };

async function fetchCommitteeMessageFormData(
  portalApiNamespace: CommitteePortalApiNamespace,
  path: string,
  formData: FormData,
): Promise<MessagePostPayload> {
  if (portalApiNamespace === 'school-admin') {
    return fetchSchoolAdminApiFormData<MessagePostPayload>(path, formData);
  }
  if (portalApiNamespace === 'teacher-portal') {
    return fetchTeacherApiFormData<MessagePostPayload>(path, formData);
  }
  return fetchParentApiFormData<MessagePostPayload>(path, formData);
}

export async function postCommitteeMessageViaPortalApi(
  committeeId: string,
  input: {
    organizationId: string;
    body: string;
    files?: StagedMessageFile[];
    portalApiNamespace?: CommitteePortalApiNamespace;
    isAdmin?: boolean;
  },
): Promise<{ messageId: string }> {
  const trimmedBody = input.body.trim();
  const files = input.files ?? [];

  if (!trimmedBody && files.length === 0) {
    throw new Error('Message cannot be empty.');
  }

  const portalApiNamespace = resolveCommitteeMessagesPortalNamespace(
    input.portalApiNamespace ?? 'parent-portal',
    input.isAdmin,
  );
  const path = buildCommitteeMessagesPath(portalApiNamespace, committeeId);
  const formData = buildCommitteeMessageFormData(input.organizationId, trimmedBody, files);
  const payload = await fetchCommitteeMessageFormData(portalApiNamespace, path, formData);
  return { messageId: payload.message.id };
}
