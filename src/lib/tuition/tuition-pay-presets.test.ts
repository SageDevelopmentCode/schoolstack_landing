import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { taxCreditPresetAmountCents } from "./tuition-pay-presets";

describe("taxCreditPresetAmountCents", () => {
  it("adds tax credit up to remaining year balance", () => {
    assert.equal(
      taxCreditPresetAmountCents({
        currentChargeRemainingCents: 72000,
        payRemainingYearCents: 720000,
      }),
      572000,
    );
  });

  it("caps at pay remaining year total", () => {
    assert.equal(
      taxCreditPresetAmountCents({
        currentChargeRemainingCents: 72000,
        payRemainingYearCents: 400000,
      }),
      400000,
    );
  });
});
