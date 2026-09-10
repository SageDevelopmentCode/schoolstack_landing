import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  classroomAppliesToEnrollment,
  resolveClassroomIdsForEnrollment,
} from "./classrooms";

describe("classroomAppliesToEnrollment", () => {
  it("allows org-wide classrooms for any enrollment program", () => {
    assert.equal(classroomAppliesToEnrollment(null, "program-1"), true);
    assert.equal(classroomAppliesToEnrollment(null, null), true);
  });

  it("requires program-specific classrooms to match enrollment program", () => {
    assert.equal(classroomAppliesToEnrollment("program-1", "program-1"), true);
    assert.equal(classroomAppliesToEnrollment("program-1", "program-2"), false);
  });
});

describe("resolveClassroomIdsForEnrollment", () => {
  const classroomsById = new Map([
    ["classroom-a", { id: "classroom-a", programId: "program-1" }],
    ["classroom-b", { id: "classroom-b", programId: "program-2" }],
    ["classroom-org", { id: "classroom-org", programId: null }],
  ]);

  it("returns program-specific and org-wide classrooms for matching enrollment", () => {
    const result = resolveClassroomIdsForEnrollment(
      "program-1",
      classroomsById,
      ["classroom-a", "classroom-b", "classroom-org"],
    );

    assert.deepEqual(result, ["classroom-a", "classroom-org"]);
  });

  it("returns only org-wide classrooms when enrollment program has no specific match", () => {
    const result = resolveClassroomIdsForEnrollment(
      "program-3",
      classroomsById,
      ["classroom-a", "classroom-org"],
    );

    assert.deepEqual(result, ["classroom-org"]);
  });

  it("returns empty array when no classrooms apply", () => {
    const result = resolveClassroomIdsForEnrollment(
      "program-3",
      classroomsById,
      ["classroom-a", "classroom-b"],
    );

    assert.deepEqual(result, []);
  });

  it("supports multiple classrooms for the same program", () => {
    const multiProgramClassrooms = new Map([
      ["classroom-a", { id: "classroom-a", programId: "program-1" }],
      ["classroom-c", { id: "classroom-c", programId: "program-1" }],
      ["classroom-org", { id: "classroom-org", programId: null }],
    ]);

    const result = resolveClassroomIdsForEnrollment(
      "program-1",
      multiProgramClassrooms,
      ["classroom-a", "classroom-c", "classroom-org"],
    );

    assert.deepEqual(result, ["classroom-a", "classroom-c", "classroom-org"]);
  });
});
