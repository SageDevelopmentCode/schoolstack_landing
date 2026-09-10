import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  DEFAULT_COOP_TEACHING_SCHEDULE_FILTERS,
  filterCoopTeachingScheduleWeeks,
} from "./program-coop-teaching-schedule-filters";
import type { CoopTeachingScheduleWeek } from "./program-coop-teaching-schedule-mock";

const spiceWeek: CoopTeachingScheduleWeek = {
  id: "week-spice",
  startDate: "2026-09-28",
  endDate: "2026-10-02",
  parentInstructors: [],
  parentAssistants: ["Rachael"],
  weekName: "Spice Week",
  seasonalTheme: "Warming Kitchen Crafts & Spices",
  characterLesson: "Warmth & Hospitality",
  celebrationEvent: null,
};

const breadWeek: CoopTeachingScheduleWeek = {
  id: "week-bread",
  startDate: "2026-09-07",
  endDate: "2026-09-11",
  parentInstructors: ["Amber"],
  parentAssistants: ["Heidi"],
  weekName: "Bread Week",
  seasonalTheme: "Welcome & Grain Grinding",
  characterLesson: "Industry & Daily Chores",
  celebrationEvent: null,
};

const pastWeek: CoopTeachingScheduleWeek = {
  id: "week-past",
  startDate: "2020-01-06",
  endDate: "2020-01-10",
  parentInstructors: ["Past Parent"],
  parentAssistants: [],
  weekName: "Past Week",
  seasonalTheme: "Winter",
  characterLesson: "Patience",
  celebrationEvent: "Winter festival",
};

const weeks = [breadWeek, spiceWeek, pastWeek];

describe("filterCoopTeachingScheduleWeeks", () => {
  it("filters by week name search", () => {
    const result = filterCoopTeachingScheduleWeeks(
      weeks,
      { ...DEFAULT_COOP_TEACHING_SCHEDULE_FILTERS, search: "spice" },
      { variant: "admin" },
    );
    assert.equal(result.length, 1);
    assert.equal(result[0]?.weekName, "Spice Week");
  });

  it("filters upcoming weeks", () => {
    const result = filterCoopTeachingScheduleWeeks(
      weeks,
      { ...DEFAULT_COOP_TEACHING_SCHEDULE_FILTERS, when: "upcoming" },
      { variant: "admin" },
    );
    assert.equal(result.some((week) => week.id === "week-past"), false);
    assert.equal(result.some((week) => week.id === "week-spice"), true);
  });

  it("includes spice week for parent open spots filter", () => {
    const result = filterCoopTeachingScheduleWeeks(
      weeks,
      { ...DEFAULT_COOP_TEACHING_SCHEDULE_FILTERS, volunteer: "open_spots" },
      { variant: "parent", currentParentName: "Taylor" },
    );
    assert.equal(result.some((week) => week.id === "week-spice"), true);
  });

  it("filters admin needs_assistant weeks", () => {
    const result = filterCoopTeachingScheduleWeeks(
      weeks,
      { ...DEFAULT_COOP_TEACHING_SCHEDULE_FILTERS, volunteer: "needs_assistant" },
      { variant: "admin" },
    );
    assert.equal(result.length, 1);
    assert.equal(result[0]?.id, "week-past");
  });
});
