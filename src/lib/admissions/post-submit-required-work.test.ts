import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  applicationHasPendingRequiredPostSubmit,
  daysSinceSubmissionInTimezone,
  isEligibleForPostSubmitRequiredReminder,
  listConfiguredRequiredPostSubmitActions,
  listPendingRequiredPostSubmitActions,
} from "./post-submit-required-work";

const sampleConfig = {
  actions: [
    {
      id: "observation",
      type: "schedule_observation_day",
      enabled: true,
      required: true,
      title: "Observation day",
    },
    {
      id: "tour",
      type: "schedule_campus_tour",
      enabled: true,
      required: false,
      label: "Campus tour",
    },
    {
      id: "off",
      type: "schedule_family_interview",
      enabled: false,
      required: true,
      label: "Interview",
    },
  ],
};

describe("listPendingRequiredPostSubmitActions", () => {
  it("returns only enabled required actions without a booking", () => {
    const pending = listPendingRequiredPostSubmitActions(sampleConfig, []);
    assert.equal(pending.length, 1);
    assert.equal(pending[0]?.actionId, "observation");
    assert.equal(pending[0]?.title, "Observation day");
  });

  it("excludes booked required actions", () => {
    const pending = listPendingRequiredPostSubmitActions(sampleConfig, [
      "observation",
    ]);
    assert.equal(pending.length, 0);
    assert.equal(
      applicationHasPendingRequiredPostSubmit(sampleConfig, ["observation"]),
      false,
    );
  });
});

describe("listConfiguredRequiredPostSubmitActions", () => {
  it("matches pending list with no bookings", () => {
    assert.deepEqual(
      listConfiguredRequiredPostSubmitActions(sampleConfig),
      listPendingRequiredPostSubmitActions(sampleConfig, []),
    );
  });
});

describe("daysSinceSubmissionInTimezone", () => {
  it("counts calendar days in the organization timezone", () => {
    const days = daysSinceSubmissionInTimezone(
      "2026-10-17T12:00:00.000Z",
      new Date("2026-10-19T12:00:00.000Z"),
      "America/Chicago",
    );
    assert.equal(days, 2);
  });
});

describe("isEligibleForPostSubmitRequiredReminder", () => {
  const timezone = "America/Chicago";

  it("sends the first reminder on the day after submission", () => {
    assert.equal(
      isEligibleForPostSubmitRequiredReminder({
        count: 0,
        submittedAt: "2026-10-18T15:00:00.000Z",
        hasPendingRequired: true,
        now: new Date("2026-10-19T12:00:00.000Z"),
        timezone,
      }),
      true,
    );
  });

  it("does not send the first reminder on the submission day", () => {
    assert.equal(
      isEligibleForPostSubmitRequiredReminder({
        count: 0,
        submittedAt: "2026-10-18T15:00:00.000Z",
        hasPendingRequired: true,
        now: new Date("2026-10-18T20:00:00.000Z"),
        timezone,
      }),
      false,
    );
  });

  it("sends the second reminder two calendar days after submission", () => {
    assert.equal(
      isEligibleForPostSubmitRequiredReminder({
        count: 1,
        submittedAt: "2026-10-18T15:00:00.000Z",
        hasPendingRequired: true,
        now: new Date("2026-10-20T12:00:00.000Z"),
        timezone,
      }),
      true,
    );
  });

  it("does not send a second reminder on day one after submission", () => {
    assert.equal(
      isEligibleForPostSubmitRequiredReminder({
        count: 1,
        submittedAt: "2026-10-18T15:00:00.000Z",
        hasPendingRequired: true,
        now: new Date("2026-10-19T12:00:00.000Z"),
        timezone,
      }),
      false,
    );
  });

  it("stops after two reminders", () => {
    assert.equal(
      isEligibleForPostSubmitRequiredReminder({
        count: 2,
        submittedAt: "2026-10-18T15:00:00.000Z",
        hasPendingRequired: true,
        now: new Date("2026-10-25T12:00:00.000Z"),
        timezone,
      }),
      false,
    );
  });
});
