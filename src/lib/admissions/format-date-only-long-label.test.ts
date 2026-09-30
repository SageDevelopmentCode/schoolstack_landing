import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  formatDateOnlyLongLabel,
  formatDateOnlyWithWeekdayLabel,
} from "./admissions-availability";

describe("formatDateOnlyLongLabel", () => {
  it("formats YYYY-MM-DD as month day, year", () => {
    assert.equal(formatDateOnlyLongLabel("2026-10-01"), "October 1, 2026");
    assert.equal(formatDateOnlyLongLabel("2026-08-01"), "August 1, 2026");
  });

  it("returns non-ISO strings unchanged", () => {
    assert.equal(
      formatDateOnlyLongLabel("August 1, 2026"),
      "August 1, 2026",
    );
  });
});

describe("formatDateOnlyWithWeekdayLabel", () => {
  it("includes weekday and long date for ISO input", () => {
    assert.equal(
      formatDateOnlyWithWeekdayLabel("2026-10-01"),
      "Thursday, October 1, 2026",
    );
  });
});
