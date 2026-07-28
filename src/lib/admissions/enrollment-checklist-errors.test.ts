import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  isBenignEnrollmentChecklistErrorCode,
  parseApiErrorResponse,
} from "./enrollment-checklist-errors";

describe("isBenignEnrollmentChecklistErrorCode", () => {
  it("treats already_completed and already_paid as benign", () => {
    assert.equal(isBenignEnrollmentChecklistErrorCode("already_completed"), true);
    assert.equal(isBenignEnrollmentChecklistErrorCode("already_paid"), true);
    assert.equal(isBenignEnrollmentChecklistErrorCode("signature_required"), false);
  });
});

describe("parseApiErrorResponse", () => {
  it("extracts error and code from JSON responses", async () => {
    const response = new Response(
      JSON.stringify({
        error: "This agreement has already been completed.",
        code: "already_completed",
      }),
      { status: 400 },
    );

    const parsed = await parseApiErrorResponse(response);
    assert.deepEqual(parsed, {
      message: "This agreement has already been completed.",
      code: "already_completed",
    });
  });

  it("falls back when response body is not JSON", async () => {
    const response = new Response("not json", { status: 500 });
    const parsed = await parseApiErrorResponse(response);
    assert.equal(parsed.message, "Request failed.");
    assert.equal(parsed.code, undefined);
  });
});
