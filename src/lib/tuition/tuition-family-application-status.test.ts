import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  familyHasWithdrawnApplication,
  indexApplicationsByFamilyId,
} from "./tuition-family-application-status";

describe("familyHasWithdrawnApplication", () => {
  it("returns true for withdrawn applications without an enrolled application", () => {
    assert.equal(
      familyHasWithdrawnApplication([{ status: "withdrawn" }]),
      true,
    );
  });

  it("returns false when a sibling application is enrolled", () => {
    assert.equal(
      familyHasWithdrawnApplication([
        { status: "withdrawn" },
        { status: "enrolled" },
      ]),
      false,
    );
  });

  it("returns false when a sibling application is still enrolling", () => {
    assert.equal(
      familyHasWithdrawnApplication([
        { status: "withdrawn" },
        { status: "enrolling" },
      ]),
      false,
    );
  });

  it("returns false when a sibling application is accepted", () => {
    assert.equal(
      familyHasWithdrawnApplication([
        { status: "withdrawn" },
        { status: "accepted" },
      ]),
      false,
    );
  });

  it("returns true when withdrawn is paired only with declined siblings", () => {
    assert.equal(
      familyHasWithdrawnApplication([
        { status: "withdrawn" },
        { status: "declined" },
      ]),
      true,
    );
  });

  it("returns false for pending applications only", () => {
    assert.equal(
      familyHasWithdrawnApplication([{ status: "submitted" }]),
      false,
    );
  });
});

describe("indexApplicationsByFamilyId", () => {
  it("indexes applications by family_id", () => {
    const indexed = indexApplicationsByFamilyId({
      applications: [
        {
          familyId: "family-1",
          primaryGuardianId: null,
          status: "withdrawn",
        },
      ],
      guardianIdToFamilyId: new Map(),
      familyIds: new Set(["family-1"]),
    });

    assert.deepEqual(indexed.get("family-1"), [{ status: "withdrawn" }]);
  });

  it("resolves guardian-linked applications to the guardian family", () => {
    const indexed = indexApplicationsByFamilyId({
      applications: [
        {
          familyId: null,
          primaryGuardianId: "guardian-1",
          status: "withdrawn",
        },
      ],
      guardianIdToFamilyId: new Map([["guardian-1", "family-1"]]),
      familyIds: new Set(["family-1"]),
    });

    assert.deepEqual(indexed.get("family-1"), [{ status: "withdrawn" }]);
  });
});
