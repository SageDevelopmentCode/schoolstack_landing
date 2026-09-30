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

const enabledOrg = async () => ({
  schoolName: "Rooted Meadows",
  schoolSlug: "rooted-meadows",
  bulletinEnabled: true,
});

const adminForAudienceLabels = {
  from: (table: string) => {
    if (table === "programs") {
      return {
        select: () => ({
          eq: async () => ({ data: [], error: null }),
        }),
      };
    }
    throw new Error(`unexpected table ${table}`);
  },
} as never;

describe("sendBulletinPublishedEmailNotifications", () => {
  it("skips when another worker already claimed the send", async () => {
    let sendCalls = 0;
    let claimCalls = 0;

    const result = await sendBulletinPublishedEmailNotifications(
      adminForAudienceLabels,
      { organizationId: "org-1", post: samplePost() },
      {
        loadOrganizationContext: enabledOrg,
        resolveRecipients: async () => [
          { email: "parent@test.com", portal: "parent" },
        ],
        tryClaimSent: async () => {
          claimCalls += 1;
          return false;
        },
        sendEmail: async () => {
          sendCalls += 1;
          return { ok: true };
        },
        logSettledNotificationFailures: async () => {},
      },
    );

    assert.equal(claimCalls, 1);
    assert.equal(result.emailsAttempted, 0);
    assert.equal(sendCalls, 0);
  });

  it("claims before sending and keeps the claim when every email succeeds", async () => {
    const sentTo: string[] = [];
    let claimCalls = 0;
    let clearCalls = 0;
    let sendCalls = 0;

    const result = await sendBulletinPublishedEmailNotifications(
      adminForAudienceLabels,
      { organizationId: "org-1", post: samplePost() },
      {
        loadOrganizationContext: enabledOrg,
        resolveRecipients: async () => [
          { email: "parent@test.com", portal: "parent" },
          { email: "teacher@test.com", portal: "teacher" },
        ],
        tryClaimSent: async () => {
          claimCalls += 1;
          return true;
        },
        clearSent: async () => {
          clearCalls += 1;
        },
        sendEmail: async ({ to }) => {
          sendCalls += 1;
          sentTo.push(to);
          return { ok: true };
        },
        logSettledNotificationFailures: async () => {},
      },
    );

    assert.equal(claimCalls, 1);
    assert.equal(sendCalls, 2);
    assert.equal(clearCalls, 0);
    assert.equal(result.emailsAttempted, 2);
    assert.equal(result.emailsSucceeded, 2);
    assert.deepEqual(sentTo.sort(), ["parent@test.com", "teacher@test.com"]);
  });

  it("clears the claim when every email fails", async () => {
    let clearCalls = 0;

    const result = await sendBulletinPublishedEmailNotifications(
      adminForAudienceLabels,
      { organizationId: "org-1", post: samplePost() },
      {
        loadOrganizationContext: enabledOrg,
        loadPublisherName: async () => null,
        resolveRecipients: async () => [{ email: "parent@test.com", portal: "parent" }],
        tryClaimSent: async () => true,
        clearSent: async () => {
          clearCalls += 1;
        },
        sendEmail: async () => ({ ok: false }),
        logSettledNotificationFailures: async () => {},
      },
    );

    assert.equal(result.emailsAttempted, 1);
    assert.equal(result.emailsSucceeded, 0);
    assert.equal(clearCalls, 1);
  });

  it("clears the claim on partial success so cron can retry", async () => {
    let clearCalls = 0;

    const result = await sendBulletinPublishedEmailNotifications(
      adminForAudienceLabels,
      { organizationId: "org-1", post: samplePost() },
      {
        loadOrganizationContext: enabledOrg,
        resolveRecipients: async () => [
          { email: "parent@test.com", portal: "parent" },
          { email: "teacher@test.com", portal: "teacher" },
        ],
        tryClaimSent: async () => true,
        clearSent: async () => {
          clearCalls += 1;
        },
        sendEmail: async ({ to }) => ({ ok: to === "parent@test.com" }),
        logSettledNotificationFailures: async () => {},
      },
    );

    assert.equal(result.emailsAttempted, 2);
    assert.equal(result.emailsSucceeded, 1);
    assert.equal(clearCalls, 1);
  });

  it("claims with zero recipients and does not send", async () => {
    let claimCalls = 0;
    let clearCalls = 0;

    const result = await sendBulletinPublishedEmailNotifications(
      adminForAudienceLabels,
      { organizationId: "org-1", post: samplePost() },
      {
        loadOrganizationContext: enabledOrg,
        resolveRecipients: async () => [],
        tryClaimSent: async () => {
          claimCalls += 1;
          return true;
        },
        clearSent: async () => {
          clearCalls += 1;
        },
        sendEmail: async () => ({ ok: true }),
        logSettledNotificationFailures: async () => {},
      },
    );

    assert.equal(claimCalls, 1);
    assert.equal(clearCalls, 0);
    assert.equal(result.emailsAttempted, 0);
    assert.equal(result.emailsSucceeded, 0);
  });
});

describe("maybeSendBulletinEmailsOnPublish", () => {
  it("skips scheduled posts that are not active yet", async () => {
    const future = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    const post = samplePost({ publishedAt: future });
    assert.equal(isBulletinPostActive(post), false);

    let claimCalls = 0;
    await maybeSendBulletinEmailsOnPublish(
      {} as never,
      { organizationId: "org-1", post },
      {
        loadOrganizationContext: enabledOrg,
        resolveRecipients: async () => {
          claimCalls += 1;
          return [];
        },
        tryClaimSent: async () => {
          claimCalls += 1;
          return true;
        },
        logSettledNotificationFailures: async () => {},
      },
    );

    assert.equal(claimCalls, 0);
  });
});
