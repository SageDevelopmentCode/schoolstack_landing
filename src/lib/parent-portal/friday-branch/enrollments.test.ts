import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  FridayBranchEnrollmentConflictError,
  resolveEnrollmentStatus,
} from "./enrollments";
import {
  buildStudentEnrollmentStates,
  computeSpotsRemaining,
  filterParentVisibleBlocks,
} from "./load-parent-friday-branch";
import type { FridayBranchBlock } from "@/lib/school-admin/friday-branch/friday-branch-types";
import { orderFridayBranchParentHomeBlockCandidates } from "@/lib/school-admin/friday-branch/friday-branch-storage";

describe("resolveEnrollmentStatus", () => {
  it("returns confirmed when under capacity", () => {
    assert.equal(resolveEnrollmentStatus(12, 3), "confirmed");
  });

  it("returns waitlisted when at capacity", () => {
    assert.equal(resolveEnrollmentStatus(12, 12), "waitlisted");
  });

  it("returns confirmed when capacity is null", () => {
    assert.equal(resolveEnrollmentStatus(null, 99), "confirmed");
  });
});

describe("computeSpotsRemaining", () => {
  it("returns remaining spots when capacity is set", () => {
    assert.equal(computeSpotsRemaining(10, 7), 3);
  });

  it("returns null when capacity is unlimited", () => {
    assert.equal(computeSpotsRemaining(null, 7), null);
  });

  it("never returns negative spots", () => {
    assert.equal(computeSpotsRemaining(5, 8), 0);
  });
});

describe("filterParentVisibleBlocks", () => {
  const blocks: FridayBranchBlock[] = [
    {
      id: "block-draft",
      label: "Draft",
      startDate: "2026-01-01",
      endDate: "2026-01-31",
      accent: "sky",
      status: "draft",
      slots: [
        {
          id: "slot-1",
          time: "10:00",
          classes: [{ id: "class-1", name: "Art", location: "Room", ageGroup: "5-7" }],
        },
      ],
    },
    {
      id: "block-current",
      label: "Block 1",
      startDate: "2026-02-01",
      endDate: "2026-02-28",
      accent: "berry",
      status: "current",
      slots: [
        {
          id: "slot-2",
          time: "10:00",
          classes: [
            { id: "class-2", name: "Visible", location: "Room", ageGroup: "5-7", familyVisible: true },
            { id: "class-3", name: "Hidden", location: "Room", ageGroup: "5-7", familyVisible: false },
          ],
        },
      ],
    },
  ];

  it("keeps current and upcoming blocks only", () => {
    const filtered = filterParentVisibleBlocks(blocks);
    assert.equal(filtered.length, 1);
    assert.equal(filtered[0]?.id, "block-current");
  });

  it("removes family-hidden classes", () => {
    const filtered = filterParentVisibleBlocks(blocks);
    assert.equal(filtered[0]?.slots[0]?.classes.length, 1);
    assert.equal(filtered[0]?.slots[0]?.classes[0]?.id, "class-2");
  });

  it("skips a current block with only family-hidden classes for the next upcoming block", () => {
    const homeCandidates: FridayBranchBlock[] = [
      {
        id: "block-current-hidden",
        label: "Hidden term",
        startDate: "2026-02-01",
        endDate: "2026-02-28",
        accent: "berry",
        status: "current",
        slots: [
          {
            id: "slot-hidden",
            time: "10:00",
            classes: [
              {
                id: "class-hidden",
                name: "Staff only",
                location: "Room",
                ageGroup: "5-7",
                familyVisible: false,
              },
            ],
          },
        ],
      },
      {
        id: "block-upcoming-visible",
        label: "Public term",
        startDate: "2026-03-01",
        endDate: "2026-03-31",
        accent: "sky",
        status: "upcoming",
        slots: [
          {
            id: "slot-visible",
            time: "10:00",
            classes: [
              {
                id: "class-visible",
                name: "Art",
                location: "Room",
                ageGroup: "5-7",
                familyVisible: true,
              },
            ],
          },
        ],
      },
    ];

    const blocksById = new Map(homeCandidates.map((block) => [block.id, block]));
    const orderedRows = orderFridayBranchParentHomeBlockCandidates(
      homeCandidates.map((block, index) => ({
        id: block.id,
        organization_id: "org-1",
        label: block.label,
        start_date: block.startDate,
        end_date: block.endDate,
        accent: block.accent,
        description: "",
        status: block.status ?? "draft",
        sort_order: index,
      })),
    );

    let picked: FridayBranchBlock | undefined;
    for (const row of orderedRows) {
      const candidate = blocksById.get(row.id);
      if (!candidate) continue;
      const visible = filterParentVisibleBlocks([candidate]);
      if (visible.length > 0) {
        picked = visible[0];
        break;
      }
    }

    assert.equal(picked?.id, "block-upcoming-visible");
  });
});

describe("buildStudentEnrollmentStates", () => {
  const studentOptions = [{ id: "student-1", name: "Ada" }];

  it("blocks enrollment when child has a time conflict", () => {
    const slotEnrollmentsByStudent = new Map([
      ["student-1", [{ classId: "other-class", slotTime: "10:00" }]],
    ]);

    const states = buildStudentEnrollmentStates(
      studentOptions,
      [],
      slotEnrollmentsByStudent,
      "class-1",
      "10:00",
      3,
    );

    assert.equal(states[0]?.canEnroll, false);
    assert.match(states[0]?.blockedReason ?? "", /another class at this time/i);
  });

  it("marks already enrolled students as blocked", () => {
    const states = buildStudentEnrollmentStates(
      studentOptions,
      [{ studentId: "student-1", enrollmentId: "enroll-1", status: "confirmed" }],
      new Map(),
      "class-1",
      "10:00",
      3,
    );

    assert.equal(states[0]?.canEnroll, false);
    assert.equal(states[0]?.status, "confirmed");
  });
});

describe("FridayBranchEnrollmentConflictError", () => {
  it("exposes status and code", () => {
    const error = new FridayBranchEnrollmentConflictError(
      "Conflict",
      "time_conflict",
    );
    assert.equal(error.status, 409);
    assert.equal(error.code, "time_conflict");
  });
});
