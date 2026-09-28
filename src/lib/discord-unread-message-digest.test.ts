import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  formatUnreadMessageDigestDeliveriesForDiscord,
  UNREAD_DIGEST_DISCORD_MAX_THREADS_PER_DELIVERY,
} from "./discord";

describe("formatUnreadMessageDigestDeliveriesForDiscord", () => {
  it("formats parent delivery with thread lines and no emails or previews", () => {
    const formatted = formatUnreadMessageDigestDeliveriesForDiscord([
      {
        recipientPortal: "parent",
        recipientLabel: "Cecilia family",
        familyId: "family-1",
        totalUnread: 3,
        threads: [
          {
            senderName: "Jane Smith",
            unreadCount: 2,
          },
          {
            senderName: "Rooted Meadows Office",
            unreadCount: 1,
          },
        ],
      },
    ]);

    assert.match(formatted, /Parent · Cecilia family/);
    assert.doesNotMatch(formatted, /@/);
    assert.match(formatted, /Jane Smith · 2 unread/);
    assert.doesNotMatch(formatted, /Can we reschedule/);
    assert.match(formatted, /Rooted Meadows Office · 1 unread/);
  });

  it("formats teacher delivery", () => {
    const formatted = formatUnreadMessageDigestDeliveriesForDiscord([
      {
        recipientPortal: "teacher",
        recipientLabel: "Alex Rivera",
        staffUserId: "user-1",
        totalUnread: 1,
        threads: [
          {
            senderName: "Maria Lopez",
            unreadCount: 1,
          },
        ],
      },
    ]);

    assert.match(formatted, /Teacher · Alex Rivera/);
    assert.doesNotMatch(formatted, /@/);
    assert.match(formatted, /Maria Lopez · 1 unread/);
    assert.doesNotMatch(formatted, /field trip/);
  });

  it("caps thread lines per delivery", () => {
    const threads = Array.from(
      { length: UNREAD_DIGEST_DISCORD_MAX_THREADS_PER_DELIVERY + 2 },
      (_, index) => ({
        senderName: `Sender ${index}`,
        unreadCount: 1,
      }),
    );

    const formatted = formatUnreadMessageDigestDeliveriesForDiscord([
      {
        recipientPortal: "parent",
        recipientLabel: "Test family",
        totalUnread: threads.length,
        threads,
      },
    ]);

    assert.equal(
      (formatted.match(/Sender \d+ · 1 unread/g) ?? []).length,
      UNREAD_DIGEST_DISCORD_MAX_THREADS_PER_DELIVERY,
    );
    assert.match(formatted, /and 2 more threads/);
  });

  it("returns em dash when there are no deliveries", () => {
    assert.equal(formatUnreadMessageDigestDeliveriesForDiscord([]), "—");
  });
});
