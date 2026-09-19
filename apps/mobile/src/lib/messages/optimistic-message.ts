import { formatMessageTime } from '@/lib/messages/format';
import type {
  PortalMessage,
  PortalMessageSenderKind,
  StagedMessageFile,
} from '@/lib/messages/types';

export type OwnMessageSenderIdentity = {
  senderUserId: string;
  senderName: string;
  profilePhotoUrl?: string | null;
};

export function displayNameFromAuthMetadata(
  fullName: string | undefined,
  email: string | undefined,
): string {
  if (fullName?.trim()) return fullName.trim();
  const emailLocalPart = email?.split('@')[0]?.trim();
  if (emailLocalPart) return emailLocalPart;
  return 'You';
}

export function resolveOwnMessageSenderIdentity(
  messages: PortalMessage[],
  fallback: OwnMessageSenderIdentity,
): OwnMessageSenderIdentity {
  const lastOwn = [...messages].reverse().find((message) => message.isOwn && !message.pending);
  if (!lastOwn) return fallback;

  return {
    senderUserId: lastOwn.senderUserId,
    senderName: lastOwn.senderName,
    profilePhotoUrl: lastOwn.profilePhotoUrl ?? null,
  };
}

type BuildOptimisticPortalMessageParams = {
  threadId: string;
  body: string;
  files: StagedMessageFile[];
  senderKind: PortalMessageSenderKind;
  senderIdentity: OwnMessageSenderIdentity;
};

export function buildOptimisticPortalMessage({
  threadId,
  body,
  files,
  senderKind,
  senderIdentity,
}: BuildOptimisticPortalMessageParams): PortalMessage {
  const createdAt = new Date().toISOString();

  return {
    id: `pending-${Date.now()}`,
    threadId,
    body,
    senderUserId: senderIdentity.senderUserId,
    senderKind,
    senderName: senderIdentity.senderName,
    profilePhotoUrl: senderIdentity.profilePhotoUrl ?? null,
    isOwn: true,
    createdAt,
    timeLabel: formatMessageTime(createdAt),
    attachments: files.map((file, index) => ({
      id: `pending-file-${index}`,
      fileName: file.name,
      mimeType: file.mimeType,
      sizeBytes: file.size,
    })),
    pending: true,
  };
}

export function confirmOptimisticMessage(
  optimistic: PortalMessage,
  server: PortalMessage,
): PortalMessage {
  return {
    ...server,
    senderName: optimistic.senderName,
    profilePhotoUrl: optimistic.profilePhotoUrl ?? server.profilePhotoUrl ?? null,
    pending: false,
  };
}
