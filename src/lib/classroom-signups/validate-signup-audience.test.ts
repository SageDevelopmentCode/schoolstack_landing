import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { classroomAudienceRequiresSelection } from "./validate-signup-audience";

describe("classroomAudienceRequiresSelection", () => {
  it("does not require classrooms for drafts", () => {
    assert.equal(
      classroomAudienceRequiresSelection("classrooms", [], "draft"),
      false,
    );
  });

  it("requires classrooms when publishing with classrooms audience", () => {
    assert.equal(
      classroomAudienceRequiresSelection("classrooms", [], "open"),
      true,
    );
  });

  it("allows open signups with at least one classroom", () => {
    assert.equal(
      classroomAudienceRequiresSelection("classrooms", ["classroom-1"], "open"),
      false,
    );
  });

  it("ignores non-classrooms audiences", () => {
    assert.equal(classroomAudienceRequiresSelection("assigned", [], "open"), false);
  });
});