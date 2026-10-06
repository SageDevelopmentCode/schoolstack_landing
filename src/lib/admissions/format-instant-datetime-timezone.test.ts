import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { formatInstantDateTimeInTimezone } from "@/lib/admissions/admissions-availability";

describe("formatInstantDateTimeInTimezone", () => {
  it("formats a UTC instant in America/Denver with timezone abbreviation", () => {
    const label = formatInstantDateTimeInTimezone(
      "2026-10-05T19:23:00.000Z",
      "America/Denver",
    );

    assert.match(label, /October 5, 2026/);
    assert.match(label, /1:23/);
    assert.match(label, /MDT|MST/);
  });

  it("returns the input string when the date is invalid", () => {
    assert.equal(formatInstantDateTimeInTimezone("not-a-date", "America/Denver"), "not-a-date");
  });
});
