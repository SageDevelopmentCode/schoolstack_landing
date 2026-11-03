import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildSidebarSummary,
  entryDurationMinutes,
  MY_HOURS_WEEK_GOAL_MINUTES,
} from "./my-hours-summaries";
import type { StaffWorkTimeEntryRow } from "./my-hours-db-types";

function row(partial: Partial<StaffWorkTimeEntryRow> & Pick<StaffWorkTimeEntryRow, "work_date" | "clock_in_at">): StaffWorkTimeEntryRow {
  return {
    id: partial.id ?? "entry-1",
    organization_id: partial.organization_id ?? "org-1",
    staff_member_id: partial.staff_member_id ?? "staff-1",
    work_date: partial.work_date,
    clock_in_at: partial.clock_in_at,
    clock_out_at: partial.clock_out_at ?? null,
    recorded_by_user_id: partial.recorded_by_user_id ?? "user-1",
  };
}

describe("my-hours-summaries", () => {
  it("uses a fixed 40h weekly goal", () => {
    assert.equal(MY_HOURS_WEEK_GOAL_MINUTES, 40 * 60);
  });

  it("computes open session duration to now", () => {
    const now = new Date("2026-11-03T17:00:00.000Z");
    const entry = row({
      clock_in_at: "2026-11-03T16:30:00.000Z",
      work_date: "2026-11-03",
    });
    assert.equal(entryDurationMinutes(entry, now), 30);
  });

  it("aggregates weekday minutes for the current week", () => {
    const referenceDate = new Date(2026, 10, 3);
    const monday = "2026-11-03";
    const tuesday = "2026-11-04";
    const rows = [
      row({
        id: "a",
        work_date: monday,
        clock_in_at: "2026-11-03T14:00:00.000Z",
        clock_out_at: "2026-11-03T15:00:00.000Z",
      }),
      row({
        id: "b",
        work_date: tuesday,
        clock_in_at: "2026-11-04T14:00:00.000Z",
        clock_out_at: "2026-11-04T16:00:00.000Z",
      }),
    ];

    const sidebar = buildSidebarSummary(rows, referenceDate, "America/Denver");
    assert.equal(sidebar.week.goalMinutes, 40 * 60);
    assert.equal(sidebar.week.loggedMinutes, 180);
    assert.equal(sidebar.week.loggedWeekdays, 2);
    assert.equal(sidebar.week.totalWeekdays, 5);
  });
});
