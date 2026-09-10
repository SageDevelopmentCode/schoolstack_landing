import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ProgramCoopSignupConflictError } from "./program-coop-storage-errors";
import {
  appendProgramCoopTeachingScheduleParent,
  removeProgramCoopTeachingScheduleParent,
} from "./program-coop-teaching-schedule-storage";

const teachingWeekRpcRow = {
  id: "week-1",
  program_id: "program-1",
  organization_id: "org-1",
  start_date: "2026-09-01",
  end_date: "2026-09-05",
  instructor_family_ids: ["family-1"],
  assistant_family_ids: [] as string[],
  week_name: "Week 1",
  seasonal_theme: "Fall",
  character_lesson: "Kindness",
  celebration_event: null,
  sort_order: 0,
  created_at: "",
  updated_at: "",
};

describe("appendProgramCoopTeachingScheduleParent", () => {
  it("maps empty RPC results to a signup conflict", async () => {
    const supabase = {
      rpc: async () => ({ data: [], error: null }),
      from() {
        return {
          select() {
            return this;
          },
          eq() {
            return this;
          },
          async maybeSingle() {
            return {
              data: {
                ...teachingWeekRpcRow,
                instructor_family_ids: [],
                assistant_family_ids: [],
              },
              error: null,
            };
          },
        };
      },
    };

    await assert.rejects(
      () =>
        appendProgramCoopTeachingScheduleParent(
          supabase as never,
          { organizationId: "org-1", programId: "program-1" },
          "week-1",
          "instructor",
          "family-new",
          { parentSignup: true },
        ),
      (error: unknown) => error instanceof ProgramCoopSignupConflictError,
    );
  });

  it("returns instructor-only RPC row without assistant assignments", async () => {
    const supabase = {
      rpc: async () => ({
        data: [teachingWeekRpcRow],
        error: null,
      }),
    };

    const week = await appendProgramCoopTeachingScheduleParent(
      supabase as never,
      { organizationId: "org-1", programId: "program-1" },
      "week-1",
      "instructor",
      "family-1",
      { parentSignup: true },
    );

    assert.deepEqual(week.instructorFamilyIds, ["family-1"]);
    assert.deepEqual(week.assistantFamilyIds, []);
  });
});

describe("removeProgramCoopTeachingScheduleParent", () => {
  it("maps empty RPC results to a not-signed-up error", async () => {
    const supabase = {
      rpc: async () => ({ data: [], error: null }),
    };

    await assert.rejects(
      () =>
        removeProgramCoopTeachingScheduleParent(
          supabase as never,
          { organizationId: "org-1", programId: "program-1" },
          "week-1",
          "instructor",
          "family-1",
        ),
      (error: unknown) =>
        error instanceof Error && error.message === "You are not signed up for this role.",
    );
  });

  it("returns the RPC row when withdraw succeeds", async () => {
    const supabase = {
      rpc: async () => ({
        data: [
          {
            ...teachingWeekRpcRow,
            instructor_family_ids: [],
            assistant_family_ids: ["family-2"],
          },
        ],
        error: null,
      }),
    };

    const week = await removeProgramCoopTeachingScheduleParent(
      supabase as never,
      { organizationId: "org-1", programId: "program-1" },
      "week-1",
      "instructor",
      "family-1",
    );

    assert.deepEqual(week.instructorFamilyIds, []);
    assert.deepEqual(week.assistantFamilyIds, ["family-2"]);
  });
});
