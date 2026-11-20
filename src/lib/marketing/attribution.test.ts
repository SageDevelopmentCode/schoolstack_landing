import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";
import { captureFirstTouch } from "@/lib/marketing/attribution";

const ATTRIBUTION_KEY = "mk-first-touch";
const CONSENT_KEY = "mudkitchen-cookie-consent";

function storageMock(store: Map<string, string>) {
  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
    clear: () => store.clear(),
  };
}

describe("captureFirstTouch", () => {
  const sessionStore = new Map<string, string>();
  const localStore = new Map<string, string>();

  beforeEach(() => {
    sessionStore.clear();
    localStore.clear();

    Object.defineProperty(globalThis, "document", {
      configurable: true,
      value: { referrer: "" },
    });
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: {
        sessionStorage: storageMock(sessionStore),
        localStorage: storageMock(localStore),
        location: {
          search: "?utm_campaign=review_test",
          pathname: "/",
          host: "trymudkitchen.com",
        },
      },
    });
  });

  afterEach(() => {
    Reflect.deleteProperty(globalThis, "window");
    Reflect.deleteProperty(globalThis, "document");
  });

  it("promotes session first-touch to localStorage after analytics consent", () => {
    captureFirstTouch();

    assert.ok(sessionStore.has(ATTRIBUTION_KEY));
    assert.equal(localStore.has(ATTRIBUTION_KEY), false);

    const sessionPayload = sessionStore.get(ATTRIBUTION_KEY);
    assert.ok(sessionPayload?.includes("review_test"));

    localStore.set(
      CONSENT_KEY,
      JSON.stringify({ level: "all", updatedAt: new Date().toISOString() }),
    );

    captureFirstTouch();

    assert.equal(localStore.get(ATTRIBUTION_KEY), sessionPayload);
  });
});