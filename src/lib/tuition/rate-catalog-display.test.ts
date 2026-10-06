import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildRateCatalogDetailLabel,
  formatRateCatalogPeriodLabel,
} from "./rate-catalog-display";

describe("formatRateCatalogPeriodLabel", () => {
  it("formats a school-year range", () => {
    const label = formatRateCatalogPeriodLabel("2026-08-01", "2027-06-01");
    assert.match(label ?? "", /2026/);
    assert.match(label ?? "", /2027/);
  });

  it("returns null when no dates", () => {
    assert.equal(formatRateCatalogPeriodLabel(null, null), null);
  });
});

describe("buildRateCatalogDetailLabel", () => {
  it("formats a single annual tier", () => {
    assert.equal(
      buildRateCatalogDetailLabel([{ amountCents: 720000 }], "annual"),
      "$7,200/yr",
    );
  });
});
