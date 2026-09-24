import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { signedInErrorMessage } from "./bearer-token";

describe("signedInErrorMessage", () => {
  it("reports missing_token when no access token was found", () => {
    assert.equal(
      signedInErrorMessage(null, { message: "Auth session missing" }),
      "You must be signed in to continue. (missing_token)",
    );
  });

  it("reports rejected_token with the auth error code when a token was present", () => {
    assert.equal(
      signedInErrorMessage("mobile-access-token", { code: "invalid_jwt" }),
      "You must be signed in to continue. (rejected_token:invalid_jwt)",
    );
  });
});
