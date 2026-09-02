import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  initialInboxLoadingState,
  mapThreadUnreadCountRows,
  shouldDeferInboxFetch,
} from "./thread-list-helpers";

describe("mapThreadUnreadCountRows", () => {
  it("defaults missing threads to zero unread", () => {
    const counts = mapThreadUnreadCountRows(
      ["thread-a", "thread-b", "thread-c"],
      [{ thread_id: "thread-b", unread_count: 3 }],
    );

    assert.equal(counts.get("thread-a"), 0);
    assert.equal(counts.get("thread-b"), 3);
    assert.equal(counts.get("thread-c"), 0);
  });

  it("coerces string unread counts from RPC rows", () => {
    const counts = mapThreadUnreadCountRows(["thread-a"], [
      { thread_id: "thread-a", unread_count: "7" },
    ]);

    assert.equal(counts.get("thread-a"), 7);
  });
});

describe("initialInboxLoadingState", () => {
  it("returns true when inbox is missing", () => {
    assert.equal(initialInboxLoadingState(undefined), true);
    assert.equal(initialInboxLoadingState(null), true);
  });

  it("returns true when threads are deferred for streaming hydration", () => {
    assert.equal(
      initialInboxLoadingState({
        threads: [],
        threadsDeferred: true,
      }),
      true,
    );
  });

  it("returns false when inbox is fully provided", () => {
    assert.equal(
      initialInboxLoadingState({
        threads: [{ id: "thread-a" } as never],
      }),
      false,
    );
  });
});

describe("shouldDeferInboxFetch", () => {
  it("does not defer when there is no initial inbox", () => {
    assert.equal(
      shouldDeferInboxFetch({
        initialInbox: undefined,
        threadsHydrated: false,
      }),
      false,
    );
  });

  it("defers fetch while threads are streaming in", () => {
    assert.equal(
      shouldDeferInboxFetch({
        initialInbox: { threads: [], threadsDeferred: true },
        threadsHydrated: false,
      }),
      true,
    );
  });

  it("defers fetch after SSR hydration completes", () => {
    assert.equal(
      shouldDeferInboxFetch({
        initialInbox: { threads: [{ id: "thread-a" }], threadsDeferred: false },
        threadsHydrated: true,
      }),
      true,
    );
  });
});
