export type PlatformSupportConversation = {
  threadId: string;
  organizationId: string;
  organizationName: string;
  organizationSlug: string;
  parentName: string;
  parentEmail: string | null;
  parentPhotoUrl: string | null;
  preview: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
};
