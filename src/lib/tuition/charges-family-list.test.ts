import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { familyHasBillingRelevance } from "./charges";

describe("familyHasBillingRelevance", () => {
  it("includes families with pending enrollments and no charges", () => {
    assert.equal(
      familyHasBillingRelevance({
        assignmentCount: 0,
        chargeCount: 0,
        enrollmentCount: 1,
      }),
      true,
    );
  });

  it("includes families with tuition assignments", () => {
    assert.equal(
      familyHasBillingRelevance({
        assignmentCount: 1,
        chargeCount: 0,
        enrollmentCount: 0,
      }),
      true,
    );
  });

  it("excludes families with no billing or enrollment activity", () => {
    assert.equal(
      familyHasBillingRelevance({
        assignmentCount: 0,
        chargeCount: 0,
        enrollmentCount: 0,
      }),
      false,
    );
  });
});
