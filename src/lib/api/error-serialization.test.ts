import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { describe, it } from "node:test";
import { stackFromCause } from "@/lib/api/error-serialization";

describe("stackFromCause", () => {
  it("serializes Postgrest-style error objects", () => {
    const serialized = stackFromCause({
      code: "23505",
      message: "duplicate key value violates unique constraint",
      details: "Key (billing_account_id, guardian_id)=(...) already exists.",
    });

    assert.match(serialized ?? "", /duplicate key value violates unique constraint/);
    assert.match(serialized ?? "", /23505/);
  });

  it("returns Error stacks when available", () => {
    const error = new Error("boom");
    error.stack = "Error: boom\n    at test";
    assert.equal(stackFromCause(error), error.stack);
  });
});
