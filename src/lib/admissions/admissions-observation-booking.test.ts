import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  normalizeScheduledDates,
  validateWholeDayScheduledDates,
} from "./admissions-booking";
import { listBookableObservationDates } from "./admissions-observation-availability";

describe("admissions observation multiselect booking", () => {
  it("lists individual bookable observation dates", () => {
    const openDays = new Set(["2026-07-21", "2026-07-22", "2026-07-24"]);
    const occupiedDays = new Set(["2026-07-22"]);

    const bookable = listBookableObservationDates(
      openDays,
      occupiedDays,
      "2026-07-21",
      "2026-07-24",
    );

    assert.deepEqual(bookable, ["2026-07-21", "2026-07-24"]);
  });

  it("normalizes and deduplicates scheduled dates", () => {
    assert.deepEqual(
      normalizeScheduledDates(["2026-07-24", "2026-07-21", "2026-07-24"]),
      ["2026-07-21", "2026-07-24"],
    );
  });

  it("accepts a valid multiselect within max days", () => {
    const result = validateWholeDayScheduledDates(
      ["2026-07-21", "2026-07-24"],
      3,
      new Set(["2026-07-21", "2026-07-22", "2026-07-24"]),
    );

    assert.deepEqual(result, ["2026-07-21", "2026-07-24"]);
  });

  it("rejects when more than max days are selected", () => {
    assert.throws(
      () =>
        validateWholeDayScheduledDates(
          ["2026-07-21", "2026-07-22", "2026-07-24"],
          2,
          new Set(["2026-07-21", "2026-07-22", "2026-07-24"]),
        ),
      /up to 2 school days/i,
    );
  });

  it("rejects when a selected day is not bookable", () => {
    assert.throws(
      () =>
        validateWholeDayScheduledDates(
          ["2026-07-21", "2026-07-22"],
          3,
          new Set(["2026-07-21"]),
        ),
      /no longer available/i,
    );
  });
});
