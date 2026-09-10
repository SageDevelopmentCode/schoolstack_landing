import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  DEFAULT_COOP_TEACHING_SCHEDULE_FILTERS,
  filterCoopTeachingScheduleWeeks,
} from "./program-coop-teaching-schedule-filters";
import type { CoopTeachingScheduleWeek } from "./program-coop-teaching-schedule-mock";

const baseWeek = (
  overrides: Partial<CoopTeachingScheduleWeek> = {},
): CoopTeachingScheduleWeek => ({
  id: "week-1",
  startDate: "2026-09-14",
  endDate: "2026-09-18",
  instructorFamilyIds: [],
  assistantFamilyIds: [],
  weekName: "Apple Week",
  seasonalTheme: "Apples",
  characterLesson: "Sharing",
  celebrationEvent: null,
  ...overrides,
});

describe("filterCoopTeachingScheduleWeeks parent context", () => {
  it("filters mine sign-ups by family id", () => {
    const weeks = [
      baseWeek({
        id: "mine",
        assistantFamilyIds: ["family-taylor"],
      }),
      baseWeek({
        id: "other",
        assistantFamilyIds: ["family-other"],
      }),
    ];

    const filtered = filterCoopTeachingScheduleWeeks(
      weeks,
      { ...DEFAULT_COOP_TEACHING_SCHEDULE_FILTERS, volunteer: "mine" },
      { variant: "parent", currentFamilyId: "family-taylor" },
    );

    assert.deepEqual(filtered.map((week) => week.id), ["mine"]);
  });
});
