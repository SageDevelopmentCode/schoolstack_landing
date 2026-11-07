import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";
import {
  CLIENT_ERROR_LIMITS,
  CLIENT_ERROR_NOTIFY_MAX_PER_WINDOW,
  CLIENT_ERROR_NOTIFY_WINDOW_MS,
  clampClientErrorString,
  resetClientErrorNotifyThrottleForTests,
  sanitizeClientErrorFields,
  sanitizeClientErrorMetadata,
  shouldNotifyClientError,
} from "@/lib/client-operational-error-input";

describe("clampClientErrorString", () => {
  it("trims, caps and rejects non-strings", () => {
    assert.equal(clampClientErrorString("  hi  ", 10), "hi");
    assert.equal(clampClientErrorString("abcdef", 3), "abc");
    assert.equal(clampClientErrorString("   ", 10), null);
    assert.equal(clampClientErrorString(42, 10), null);
    assert.equal(clampClientErrorString(undefined, 10), null);
  });
});

describe("sanitizeClientErrorMetadata", () => {
  it("keeps small plain objects and drops everything else", () => {
    assert.deepEqual(sanitizeClientErrorMetadata({ a: 1 }), { a: 1 });
    assert.equal(sanitizeClientErrorMetadata([1, 2]), undefined);
    assert.equal(sanitizeClientErrorMetadata("text"), undefined);
    assert.equal(sanitizeClientErrorMetadata(null), undefined);
  });

  it("replaces oversized metadata with a marker", () => {
    const result = sanitizeClientErrorMetadata({
      blob: "x".repeat(CLIENT_ERROR_LIMITS.metadataBytes + 1),
    });
    assert.equal(result?.metadataTruncated, true);
    assert.ok(!("blob" in (result ?? {})));
  });

  it("handles unserializable metadata", () => {
    const circular: Record<string, unknown> = {};
    circular.self = circular;
    assert.deepEqual(sanitizeClientErrorMetadata(circular), {
      metadataDropped: "unserializable",
    });
  });
});

describe("sanitizeClientErrorFields", () => {
  it("requires operation and error", () => {
    assert.equal(sanitizeClientErrorFields({ operation: "op" }), null);
    assert.equal(sanitizeClientErrorFields({ error: "boom" }), null);
  });

  it("caps long fields", () => {
    const result = sanitizeClientErrorFields({
      operation: "o".repeat(1000),
      error: "e".repeat(5000),
      details: "d".repeat(5000),
    });
    assert.equal(result?.operation.length, CLIENT_ERROR_LIMITS.operation);
    assert.equal(result?.error.length, CLIENT_ERROR_LIMITS.error);
    assert.equal(result?.details?.length, CLIENT_ERROR_LIMITS.details);
  });
});

describe("shouldNotifyClientError", () => {
  beforeEach(() => resetClientErrorNotifyThrottleForTests());

  it("allows a budget of notifications per user and organization, then stops", () => {
    const now = 1_000_000;
    for (let i = 0; i < CLIENT_ERROR_NOTIFY_MAX_PER_WINDOW; i += 1) {
      assert.equal(shouldNotifyClientError("u1", "o1", now + i), true);
    }
    assert.equal(shouldNotifyClientError("u1", "o1", now + 100), false);
    // Other user / org is independent.
    assert.equal(shouldNotifyClientError("u2", "o1", now + 100), true);
    assert.equal(shouldNotifyClientError("u1", "o2", now + 100), true);
  });

  it("allows notifications again after the window passes", () => {
    const now = 1_000_000;
    for (let i = 0; i < CLIENT_ERROR_NOTIFY_MAX_PER_WINDOW; i += 1) {
      shouldNotifyClientError("u1", "o1", now);
    }
    assert.equal(shouldNotifyClientError("u1", "o1", now + 1), false);
    assert.equal(
      shouldNotifyClientError("u1", "o1", now + CLIENT_ERROR_NOTIFY_WINDOW_MS + 1),
      true,
    );
  });
});
