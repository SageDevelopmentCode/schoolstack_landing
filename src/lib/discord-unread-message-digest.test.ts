import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  formatUnreadMessageDigestDeliveriesForDiscord,
  UNREAD_DIGEST_DISCORD_MAX_THREADS_PER_DELIVERY,
  UNREAD_DIGEST_DISCORD_PREVIEW_MAX,
} from "./discord";

describe("formatUnreadMessageDigestDeliveriesForDiscord", () => {
  it("formats parent delivery with multiple emails and thread lines", () => {
    const formatted = formatUnreadMessageDigestDeliveriesForDiscord([
      {
        recipientPortal: "parent",
        recipientEmails: ["rachael@example.com", "partner@example.com"],
        recipientLabel: "Cecilia family",
        familyId: "family-1",
        totalUnread: 3,
        threads: [
          {
            senderName: "Jane Smith",
            unreadCount: 2,
            preview: "Can we reschedule the shadow day?",
          },
          {
            senderName: "Rooted Meadows Office",
            unreadCount: 1,
            preview: "Thanks — we will see you at pickup.",
          },
        ],
      },
    ]);

    assert.match(formatted, /Parent · Cecilia family · rachael@example.com, partner@example.com/);
    assert.match(formatted, /Jane Smith · 2 unread/);
    assert.match(formatted, /Can we reschedule the shadow day/);
    assert.match(formatted, /Rooted Meadows Office · 1 unread/);
  });

  it("formats teacher delivery", () => {
    const formatted = formatUnreadMessageDigestDeliveriesForDiscord([
      {
        recipientPortal: "teacher",
        recipientEmails: ["teacher@school.com"],
        recipientLabel: "Alex Rivera",
        staffUserId: "user-1",
        totalUnread: 1,
        threads: [
          {
            senderName: "Maria Lopez",
            unreadCount: 1,
            preview: "Question about tomorrow's field trip",
          },
        ],
      },
    ]);

    assert.match(formatted, /Teacher · Alex Rivera · teacher@school.com/);
    assert.match(formatted, /Maria Lopez · 1 unread/);
  });

  it("truncates long previews and caps thread lines per delivery", () => {
    const longPreview = "x".repeat(UNREAD_DIGEST_DISCORD_PREVIEW_MAX + 40);
    const threads = Array.from(
      { length: UNREAD_DIGEST_DISCORD_MAX_THREADS_PER_DELIVERY + 2 },
      (_, index) => ({
        senderName: `Sender ${index}`,
        unreadCount: 1,
        preview: index === 0 ? longPreview : `Preview ${index}`,
      }),
    );

    const formatted = formatUnreadMessageDigestDeliveriesForDiscord([
      {
        recipientPortal: "parent",
        recipientEmails: ["family@example.com"],
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
    assert.match(
      formatted,
      new RegExp(`"${"x".repeat(UNREAD_DIGEST_DISCORD_PREVIEW_MAX - 3)}\\.\\.\\."`),
    );
  });

  it("returns em dash when there are no deliveries", () => {
    assert.equal(formatUnreadMessageDigestDeliveriesForDiscord([]), "—");
  });
});
