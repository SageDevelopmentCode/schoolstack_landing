import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildSentryPerformanceExploreUrl } from "@/lib/sentry/admin-api";
import { resolvePerformanceQuery } from "@/lib/sentry/sentry-performance-queries";

const testConfig = {
  orgSlug: "mudkitchen",
  projectSlug: "mudkitchenweb",
  authToken: "test",
  webBaseUrl: "https://mudkitchen.sentry.io",
};

describe("resolvePerformanceQuery", () => {
  it("matches /api/ anywhere in transaction names for api_routes", () => {
    const query = resolvePerformanceQuery("api_routes");
    assert.match(query, /\*\/api\/\*/);
    assert.doesNotMatch(query, /transaction:\/api\/\*/);
  });
});

describe("buildSentryPerformanceExploreUrl", () => {
  it("includes project id and environment in explore link", () => {
    const query = resolvePerformanceQuery("parent_committees");
    const url = buildSentryPerformanceExploreUrl(
      testConfig,
      query,
      "12345",
      "production",
    );
    const parsed = new URL(url);
    assert.equal(parsed.searchParams.get("project"), "12345");
    assert.equal(parsed.searchParams.get("environment"), "production");
    assert.equal(parsed.searchParams.get("dataset"), "spans");
    assert.match(parsed.searchParams.get("query") ?? "", /is_transaction:true/);
  });

  it("omits environment when filter is all", () => {
    const url = buildSentryPerformanceExploreUrl(
      testConfig,
      "is_transaction:true",
      "999",
      "all",
    );
    const parsed = new URL(url);
    assert.equal(parsed.searchParams.get("project"), "999");
    assert.equal(parsed.searchParams.get("environment"), null);
  });
});
