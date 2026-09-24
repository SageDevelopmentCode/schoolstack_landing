import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  getBearerAccessToken,
  MOBILE_ACCESS_TOKEN_HEADER,
} from "./bearer-token";

describe("getBearerAccessToken", () => {
  it("returns the token when Authorization uses Bearer scheme", () => {
    const request = new Request("https://example.com/api/test", {
      headers: { Authorization: "Bearer access-token-123" },
    });

    assert.equal(getBearerAccessToken(request), "access-token-123");
  });

  it("returns null when Authorization header is missing", () => {
    const request = new Request("https://example.com/api/test");

    assert.equal(getBearerAccessToken(request), null);
  });

  it("returns null for non-Bearer Authorization schemes", () => {
    const request = new Request("https://example.com/api/test", {
      headers: { Authorization: "Basic dXNlcjpwYXNz" },
    });

    assert.equal(getBearerAccessToken(request), null);
  });

  it("returns null for an empty Bearer token", () => {
    const request = new Request("https://example.com/api/test", {
      headers: { Authorization: "Bearer    " },
    });

    assert.equal(getBearerAccessToken(request), null);
  });

  it("returns the token from the mobile access-token header", () => {
    const request = new Request("https://example.com/api/test", {
      headers: { [MOBILE_ACCESS_TOKEN_HEADER]: "mobile-token-456" },
    });

    assert.equal(getBearerAccessToken(request), "mobile-token-456");
  });
});
