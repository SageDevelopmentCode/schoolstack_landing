import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  aggregateCoopFamilyParticipation,
  buildProgramCoopFamiliesAdminSummary,
  filterProgramCoopFamiliesAdminRows,
  formatCoopFamilyLearnersSummary,
  searchProgramCoopFamiliesAdminRows,
  type ProgramCoopFamilyAdminRow,
} from "./program-coop-families-admin";
import type { CoopSupplyListItem } from "./program-coop-supply-list-mock";
import type { CoopTeachingScheduleWeek } from "./program-coop-teaching-schedule-mock";

function baseFamily(overrides: Partial<ProgramCoopFamilyAdminRow> = {}): ProgramCoopFamilyAdminRow {
  return {
    familyId: "family-a",
    familyName: "The Example family",
    learners: [
      {
        studentId: "student-a",
        firstName: "Emma",
        grade: "k",
        profilePhotoUrl: null,
      },
    ],
    enrolledAt: "2026-01-05T00:00:00.000Z",
    primaryGuardian: {
      guardianId: "guardian-a",
      name: "Jane Example",
      email: "jane@example.com",
    },
    supplyItemCount: 0,
    teachingWeekCount: 0,
    upcomingTeachingWeekCount: 0,
    hasSupplyGap: true,
    hasTeachingGap: true,
    supplyItems: [],
    teachingWeeks: [],
    ...overrides,
  };
}

function baseSupplyItem(overrides: Partial<CoopSupplyListItem> = {}): CoopSupplyListItem {
  return {
    id: "item-1",
    name: "Paper towels",
    itemType: "consumable",
    usageTiming: "year_round",
    months: [],
    colorId: null,
    assignedFamilyIds: [],
    whereToBuy: "Store",
    quantity: 1,
    quantityLabel: "roll",
    estimatedPrice: { mode: "unset" },
    ...overrides,
  };
}

function baseTeachingWeek(
  overrides: Partial<CoopTeachingScheduleWeek> = {},
): CoopTeachingScheduleWeek {
  return {
    id: "week-1",
    startDate: "2026-12-01",
    endDate: "2026-12-05",
    instructorFamilyIds: [],
    assistantFamilyIds: [],
    weekName: "Advent week",
    seasonalTheme: "Winter",
    characterLesson: "Kindness",
    celebrationEvent: null,
    ...overrides,
  };
}

describe("aggregateCoopFamilyParticipation", () => {
  it("counts supply items and upcoming teaching weeks for a family", () => {
    const participation = aggregateCoopFamilyParticipation(
      "family-a",
      [
        baseSupplyItem({ id: "item-1", assignedFamilyIds: ["family-a"] }),
        baseSupplyItem({ id: "item-2", assignedFamilyIds: ["family-b"] }),
      ],
      [
        baseTeachingWeek({
          id: "week-1",
          instructorFamilyIds: ["family-a"],
        }),
        baseTeachingWeek({
          id: "week-2",
          startDate: "2025-01-01",
          endDate: "2025-01-05",
          assistantFamilyIds: ["family-a"],
        }),
      ],
      new Date("2026-06-01"),
    );

    assert.equal(participation.supplyItemCount, 1);
    assert.equal(participation.teachingWeekCount, 2);
    assert.equal(participation.upcomingTeachingWeekCount, 1);
    assert.equal(participation.hasSupplyGap, false);
    assert.equal(participation.hasTeachingGap, false);
    assert.equal(participation.teachingWeeks[0]?.role, "instructor");
    assert.equal(participation.teachingWeeks[1]?.role, "assistant");
    assert.equal(participation.teachingWeeks[1]?.isPast, true);
  });

  it("flags gaps when a family has no assignments", () => {
    const participation = aggregateCoopFamilyParticipation(
      "family-a",
      [baseSupplyItem({ assignedFamilyIds: ["family-b"] })],
      [baseTeachingWeek({ instructorFamilyIds: ["family-b"] })],
      new Date("2026-06-01"),
    );

    assert.equal(participation.supplyItemCount, 0);
    assert.equal(participation.teachingWeekCount, 0);
    assert.equal(participation.hasSupplyGap, true);
    assert.equal(participation.hasTeachingGap, true);
  });
});

