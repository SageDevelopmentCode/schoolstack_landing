import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { summarizeOutboundEmailSettledFailures } from "@/lib/admissions/notification-logging";

describe("summarizeOutboundEmailSettledFailures", () => {
  it("returns failure detail from rejected and failed sends", () => {
    const summary = summarizeOutboundEmailSettledFailures([
      { status: "fulfilled", value: { ok: true } },
      { status: "fulfilled", value: { ok: false, error: "Invalid token" } },
      { status: "rejected", reason: new Error("network down") },
    ]);

    assert.equal(summary.failureCount, 2);
    assert.equal(summary.detail, "Invalid token; network down");
  });

  it("returns zero failures when all sends succeeded", () => {
    const summary = summarizeOutboundEmailSettledFailures([
      { status: "fulfilled", value: { ok: true } },
      { status: "fulfilled", value: { ok: true, skipped: "unsubscribed" } },
    ]);

    assert.equal(summary.failureCount, 0);
    assert.equal(summary.detail, null);
  });
});
