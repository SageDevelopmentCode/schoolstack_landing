import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";
import {
  claimRpcPermissionDeniedReport,
  isRpcPermissionDenied,
  reportRpcPermissionDenied,
  resetRpcPermissionDeniedThrottleForTests,
  RPC_PERMISSION_DENIED_THROTTLE_MS,
} from "./rpc-permission-errors";

describe("isRpcPermissionDenied", () => {
  it("matches Postgres permission errors (42501)", () => {
    assert.equal(isRpcPermissionDenied({ code: "42501", message: "forbidden" }), true);
  });

  it("ignores other errors", () => {
    assert.equal(isRpcPermissionDenied({ code: "PGRST202" }), false);
    assert.equal(isRpcPermissionDenied(new Error("boom")), false);
    assert.equal(isRpcPermissionDenied(null), false);
    assert.equal(isRpcPermissionDenied("42501"), false);
  });
});

describe("claimRpcPermissionDeniedReport", () => {
  beforeEach(() => {
    resetRpcPermissionDeniedThrottleForTests();
  });

  it("allows the first report and blocks repeats inside the window", () => {
    assert.equal(claimRpcPermissionDeniedReport("fn:org", 1_000), true);
    assert.equal(claimRpcPermissionDeniedReport("fn:org", 1_000 + 5_000), false);
  });

  it("allows another report after the window", () => {
    assert.equal(claimRpcPermissionDeniedReport("fn:org", 1_000), true);
    assert.equal(
      claimRpcPermissionDeniedReport("fn:org", 1_000 + RPC_PERMISSION_DENIED_THROTTLE_MS),
      true,
    );
  });

  it("throttles per function and organization", () => {
    assert.equal(claimRpcPermissionDeniedReport("a:org1", 1_000), true);
    assert.equal(claimRpcPermissionDeniedReport("b:org1", 1_000), true);
    assert.equal(claimRpcPermissionDeniedReport("a:org2", 1_000), true);
  });
});

describe("reportRpcPermissionDenied", () => {
  beforeEach(() => {
    resetRpcPermissionDeniedThrottleForTests();
  });

  it("does nothing (and does not throw) for non-permission errors", async () => {
    await reportRpcPermissionDenied({
      functionName: "admin_students_page_meta",
      organizationId: "org-1",
      error: { code: "PGRST202", message: "not found" },
      surface: "school_admin",
    });
    // Not throttled, because it never reached the throttle: a later real denial still reports.
    assert.equal(claimRpcPermissionDeniedReport("admin_students_page_meta:org-1"), true);
  });
});
