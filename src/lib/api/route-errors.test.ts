import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { shouldNotifyOperationalError } from "./route-errors";

describe("shouldNotifyOperationalError", () => {
  it("notifies for 5xx by default", () => {
    assert.equal(shouldNotifyOperationalError(500), true);
    assert.equal(shouldNotifyOperationalError(503), true);
  });

  it("does not notify for 4xx by default", () => {
    assert.equal(shouldNotifyOperationalError(400), false);
    assert.equal(shouldNotifyOperationalError(403), false);
    assert.equal(shouldNotifyOperationalError(404), false);
  });

  it("honors explicit notify override on 4xx", () => {
    assert.equal(shouldNotifyOperationalError(400, true), true);
    assert.equal(shouldNotifyOperationalError(500, false), false);
  });
});
