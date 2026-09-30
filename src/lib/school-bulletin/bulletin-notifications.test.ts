import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isBulletinPostActive } from "./bulletin-audience";
import {
  maybeSendBulletinEmailsOnPublish,
  sendBulletinPublishedEmailNotifications,
} from "./bulletin-notifications";
import type { BulletinPost } from "./types";

function samplePost(overrides: Partial<BulletinPost> = {}): BulletinPost {
  return {
    id: "post-1",
    organizationId: "org-1",
    title: "Field trip Friday",
    body: "Please pack a lunch.",
    status: "published",
    audiences: ["school_wide"],
    programIds: [],
    publishedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    attachments: [],
    ...overrides,
  };
}

describe("sendBulletinPublishedEmailNotifications", () => {
  it("skips when publish emails were already sent", async () => {
    let sendCalls = 0;
    const admin = {
      from: () => ({
        select: () => ({
          eq: () => ({
            eq: () => ({
              maybeSingle: async () => ({
                data: { published_email_sent_at: "2026-01-01T00:00:00.000Z" },
                error: null,
              }),
            }),
          }),
        }),
      }),
    };

    const result = await sendBulletinPublishedEmailNotifications(
      admin as never,
      { organizationId: "org-1", post: samplePost() },
      {
        sendEmail: async () => {
          sendCalls += 1;
          return { ok: true };
        },
      },
    );

    assert.equal(result.emailsAttempted, 0);
    assert.equal(sendCalls, 0);
  });

  it("sends to recipients and marks the post as sent", async () => {
    const sentTo: string[] = [];
    let markedSent = false;

    const admin = {
      from: (table: string) => {
        if (table === "programs") {
          return {
            select: () => ({
              eq: async () => ({ data: [], error: null }),
            }),
          };
        }
        if (table === "school_bulletin_posts") {
          return {
            select: () => ({
              eq: () => ({
                eq: () => ({
                  maybeSingle: async () => ({
                    data: { published_email_sent_at: null },
                    error: null,
                  }),
                }),
              }),
            }),
            update: () => ({
              eq: () => ({
                eq: () => ({
                  is: async () => {
                    markedSent = true;
                    return { error: null };
                  },
                }),
              }),
            }),
          };
        }
        throw new Error(`unexpected table ${table}`);
      },
    };

    const result = await sendBulletinPublishedEmailNotifications(
      admin as never,
      { organizationId: "org-1", post: samplePost() },
      {
        loadOrganizationContext: async () => ({
          schoolName: "Rooted Meadows",
          schoolSlug: "rooted-meadows",
          bulletinEnabled: true,
        }),
        resolveRecipients: async () => [
          { email: "parent@test.com", portal: "parent" },
          { email: "teacher@test.com", portal: "teacher" },
        ],
        sendEmail: async ({ to }) => {
          sentTo.push(to);
          return { ok: true };
        },
        markSent: async () => {
          markedSent = true;
        },
        logSettledNotificationFailures: async () => {},
      },
    );

    assert.equal(result.emailsAttempted, 2);
    assert.equal(result.emailsSucceeded, 2);
    assert.deepEqual(sentTo.sort(), ["parent@test.com", "teacher@test.com"]);
    assert.equal(markedSent, true);
  });

  it("does not mark sent when every email fails", async () => {
    let markedSent = false;

    const admin = {
      from: (table: string) => {
        if (table === "programs") {
          return {
            select: () => ({
              eq: async () => ({ data: [], error: null }),
            }),
          };
        }
        if (table === "school_bulletin_posts") {
          return {
            select: () => ({
              eq: () => ({
                eq: () => ({
                  maybeSingle: async () => ({
                    data: { published_email_sent_at: null },
                    error: null,
                  }),
                }),
              }),
            }),
          };
        }
        throw new Error(`unexpected table ${table}`);
      },
    };

    const result = await sendBulletinPublishedEmailNotifications(
      admin as never,
      { organizationId: "org-1", post: samplePost() },
      {
        loadOrganizationContext: async () => ({
          schoolName: "Rooted Meadows",
          schoolSlug: "rooted-meadows",
          bulletinEnabled: true,
        }),
        loadPublisherName: async () => null,
        resolveRecipients: async () => [{ email: "parent@test.com", portal: "parent" }],
        sendEmail: async () => ({ ok: false }),
        markSent: async () => {
          markedSent = true;
        },
        logSettledNotificationFailures: async () => {},
      },
    );

    assert.equal(result.emailsAttempted, 1);
    assert.equal(result.emailsSucceeded, 0);
    assert.equal(markedSent, false);
  });
});

describe("maybeSendBulletinEmailsOnPublish", () => {
  it("skips scheduled posts that are not active yet", async () => {
    const future = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    const post = samplePost({ publishedAt: future });
    assert.equal(isBulletinPostActive(post), false);

    let sendCalls = 0;
    await maybeSendBulletinEmailsOnPublish(
      {} as never,
      { organizationId: "org-1", post },
      {
        loadOrganizationContext: async () => ({
          schoolName: "School",
          schoolSlug: "school",
          bulletinEnabled: true,
        }),
        resolveRecipients: async () => {
          sendCalls += 1;
          return [];
        },
        sendEmail: async () => ({ ok: true }),
        markSent: async () => {},
        logSettledNotificationFailures: async () => {},
      },
    );

    assert.equal(sendCalls, 0);
  });
});
