import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  isMobilePushNotificationKind,
  MOBILE_PUSH_CATALOG,
  MOBILE_PUSH_NOTIFICATION_KINDS,
} from "@/lib/notifications/mobile-push-catalog";

describe("mobile push catalog", () => {
  it("lists every kind exactly once", () => {
    assert.equal(MOBILE_PUSH_CATALOG.length, MOBILE_PUSH_NOTIFICATION_KINDS.length);
    assert.equal(MOBILE_PUSH_NOTIFICATION_KINDS.length, 12);
    const catalogKinds = MOBILE_PUSH_CATALOG.map((entry) => entry.kind);
    assert.deepEqual([...new Set(catalogKinds)].sort(), [
      ...MOBILE_PUSH_NOTIFICATION_KINDS,
    ].sort());
  });

  it("validates known kinds", () => {
    assert.equal(isMobilePushNotificationKind("message.new"), true);
    assert.equal(isMobilePushNotificationKind("not.real"), false);
  });
});
