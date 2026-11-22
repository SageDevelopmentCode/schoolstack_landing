import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  CHUNK_RELOAD_WINDOW_MS,
  isChunkLoadError,
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
