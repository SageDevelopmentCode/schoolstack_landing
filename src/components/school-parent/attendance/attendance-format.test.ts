import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { AttendanceHistoryEntry } from "@/lib/school-admin/attendance/attendance-types";
import {
  attendanceDayTimeline,
  attendanceMetaLine,
  attendanceRelativeDayLabel,
  attendanceStaffRecorder,
  buildAttendanceRecentWeeks,
  countAttendanceByStatus,
  filterAttendanceEntries,
  groupAttendanceEntriesByMonth,
} from "./attendance-format";

function entry(
  date: string,
  status: AttendanceHistoryEntry["status"],
  overrides: Partial<AttendanceHistoryEntry> = {},
): AttendanceHistoryEntry {
  return {
    date,
    status,
    presentAt: null,
    absentAt: null,
    pickedUpAt: null,
    pickedUpByName: null,
    recordedByUserId: null,
    recordedByName: null,
    recordedByPhotoUrl: null,
    ...overrides,
  };
}

describe("attendance-format", () => {
  it("counts and filters by status", () => {
    const entries = [
      entry("2026-11-13", "picked_up"),
      entry("2026-11-12", "present"),
      entry("2026-11-11", "absent"),
      entry("2026-11-10", "present"),
    ];
    assert.deepEqual(countAttendanceByStatus(entries), { present: 2, absent: 1, picked_up: 1 });
    assert.equal(filterAttendanceEntries(entries, "all").length, 4);
    assert.deepEqual(
      filterAttendanceEntries(entries, "present").map((e) => e.date),
      ["2026-11-12", "2026-11-10"],
    );
  });

  it("groups consecutive entries by month in order", () => {
    const groups = groupAttendanceEntriesByMonth([
      entry("2026-11-03", "present"),
      entry("2026-11-02", "present"),
      entry("2026-10-31", "absent"),
    ]);
    assert.deepEqual(
      groups.map((g) => [g.key, g.label, g.entries.length]),
      [
        ["2026-11", "November 2026", 2],
        ["2026-10", "October 2026", 1],
      ],
    );
  });

  it("builds a Mon–Fri grid ending with the latest record's week", () => {
    const weeks = buildAttendanceRecentWeeks(
      [entry("2026-11-13", "present"), entry("2026-11-03", "absent")],
      2,
    );
    assert.ok(weeks);
    assert.deepEqual(weeks.weekdays, ["Mon", "Tue", "Wed", "Thu", "Fri"]);
    assert.equal(weeks.rows.length, 2);
    assert.equal(weeks.rows[0].weekStartKey, "2026-11-02");
    assert.equal(weeks.rows[1].days[4].dateKey, "2026-11-13");
    assert.equal(weeks.rows[1].days[4].entry?.status, "present");
    assert.equal(weeks.rows[0].days[1].entry?.status, "absent");
    assert.equal(weeks.recordedDays, 2);
    assert.equal(weeks.rangeLabel, "Nov 2 – Nov 13");
  });

  it("adds weekend columns only when a weekend day has a record", () => {
    const weeks = buildAttendanceRecentWeeks([entry("2026-11-14", "present")], 1);
    assert.ok(weeks);
    assert.equal(weeks.weekdays.length, 7);
    assert.equal(weeks.rows[0].days[5].entry?.date, "2026-11-14");
    assert.equal(buildAttendanceRecentWeeks([], 4), null);
  });

  it("describes the day as ordered steps", () => {
    const pickup = entry("2026-11-13", "picked_up", {
      presentAt: "2026-11-13T08:02:00",
      pickedUpAt: "2026-11-13T15:15:00",
      pickedUpByName: "Dana Lee",
    });
    assert.deepEqual(
      attendanceDayTimeline(pickup).map((s) => [s.key, s.time, s.detail]),
      [
        ["checked_in", "8:02 AM", null],
        ["picked_up", "3:15 PM", "by Dana Lee"],
      ],
    );
    assert.deepEqual(
      attendanceDayTimeline(entry("2026-11-12", "absent")).map((s) => s.key),
      ["absent"],
    );
    assert.deepEqual(
      attendanceDayTimeline(entry("2026-11-11", "picked_up")).map((s) => s.key),
      ["picked_up"],
    );
  });

  it("formats meta lines, recorders and relative day labels", () => {
    const present = entry("2026-11-12", "present", {
      presentAt: "2026-11-12T08:30:00",
      recordedByName: "Ms. Rivera",
    });
    assert.equal(attendanceMetaLine(present), "8:30 AM · Present");
    assert.equal(attendanceMetaLine(entry("2026-11-12", "absent")), "Absent");
    assert.equal(attendanceStaffRecorder(present)?.name, "Ms. Rivera");
    assert.equal(attendanceStaffRecorder(entry("2026-11-12", "absent"))?.name, "School staff");
    assert.equal(
      attendanceStaffRecorder(entry("2026-11-12", "picked_up", { pickedUpByName: "Dana" })),
      null,
    );
    const now = new Date(2026, 10, 14, 10);
    assert.equal(attendanceRelativeDayLabel("2026-11-14", now), "Today");
    assert.equal(attendanceRelativeDayLabel("2026-11-13", now), "Yesterday");
    assert.equal(attendanceRelativeDayLabel("2026-11-10", now), "Tue, Nov 10");
  });
});
