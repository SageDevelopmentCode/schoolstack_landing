import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { calendarEventWindowForMonth } from "./calendar-window";

describe("calendarEventWindowForMonth", () => {
  it("returns visible month plus one month on each side", () => {
    assert.deepEqual(calendarEventWindowForMonth(2026, 7), {
      startDate: "2026-07-01",
      endDate: "2026-09-30",
    });
  });
});
