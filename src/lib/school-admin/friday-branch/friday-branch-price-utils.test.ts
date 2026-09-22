import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  formatFridayBranchPriceInput,
  parseFridayBranchPriceInput,
  validateFridayBranchPriceCents,
} from "./friday-branch-price-utils";

describe("friday-branch-price-utils", () => {
  it("parses dollar input into cents", () => {
    assert.equal(parseFridayBranchPriceInput("12.50"), 1250);
    assert.equal(parseFridayBranchPriceInput("$8"), 800);
    assert.equal(parseFridayBranchPriceInput(" 55"), 5500);
    assert.equal(parseFridayBranchPriceInput("$ 55"), 5500);
    assert.equal(parseFridayBranchPriceInput("0.99"), 99);
    assert.equal(parseFridayBranchPriceInput(""), null);
    assert.equal(parseFridayBranchPriceInput("abc"), null);
    assert.equal(parseFridayBranchPriceInput("-1"), null);
  });

  it("formats cents for admin input", () => {
    assert.equal(formatFridayBranchPriceInput(1250), "12.50");
    assert.equal(formatFridayBranchPriceInput(null), "");
  });

  it("validates stored price cents", () => {
    assert.equal(validateFridayBranchPriceCents(0), null);
    assert.equal(validateFridayBranchPriceCents(null), null);
    assert.match(validateFridayBranchPriceCents(-1) ?? "", /zero or greater/i);
  });
});
