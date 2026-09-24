import { fetchSchoolAdminApiFormData } from '@/lib/school-admin-api';

export const MAX_SUPPORT_REQUEST_FILES = 5;
export const MAX_SUPPORT_REQUEST_FILE_BYTES = 10 * 1024 * 1024;

export const SUPPORT_REQUEST_TOPIC_OPTIONS = [
  { value: 'general', label: 'General question' },
  { value: 'bug', label: "Something isn't working" },
  { value: 'application-forms', label: 'Application forms' },
  { value: 'enrollment', label: 'Enrollment' },
  { value: 'billing', label: 'Billing' },
  { value: 'feature', label: 'Feature request' },
  { value: 'account-deletion', label: 'Delete my account' },
  { value: 'other', label: 'Other' },
] as const;

export type SupportRequestTopic = (typeof SUPPORT_REQUEST_TOPIC_OPTIONS)[number]['value'];

export type StagedSupportAttachment = {
  uri: string;
  name: string;
  mimeType: string | null;
  size: number | null;
};

export type SubmitAdminSupportRequestInput = {
  organizationId: string;
  topic: SupportRequestTopic;
  description: string;
  sourcePagePath?: string;
  attachments?: StagedSupportAttachment[];
};

export function supportRequestTopicLabel(topic: SupportRequestTopic): string {
  return SUPPORT_REQUEST_TOPIC_OPTIONS.find((option) => option.value === topic)?.label ?? topic;
}

export async function submitAdminSupportRequest(
  input: SubmitAdminSupportRequestInput,
): Promise<void> {
  const formData = new FormData();
  formData.append('organizationId', input.organizationId);
  formData.append('topic', input.topic);
  formData.append('description', input.description.trim());

  if (input.sourcePagePath?.trim()) {
    formData.append('sourcePagePath', input.sourcePagePath.trim());
  }

  for (const file of input.attachments ?? []) {
    formData.append('attachments', {
      uri: file.uri,
      name: file.name,
      type: file.mimeType ?? 'application/octet-stream',
    } as unknown as Blob);
  }

  await fetchSchoolAdminApiFormData('/api/school-admin/support-requests', formData);
}
