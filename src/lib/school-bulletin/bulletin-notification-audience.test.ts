import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  bulletinNotifiesParents,
  bulletinNotifiesStaff,
  bulletinParentProgramFilter,
} from "./bulletin-audience";

describe("bulletin notification audience helpers", () => {
  it("school_wide notifies parents and staff", () => {
    assert.equal(bulletinNotifiesParents(["school_wide"]), true);
    assert.equal(bulletinNotifiesStaff(["school_wide"]), true);
    assert.deepEqual(bulletinParentProgramFilter(["school_wide"], ["p1"]), []);
  });

  it("teachers-only notifies staff but not parents", () => {
    assert.equal(bulletinNotifiesParents(["teachers"]), false);
    assert.equal(bulletinNotifiesStaff(["teachers"]), true);
  });

  it("parents audience uses program filter when program ids are set", () => {
    assert.equal(bulletinNotifiesParents(["parents"]), true);
    assert.equal(bulletinNotifiesStaff(["parents"]), false);
    assert.deepEqual(
      bulletinParentProgramFilter(["parents"], ["prog-a", "prog-b"]),
      ["prog-a", "prog-b"],
    );
  });

  it("program audience requires program ids for filtering", () => {
    assert.equal(bulletinNotifiesParents(["program"]), true);
    assert.deepEqual(
      bulletinParentProgramFilter(["program"], ["prog-1"]),
      ["prog-1"],
    );
  });
});
