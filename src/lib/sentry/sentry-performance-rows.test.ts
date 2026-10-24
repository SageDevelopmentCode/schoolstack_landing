import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  mapSentryPerformanceDiscoverRow,
  performanceDiscoverPageSize,
  sentryPerformanceRowKey,
} from "@/lib/sentry/sentry-performance-rows";

describe("mapSentryPerformanceDiscoverRow", () => {
  it("maps environment from discover rows", () => {
    const row = mapSentryPerformanceDiscoverRow({
      transaction: "GET /api/parent-portal/home",
      environment: "development",
      "p75(span.duration)": 1200,
      "count(span.duration)": 5,
      "failure_rate()": 0,
    });
    assert.equal(row.environment, "development");
    assert.equal(row.transaction, "GET /api/parent-portal/home");
    assert.equal(row.p75DurationMs, 1200);
  });

  it("uses null when environment is missing", () => {
    const row = mapSentryPerformanceDiscoverRow({
      transaction: "GET /",
      "p75(span.duration)": null,
      "count(span.duration)": 1,
    });
    assert.equal(row.environment, null);
  });
});

describe("sentryPerformanceRowKey", () => {
  it("combines transaction and environment", () => {
    const key = sentryPerformanceRowKey({
      transaction: "GET /api/foo",
      environment: "production",
      p75DurationMs: 1,
      count: 1,
      failureRate: 0,
    });
    assert.match(key, /GET \/api\/foo/);
    assert.match(key, /production/);
  });
});

describe("performanceDiscoverPageSize", () => {
  it("returns larger page size when all environments", () => {
    assert.equal(performanceDiscoverPageSize("all"), 50);
    assert.equal(performanceDiscoverPageSize("production"), 25);
  });
});
