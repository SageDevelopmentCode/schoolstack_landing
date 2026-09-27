import type { PortalMessage } from '@/lib/messages/types';

type MessageMutationFetcher = <T>(
  path: string,
  options?: { method?: 'GET' | 'POST' | 'DELETE' | 'PATCH'; body?: unknown },
) => Promise<T>;

export async function patchPortalMessage(
  fetcher: MessageMutationFetcher,
  basePath: string,
  threadId: string,
  messageId: string,
  params: { organizationId: string; schoolName: string; body: string },
): Promise<PortalMessage> {
  const payload = await fetcher<{ message: PortalMessage }>(
    `${basePath}/threads/${threadId}/messages/${messageId}`,
    {
      method: 'PATCH',
      body: {
        organizationId: params.organizationId,
        schoolName: params.schoolName,
        body: params.body,
      },
    },
  );
  return payload.message;
}

export async function deletePortalMessageRequest(
  fetcher: MessageMutationFetcher,
  basePath: string,
  threadId: string,
  messageId: string,
  params: { organizationId: string; schoolName: string },
): Promise<PortalMessage> {
  const query = new URLSearchParams({
    organizationId: params.organizationId,
    schoolName: params.schoolName,
  }).toString();
  const payload = await fetcher<{ message: PortalMessage }>(
    `${basePath}/threads/${threadId}/messages/${messageId}?${query}`,
    { method: 'DELETE' },
  );
  return payload.message;
}
