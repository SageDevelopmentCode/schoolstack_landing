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

  it("maps form classroom scope errors to 403", () => {
    const teacherScope = portalRouteErrorStatus(
      new Error("You can only assign forms to your classrooms."),
      "Fallback",
    );
    assert.equal(teacherScope.status, 403);
    assert.equal(teacherScope.code, "forbidden");

    const adminScope = portalRouteErrorStatus(
      new Error("One or more selected classrooms are invalid."),
      "Fallback",
    );
    assert.equal(adminScope.status, 403);
    assert.equal(adminScope.code, "forbidden");
  });

  it("maps form family scope errors to 403", () => {
    const teacherScope = portalRouteErrorStatus(
      new Error("You can only assign forms to families in your classrooms."),
      "Fallback",
    );
    assert.equal(teacherScope.status, 403);
    assert.equal(teacherScope.code, "forbidden");

    const adminScope = portalRouteErrorStatus(
      new Error("One or more selected families are invalid."),
      "Fallback",
    );
    assert.equal(adminScope.status, 403);
    assert.equal(adminScope.code, "forbidden");
  });

  it("maps form validation errors to 400", () => {
    for (const message of [
      "Title is required.",
      "Select at least one classroom.",
      "Select at least one family.",
      "Choose who should receive this form before sending.",
      "Built forms must include a signature field.",
      "Upload a document before saving.",
      "Type your full legal name to sign.",
      '"Emergency contact" is required.',
    ]) {
      const resolved = portalRouteErrorStatus(new Error(message), "Fallback");
      assert.equal(resolved.status, 400, message);
      assert.equal(resolved.code, "invalid_request", message);
    }
  });

  it("maps already signed form to 400 before generic already conflict", () => {
    const resolved = portalRouteErrorStatus(
      new Error("This form has already been signed."),
      "Fallback",
    );
    assert.equal(resolved.status, 400);
    assert.equal(resolved.code, "invalid_request");
  });
});
