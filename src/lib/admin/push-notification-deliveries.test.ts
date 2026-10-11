import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  decodePushNotificationCursor,
  encodePushNotificationCursor,
  fetchAdminPushNotificationDeliveries,
} from "@/lib/admin/push-notification-deliveries";

describe("push notification delivery cursors", () => {
  it("encodes and decodes cursors", () => {
    const encoded = encodePushNotificationCursor(
      "2026-09-20T12:00:00.000Z",
      "abc-123",
    );
    assert.deepEqual(decodePushNotificationCursor(encoded), {
      createdAt: "2026-09-20T12:00:00.000Z",
      id: "abc-123",
    });
  });

  it("returns null for invalid cursors", () => {
    assert.equal(decodePushNotificationCursor("invalid"), null);
  });
});

describe("fetchAdminPushNotificationDeliveries", () => {
  it("maps rows with message hrefs", async () => {
    const eqCalls: { column: string; value: string }[] = [];
    const query = {
      select() {
        return this;
      },
      eq(column: string, value: string) {
        eqCalls.push({ column, value });
        return this;
      },
      or() {
        return this;
      },
      order() {
        return this;
      },
      limit() {
        return Promise.resolve({
          data: [
            {
              id: "delivery-1",
              created_at: "2026-09-20T12:00:00.000Z",
              status: "sent",
              title: "School — Sender",
              body: "Hello",
              recipient_portal: "parent",
              recipient_email: "parent@example.com",
              recipient_user_id: "user-1",
              thread_id: "thread-1",
              error_message: null,
            },
          ],
          error: null,
        });
      },
    };

    const admin = {
      from() {
        return query;
      },
    };

    const page = await fetchAdminPushNotificationDeliveries(
      admin as never,
      "org-1",
      "river-oak-academy",
      { limit: 20 },
    );

    assert.equal(page.deliveries.length, 1);
    assert.equal(
      page.deliveries[0]?.messageHref,
      "/school/river-oak-academy/parent/messages?thread=thread-1",
    );
    assert.equal(page.hasMore, false);
  });

  it("filters by recipient user id when provided", async () => {
    const eqCalls: { column: string; value: string }[] = [];
    const query = {
      select() {
        return this;
      },
      eq(column: string, value: string) {
        eqCalls.push({ column, value });
        return this;
      },
      or() {
        return this;
      },
      order() {
        return this;
      },
      limit() {
        return Promise.resolve({ data: [], error: null });
      },
    };

    const admin = {
      from() {
        return query;
      },
    };

    await fetchAdminPushNotificationDeliveries(
      admin as never,
      "org-1",
      "river-oak-academy",
      { limit: 20, recipientUserId: "user-abc" },
    );

    assert.ok(
      eqCalls.some(
        (call) =>
          call.column === "recipient_user_id" && call.value === "user-abc",
      ),
    );
  });
});