describe("buildProgramCoopFamiliesAdminSummary", () => {
  it("summarizes family, learner, supply, and teaching counts", () => {
    const summary = buildProgramCoopFamiliesAdminSummary(
      [
        baseFamily(),
        baseFamily({
          familyId: "family-b",
          familyName: "The Other family",
          learners: [
            {
              studentId: "student-b",
              firstName: "Noah",
              grade: "1",
              profilePhotoUrl: null,
            },
            {
              studentId: "student-c",
              firstName: "Mia",
              grade: "3",
              profilePhotoUrl: null,
            },
          ],
        }),
      ],
      [
        baseSupplyItem({ id: "item-1", assignedFamilyIds: ["family-a"] }),
        baseSupplyItem({ id: "item-2" }),
      ],
      [
        baseTeachingWeek({ instructorFamilyIds: ["family-a"] }),
        baseTeachingWeek({
          id: "week-2",
          instructorFamilyIds: ["family-b"],
          assistantFamilyIds: ["family-c"],
        }),
      ],
    );

    assert.equal(summary.familyCount, 2);
    assert.equal(summary.learnerCount, 3);
    assert.equal(summary.unassignedSupplyItemCount, 1);
    assert.equal(summary.unfilledTeachingWeekCount, 1);
  });
});

describe("filterProgramCoopFamiliesAdminRows", () => {
  it("filters families that need supply or teaching assignments", () => {
    const families = [
      baseFamily({ familyId: "family-a", hasSupplyGap: true, hasTeachingGap: false }),
      baseFamily({ familyId: "family-b", hasSupplyGap: false, hasTeachingGap: true }),
      baseFamily({ familyId: "family-c", hasSupplyGap: false, hasTeachingGap: false }),
    ];

    assert.deepEqual(
      filterProgramCoopFamiliesAdminRows(families, "needs_supply").map(
        (family) => family.familyId,
      ),
      ["family-a"],
    );
    assert.deepEqual(
      filterProgramCoopFamiliesAdminRows(families, "needs_teaching").map(
        (family) => family.familyId,
      ),
      ["family-b"],
    );
  });
});

describe("searchProgramCoopFamiliesAdminRows", () => {
  it("matches family, learner, guardian, and email text", () => {
    const families = [
      baseFamily(),
      baseFamily({
        familyId: "family-b",
        familyName: "The Rivera family",
        learners: [
          {
            studentId: "student-b",
            firstName: "Noah",
            grade: "1",
            profilePhotoUrl: null,
          },
        ],
        primaryGuardian: {
          guardianId: "guardian-b",
          name: "Maria Rivera",
          email: "maria@example.com",
        },
      }),
    ];

    assert.equal(searchProgramCoopFamiliesAdminRows(families, "rivera").length, 1);
    assert.equal(searchProgramCoopFamiliesAdminRows(families, "noah").length, 1);
    assert.equal(searchProgramCoopFamiliesAdminRows(families, "jane@example.com").length, 1);
  });
});

describe("formatCoopFamilyLearnersSummary", () => {
  it("formats learner counts and names", () => {
    assert.equal(
      formatCoopFamilyLearnersSummary([
        {
          studentId: "student-a",
          firstName: "Emma",
          grade: null,
          profilePhotoUrl: null,
        },
        {
          studentId: "student-b",
          firstName: "Noah",
          grade: null,
          profilePhotoUrl: null,
        },
      ]),
      "2 · Emma, Noah",
    );
    assert.equal(formatCoopFamilyLearnersSummary([]), "—");
  });
});
