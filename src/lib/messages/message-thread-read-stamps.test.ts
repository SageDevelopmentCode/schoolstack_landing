import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  MESSAGE_THREAD_NEVER_READ_LAST_READ_AT,
  partitionPairsByExistingReads,
  threadUserPairKey,
} from "./message-thread-read-stamps";

describe("threadUserPairKey", () => {
  it("joins thread and user ids", () => {
    assert.equal(
      threadUserPairKey("thread-a", "user-b"),
      "thread-a:user-b",
    );
  });
});

describe("partitionPairsByExistingReads", () => {
  it("splits pairs into update vs insert buckets", () => {
    const pairs = [
      { threadId: "t1", userId: "u1" },
      { threadId: "t2", userId: "u2" },
      { threadId: "t1", userId: "u1" },
    ];

    const { toUpdate, toInsert } = partitionPairsByExistingReads(pairs, [
      threadUserPairKey("t1", "u1"),
    ]);

    assert.deepEqual(toUpdate, [{ threadId: "t1", userId: "u1" }]);
    assert.deepEqual(toInsert, [{ threadId: "t2", userId: "u2" }]);
  });

  it("treats all pairs as insert when nothing exists", () => {
    const pairs = [{ threadId: "t1", userId: "u1" }];
    const { toUpdate, toInsert } = partitionPairsByExistingReads(pairs, []);

    assert.deepEqual(toUpdate, []);
    assert.deepEqual(toInsert, pairs);
  });
});

describe("MESSAGE_THREAD_NEVER_READ_LAST_READ_AT", () => {
  it("is before any real portal message timestamps", () => {
    assert.ok(
      new Date(MESSAGE_THREAD_NEVER_READ_LAST_READ_AT).getTime() <
        new Date("2020-01-01T00:00:00.000Z").getTime(),
    );
  });
});
