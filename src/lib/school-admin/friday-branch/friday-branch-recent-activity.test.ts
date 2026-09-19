import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { mapFridayBranchRecentSignupRow } from "./friday-branch-recent-activity";

describe("mapFridayBranchRecentSignupRow", () => {
  it("maps enrollment joins into recent signup rows", () => {
    const row = mapFridayBranchRecentSignupRow({
      id: "enrollment-1",
      class_id: "class-1",
      block_id: "block-1",
      status: "confirmed",
      updated_at: "2026-09-17T20:15:00.000Z",
      students: { first_name: "Autumn", last_name: "Evensen" },
      families: { name: "Evensen Family" },
      friday_branch_classes: {
        name: "Nature Journaling",
        friday_branch_time_slots: {
          time: "9:00 AM",
          friday_branch_blocks: { label: "Fall Block" },
        },
      },
    });

    assert.deepEqual(row, {
      enrollmentId: "enrollment-1",
      classId: "class-1",
      blockId: "block-1",
      className: "Nature Journaling",
      slotTime: "9:00 AM",
      blockLabel: "Fall Block",
      studentName: "Autumn Evensen",
      familyName: "Evensen Family",
      status: "confirmed",
      updatedAt: "2026-09-17T20:15:00.000Z",
    });
  });

  it("returns null when class relations are missing", () => {
    const row = mapFridayBranchRecentSignupRow({
      id: "enrollment-2",
      class_id: "class-2",
      block_id: "block-1",
      status: "waitlisted",
      updated_at: "2026-09-17T20:15:00.000Z",
      students: { first_name: "River" },
      families: { name: "Calvert Family" },
      friday_branch_classes: null,
    });

    assert.equal(row, null);
  });
});
