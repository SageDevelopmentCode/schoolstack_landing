import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  failureRateClassName,
  p75DurationClassName,
  transactionCountClassName,
} from "@/lib/sentry/performance-metric-styles";

describe("p75DurationClassName", () => {
  it("classifies strict API thresholds", () => {
    assert.match(p75DurationClassName(499), /success/);
    assert.match(p75DurationClassName(500), /success/);
    assert.match(p75DurationClassName(501), /warning/);
    assert.match(p75DurationClassName(2000), /warning/);
    assert.match(p75DurationClassName(2001), /error/);
    assert.match(p75DurationClassName(null), /muted/);
  });
});

describe("failureRateClassName", () => {
  it("classifies failure rates", () => {
    assert.match(failureRateClassName(0), /success/);
    assert.match(failureRateClassName(0.005), /warning/);
    assert.match(failureRateClassName(0.01), /error/);
    assert.match(failureRateClassName(null), /muted/);
  });
});

describe("transactionCountClassName", () => {
  it("emphasizes high-traffic slow routes", () => {
    assert.match(transactionCountClassName(9, 3000), /muted/);
    assert.match(transactionCountClassName(10, 3000), /font-medium/);
    assert.match(transactionCountClassName(100, 100), /muted/);
  });
});
