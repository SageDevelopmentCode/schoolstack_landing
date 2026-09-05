import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { resolveClassroomIdForEnrollment } from "./classrooms";

describe("resolveClassroomIdForEnrollment", () => {
  it("uses program-specific classroom when available", () => {
    const programToClassroomId = new Map<string, string>([
      ["program-1", "classroom-a"],
      ["__none__", "classroom-org"],
    ]);

    assert.equal(
      resolveClassroomIdForEnrollment("program-1", programToClassroomId),
      "classroom-a",
    );
  });

  it("falls back to org-wide classroom when program-specific match is missing", () => {
    const programToClassroomId = new Map<string, string>([
      ["__none__", "classroom-org"],
    ]);

    assert.equal(
      resolveClassroomIdForEnrollment("program-1", programToClassroomId),
      "classroom-org",
    );
  });

  it("prefers program-specific classroom over org-wide fallback", () => {
    const programToClassroomId = new Map<string, string>([
      ["program-1", "classroom-a"],
      ["__none__", "classroom-org"],
    ]);

    assert.equal(
      resolveClassroomIdForEnrollment("program-1", programToClassroomId),
      "classroom-a",
    );
  });

  it("returns null when no classroom applies", () => {
    const programToClassroomId = new Map<string, string>([
      ["program-2", "classroom-b"],
    ]);

    assert.equal(
      resolveClassroomIdForEnrollment("program-1", programToClassroomId),
      null,
    );
  });
});
