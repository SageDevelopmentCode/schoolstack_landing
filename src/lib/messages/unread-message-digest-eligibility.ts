export type UnreadDigestEligibilityInput = {
  messageCreatedAt: string;
  senderUserId: string;
  recipientUserId: string;
  lastReadAt: string | null;
  lastDigestNotifiedAt: string | null;
};

export function isMessageEligibleForUnreadDigest(
  input: UnreadDigestEligibilityInput,
): boolean {
  if (input.senderUserId === input.recipientUserId) {
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

  const digestCutoff = input.lastDigestNotifiedAt
    ? new Date(input.lastDigestNotifiedAt).getTime()
    : Number.NEGATIVE_INFINITY;
  if (Number.isNaN(digestCutoff) || created <= digestCutoff) {
    return false;
  }

  return true;
}
