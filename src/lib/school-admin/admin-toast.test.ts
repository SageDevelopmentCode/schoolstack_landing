import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { formatActionError, sessionExpiredUserMessage } from "@/lib/school-admin/admin-toast";

const SESSION_MESSAGE = "Your session expired. Refresh the page and sign in again.";

describe("sessionExpiredUserMessage", () => {
  it("maps JWT expired and PGRST303 to a session sentence", () => {
    assert.equal(sessionExpiredUserMessage(new Error("JWT expired")), SESSION_MESSAGE);
    assert.equal(sessionExpiredUserMessage(new Error("Invalid JWT")), SESSION_MESSAGE);
    assert.equal(
      sessionExpiredUserMessage({ message: "permission denied", code: "PGRST303" }),
      SESSION_MESSAGE,
    );
    assert.equal(formatActionError(new Error("JWT expired"), "Failed to save form."), SESSION_MESSAGE);
  });

  it("leaves other errors unchanged", () => {
    assert.equal(sessionExpiredUserMessage(new Error("A public URL slug is required.")), null);
    assert.equal(
      formatActionError(new Error("A public URL slug is required."), "Failed to save form."),
      "A public URL slug is required.",
    );
    assert.equal(formatActionError({ message: "row missing" }, "Failed to save form."), "Failed to save form.");
  });
});
