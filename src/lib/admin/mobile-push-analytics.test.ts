import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  aggregatePushDeliveryGroupRows,
  buildMobilePushKindSummaries,
} from "@/lib/admin/mobile-push-analytics";

describe("aggregatePushDeliveryGroupRows", () => {
  it("counts statuses per catalog kind and ignores unknown kinds", () => {
    const byKind = aggregatePushDeliveryGroupRows([
      { notification_kind: "message.new", status: "sent" },
      { notification_kind: "message.new", status: "sent" },
      { notification_kind: "message.new", status: "failed" },
      { notification_kind: "committee.message_posted", status: "skipped_no_token" },
      { notification_kind: "unknown.kind", status: "sent" },
      { notification_kind: null, status: "sent" },
    ]);

    assert.equal(byKind.get("message.new")?.sent, 2);
    assert.equal(byKind.get("message.new")?.failed, 1);
    assert.equal(byKind.get("message.new")?.skipped_no_token, 0);
    assert.equal(byKind.get("committee.message_posted")?.skipped_no_token, 1);
    assert.equal(byKind.get("committee.join_approved")?.sent, 0);
  });
});

describe("buildMobilePushKindSummaries", () => {
  it("merges period and today counts into catalog rows", () => {
    const period = aggregatePushDeliveryGroupRows([
      { notification_kind: "message.new", status: "sent" },
      { notification_kind: "message.new", status: "failed" },
    ]);
    const today = aggregatePushDeliveryGroupRows([
      { notification_kind: "message.new", status: "sent" },
    ]);

    const kinds = buildMobilePushKindSummaries(period, today);
    const messageRow = kinds.find((row) => row.kind === "message.new");

    assert.ok(messageRow);
    assert.equal(messageRow.sentCount, 1);
    assert.equal(messageRow.failedCount, 1);
    assert.equal(messageRow.deliveryCount, 2);
    assert.equal(messageRow.sentTodayCount, 1);
    assert.equal(messageRow.failedTodayCount, 0);
    assert.equal(messageRow.label, "New message");
  });
});
