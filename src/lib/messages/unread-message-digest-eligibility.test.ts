import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isMessageEligibleForUnreadDigest } from "./unread-message-digest-eligibility";

describe("isMessageEligibleForUnreadDigest", () => {
  const recipientUserId = "recipient-user";
  const senderUserId = "sender-user";

  it("rejects messages from the recipient", () => {
    assert.equal(
      isMessageEligibleForUnreadDigest({
        messageCreatedAt: "2026-09-28T18:00:00.000Z",
        senderUserId: recipientUserId,
        recipientUserId,
        lastReadAt: null,
        lastDigestNotifiedAt: null,
      }),
      false,
    );
  });

  it("rejects messages already read", () => {
    assert.equal(
      isMessageEligibleForUnreadDigest({
        messageCreatedAt: "2026-09-28T18:00:00.000Z",
        senderUserId,
        recipientUserId,
        lastReadAt: "2026-09-28T19:00:00.000Z",
        lastDigestNotifiedAt: null,
      }),
      false,
    );
  });

  it("rejects messages already covered by a digest reminder", () => {
    assert.equal(
      isMessageEligibleForUnreadDigest({
        messageCreatedAt: "2026-09-28T18:00:00.000Z",
        senderUserId,
        recipientUserId,
        lastReadAt: null,
        lastDigestNotifiedAt: "2026-09-28T19:00:00.000Z",
      }),
      false,
    );
  });

  it("accepts unread messages not yet digest-reminded", () => {
    assert.equal(
      isMessageEligibleForUnreadDigest({
        messageCreatedAt: "2026-09-28T20:00:00.000Z",
        senderUserId,
        recipientUserId,
        lastReadAt: "2026-09-28T18:00:00.000Z",
        lastDigestNotifiedAt: "2026-09-28T19:00:00.000Z",
      }),
      true,
    );
  });
});
