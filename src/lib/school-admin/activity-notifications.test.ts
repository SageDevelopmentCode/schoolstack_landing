import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ACTIVITY_ACTIONS } from "@/lib/activity-log";
import {
  formatActivityNotificationDetail,
  formatSubjectShortLabel,
  getActivityNotificationRangeStart,
  isUnreadActivityNotificationEvent,
  shortenSubjectLabel,
} from "@/lib/school-admin/activity-notifications";

describe("formatSubjectShortLabel", () => {
  it("formats first name and last initial", () => {
    assert.equal(formatSubjectShortLabel("Nina", "Thompson"), "Nina T.");
  });

  it("returns first name when last name is missing", () => {
    assert.equal(formatSubjectShortLabel("Nina", null), "Nina");
  });

  it("returns last name when first name is missing", () => {
    assert.equal(formatSubjectShortLabel(null, "Thompson"), "Thompson");
  });

  it("returns null when both names are missing", () => {
    assert.equal(formatSubjectShortLabel(null, null), null);
  });
});

describe("shortenSubjectLabel", () => {
  it("shortens a full name to first name and last initial", () => {
    assert.equal(shortenSubjectLabel("Maggie Thompson"), "Maggie T.");
  });

  it("leaves a single token unchanged", () => {
    assert.equal(shortenSubjectLabel("Madonna"), "Madonna");
  });

  it("handles extra whitespace", () => {
    assert.equal(shortenSubjectLabel("  Nina   Thompson  "), "Nina T.");
  });
});

describe("formatActivityNotificationDetail", () => {
  it("includes payment amount when provided", () => {
    assert.equal(
      formatActivityNotificationDetail(
        ACTIVITY_ACTIONS.APPLICATION_PAYMENT_COMPLETED,
        "Maggie T.",
        "Application fee payment completed",
        "$150",
      ),
      "Maggie T. paid a $150 application fee",
    );
  });

  it("falls back when payment amount is missing", () => {
    assert.equal(
      formatActivityNotificationDetail(
        ACTIVITY_ACTIONS.APPLICATION_PAYMENT_COMPLETED,
        "Maggie T.",
        "Application fee payment completed",
      ),
      "Maggie T. paid an application fee",
    );
  });

  it("uses short subject label for enrollment copy", () => {
    assert.equal(
      formatActivityNotificationDetail(
        ACTIVITY_ACTIONS.ENROLLMENT_COMPLETED,
        "Nina T.",
        "Enrollment completed",
      ),
      "Nina T. finished enrollment",
    );
  });

  it("formats tuition payment completed with family, amount, and charge label", () => {
    assert.equal(
      formatActivityNotificationDetail(
        ACTIVITY_ACTIONS.APPLICATION_PAYMENT_COMPLETED,
        "Test Child",
        "Tuition payment completed",
        "$360.00",
        {
          subjectLabel: "Test Child",
          chargeLabel: "Aug Tuition (Julius)",
          familyName: "Cecilia Family",
          studentName: "Test Child",
        },
      ),
      "Test Child paid $360.00 for Aug Tuition (Julius)",
    );
  });

  it("appends amount to autopay succeeded summary", () => {
    assert.equal(
      formatActivityNotificationDetail(
        ACTIVITY_ACTIONS.TUITION_AUTOPAY_SUCCEEDED,
        null,
        "Autopay succeeded for Aug Tuition (Julius)",
        "$360.00",
      ),
      "Autopay succeeded for Aug Tuition (Julius) — $360.00",
    );
  });
});

describe("isUnreadActivityNotificationEvent", () => {
  const now = new Date("2026-07-28T12:00:00.000Z");
  const rangeStart = getActivityNotificationRangeStart(30, now);

  it("counts events after the read watermark inside the window", () => {
    assert.equal(
      isUnreadActivityNotificationEvent(
        "2026-07-28T11:00:00.000Z",
        "2026-07-28T10:00:00.000Z",
        rangeStart,
      ),
      true,
    );
  });

  it("ignores events at or before the read watermark", () => {
    assert.equal(
      isUnreadActivityNotificationEvent(
        "2026-07-28T10:00:00.000Z",
        "2026-07-28T10:00:00.000Z",
        rangeStart,
      ),
      false,
    );
  });

  it("treats all in-window events as unread when watermark is missing", () => {
    assert.equal(
      isUnreadActivityNotificationEvent(
        "2026-07-27T12:00:00.000Z",
        null,
        rangeStart,
      ),
      true,
    );
  });

  it("ignores events outside the notification window", () => {
    assert.equal(
      isUnreadActivityNotificationEvent(
        "2026-06-01T12:00:00.000Z",
        null,
        rangeStart,
      ),
      false,
    );
  });
});
