import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { CommitteeEvent } from "./types";
import {
  dateKey,
  formatWeekRangeLabel,
  getMonthCells,
  getWeekDates,
  groupEventsByDate,
  startOfWeek,
} from "./calendar-utils";

describe("calendar-utils", () => {
  it("getMonthCells pads to full weeks", () => {
    const cells = getMonthCells(2026, 3);
    assert.equal(cells.length % 7, 0);
    assert.equal(cells.filter(Boolean).length, 30);
  });

  it("getWeekDates returns seven days starting Sunday", () => {
    const anchor = new Date(2026, 3, 15);
    const week = getWeekDates(anchor);
    assert.equal(week.length, 7);
    assert.equal(week[0]?.getDay(), 0);
    assert.equal(dateKey(week[0]!), dateKey(startOfWeek(anchor)));
  });

  it("groupEventsByDate groups by event date string", () => {
    const events: CommitteeEvent[] = [
      { id: "1", title: "A", date: "2026-04-10", type: "meeting" },
      { id: "2", title: "B", date: "2026-04-10", type: "event" },
      { id: "3", title: "C", date: "2026-04-11", type: "deadline" },
    ];
    const grouped = groupEventsByDate(events);
    assert.equal(grouped.get("2026-04-10")?.length, 2);
    assert.equal(grouped.get("2026-04-11")?.length, 1);
  });

  it("formatWeekRangeLabel shows same-month range", () => {
    const week = getWeekDates(new Date(2026, 3, 15));
    assert.match(formatWeekRangeLabel(week), /Apr 12 – 18, 2026/);
  });
});
