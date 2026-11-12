import assert from "node:assert/strict";
import test from "node:test";
import {
  isDateKeyInLoadedRange,
  mergeTeacherMyHoursPageData,
  nextLoadedAdjustWeekToken,
  weekRangeNeedsFetch,
} from "@/lib/school-teacher/my-hours/my-hours-range-merge";
import type { TeacherMyHoursPageData } from "@/lib/school-teacher/my-hours/types";

function emptyPageData(overrides: Partial<TeacherMyHoursPageData> = {}): TeacherMyHoursPageData {
  return {
    timezone: "America/Denver",
    referenceDateKey: "2026-11-12",
    rangeFrom: "2025-11-12",
    rangeTo: "2026-11-12",
    activeSession: null,
    entriesByDateKey: {},
    sessionsByDateKey: {},
    sidebar: {
      week: {
        goalMinutes: 0,
        loggedMinutes: 0,
        loggedWeekdays: 0,
        totalWeekdays: 5,
      },
      todayMinutes: null,
      monthLoggedMinutes: 0,
      monthLoggedDays: 0,
      recent: [],
    },
    pendingAdjustmentsByDateKey: {},
    adjustmentsRequireApproval: true,
    ...overrides,
  };
}

test("isDateKeyInLoadedRange respects inclusive bounds", () => {
  assert.equal(isDateKeyInLoadedRange("2025-11-12", "2025-11-12", "2026-11-12"), true);
  assert.equal(isDateKeyInLoadedRange("2025-11-11", "2025-11-12", "2026-11-12"), false);
  assert.equal(isDateKeyInLoadedRange("2026-11-13", "2025-11-12", "2026-11-12"), false);
});

test("nextLoadedAdjustWeekToken returns null when week keys are missing", () => {
  const pageData = emptyPageData();
  assert.equal(nextLoadedAdjustWeekToken(null, "2025-11-09", pageData), null);
  assert.equal(nextLoadedAdjustWeekToken("2025-11-03", null, pageData), null);
});

test("nextLoadedAdjustWeekToken returns token when week is inside loaded range", () => {
  const pageData = emptyPageData({
    rangeFrom: "2025-11-12",
    rangeTo: "2026-11-12",
  });
  assert.equal(
    nextLoadedAdjustWeekToken("2025-11-17", "2025-11-23", pageData),
    "2025-11-17:2025-11-23",
  );
});

test("nextLoadedAdjustWeekToken returns null when week needs fetch", () => {
  const pageData = emptyPageData({
    rangeFrom: "2025-11-12",
    rangeTo: "2026-11-12",
  });
  assert.equal(
    nextLoadedAdjustWeekToken("2025-11-03", "2025-11-09", pageData),
    null,
  );
});

test("weekRangeNeedsFetch is true when the week extends outside the loaded window", () => {
  assert.equal(
    weekRangeNeedsFetch("2025-11-03", "2025-11-09", "2025-11-12", "2026-11-12"),
    true,
  );
  assert.equal(
    weekRangeNeedsFetch("2025-11-17", "2025-11-23", "2025-11-12", "2026-11-12"),
    false,
  );
});

test("mergeTeacherMyHoursPageData widens range and merges maps", () => {
  const base = emptyPageData({
    rangeFrom: "2025-11-12",
    rangeTo: "2026-11-12",
    sessionsByDateKey: { "2026-11-10": [] },
    sidebar: {
      week: {
        goalMinutes: 2400,
        loggedMinutes: 100,
        loggedWeekdays: 1,
        totalWeekdays: 5,
      },
      todayMinutes: 60,
      monthLoggedMinutes: 100,
      monthLoggedDays: 1,
      recent: [],
    },
  });
  const patch = emptyPageData({
    rangeFrom: "2025-11-03",
    rangeTo: "2025-11-09",
    sessionsByDateKey: {
      "2025-11-05": [
        {
          id: "a",
          clockInAt: "",
          clockOutAt: "",
          clockIn: "8:00 AM",
          clockOut: "3:00 PM",
          minutes: 420,
        },
      ],
    },
    pendingAdjustmentsByDateKey: {
      "2025-11-06": {
        id: "req",
        dateKey: "2025-11-06",
        note: "",
        sessions: [{ clockIn: "09:00", clockOut: "17:00" }],
      },
    },
  });

  const merged = mergeTeacherMyHoursPageData(base, patch);
  assert.equal(merged.rangeFrom, "2025-11-03");
  assert.equal(merged.rangeTo, "2026-11-12");
  assert.deepEqual(Object.keys(merged.sessionsByDateKey).sort(), [
    "2025-11-05",
    "2026-11-10",
  ]);
  assert.equal(merged.sidebar.week.loggedMinutes, 100);
  assert.ok(merged.pendingAdjustmentsByDateKey?.["2025-11-06"]);
});
