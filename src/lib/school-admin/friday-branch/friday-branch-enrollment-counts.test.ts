import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { aggregateFridayBranchEnrollmentCounts } from "./friday-branch-enrollment-counts";

describe("aggregateFridayBranchEnrollmentCounts", () => {
  it("groups confirmed and waitlisted counts by class id", () => {
    const counts = aggregateFridayBranchEnrollmentCounts(
      [
        { class_id: "class-1", status: "confirmed" },
        { class_id: "class-1", status: "confirmed" },
        { class_id: "class-1", status: "waitlisted" },
        { class_id: "class-2", status: "waitlisted" },
      ],
      ["class-1", "class-2", "class-3"],
    );

    assert.deepEqual(counts["class-1"], { confirmed: 2, waitlisted: 1 });
    assert.deepEqual(counts["class-2"], { confirmed: 0, waitlisted: 1 });
    assert.deepEqual(counts["class-3"], { confirmed: 0, waitlisted: 0 });
  });
});
