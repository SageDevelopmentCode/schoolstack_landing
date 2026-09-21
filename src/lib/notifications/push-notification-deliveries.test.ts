import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  logPushNotificationDelivery,
  type PushDeliveryInput,
} from "@/lib/notifications/push-notification-deliveries";

function buildInput(
  overrides: Partial<PushDeliveryInput> = {},
): PushDeliveryInput {
  return {
    organizationId: "org-1",
    organizationName: "River Oak Academy",
    organizationSlug: "river-oak-academy",
    recipientUserId: "user-1",
    recipientPortal: "parent",
    recipientEmail: "parent@example.com",
    title: "River Oak Academy — Office",
    body: "Hello there",
    threadId: "thread-1",
    status: "sent",
    expoTicketId: "ticket-1",
    ...overrides,
  };
}

describe("logPushNotificationDelivery", () => {
  it("records delivery and notifies Discord after insert", async () => {
    const notified: PushDeliveryInput[] = [];

    const admin = {
      from() {
        return {
          insert: async () => ({ error: null }),
        };
      },
    };

    await logPushNotificationDelivery(
      admin as never,
      buildInput(),
      {
        notifyDelivered: async (input) => {
          notified.push(input);
        },
      },
    );

    assert.equal(notified.length, 1);
    assert.equal(notified[0]?.status, "sent");
    assert.equal(notified[0]?.organizationSlug, "river-oak-academy");
    assert.equal(notified[0]?.recipientEmail, "parent@example.com");
  });

  it("skips Discord when org name or slug is missing", async () => {
    let notifyCount = 0;

    const admin = {
      from() {
        return {
          insert: async () => ({ error: null }),
        };
      },
    };

    await logPushNotificationDelivery(
      admin as never,
      buildInput({ organizationName: " ", organizationSlug: "" }),
      {
        notifyDelivered: async () => {
          notifyCount += 1;
        },
      },
    );

    assert.equal(notifyCount, 0);
  });

  it("does not notify Discord when insert fails", async () => {
    let notifyCount = 0;

    const admin = {
      from() {
        return {
          insert: async () => ({ error: { message: "insert failed" } }),
        };
      },
    };

    await logPushNotificationDelivery(admin as never, buildInput(), {
      notifyDelivered: async () => {
        notifyCount += 1;
      },
    });

    assert.equal(notifyCount, 0);
  });
});
