import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getRequestIp } from "@/lib/public-forms/request-ip";

describe("getRequestIp", () => {
  it("uses the first x-forwarded-for address", () => {
    const request = new Request("https://example.com", {
      headers: {
        "x-forwarded-for": "203.0.113.10, 70.41.3.18",
      },
    });

    assert.equal(getRequestIp(request), "203.0.113.10");
  });

  it("falls back to x-real-ip", () => {
    const request = new Request("https://example.com", {
      headers: {
        "x-real-ip": "198.51.100.42",
      },
    });

    assert.equal(getRequestIp(request), "198.51.100.42");
  });

  it("returns null when no ip headers are present", () => {
    const request = new Request("https://example.com");
    assert.equal(getRequestIp(request), null);
  });
});
