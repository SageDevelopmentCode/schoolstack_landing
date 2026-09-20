import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  AuthorizedPickupValidationError,
  validateAuthorizedPickupContactInput,
} from "./mutations";

describe("authorized pickup mutations", () => {
  it("accepts valid contact input", () => {
    const result = validateAuthorizedPickupContactInput({
      firstName: "Maria",
      lastName: "Lopez",
      relationship: "Grandmother",
      phone: "555-0100",
      notes: "Picks up on Fridays",
    });

    assert.equal(result.firstName, "Maria");
    assert.equal(result.lastName, "Lopez");
    assert.equal(result.relationship, "Grandmother");
    assert.equal(result.phone, "555-0100");
    assert.equal(result.notes, "Picks up on Fridays");
  });

  it("rejects missing names", () => {
    assert.throws(
      () =>
        validateAuthorizedPickupContactInput({
          firstName: "",
          lastName: "Lopez",
        }),
      (error: unknown) =>
        error instanceof AuthorizedPickupValidationError &&
        error.code === "missing_first_name",
    );
  });
});
