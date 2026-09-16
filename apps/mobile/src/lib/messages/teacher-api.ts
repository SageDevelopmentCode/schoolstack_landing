import { fetchTeacherApi, fetchTeacherApiFormData } from '@/lib/teacher/teacher-portal-api';
import type {
  MessageContact,
  MessageThreadDetail,
  MessagesInboxData,
  PortalMessage,
  StagedMessageFile,
} from '@/lib/messages/types';

export { mergeMessages } from '@/lib/messages/parent-api';

const BASE_PATH = '/api/teacher-portal/messages';

function buildQuery(organizationId: string, schoolName: string): string {
  return new URLSearchParams({
    organizationId,
    schoolName,
  }).toString();
}

export async function loadTeacherMessagesInbox(
  organizationId: string,
  schoolName: string,
): Promise<MessagesInboxData> {
  const query = buildQuery(organizationId, schoolName);
  return fetchTeacherApi<MessagesInboxData>(`${BASE_PATH}/threads?${query}`);
}

export async function loadTeacherMessageThread(
  threadId: string,
  organizationId: string,
  schoolName: string,
): Promise<MessageThreadDetail> {
  const query = buildQuery(organizationId, schoolName);
  const payload = await fetchTeacherApi<{ thread: MessageThreadDetail }>(
    `${BASE_PATH}/threads/${threadId}?${query}`,
  );
  return payload.thread;
}

export async function createTeacherMessageThread(
  organizationId: string,
  contact: MessageContact,
): Promise<string> {
  const payload = await fetchTeacherApi<{ threadId: string }>(`${BASE_PATH}/threads`, {
    method: 'POST',
    body: {
      organizationId,
      contact: {
        key: contact.key,
        kind: contact.kind,
        guardianId: contact.guardianId,
        familyId: contact.familyId,
        staffMemberId: contact.staffMemberId,
        name: contact.name,
      },
    },
  });
  return payload.threadId;
}

export async function sendTeacherMessage(
  threadId: string,
  params: {
    organizationId: string;
    organizationSlug: string;
    schoolName: string;
    body: string;
    files?: StagedMessageFile[];
  },
): Promise<PortalMessage> {
  const { organizationId, organizationSlug, schoolName, body, files = [] } = params;

  if (files.length > 0) {
    const formData = new FormData();
    formData.append('organizationId', organizationId);
    formData.append('organizationSlug', organizationSlug);
    formData.append('schoolName', schoolName);
    formData.append('body', body);
    for (const file of files) {
      formData.append('files', {
        uri: file.uri,
        name: file.name,
        type: file.mimeType ?? 'application/octet-stream',
      } as unknown as Blob);
    }

    const payload = await fetchTeacherApiFormData<{ message: PortalMessage }>(
      `${BASE_PATH}/threads/${threadId}/messages`,
      formData,
    );
    return payload.message;
  }

  const payload = await fetchTeacherApi<{ message: PortalMessage }>(
    `${BASE_PATH}/threads/${threadId}/messages`,
    {
      method: 'POST',
      body: {
        organizationId,
        organizationSlug,
        schoolName,
        body,
      },
    },
  );
  return payload.message;
}
