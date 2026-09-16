export {
  MAX_SUPPORT_REQUEST_FILES,
  MAX_SUPPORT_REQUEST_FILE_BYTES,
  SUPPORT_REQUEST_TOPIC_OPTIONS,
  supportRequestTopicLabel,
  type StagedSupportAttachment,
  type SubmitAdminSupportRequestInput,
  type SupportRequestTopic,
} from '@/lib/school-admin/support-request';

export type SubmitPortalSupportRequestInput = {
  organizationId: string;
  topic: import('@/lib/school-admin/support-request').SupportRequestTopic;
  description: string;
  sourcePagePath?: string;
  attachments?: import('@/lib/school-admin/support-request').StagedSupportAttachment[];
};
