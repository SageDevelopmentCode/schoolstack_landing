import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { serializeJsonLd } from "./seo";

describe("serializeJsonLd", () => {
  it("escapes < so script tags cannot break out of ld+json", () => {
    const payload = { headline: "</script><script>alert(1)</script>" };
    const serialized = serializeJsonLd(payload);

    assert.equal(serialized.includes("<"), false);
    assert.ok(serialized.includes("\\u003c/script>"));
  });
});
