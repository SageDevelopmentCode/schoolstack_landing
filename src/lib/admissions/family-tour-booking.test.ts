import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  FAMILY_TOUR_ACTION_TYPE,
  findTourAttachableApplication,
  hasPendingPostSubmitCampusTour,
  hasPreEnrollmentApplication,
  listUpcomingCampusToursFromApplications,
  shouldOfferApplyPortalTourBooking,
  type TourBookingApplicationSummary,
} from "./family-tour-booking";

function application(
  overrides: Partial<TourBookingApplicationSummary> & Pick<TourBookingApplicationSummary, "id" | "status">,
): TourBookingApplicationSummary {
  return {
    submittedAt: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    postSubmitTasks: [],
    ...overrides,
  };
}

function pendingCampusTourTask() {
  return {
    type: FAMILY_TOUR_ACTION_TYPE,
    status: "pending",
  };
}

function scheduledCampusTourTask() {
  return {
    type: FAMILY_TOUR_ACTION_TYPE,
    status: "scheduled",
    title: "Campus tour",
    booking: {
      schedulingMode: "time_slot" as const,
      scheduledDate: "2026-09-15",
      startTimeSlot: "10:00",
      durationMinutes: 60,
    },
  };
}

describe("shouldOfferApplyPortalTourBooking", () => {
  it("returns false when tour entry is disabled", () => {
    const result = shouldOfferApplyPortalTourBooking({
      tourEntryEnabled: false,
      applications: [application({ id: "app-1", status: "submitted" })],
      hasScheduledCampusTour: false,
    });

    assert.equal(result, false);
  });

  it("returns false when family already has a scheduled campus tour", () => {
    const result = shouldOfferApplyPortalTourBooking({
      tourEntryEnabled: true,
      applications: [application({ id: "app-1", status: "submitted" })],
      hasScheduledCampusTour: true,
    });

    assert.equal(result, false);
  });

  it("returns false when a post-submit campus tour task is still pending", () => {
    const result = shouldOfferApplyPortalTourBooking({
      tourEntryEnabled: true,
      applications: [
        application({
          id: "app-1",
          status: "submitted",
          postSubmitTasks: [pendingCampusTourTask()],
        }),
      ],
      hasScheduledCampusTour: false,
    });

    assert.equal(result, false);
  });

  it("returns false when there is no pre-enrollment application", () => {
    assert.equal(
      shouldOfferApplyPortalTourBooking({
        tourEntryEnabled: true,
        applications: [application({ id: "app-1", status: "draft" })],
        hasScheduledCampusTour: false,
      }),
      false,
    );

    assert.equal(
      shouldOfferApplyPortalTourBooking({
        tourEntryEnabled: true,
        applications: [application({ id: "app-1", status: "enrolling" })],
        hasScheduledCampusTour: false,
      }),
      false,
    );
  });

  it("returns true when tour entry is enabled and a pre-enrollment app has no tour yet", () => {
    for (const status of ["submitted", "under_review", "accepted"] as const) {
      const result = shouldOfferApplyPortalTourBooking({
        tourEntryEnabled: true,
        applications: [application({ id: "app-1", status })],
        hasScheduledCampusTour: false,
      });

      assert.equal(result, true, `expected true for status ${status}`);
    }
  });

  it("returns true when post-submit campus tour is scheduled but not pending", () => {
    const result = shouldOfferApplyPortalTourBooking({
      tourEntryEnabled: true,
      applications: [
        application({
          id: "app-1",
          status: "submitted",
          postSubmitTasks: [scheduledCampusTourTask()],
        }),
      ],
      hasScheduledCampusTour: false,
    });

    assert.equal(result, true);
  });
});

describe("hasPendingPostSubmitCampusTour", () => {
  it("ignores draft applications and non-pending tasks", () => {
    assert.equal(
      hasPendingPostSubmitCampusTour([
        application({
          id: "draft",
          status: "draft",
          postSubmitTasks: [pendingCampusTourTask()],
        }),
        application({
          id: "submitted",
          status: "submitted",
          postSubmitTasks: [scheduledCampusTourTask()],
        }),
      ]),
      false,
    );
  });

  it("detects pending campus tour on submitted applications", () => {
    assert.equal(
      hasPendingPostSubmitCampusTour([
        application({
          id: "submitted",
          status: "submitted",
          postSubmitTasks: [pendingCampusTourTask()],
        }),
      ]),
      true,
    );
  });
});

describe("findTourAttachableApplication", () => {
  it("returns the most recently submitted pre-enrollment application", () => {
    const attachable = findTourAttachableApplication([
      application({
        id: "older",
        status: "submitted",
        submittedAt: "2026-01-01T00:00:00.000Z",
        createdAt: "2026-01-01T00:00:00.000Z",
      }),
      application({
        id: "newer",
        status: "under_review",
        submittedAt: "2026-02-01T00:00:00.000Z",
        createdAt: "2026-01-15T00:00:00.000Z",
      }),
    ]);

    assert.equal(attachable?.id, "newer");
  });

  it("returns null when no pre-enrollment applications exist", () => {
    assert.equal(
      findTourAttachableApplication([
        application({ id: "draft", status: "draft" }),
      ]),
      null,
    );
  });
});

describe("hasPreEnrollmentApplication", () => {
  it("returns true for submitted, under_review, and accepted statuses", () => {
    assert.equal(
      hasPreEnrollmentApplication([
        application({ id: "app-1", status: "accepted" }),
      ]),
      true,
    );
  });
});

describe("listUpcomingCampusToursFromApplications", () => {
  it("lists scheduled campus tours for pre-enrollment applications only", () => {
    const visits = listUpcomingCampusToursFromApplications([
      application({
        id: "draft",
        status: "draft",
        postSubmitTasks: [scheduledCampusTourTask()],
      }),
      application({
        id: "submitted",
        status: "submitted",
        postSubmitTasks: [scheduledCampusTourTask()],
      }),
    ]);

    assert.equal(visits.length, 1);
    assert.equal(visits[0].id, "application:submitted");
    assert.equal(visits[0].scheduledDate, "2026-09-15");
  });
});
