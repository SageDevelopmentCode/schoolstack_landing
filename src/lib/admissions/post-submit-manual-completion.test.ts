import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { formatScheduledVisitWhenLabel } from "./admissions-availability";
import { buildAdminPostSubmitSteps } from "./admin-post-submit-steps";
import type { ScheduledVisitRecord } from "./admissions-booking";
import type { ApplicationFormPostSubmitConfig } from "./application-form-schema";

describe("formatScheduledVisitWhenLabel", () => {
  it("returns school-completed copy for manual completions", () => {
    assert.equal(
      formatScheduledVisitWhenLabel({
        schedulingMode: "time_slot",
        scheduledDate: "2026-08-09",
        startTimeSlot: "ADMIN_MANUAL",
        durationMinutes: 30,
        completedManuallyAt: "2026-08-09T12:00:00.000Z",
      }),
      "Marked complete by school",
    );
  });
});

describe("buildAdminPostSubmitSteps", () => {
  const config: ApplicationFormPostSubmitConfig = {
    actions: [
      {
        id: "shadow-day",
        type: "schedule_observation_day",
        enabled: true,
        required: true,
      },
    ],
  };

  it("marks a step scheduled when a manual visit exists", () => {
    const visits: ScheduledVisitRecord[] = [
      {
        id: "visit-1",
        organizationId: "org-1",
        applicationId: "app-1",
        postSubmitActionId: "shadow-day",
        actionType: "schedule_observation_day",
        schedulingMode: "whole_day",
        scheduledDate: "2026-08-09",
        startTimeSlot: "ADMIN_MANUAL",
        durationMinutes: 1440,
        status: "scheduled",
        completedManuallyAt: "2026-08-09T12:00:00.000Z",
      },
    ];

    const steps = buildAdminPostSubmitSteps(config, visits, "submitted");
    assert.equal(steps.length, 1);
    assert.equal(steps[0]?.status, "scheduled");
    assert.equal(steps[0]?.booking?.completedManuallyAt, "2026-08-09T12:00:00.000Z");
  });

  it("returns no steps for draft applications", () => {
    const steps = buildAdminPostSubmitSteps(config, [], "draft");
    assert.deepEqual(steps, []);
  });
});
