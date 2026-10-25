import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { AdminPostSubmitStep } from "./admin-post-submit-steps";
import {
  actionTypeMatchesManualBookingContext,
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
