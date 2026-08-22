import {
  fetchSchoolAdminApi,
  fetchSchoolAdminApiFormData,
} from '@/lib/school-admin-api';
import type {
  MessageContact,
  MessageThreadDetail,
  MessagesInboxData,
  PortalMessage,
  StagedMessageFile,
} from '@/lib/messages/types';

const BASE_PATH = '/api/school-admin/messages';

function buildQuery(organizationId: string, schoolName: string): string {
  return new URLSearchParams({
    organizationId,
    schoolName,
  }).toString();
}

export async function loadMessagesInbox(
  organizationId: string,
  schoolName: string,
): Promise<MessagesInboxData> {
  const query = buildQuery(organizationId, schoolName);
  return fetchSchoolAdminApi<MessagesInboxData>(`${BASE_PATH}/threads?${query}`);
}

export async function loadMessageThread(
  threadId: string,
  organizationId: string,
  schoolName: string,
): Promise<MessageThreadDetail> {
  const query = buildQuery(organizationId, schoolName);
  const payload = await fetchSchoolAdminApi<{ thread: MessageThreadDetail }>(
    `${BASE_PATH}/threads/${threadId}?${query}`,
  );
  return payload.thread;
}

export async function createMessageThread(
  organizationId: string,
  contact: MessageContact,
): Promise<string> {
  const payload = await fetchSchoolAdminApi<{ threadId: string }>(`${BASE_PATH}/threads`, {
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

export async function sendMessage(
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

    const payload = await fetchSchoolAdminApiFormData<{ message: PortalMessage }>(
      `${BASE_PATH}/threads/${threadId}/messages`,
      formData,
    );
    return payload.message;
  }

  const payload = await fetchSchoolAdminApi<{ message: PortalMessage }>(
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

export async function fetchMessagesUnreadCount(
  organizationId: string,
  schoolName: string,
): Promise<number> {
  const query = buildQuery(organizationId, schoolName);
  const payload = await fetchSchoolAdminApi<{ unreadCount: number }>(
    `${BASE_PATH}/unread-count?${query}`,
  );
  return payload.unreadCount ?? 0;
}

export function mergeMessages(
  existing: PortalMessage[],
  incoming: PortalMessage[],
): PortalMessage[] {
  const map = new Map<string, PortalMessage>();
  for (const message of existing) {
    map.set(message.id, message);
  }
  for (const message of incoming) {
    map.set(message.id, message);
  }
  return [...map.values()].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );
}
