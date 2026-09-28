import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  dateKeyInTimezone,
  isMondayMorningWindow,
  tomorrowKey,
  weekRangeForWeeklyDigest,
} from "./scheduled-visit-reminders";
import { addCalendarDays } from "./admissions-observation-availability";

describe("scheduled visit reminder date helpers", () => {
  it("computes tomorrow in org timezone", () => {
    const now = new Date("2026-09-28T15:00:00.000Z");
    assert.equal(tomorrowKey("America/Chicago", now), "2026-09-29");
  });

  it("detects Monday morning window in org timezone", () => {
    const mondayMorning = new Date("2026-09-28T12:00:00.000Z");
    assert.equal(isMondayMorningWindow("America/Chicago", mondayMorning), true);

    const mondayAfternoon = new Date("2026-09-28T20:00:00.000Z");
    assert.equal(isMondayMorningWindow("America/Chicago", mondayAfternoon), false);

    const tuesdayMorning = new Date("2026-09-29T12:00:00.000Z");
    assert.equal(isMondayMorningWindow("America/Chicago", tuesdayMorning), false);
  });

  it("builds weekly digest range as tomorrow through six days out", () => {
    const now = new Date("2026-09-28T15:00:00.000Z");
    const range = weekRangeForWeeklyDigest("America/Chicago", now);
    assert.equal(range.start, "2026-09-29");
    assert.equal(range.end, addCalendarDays("2026-09-29", 6));
  });

  it("uses org-local calendar date keys", () => {
    const lateUtc = new Date("2026-09-29T04:00:00.000Z");
    assert.equal(dateKeyInTimezone("America/Chicago", lateUtc), "2026-09-28");
    assert.equal(tomorrowKey("America/Chicago", lateUtc), "2026-09-29");
  });
});
