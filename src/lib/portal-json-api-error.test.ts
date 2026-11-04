import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  PortalJsonApiError,
  portalJsonApiErrorCode,
  portalJsonApiErrorStatus,
  throwPortalJsonApiError,
} from "./portal-json-api-error";

describe("portalJsonApiError", () => {
  it("throws with status and code from payload", () => {
    assert.throws(
      () =>
        throwPortalJsonApiError(
          { error: "You are already clocked in.", code: "already_clocked_in" },
          409,
          "Failed.",
        ),
      PortalJsonApiError,
    );

    try {
      throwPortalJsonApiError(
        { error: "You are already clocked in.", code: "already_clocked_in" },
        409,
        "Failed.",
      );
    } catch (err) {
      assert.equal(portalJsonApiErrorStatus(err), 409);
      assert.equal(portalJsonApiErrorCode(err), "already_clocked_in");
      assert.equal((err as Error).message, "You are already clocked in.");
    }
  });

  it("uses fallback when payload has no error string", () => {
    try {
      throwPortalJsonApiError(null, 500, "Failed to clock in.");
    } catch (err) {
      assert.ok(err instanceof PortalJsonApiError);
      assert.equal(err.message, "Failed to clock in.");
      assert.equal(err.status, 500);
    }
  });
});
