import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildEmailNotificationContext } from "@/lib/emails";
import { notifyOutboundEmailSent } from "@/lib/discord";

describe("outbound email Discord notifications", () => {
  it("buildEmailNotificationContext copies org and entity fields", () => {
    const context = buildEmailNotificationContext({
      organizationId: "org-1",
      organizationSlug: "rooted-meadows",
      surface: "cron",
      entityType: "family",
      entityId: "family-1",
    });

    assert.deepEqual(context, {
      organizationId: "org-1",
      organizationSlug: "rooted-meadows",
      surface: "cron",
      entityType: "family",
      entityId: "family-1",
    });
  });

  it("notifyOutboundEmailSent resolves when digest webhook is unset", async () => {
    const previous = process.env.DISCORD_DIGEST_NOTIFICATIONS_WEBHOOK_URL;
    delete process.env.DISCORD_DIGEST_NOTIFICATIONS_WEBHOOK_URL;

    try {
      await notifyOutboundEmailSent({
        channel: "tuition_due_reminder",
        audience: "parent",
        toAddress: "parent@example.com",
        subject: "Tuition reminder — Example School",
        organizationName: "Example School",
        organizationSlug: "example",
        organizationId: "org-1",
        surface: "cron",
      });
    } finally {
      if (previous === undefined) {
        delete process.env.DISCORD_DIGEST_NOTIFICATIONS_WEBHOOK_URL;
      } else {
        process.env.DISCORD_DIGEST_NOTIFICATIONS_WEBHOOK_URL = previous;
      }
    }
  });
});
