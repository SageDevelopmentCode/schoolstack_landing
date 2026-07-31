import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  splitAmountCents,
  validateBillingSplits,
} from "./billing-splits";

describe("validateBillingSplits", () => {
  it("requires at least two guardians", () => {
    assert.throws(
      () => validateBillingSplits([{ guardianId: "g1", shareBps: 10000 }]),
      /at least two guardians/i,
    );
  });

  it("requires shares to total 100%", () => {
    assert.throws(
      () =>
        validateBillingSplits([
          { guardianId: "g1", shareBps: 4000 },
          { guardianId: "g2", shareBps: 4000 },
        ]),
      /total 100%/i,
    );
  });
});

describe("splitAmountCents", () => {
  it("splits evenly for 50/50 on $720", () => {
    const result = splitAmountCents(72000, [
      { guardianId: "g1", shareBps: 5000 },
      { guardianId: "g2", shareBps: 5000 },
    ]);
    assert.equal(result[0]?.amountCents, 36000);
    assert.equal(result[1]?.amountCents, 36000);
    assert.equal(
      result.reduce((sum, row) => sum + row.amountCents, 0),
      72000,
    );
  });

  it("assigns remainder to last payer", () => {
    const result = splitAmountCents(100, [
      { guardianId: "g1", shareBps: 3333 },
      { guardianId: "g2", shareBps: 3333 },
      { guardianId: "g3", shareBps: 3334 },
    ]);
    assert.equal(
      result.reduce((sum, row) => sum + row.amountCents, 0),
      100,
    );
  });
});
