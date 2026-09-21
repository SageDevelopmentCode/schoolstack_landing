import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { resolveTeacherDashboardWorkspaceTabs } from "./teacher-dashboard-workspace";

describe("resolveTeacherDashboardWorkspaceTabs", () => {
  it("returns all tabs when attendance and classrooms are available", () => {
    const result = resolveTeacherDashboardWorkspaceTabs({
      showAttendanceSection: true,
      myStudentsEnabled: true,
      classroomCount: 2,
    });

    assert.deepEqual(
      result.tabs.map((tab) => tab.key),
      ["attendance", "classrooms", "students"],
    );
    assert.equal(result.defaultTab, "attendance");
  });

  it("hides attendance when the section is unavailable", () => {
    const result = resolveTeacherDashboardWorkspaceTabs({
      showAttendanceSection: false,
      myStudentsEnabled: true,
      classroomCount: 1,
    });

    assert.deepEqual(
      result.tabs.map((tab) => tab.key),
      ["classrooms", "students"],
    );
    assert.equal(result.defaultTab, "classrooms");
  });

  it("hides classrooms when there are none", () => {
    const result = resolveTeacherDashboardWorkspaceTabs({
      showAttendanceSection: true,
      myStudentsEnabled: true,
      classroomCount: 0,
    });

    assert.deepEqual(
      result.tabs.map((tab) => tab.key),
      ["attendance", "students"],
    );
    assert.equal(result.defaultTab, "attendance");
  });

  it("returns no tabs when my students is disabled and attendance is hidden", () => {
    const result = resolveTeacherDashboardWorkspaceTabs({
      showAttendanceSection: false,
      myStudentsEnabled: false,
      classroomCount: 3,
    });

    assert.deepEqual(result.tabs, []);
    assert.equal(result.defaultTab, null);
  });
});
