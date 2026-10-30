import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { AdminPostSubmitStep } from "./admin-post-submit-steps";
import {
  actionTypeMatchesManualBookingContext,
  buildApplicationManualVisitBookingFkOrFilter,
  buildFamilyManualVisitBookingSearchOrFilter,
  buildGuardianManualVisitBookingSearchOrFilter,
  buildStudentManualVisitBookingSearchOrFilter,
  escapeIlikePatternTerm,
  filterPendingStepsForContext,
  isFamilyEligibleForPreAppCampusTour,
} from "./admin-manual-visit-booking";
import type { TourBookingApplicationSummary } from "./family-tour-booking";

function step(
  overrides: Partial<AdminPostSubmitStep> & Pick<AdminPostSubmitStep, "actionId" | "type">,
): AdminPostSubmitStep {
  return {
    title: overrides.title ?? "Step",
    required: true,
    sortIndex: 0,
    status: overrides.status ?? "pending",
    ...overrides,
  };
}

describe("manual visit booking search filters", () => {
  it("escapes ilike metacharacters in the search term", () => {
    assert.equal(escapeIlikePatternTerm("100%"), "100\\%");
    assert.equal(escapeIlikePatternTerm("a_b"), "a\\_b");
    assert.equal(escapeIlikePatternTerm("a\\b"), "a\\\\b");
  });

  it("builds family name and email ilike or filters", () => {
    assert.equal(
      buildFamilyManualVisitBookingSearchOrFilter("rivera"),
      "name.ilike.%rivera%,primary_email.ilike.%rivera%",
    );
  });

  it("builds student name ilike or filters", () => {
    assert.equal(
      buildStudentManualVisitBookingSearchOrFilter("smith"),
      "first_name.ilike.%smith%,last_name.ilike.%smith%",
    );
  });

  it("builds guardian name and email ilike or filters", () => {
    assert.equal(
      buildGuardianManualVisitBookingSearchOrFilter("smith"),
      "first_name.ilike.%smith%,last_name.ilike.%smith%,email.ilike.%smith%",
    );
  });

  it("builds application FK or filters from subsidiary matches", () => {
    const studentId = "11111111-1111-1111-1111-111111111111";
    const guardianId = "22222222-2222-2222-2222-222222222222";
    const familyFromGuardian = "33333333-3333-3333-3333-333333333333";
    const familyFromSearch = "44444444-4444-4444-4444-444444444444";

    assert.equal(
      buildApplicationManualVisitBookingFkOrFilter({
        studentIds: [studentId],
        guardianIds: [],
        familyIds: [],
      }),
      `student_id.in.(${studentId})`,
    );

    assert.equal(
      buildApplicationManualVisitBookingFkOrFilter({
        studentIds: [],
        guardianIds: [guardianId],
        familyIds: [familyFromGuardian, familyFromSearch],
      }),
      `primary_guardian_id.in.(${guardianId}),family_id.in.(${familyFromGuardian},${familyFromSearch})`,
    );

    assert.equal(
      buildApplicationManualVisitBookingFkOrFilter({
        studentIds: [],
        guardianIds: [],
        familyIds: [],
      }),
      null,
    );
  });

  it("quotes family filter values when the pattern contains commas", () => {
    assert.equal(
      buildFamilyManualVisitBookingSearchOrFilter("a,b"),
      'name.ilike."%a,b%",primary_email.ilike."%a,b%"',
    );
  });
});

describe("actionTypeMatchesManualBookingContext", () => {
  it("matches tours context", () => {
    assert.equal(actionTypeMatchesManualBookingContext("schedule_campus_tour", "tours"), true);
    assert.equal(
      actionTypeMatchesManualBookingContext("schedule_family_interview", "tours"),
      true,
    );
    assert.equal(
      actionTypeMatchesManualBookingContext("schedule_observation_day", "tours"),
      false,
    );
  });

  it("matches shadow context", () => {
    assert.equal(
      actionTypeMatchesManualBookingContext("schedule_observation_day", "shadow"),
      true,
    );
    assert.equal(actionTypeMatchesManualBookingContext("schedule_campus_tour", "shadow"), false);
  });
});

describe("filterPendingStepsForContext", () => {
  it("returns only pending steps for the active tab", () => {
    const steps = [
      step({ actionId: "tour", type: "schedule_campus_tour", status: "pending" }),
      step({ actionId: "interview", type: "schedule_family_interview", status: "scheduled" }),
      step({ actionId: "shadow", type: "schedule_observation_day", status: "pending" }),
    ];

    assert.deepEqual(filterPendingStepsForContext(steps, "tours"), [
      { actionId: "tour", type: "schedule_campus_tour", title: "Step" },
    ]);
    assert.deepEqual(filterPendingStepsForContext(steps, "shadow"), [
      { actionId: "shadow", type: "schedule_observation_day", title: "Step" },
    ]);
  });
});

describe("isFamilyEligibleForPreAppCampusTour", () => {
  const baseApplication: TourBookingApplicationSummary = {
    id: "app-1",
    status: "submitted",
    submittedAt: "2026-01-01T00:00:00.000Z",
    createdAt: "2026-01-01T00:00:00.000Z",
    postSubmitTasks: [],
  };

  it("rejects families that already have a scheduled tour", () => {
    assert.equal(isFamilyEligibleForPreAppCampusTour([baseApplication], true), false);
  });

  it("rejects families with a pending post-submit campus tour", () => {
    assert.equal(
      isFamilyEligibleForPreAppCampusTour(
        [
          {
            ...baseApplication,
            postSubmitTasks: [
              { type: "schedule_campus_tour", status: "pending", title: "Tour" },
            ],
          },
        ],
        false,
      ),
      false,
    );
  });

  it("allows families without an existing or pending application tour", () => {
    assert.equal(isFamilyEligibleForPreAppCampusTour([baseApplication], false), true);
  });
});
