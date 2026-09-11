import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isChargePayable } from "./charge-payability";
import type { TuitionCharge } from "./types";

function charge(status: TuitionCharge["status"]): Pick<TuitionCharge, "status"> {
  return { status };
}

describe("isChargePayable", () => {
  it("allows scheduled, sent, and overdue charges", () => {
    assert.equal(isChargePayable(charge("scheduled")), true);
    assert.equal(isChargePayable(charge("sent")), true);
    assert.equal(isChargePayable(charge("overdue")), true);
  });

  it("rejects paid, void, and waived charges", () => {
    assert.equal(isChargePayable(charge("paid")), false);
    assert.equal(isChargePayable(charge("void")), false);
    assert.equal(isChargePayable(charge("waived")), false);
  });
});
