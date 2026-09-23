import { formatCommitteeAttribution } from '@/lib/parent/committees/attribution';
import type { Committee, CommitteeMessage } from '@/lib/parent/parent-committees-types';
import type { PortalMessage } from '@/lib/messages/types';

function parseMessageTimestamp(time: string): string {
  const parsed = new Date(time);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString();
  }
  return new Date().toISOString();
}

export function mapCommitteeMessageToPortalMessage(
  message: CommitteeMessage,
  currentMemberId?: string,
): PortalMessage {
  const isOwn = Boolean(currentMemberId && message.senderId === currentMemberId);
  const senderName =
    message.senderRole != null
      ? formatCommitteeAttribution({
          name: message.senderName,
          role: message.senderRole,
        })
      : message.senderName;

  return {
    id: message.id,
    threadId: 'committee',
    body: message.text,
    senderUserId: message.senderId || senderName,
    senderKind: 'guardian',
    senderName,
    isOwn,
    createdAt: parseMessageTimestamp(message.time),
    timeLabel: message.time,
    attachments: (message.attachments ?? []).map((attachment) => ({
      id: attachment.id,
      fileName: attachment.fileName,
      mimeType: attachment.mimeType ?? null,
      sizeBytes: attachment.sizeBytes ?? null,
      url: null,
    })),
  };
}

export function mapCommitteeMessagesToPortalMessages(
  committee: Committee,
  currentMemberId?: string,
): PortalMessage[] {
  return committee.messages.map((message) =>
    mapCommitteeMessageToPortalMessage(message, currentMemberId),
  );
}
