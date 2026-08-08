import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { formatInstallmentRange } from "./format-installment-range";

describe("formatInstallmentRange", () => {
  it("shows a single amount when cents differ but round to the same dollar", () => {
    assert.equal(formatInstallmentRange([24444, 24445, 24444, 24445]), "$244");
  });

  it("shows a range when installments differ at the dollar level", () => {
    assert.equal(formatInstallmentRange([24300, 24400]), "$243–$244");
  });

  it("returns zero for an empty list", () => {
    assert.equal(formatInstallmentRange([]), "$0");
  });
});
