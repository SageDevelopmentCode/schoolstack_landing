import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isBenignPortalErrorCode } from "@/lib/portal-operational-errors";
import {
  parseOperationalError,
  shouldReportApplyClientError,
  shouldReportPortalClientError,
} from "./operational-errors-client";

describe("shouldReportPortalClientError", () => {
  it("skips expected 4xx response statuses", () => {
    assert.equal(shouldReportPortalClientError(new Error("nope"), 404), false);
    assert.equal(shouldReportPortalClientError(new Error("nope"), 403), false);
  });

  it("reports unexpected 5xx response statuses", () => {
    assert.equal(shouldReportPortalClientError(new Error("boom"), 500), true);
  });

  it("skips abort errors", () => {
    const abortError = new DOMException("Aborted", "AbortError");
    assert.equal(shouldReportPortalClientError(abortError), false);
  });

  it("reports real Error instances", () => {
    assert.equal(shouldReportPortalClientError(new Error("failed")), true);
  });
});

describe("shouldReportApplyClientError", () => {
  it("delegates to portal client gating", () => {
    assert.equal(shouldReportApplyClientError(new Error("x"), 422), false);
    assert.equal(shouldReportApplyClientError(new Error("x"), 502), true);
  });
});

describe("parseOperationalError", () => {
  it("normalizes Error messages", () => {
    assert.equal(parseOperationalError(new Error("hello")).message, "hello");
  });
});

describe("isBenignPortalErrorCode", () => {
  it("filters checklist benign codes", () => {
    assert.equal(isBenignPortalErrorCode("already_completed"), true);
    assert.equal(isBenignPortalErrorCode("already_paid"), true);
    assert.equal(isBenignPortalErrorCode("internal_error"), false);
  });
});
