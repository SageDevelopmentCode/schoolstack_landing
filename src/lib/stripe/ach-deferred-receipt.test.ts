import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { shouldSendDeferredAchReceipt } from "@/lib/stripe/ach-deferred-receipt";

describe("shouldSendDeferredAchReceipt", () => {
  it("returns false for standard ACH processing (receipt already sent at checkout)", () => {
    assert.equal(shouldSendDeferredAchReceipt("processing"), false);
  });

  it("returns false for succeeded and other provider statuses", () => {
    assert.equal(shouldSendDeferredAchReceipt("succeeded"), false);
    assert.equal(shouldSendDeferredAchReceipt("failed"), false);
    assert.equal(shouldSendDeferredAchReceipt(null), false);
    assert.equal(shouldSendDeferredAchReceipt(undefined), false);
  });

  it("returns true only when bank verification was pending", () => {
    assert.equal(shouldSendDeferredAchReceipt("requires_action"), true);
  });
});
