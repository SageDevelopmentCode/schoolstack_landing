import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  isCommitteeMessageEligibleForUnreadCatchUp,
  summarizeEligibleCommitteeMessagesForMember,
} from "./committee-unread-message-eligibility";

describe("isCommitteeMessageEligibleForUnreadCatchUp", () => {
  const recipientMemberId = "member-recipient";

  it("rejects messages sent by the recipient member", () => {
    assert.equal(
      isCommitteeMessageEligibleForUnreadCatchUp({
        messageCreatedAt: "2026-09-28T18:00:00.000Z",
        senderMemberId: recipientMemberId,
        recipientMemberId,
        lastReadAt: null,
      }),
      false,
    );
  });

  it("rejects messages already read", () => {
    assert.equal(
      isCommitteeMessageEligibleForUnreadCatchUp({
        messageCreatedAt: "2026-09-28T18:00:00.000Z",
        senderMemberId: "member-sender",
        recipientMemberId,
        lastReadAt: "2026-09-28T19:00:00.000Z",
      }),
      false,
    );
  });

  it("accepts unread messages from other members", () => {
    assert.equal(
      isCommitteeMessageEligibleForUnreadCatchUp({
        messageCreatedAt: "2026-09-28T20:00:00.000Z",
        senderMemberId: "member-sender",
        recipientMemberId,
        lastReadAt: "2026-09-28T18:00:00.000Z",
      }),
      true,
    );
  });

  it("accepts school posts with null sender for other members", () => {
    assert.equal(
      isCommitteeMessageEligibleForUnreadCatchUp({
        messageCreatedAt: "2026-09-15T12:00:00.000Z",
        senderMemberId: null,
        recipientMemberId,
        lastReadAt: null,
      }),
      true,
    );
  });

  it("treats missing read row like never read", () => {
    assert.equal(
      isCommitteeMessageEligibleForUnreadCatchUp({
        messageCreatedAt: "2026-09-28T20:00:00.000Z",
        senderMemberId: "member-sender",
        recipientMemberId,
        lastReadAt: null,
      }),
      true,
    );
  });
});

describe("summarizeEligibleCommitteeMessagesForMember", () => {
  const committeeId = "committee-1";
  const recipientMemberId = "member-recipient";

  it("returns latest eligible message and count", () => {
    const messages = [
      {
        id: "m1",
        committeeId,
        senderMemberId: "other",
        body: "First",
        createdAt: "2026-09-15T12:00:00.000Z",
      },
      {
        id: "m2",
        committeeId,
        senderMemberId: "other",
        body: "Second",
        createdAt: "2026-09-28T18:00:00.000Z",
      },
      {
        id: "m3",
        committeeId,
        senderMemberId: recipientMemberId,
        body: "Own",
        createdAt: "2026-09-29T18:00:00.000Z",
      },
    ];

    const summary = summarizeEligibleCommitteeMessagesForMember(messages, {
      committeeId,
      recipientMemberId,
      lastReadAt: null,
    });

    assert.equal(summary.unreadCount, 2);
    assert.equal(summary.latestEligible?.id, "m2");
  });
});
