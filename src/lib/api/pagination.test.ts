import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parsePagination } from "@/lib/api/pagination";

const opts = { defaultLimit: 50, maxLimit: 200 };

function parse(query: string) {
  return parsePagination(new URLSearchParams(query), opts);
}

describe("parsePagination", () => {
  it("uses defaults when params are missing", () => {
    assert.deepEqual(parse(""), { limit: 50, offset: 0 });
  });

  it("parses valid values", () => {
    assert.deepEqual(parse("limit=25&offset=100"), { limit: 25, offset: 100 });
  });

  it("falls back to defaults for NaN and non-integer input", () => {
    assert.deepEqual(parse("limit=abc&offset=NaN"), { limit: 50, offset: 0 });
    assert.deepEqual(parse("limit=1e3&offset=2.5"), { limit: 50, offset: 0 });
    assert.deepEqual(parse("limit=&offset="), { limit: 50, offset: 0 });
  });

  it("clamps limit to [1, maxLimit]", () => {
    assert.equal(parse("limit=0").limit, 1);
    assert.equal(parse("limit=-5").limit, 1);
    assert.equal(parse("limit=100000").limit, 200);
  });

  it("clamps offset to [0, maxOffset]", () => {
    assert.equal(parse("offset=-10").offset, 0);
    assert.equal(parse("offset=999999999").offset, 100_000);
    assert.equal(
      parsePagination(new URLSearchParams("offset=500"), { ...opts, maxOffset: 200 })
        .offset,
      200,
    );
  });
});
