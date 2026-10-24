import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { resolvePerformanceQuery } from "@/lib/sentry/sentry-performance-queries";

describe("resolvePerformanceQuery", () => {
  it("matches /api/ anywhere in transaction names for api_routes", () => {
    const query = resolvePerformanceQuery("api_routes");
    assert.match(query, /\*\/api\/\*/);
    assert.doesNotMatch(query, /transaction:\/api\/\*/);
  });
});
