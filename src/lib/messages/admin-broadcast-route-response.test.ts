import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildBroadcastPartialFailureMessage,
  buildBroadcastTotalFailureBody,
  summarizeBroadcastFailures,
} from "./admin-broadcast-route-response";

describe("admin broadcast route response helpers", () => {
  it("summarizes failures with a limit", () => {
    const failures = Array.from({ length: 12 }, (_, index) => ({
      guardianId: `g-${index}`,
      name: `Parent ${index}`,
      error: `Error ${index}`,
    }));

    const summary = summarizeBroadcastFailures(failures, 3);
    assert.equal(summary.length, 3);
    assert.deepEqual(summary[0], { name: "Parent 0", error: "Error 0" });
  });

  it("builds partial failure message with counts", () => {
    const message = buildBroadcastPartialFailureMessage({
      sentCount: 8,
      failedCount: 2,
      failures: [],
    });
    assert.equal(message, "Bulk message partially failed: 2 of 10 parents could not be reached.");
  });

  it("builds total failure body with failures included", () => {
    const body = buildBroadcastTotalFailureBody({
      sentCount: 0,
      failedCount: 2,
      failures: [
        { guardianId: "g-1", name: "Ada", error: "Thread not found." },
        { guardianId: "g-2", name: "Ben", error: "Upload failed." },
      ],
    });

    assert.equal(body.code, "broadcast_failed");
    assert.equal(body.sentCount, 0);
    assert.equal(body.failedCount, 2);
    assert.equal(body.failures.length, 2);
    assert.equal(body.error, "Unable to send messages to the selected parents.");
  });
});
