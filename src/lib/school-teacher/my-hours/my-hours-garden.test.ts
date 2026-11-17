import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  draftSummary,
  formatClockValue,
  minutesFromTime,
  sessionMinutes,
  validateAdjustmentSessions,
} from "./adjust-validation";
import { adjustmentSessionsOverlap } from "./my-hours-adjustment-rules";
import { buildMonthGrid } from "./month-grid";
import {
  compactHours,
  dayBarFraction,
  myHoursStatusLine,
  sessionCountLabel,
  todayClockLine,
  weekToGoLabel,
} from "./my-hours-status";

const s = (key: string, clockIn: string, clockOut: string) => ({ key, clockIn, clockOut });

describe("validateAdjustmentSessions", () => {
  it("accepts a single valid session and totals it", () => {
    const result = validateAdjustmentSessions([s("a", "08:00", "15:00")]);
    assert.equal(result.valid, true);
    assert.equal(result.errors.a, null);
    assert.equal(result.totalMinutes, 420);
  });

  it("flags a clock-out before or equal to clock-in, and missing times", () => {
    const result = validateAdjustmentSessions([
      s("a", "15:00", "08:00"),
      s("b", "09:00", "09:00"),
      s("c", "", "09:00"),
    ]);
    assert.equal(result.valid, false);
    assert.equal(result.errors.a, "Clock out must be after clock in.");
    assert.equal(result.errors.b, "Clock out must be after clock in.");
    assert.equal(result.errors.c, "Pick both times.");
  });

  it("names the session each overlapping session collides with", () => {
    const result = validateAdjustmentSessions([
      s("a", "08:00", "12:00"),
      s("b", "13:00", "15:00"),
      s("c", "11:00", "13:30"),
    ]);
    assert.equal(result.valid, false);
    assert.equal(result.errors.a, "Overlaps session 3.");
    assert.equal(result.errors.b, "Overlaps session 3.");
    assert.equal(result.errors.c, "Overlaps session 1.");
  });

  it("allows back-to-back sessions and rejects an empty day", () => {
    const result = validateAdjustmentSessions([s("a", "08:00", "12:00"), s("b", "12:00", "15:00")]);
    assert.equal(result.valid, true);
    assert.equal(result.totalMinutes, 420);
    assert.equal(validateAdjustmentSessions([]).valid, false);
  });

  it("matches the old save rule (no invalid session, no overlap)", () => {
    const cases = [
      [s("a", "08:00", "12:00"), s("b", "11:59", "13:00")],
      [s("a", "08:00", "12:00"), s("b", "14:00", "13:00")],
      [s("a", "07:15", "09:45"), s("b", "10:00", "11:00"), s("c", "12:00", "15:30")],
      [s("a", "00:00", "23:59")],
    ];
    for (const sessions of cases) {
      const oldValid =
        !sessions.some((session) => sessionMinutes(session.clockIn, session.clockOut) == null) &&
        !adjustmentSessionsOverlap(sessions);
      assert.equal(validateAdjustmentSessions(sessions).valid, oldValid);
    }
  });
});

describe("time helpers", () => {
  it("parses HH:mm and rejects out-of-range values", () => {
    assert.equal(minutesFromTime("8:05"), 485);
    assert.equal(minutesFromTime("24:00"), null);
    assert.equal(minutesFromTime("nope"), null);
  });

  it("formats clock values and summarises drafts", () => {
    assert.equal(formatClockValue("15:00"), "3:00 PM");
    assert.equal(formatClockValue(""), "—");
    assert.equal(draftSummary([{ clockIn: "08:00", clockOut: "15:00" }]), "8:00 AM – 3:00 PM · 7h");
    assert.equal(
      draftSummary([
        { clockIn: "08:00", clockOut: "12:00" },
        { clockIn: "13:00", clockOut: "15:30" },
      ]),
      "6h 30m · 2 sessions",
    );
  });
});

describe("myHoursStatusLine", () => {
  it("shows the running session and the week against the goal", () => {
    assert.equal(
      myHoursStatusLine({ clockedInLabel: "8:02 AM", week: { loggedMinutes: 750, goalMinutes: 1800 } }),
      "On the clock since 8:02 AM · 12h 30m of 30h this week",
    );
  });

  it("says off the clock and goal met", () => {
    assert.equal(
      myHoursStatusLine({ clockedInLabel: null, week: { loggedMinutes: 1830, goalMinutes: 1800 } }),
      "Off the clock · 30h 30m this week · goal met",
    );
  });

  it("drops the goal when there is none, and the week when it is missing", () => {
    assert.equal(
      myHoursStatusLine({ clockedInLabel: null, week: { loggedMinutes: 90, goalMinutes: 0 } }),
      "Off the clock · 1h 30m this week",
    );
    assert.equal(myHoursStatusLine({ clockedInLabel: null, week: null }), "Off the clock");
  });
});

describe("week and today lines", () => {
  it("counts down to the goal", () => {
    assert.equal(weekToGoLabel({ loggedMinutes: 1530, goalMinutes: 1800 }), "4h 30m to go");
    assert.equal(weekToGoLabel({ loggedMinutes: 1800, goalMinutes: 1800 }), "Goal met");
    assert.equal(weekToGoLabel({ loggedMinutes: 10, goalMinutes: 0 }), null);
  });

  it("adds the live session to today's closed time", () => {
    assert.equal(
      todayClockLine({ closedMinutes: 0, closedSessions: 0, activeCountsToday: false, elapsedSeconds: 0 }),
      "Today: nothing logged yet",
    );
    assert.equal(
      todayClockLine({ closedMinutes: 120, closedSessions: 1, activeCountsToday: true, elapsedSeconds: 3725 }),
      "Today: 3h 2m · 2 sessions",
    );
    assert.equal(sessionCountLabel(1), "1 session");
  });

  it("scales day bars and caps them at full", () => {
    assert.equal(dayBarFraction(240, 480), 0.5);
    assert.equal(dayBarFraction(600, 480), 1);
    assert.equal(dayBarFraction(0, 480), 0);
    assert.equal(dayBarFraction(60, 0), 0);
  });

  it("writes compact totals for tight cells", () => {
    assert.equal(compactHours(0), "0m");
    assert.equal(compactHours(45), "45m");
    assert.equal(compactHours(480), "8h");
    assert.equal(compactHours(486), "8.1h");
  });
});

describe("buildMonthGrid", () => {
  it("pads a Sunday-first grid to whole weeks", () => {
    // November 2026 starts on a Sunday and has 30 days.
    const grid = buildMonthGrid(new Date(2026, 10, 1));
    assert.equal(grid[0]?.getDate(), 1);
    assert.equal(grid.length % 7, 0);
    assert.equal(grid.filter(Boolean).length, 30);
    // May 2026 starts on a Friday.
    const may = buildMonthGrid(new Date(2026, 4, 1));
    assert.equal(may.slice(0, 5).every((cell) => cell == null), true);
    assert.equal(may[5]?.getDate(), 1);
  });
});
