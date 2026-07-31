import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildLateFeeKey,
  buildLateFeeTriggerDate,
  listBillingPeriodsForLateFee,
  parseExistingLateFeeKeys,
} from "./late-fees";

describe("listBillingPeriodsForLateFee", () => {
  it("returns only the due month when recurring is disabled", () => {
    const periods = listBillingPeriodsForLateFee(
      "2026-08-01",
      new Date("2026-10-15T12:00:00Z"),
      false,
    );

    assert.deepEqual(periods, [{ year: 2026, month: 8 }]);
  });

  it("returns each month from due month through today when recurring", () => {
    const periods = listBillingPeriodsForLateFee(
      "2026-08-01",
      new Date("2026-10-15T12:00:00Z"),
      true,
    );

    assert.deepEqual(periods, [
      { year: 2026, month: 8 },
      { year: 2026, month: 9 },
      { year: 2026, month: 10 },
    ]);
  });
});

describe("buildLateFeeTriggerDate", () => {
  it("pads month and day", () => {
    assert.equal(buildLateFeeTriggerDate(2026, 8, 10), "2026-08-10");
    assert.equal(buildLateFeeTriggerDate(2026, 12, 5), "2026-12-05");
  });
});

describe("parseExistingLateFeeKeys", () => {
  it("extracts source charge period keys", () => {
    const keys = parseExistingLateFeeKeys([
      {
        metadata: {
          sourceChargeId: "charge-1",
          periodYear: 2026,
          periodMonth: 8,
        },
      },
      { metadata: {} },
    ]);

    assert.deepEqual(keys, new Set([buildLateFeeKey("charge-1", 2026, 8)]));
  });
});
