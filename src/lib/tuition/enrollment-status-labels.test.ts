import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  familyEnrollmentBadgeLabel,
  familyEnrollmentStatusBadges,
  formatEnrollmentStatusLabel,
} from "./enrollment-status-labels";

describe("formatEnrollmentStatusLabel", () => {
  it("maps pending to Enrolling", () => {
    assert.equal(formatEnrollmentStatusLabel("pending"), "Enrolling");
  });

  it("maps enrolled to Enrolled", () => {
    assert.equal(formatEnrollmentStatusLabel("enrolled"), "Enrolled");
  });
});

describe("familyEnrollmentStatusBadges", () => {
  it("returns enrolling for pending-only families", () => {
    assert.deepEqual(
      familyEnrollmentStatusBadges([{ status: "pending" }]),
      ["enrolling"],
    );
  });

  it("returns enrolled for enrolled-only families", () => {
    assert.deepEqual(
      familyEnrollmentStatusBadges([{ status: "enrolled" }]),
      ["enrolled"],
    );
  });

  it("returns both badges for mixed families", () => {
    assert.deepEqual(
      familyEnrollmentStatusBadges([
        { status: "pending" },
        { status: "enrolled" },
      ]),
      ["enrolling", "enrolled"],
    );
  });
});

describe("familyEnrollmentBadgeLabel", () => {
  it("returns display labels for family badge kinds", () => {
    assert.equal(familyEnrollmentBadgeLabel("enrolling"), "Enrolling");
    assert.equal(familyEnrollmentBadgeLabel("enrolled"), "Enrolled");
  });
});
