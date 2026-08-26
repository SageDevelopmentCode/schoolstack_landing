import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { deliverZohoEmail, ensureZohoConfigured } from "@/lib/notification-delivery";

describe("notification-delivery", () => {
  it("ensureZohoConfigured throws when outbound email is disabled", async () => {
    const previous = process.env.DISABLE_OUTBOUND_EMAIL;
    process.env.DISABLE_OUTBOUND_EMAIL = "1";

    try {
      await assert.rejects(
        () => ensureZohoConfigured("Test channel"),
        /Zoho outbound email is not configured/,
      );
    } finally {
      if (previous === undefined) {
        delete process.env.DISABLE_OUTBOUND_EMAIL;
      } else {
        process.env.DISABLE_OUTBOUND_EMAIL = previous;
      }
    }
  });

  it("deliverZohoEmail throws when outbound email is disabled", async () => {
    const previous = process.env.DISABLE_OUTBOUND_EMAIL;
    process.env.DISABLE_OUTBOUND_EMAIL = "true";

    try {
      await assert.rejects(
        () =>
          deliverZohoEmail({
            channel: "Test email",
            toAddress: "test@example.com",
            subject: "Subject",
            content: "<p>Hi</p>",
          }),
        /Test email: Zoho outbound email is not configured/,
      );
    } finally {
      if (previous === undefined) {
        delete process.env.DISABLE_OUTBOUND_EMAIL;
      } else {
        process.env.DISABLE_OUTBOUND_EMAIL = previous;
      }
    }
  });
});
