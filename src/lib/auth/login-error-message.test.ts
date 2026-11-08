import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { normalizeLoginErrorMessage } from "./login-error-message";

describe("normalizeLoginErrorMessage", () => {
  it("maps the Supabase OTP signup error to friendly copy", () => {
    assert.match(
      normalizeLoginErrorMessage(new Error("Signups not allowed for otp")),
      /couldn't find an account/i,
    );
  });

  it("passes other error messages through", () => {
    assert.equal(
      normalizeLoginErrorMessage(new Error("Token has expired")),
      "Token has expired",
    );
  });

  it("uses the fallback for unknown values", () => {
    assert.equal(normalizeLoginErrorMessage(null, "Nope"), "Nope");
  });
});
