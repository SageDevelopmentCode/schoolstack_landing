import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildFlyerCacheKey,
  clearFlyerSessionCacheForTests,
  getCachedFlyer,
  isCachedFlyerObjectUrl,
  setCachedFlyer,
} from "./flyer-session-cache";

describe("flyer session cache", () => {
  it("builds stable cache keys", () => {
    assert.equal(
      buildFlyerCacheKey("org-1", "class-1"),
      "org-1:class-1:",
    );
    assert.equal(
      buildFlyerCacheKey("org-1", "class-1", "family-1"),
      "org-1:class-1:family-1",
    );
  });

  it("stores and retrieves flyer entries", () => {
    clearFlyerSessionCacheForTests();

    const cacheKey = buildFlyerCacheKey("org-1", "class-1");
    const objectUrl = "blob:http://localhost/test-flyer";

    assert.equal(getCachedFlyer(cacheKey), undefined);

    const entry = setCachedFlyer(cacheKey, objectUrl);
    assert.equal(entry.objectUrl, objectUrl);
    assert.match(entry.viewerUrl, /test-flyer/);

    const cached = getCachedFlyer(cacheKey);
    assert.equal(cached?.objectUrl, objectUrl);
    assert.equal(isCachedFlyerObjectUrl(objectUrl), true);
    assert.equal(isCachedFlyerObjectUrl("blob:http://localhost/other"), false);
  });
});
