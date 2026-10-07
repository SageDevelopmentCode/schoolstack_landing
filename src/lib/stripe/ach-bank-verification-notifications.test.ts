import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { OutboundEmailSendResult } from "@/lib/admissions/notification-logging";
import { tuitionAchParentEmailDeliveredFromResults } from "@/lib/stripe/ach-failure-parent-email-result";

describe("tuitionAchParentEmailDeliveredFromResults", () => {
  it("treats unsubscribed as not delivered", () => {
    const results: PromiseSettledResult<OutboundEmailSendResult>[] = [
      { status: "fulfilled", value: { ok: true, skipped: "unsubscribed" } },
    ];

    assert.equal(tuitionAchParentEmailDeliveredFromResults(results), false);
  });

  it("counts a successful send as delivered", () => {
    const results: PromiseSettledResult<OutboundEmailSendResult>[] = [
      { status: "fulfilled", value: { ok: true } },
    ];

    assert.equal(tuitionAchParentEmailDeliveredFromResults(results), true);
  });
});
