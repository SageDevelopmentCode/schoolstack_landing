import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  AdmissionsAvailabilityDateRangeError,
  assertAvailabilityDateWindow,
  DEFAULT_AVAILABILITY_WINDOW_MAX_INCLUSIVE_DAYS,
  parseAdmissionsCalendarDate,
} from "./admissions-availability-date-range";

describe("parseAdmissionsCalendarDate", () => {
  it("accepts valid YYYY-MM-DD dates", () => {
    assert.equal(parseAdmissionsCalendarDate("2026-10-01"), "2026-10-01");
    assert.equal(parseAdmissionsCalendarDate(" 2026-10-01 "), "2026-10-01");
  });

  it("rejects invalid calendar days", () => {
    assert.equal(parseAdmissionsCalendarDate("2026-02-31"), null);
    assert.equal(parseAdmissionsCalendarDate("2026-13-01"), null);
  });

  it("rejects garbage and wrong formats", () => {
    assert.equal(parseAdmissionsCalendarDate("not-a-date"), null);
    assert.equal(parseAdmissionsCalendarDate("2026/10/01"), null);
    assert.equal(parseAdmissionsCalendarDate("2026-10-1"), null);
  });
});

describe("assertAvailabilityDateWindow", () => {
  it("allows a full calendar month", () => {
    assert.doesNotThrow(() =>
      assertAvailabilityDateWindow("2026-10-01", "2026-10-31"),
    );
  });

  it("allows spans up to the default max inclusive days", () => {
    assert.doesNotThrow(() =>
      assertAvailabilityDateWindow(
        "2026-01-01",
        "2026-03-03",
        DEFAULT_AVAILABILITY_WINDOW_MAX_INCLUSIVE_DAYS,
      ),
    );
  });

  it("rejects spans wider than the max inclusive days", () => {
    assert.throws(
      () =>
        assertAvailabilityDateWindow(
          "2026-01-01",
          "2026-03-04",
          DEFAULT_AVAILABILITY_WINDOW_MAX_INCLUSIVE_DAYS,
        ),
      (error: unknown) => {
        assert.ok(error instanceof AdmissionsAvailabilityDateRangeError);
        assert.equal(error.code, "invalid_date_range");
        return true;
      },
    );
  });

  it("rejects start after end", () => {
    assert.throws(
      () => assertAvailabilityDateWindow("2026-10-02", "2026-10-01"),
      (error: unknown) => {
        assert.ok(error instanceof AdmissionsAvailabilityDateRangeError);
        assert.match(String(error.message), /on or before/i);
        return true;
      },
    );
  });

  it("rejects invalid date strings", () => {
    assert.throws(
      () => assertAvailabilityDateWindow("2026-02-31", "2026-10-01"),
      AdmissionsAvailabilityDateRangeError,
    );
    assert.throws(
      () => assertAvailabilityDateWindow("2026-10-01", "bad"),
      AdmissionsAvailabilityDateRangeError,
    );
  });
});
