export type CommitteeCatchUpMessageInput = {
  id: string;
  committeeId: string;
  senderMemberId: string | null;
  body: string;
  createdAt: string;
};

export function isCommitteeMessageEligibleForUnreadCatchUp(input: {
  messageCreatedAt: string;
  senderMemberId: string | null;
  recipientMemberId: string;
  lastReadAt: string | null;
}): boolean {
  if (
    input.senderMemberId &&
    input.senderMemberId === input.recipientMemberId
  ) {
    return false;
  }

  const created = new Date(input.messageCreatedAt).getTime();
  if (Number.isNaN(created)) {
    return false;
  }

  const readCutoff = input.lastReadAt
    ? new Date(input.lastReadAt).getTime()
    : Number.NEGATIVE_INFINITY;
  if (Number.isNaN(readCutoff) || created <= readCutoff) {
    return false;
  }

  return true;
}

export function summarizeEligibleCommitteeMessagesForMember(
  messages: CommitteeCatchUpMessageInput[],
  input: {
    committeeId: string;
    recipientMemberId: string;
    lastReadAt: string | null;
  },
): { unreadCount: number; latestEligible: CommitteeCatchUpMessageInput | null } {
  const eligible = messages.filter(
    (message) =>
      message.committeeId === input.committeeId &&
      isCommitteeMessageEligibleForUnreadCatchUp({
        messageCreatedAt: message.createdAt,
        senderMemberId: message.senderMemberId,
        recipientMemberId: input.recipientMemberId,
        lastReadAt: input.lastReadAt,
      }),
  );

  if (eligible.length === 0) {
    return { unreadCount: 0, latestEligible: null };
  }

  let latest = eligible[0];
  for (const message of eligible) {
    if (new Date(message.createdAt).getTime() > new Date(latest.createdAt).getTime()) {
      latest = message;
    }
  }

  return { unreadCount: eligible.length, latestEligible: latest };
}
