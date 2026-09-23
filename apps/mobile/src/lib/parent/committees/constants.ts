import type { CommitteeResourceType, CommitteeWorkspaceSection } from '@/lib/parent/parent-committees-types';

export const PARENT_VISIBLE_SECTIONS: CommitteeWorkspaceSection[] = [
  'home',
  'resources',
  'calendar',
  'tasks',
  'messages',
  'members',
];

export const COMMITTEE_RESOURCE_TYPE_LABELS: Record<CommitteeResourceType, string> = {
  pdf: 'PDF',
  doc: 'Word document',
  link: 'Link',
  checklist: 'Checklist',
};

export const COMMITTEE_RESOURCE_FILES_BUCKET = 'committee-resource-files';
export const COMMITTEE_RESOURCE_SIGNED_URL_TTL_SECONDS = 60 * 60;
export const COMMITTEE_MESSAGE_FILES_BUCKET = 'committee-message-files';
export const MAX_MESSAGE_ATTACHMENTS = 5;
