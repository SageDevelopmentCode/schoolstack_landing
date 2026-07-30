import assert from "node:assert/strict";
import { describe, it, beforeEach, afterEach } from "node:test";
import { enrollmentPaymentPollSucceeded } from "./enrollment-checklist-materialization";
import type { EnrollmentChecklistItemInstance } from "./enrollment-checklist-schema";
import {
  clearPaymentReturnQuery,
  getPaymentPollStorageKey,
  hasPaymentPollStarted,
  markPaymentPollStarted,
  readPaymentReturnPending,
} from "./payment-return-polling";

function instance(
  id: string,
  overrides: Partial<EnrollmentChecklistItemInstance> = {},
): EnrollmentChecklistItemInstance {
  return {
    id,
    checklistId: "chk_1",
    templateItemId: "tpl_1",
    itemKey: "payment",
    status: "in_progress",
    paymentStatus: "pending",
    responses: {},
    ...overrides,
  };
}

describe("enrollmentPaymentPollSucceeded", () => {
  it("returns true when an instance becomes paid", () => {
    const previous = [instance("a", { paymentStatus: "pending" })];
    const next = [instance("a", { paymentStatus: "paid", status: "completed" })];
    assert.equal(enrollmentPaymentPollSucceeded(previous, next), true);
  });

  it("returns false when payment status is unchanged", () => {
    const previous = [instance("a", { paymentStatus: "pending" })];
    const next = [instance("a", { paymentStatus: "pending" })];
    assert.equal(enrollmentPaymentPollSucceeded(previous, next), false);
  });
});

describe("readPaymentReturnPending", () => {
  it("returns true when payment=success", () => {
    const params = new URLSearchParams("payment=success&session_id=abc");
    assert.equal(readPaymentReturnPending(params), true);
  });

  it("returns false for other payment values", () => {
    const params = new URLSearchParams("payment=cancelled");
    assert.equal(readPaymentReturnPending(params), false);
  });
});

describe("payment poll sessionStorage guard", () => {
  const storage = new Map<string, string>();

  beforeEach(() => {
    storage.clear();
    const sessionStorageMock = {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => {
        storage.set(key, value);
      },
      removeItem: (key: string) => {
        storage.delete(key);
      },
      clear: () => storage.clear(),
    };
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: { sessionStorage: sessionStorageMock },
    });
  });

  afterEach(() => {
    Reflect.deleteProperty(globalThis, "window");
  });

  it("uses a scoped storage key", () => {
    assert.equal(
      getPaymentPollStorageKey("enrollment:chk_123"),
      "payment-return-poll:enrollment:chk_123",
    );
  });

  it("tracks whether a poll has already started", () => {
    const scope = "application:app_456";
    assert.equal(hasPaymentPollStarted(scope), false);
    markPaymentPollStarted(scope);
    assert.equal(hasPaymentPollStarted(scope), true);
  });
});

describe("clearPaymentReturnQuery", () => {
  it("replaces the current pathname without query params", () => {
    const replaced: string[] = [];
    const router = {
      replace: (path: string) => {
        replaced.push(path);
      },
    };

    clearPaymentReturnQuery(router, "/school/demo/forms/apply");
    assert.deepEqual(replaced, ["/school/demo/forms/apply"]);
  });
});
