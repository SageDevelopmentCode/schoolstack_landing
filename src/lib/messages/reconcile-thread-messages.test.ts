import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { PortalMessage } from "./types";
import {
  createLoadGenerationGuard,
  createOptimisticSendTracker,
  matchesPendingServerMessage,
  reconcileThreadMessages,
} from "./reconcile-thread-messages";

function message(
  overrides: Partial<PortalMessage> & Pick<PortalMessage, "id" | "body">,
): PortalMessage {
  return {
    threadId: "thread-1",
    senderUserId: "user-1",
    senderKind: "guardian",
    senderName: "You",
    isOwn: true,
    createdAt: "2026-09-19T12:00:00.000Z",
    timeLabel: "12:00 PM",
    editedAt: null,
    attachments: [],
    ...overrides,
  };
}

describe("matchesPendingServerMessage", () => {
  it("matches own messages with the same body within the time window", () => {
    const pending = message({
      id: "pending-1",
      body: "Hello",
      pending: true,
      createdAt: "2026-09-19T12:00:00.000Z",
    });
    const server = message({
      id: "server-1",
      body: "Hello",
      createdAt: "2026-09-19T12:00:05.000Z",
    });

    assert.equal(matchesPendingServerMessage(server, pending, 30_000), true);
  });

  it("does not match different bodies or messages outside the window", () => {
    const pending = message({
      id: "pending-1",
      body: "Hello",
      pending: true,
      createdAt: "2026-09-19T12:00:00.000Z",
    });
    const differentBody = message({
      id: "server-1",
      body: "Goodbye",
      createdAt: "2026-09-19T12:00:05.000Z",
    });
    const tooLate = message({
      id: "server-2",
      body: "Hello",
      createdAt: "2026-09-19T12:01:00.000Z",
    });

    assert.equal(matchesPendingServerMessage(differentBody, pending, 30_000), false);
    assert.equal(matchesPendingServerMessage(tooLate, pending, 30_000), false);
  });
});

describe("reconcileThreadMessages", () => {
  it("drops pending messages when the server already has a matching own message", () => {
    const pending = message({
      id: "pending-1",
      body: "Hello",
      pending: true,
      createdAt: "2026-09-19T12:00:00.000Z",
    });
    const server = message({
      id: "server-1",
      body: "Hello",
      createdAt: "2026-09-19T12:00:05.000Z",
    });

    const reconciled = reconcileThreadMessages([server], [pending]);
    assert.deepEqual(reconciled.map((item) => item.id), ["server-1"]);
  });

  it("keeps unrelated pending messages", () => {
    const pending = message({
      id: "pending-1",
      body: "Still sending",
      pending: true,
      createdAt: "2026-09-19T12:00:00.000Z",
    });
    const server = message({
      id: "server-1",
      body: "Earlier message",
      createdAt: "2026-09-19T11:59:00.000Z",
    });

    const reconciled = reconcileThreadMessages([server], [pending]);
    assert.deepEqual(reconciled.map((item) => item.id), ["server-1", "pending-1"]);
  });

  it("preserves recently confirmed messages missing from stale server responses", () => {
    const confirmed = message({
      id: "server-1",
      body: "Hello",
      createdAt: "2026-09-19T12:00:05.000Z",
    });
    const olderServer = message({
      id: "server-0",
      body: "Earlier message",
      createdAt: "2026-09-19T11:59:00.000Z",
    });

    const reconciled = reconcileThreadMessages([olderServer], [confirmed], {
      recentlyConfirmedIds: new Set(["server-1"]),
    });

    assert.deepEqual(reconciled.map((item) => item.id), ["server-0", "server-1"]);
  });

  it("uses optimistic-to-server mappings during reconciliation", () => {
    const pending = message({
      id: "pending-1",
      body: "Hello",
      pending: true,
      createdAt: "2026-09-19T12:00:00.000Z",
    });
    const server = message({
      id: "server-1",
      body: "Different preview text",
      createdAt: "2026-09-19T12:00:05.000Z",
    });

    const reconciled = reconcileThreadMessages([server], [pending], {
      optimisticToServerId: new Map([["pending-1", "server-1"]]),
    });

    assert.deepEqual(reconciled.map((item) => item.id), ["server-1"]);
  });
});

describe("createLoadGenerationGuard", () => {
  it("discards older generations after a newer load starts", () => {
    const guard = createLoadGenerationGuard();
    const first = guard.bump();
    const second = guard.bump();

    assert.equal(guard.isLatest(first), false);
    assert.equal(guard.isLatest(second), true);
  });
});

describe("createOptimisticSendTracker", () => {
  it("tracks pending and confirmed ids for reconciliation", () => {
    const tracker = createOptimisticSendTracker();
    tracker.addPending("pending-1");
    tracker.confirm("pending-1", "server-1");

    const options = tracker.getReconcileOptions();
    assert.equal(options.optimisticToServerId?.get("pending-1"), "server-1");
    assert.equal(options.recentlyConfirmedIds?.has("server-1"), true);
    assert.equal(tracker.hasPending(), false);
  });
});
