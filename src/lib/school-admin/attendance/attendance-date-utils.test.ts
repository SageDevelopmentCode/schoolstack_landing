import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  formatAttendanceDateLabel,
  isSameDay,
  parseDateKey,
  shiftDate,
  toDateKey,
} from "./attendance-date-utils";

describe("attendance date utils", () => {
  it("round-trips a date key through parseDateKey", () => {
    const date = new Date(2026, 8, 20);
    const key = toDateKey(date);
    const parsed = parseDateKey(key);

    assert.equal(key, "2026-09-20");
    assert.ok(parsed);
    assert.equal(isSameDay(parsed, date), true);
  });

  it("rejects invalid date keys", () => {
    assert.equal(parseDateKey("2026-13-01"), null);
    assert.equal(parseDateKey("2026-02-30"), null);
    assert.equal(parseDateKey("09-20-2026"), null);
    assert.equal(parseDateKey(""), null);
  });

  it("shifts dates by whole days", () => {
    const date = new Date(2026, 8, 20);
    const previous = shiftDate(date, -1);

    assert.equal(toDateKey(previous), "2026-09-19");
  });

  it("formats attendance date labels", () => {
    const label = formatAttendanceDateLabel(new Date(2026, 8, 20));
    assert.match(label, /Sep/);
    assert.match(label, /20/);
  });
});
