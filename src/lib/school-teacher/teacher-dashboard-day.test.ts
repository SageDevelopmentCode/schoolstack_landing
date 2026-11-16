import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildTeacherDaySteps, teacherDashboardStatusLine } from "./teacher-dashboard-day";

const summary = (partial: Partial<Parameters<typeof buildTeacherDaySteps>[0]>) => ({
  totalStudents: 0,
  presentCount: 0,
  absentCount: 0,
  pickedUpCount: 0,
  notMarkedCount: 0,
  ...partial,
});

describe("teacherDashboardStatusLine", () => {
  it("lists focus, unmarked students and unread messages", () => {
    assert.equal(
      teacherDashboardStatusLine({
        focusCount: 2,
        attendance: summary({ totalStudents: 14, notMarkedCount: 9, presentCount: 5 }),
        unreadMessages: 1,
      }),
      "2 things need you today · 9 of 14 not marked yet · 1 unread message",
    );
  });

  it("says nothing is urgent and counts present students once everyone is marked", () => {
    assert.equal(
      teacherDashboardStatusLine({
        focusCount: 0,
        attendance: summary({ totalStudents: 4, presentCount: 2, pickedUpCount: 1, absentCount: 1 }),
        unreadMessages: 0,
      }),
      "Nothing urgent today · 3 of 4 present",
    );
  });

  it("leaves out features that are off", () => {
    assert.equal(
      teacherDashboardStatusLine({ focusCount: 1, attendance: null, unreadMessages: null }),
      "1 thing needs you today",
    );
  });
});

describe("buildTeacherDaySteps", () => {
  it("starts on roll call while students are unmarked", () => {
    const steps = buildTeacherDaySteps(summary({ totalStudents: 4, notMarkedCount: 3, presentCount: 1 }));
    assert.deepEqual(steps.map((s) => s.current), [true, false, false]);
    assert.equal(steps[0].detail, "1 of 4 marked");
    assert.equal(steps[0].filter, "not_marked");
  });

  it("moves to in class once roll call is done", () => {
    const steps = buildTeacherDaySteps(summary({ totalStudents: 4, presentCount: 3, absentCount: 1 }));
    assert.deepEqual(steps.map((s) => s.done), [true, false, false]);
    assert.equal(steps[1].current, true);
    assert.equal(steps[1].detail, "3 in class · 1 absent");
  });

  it("moves to pickup once the first child is picked up, and finishes when everyone has gone", () => {
    const mid = buildTeacherDaySteps(summary({ totalStudents: 4, presentCount: 2, pickedUpCount: 1, absentCount: 1 }));
    assert.equal(mid[2].current, true);
    assert.equal(mid[2].detail, "1 of 3 picked up");
    const end = buildTeacherDaySteps(summary({ totalStudents: 4, pickedUpCount: 3, absentCount: 1 }));
    assert.deepEqual(end.map((s) => s.done), [true, true, true]);
    assert.equal(end.some((s) => s.current), false);
  });
});
