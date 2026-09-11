import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { PortalRouteError, portalRouteErrorStatus } from "./portal-route-errors";

describe("portalRouteErrorStatus", () => {
  it("returns typed PortalRouteError status", () => {
    const resolved = portalRouteErrorStatus(
      new PortalRouteError("Forbidden", 403, "forbidden"),
      "Fallback",
    );
    assert.equal(resolved.status, 403);
    assert.equal(resolved.code, "forbidden");
    assert.equal(resolved.message, "Forbidden");
  });

  it("maps access errors to 403", () => {
    const resolved = portalRouteErrorStatus(
      new Error("You do not have access to this thread."),
      "Fallback",
    );
    assert.equal(resolved.status, 403);
    assert.equal(resolved.code, "forbidden");
  });

  it("maps not found errors to 400", () => {
    const resolved = portalRouteErrorStatus(
      new Error("Committee not found"),
      "Fallback",
    );
    assert.equal(resolved.status, 400);
    assert.equal(resolved.code, "invalid_request");
  });

  it("defaults unknown errors to 500", () => {
    const resolved = portalRouteErrorStatus(
      new Error("Database connection lost"),
      "Fallback",
    );
    assert.equal(resolved.status, 500);
    assert.equal(resolved.code, "internal_error");
  });
});
