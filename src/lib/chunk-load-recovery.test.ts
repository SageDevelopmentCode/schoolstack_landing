import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import {
  CHUNK_RELOAD_STORAGE_KEY,
  CHUNK_RELOAD_WINDOW_MS,
  hasUnsavedFieldValues,
  isChunkLoadError,
  reloadForChunkError,
  reloadOnceForChunkError,
  shouldReloadForChunkError,
} from "@/lib/chunk-load-recovery";

function namedError(name: string, message: string): Error {
  const error = new Error(message);
  error.name = name;
  return error;
}

describe("isChunkLoadError", () => {
  it("matches the Turbopack ChunkLoadError from production", () => {
    const error = namedError(
      "ChunkLoadError",
      "Failed to load chunk /_next/static/chunks/08~vfzz5.9ysp.js from module 964893",
    );
    assert.equal(isChunkLoadError(error), true);
    assert.equal(isChunkLoadError(new Error(error.message)), true);
  });

  it("matches webpack JS and CSS chunk failures", () => {
    assert.equal(isChunkLoadError(new Error("Loading chunk 123 failed.\n(error: https://x/1.js)")), true);
    assert.equal(isChunkLoadError(new Error("Loading CSS chunk 45 failed.")), true);
  });

  it("matches dynamic import failures in Firefox, Safari and Chrome", () => {
    assert.equal(isChunkLoadError(new TypeError("error loading dynamically imported module")), true);
    assert.equal(isChunkLoadError(new TypeError("Importing a module script failed.")), true);
    assert.equal(
      isChunkLoadError(new TypeError("Failed to fetch dynamically imported module: https://x/a.js")),
      true,
    );
  });

  it("accepts a plain message string", () => {
    assert.equal(isChunkLoadError("Failed to load chunk /_next/static/chunks/a.js"), true);
  });

  it("ignores unrelated errors", () => {
    assert.equal(isChunkLoadError(new TypeError("Cannot read properties of undefined (reading 'map')")), false);
    assert.equal(isChunkLoadError(new Error("Failed to fetch")), false);
    assert.equal(isChunkLoadError(null), false);
    assert.equal(isChunkLoadError({ message: "Failed to load chunk x" }), false);
  });
});

describe("shouldReloadForChunkError", () => {
  const now = 1_000_000;

  it("reloads when there was no earlier reload", () => {
    assert.equal(shouldReloadForChunkError(null, now), true);
    assert.equal(shouldReloadForChunkError("garbage", now), true);
  });

  it("does not reload again inside the window", () => {
    assert.equal(shouldReloadForChunkError(String(now - 1_000), now), false);
    assert.equal(shouldReloadForChunkError(String(now - CHUNK_RELOAD_WINDOW_MS), now), false);
  });

  it("reloads again once the window has passed", () => {
    assert.equal(shouldReloadForChunkError(String(now - CHUNK_RELOAD_WINDOW_MS - 1), now), true);
  });
});

describe("reloadForChunkError / reloadOnceForChunkError", () => {
  const globals = globalThis as { window?: unknown };
  const originalWindow = globals.window;

  afterEach(() => {
    if (originalWindow === undefined) delete globals.window;
    else globals.window = originalWindow;
  });

  /** Stubs `window` with an in-memory sessionStorage and a reload spy. */
  function stubWindow(options: { setItemThrows?: boolean; stored?: string } = {}) {
    const store = new Map<string, string>();
    if (options.stored !== undefined) store.set(CHUNK_RELOAD_STORAGE_KEY, options.stored);
    let reloads = 0;
    globals.window = {
      sessionStorage: {
        getItem: (key: string) => store.get(key) ?? null,
        setItem: (key: string, value: string) => {
          if (options.setItemThrows) throw new DOMException("Quota exceeded", "QuotaExceededError");
          store.set(key, value);
        },
      },
      location: { reload: () => void reloads++ },
    };
    return { store, reloads: () => reloads };
  }

  it("reloads and records the time when storage works", () => {
    const stub = stubWindow();
    assert.equal(reloadForChunkError(), true);
    assert.equal(stub.reloads(), 1);
    assert.ok(stub.store.has(CHUNK_RELOAD_STORAGE_KEY));
  });

  it("reports that no reload started when storage cannot be written", () => {
    const stub = stubWindow({ setItemThrows: true });
    assert.equal(reloadForChunkError(), false);
    assert.equal(reloadOnceForChunkError(), false);
    assert.equal(stub.reloads(), 0);
  });

  it("does not reload twice inside the window", () => {
    const stub = stubWindow({ stored: String(Date.now()) });
    assert.equal(reloadOnceForChunkError(), false);
    assert.equal(stub.reloads(), 0);
  });

  it("reloads once when there was no earlier reload", () => {
    const stub = stubWindow();
    assert.equal(reloadOnceForChunkError(), true);
    assert.equal(stub.reloads(), 1);
  });
});

describe("hasUnsavedFieldValues", () => {
  it("is false when nothing was edited", () => {
    assert.equal(hasUnsavedFieldValues([]), false);
  });

  it("is true for an edited field still on the page with text in it", () => {
    assert.equal(hasUnsavedFieldValues([{ isConnected: true, type: "email", value: "a@b.co" }]), true);
    assert.equal(hasUnsavedFieldValues([{ isConnected: true, value: "Our school" }]), true);
  });

  it("is false for fields cleared back to blank", () => {
    assert.equal(hasUnsavedFieldValues([{ isConnected: true, type: "text", value: "   " }]), false);
  });

  it("ignores fields no longer on the page (submitted or navigated away)", () => {
    assert.equal(hasUnsavedFieldValues([{ isConnected: false, type: "text", value: "Ada" }]), false);
  });

  it("counts a touched checkbox or radio", () => {
    assert.equal(hasUnsavedFieldValues([{ isConnected: true, type: "checkbox", value: "on", checked: false }]), true);
    assert.equal(hasUnsavedFieldValues([{ isConnected: true, type: "radio", value: "" }]), true);
  });

  it("ignores hidden inputs", () => {
    assert.equal(hasUnsavedFieldValues([{ isConnected: true, type: "hidden", value: "token" }]), false);
  });
});
