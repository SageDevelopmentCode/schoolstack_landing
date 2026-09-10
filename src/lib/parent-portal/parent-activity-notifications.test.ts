import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ACTIVITY_ACTIONS } from "@/lib/activity-log";
import {
  getParentActivityNotificationCategory,
  formatRelativeTime,
} from "@/lib/parent-portal/parent-activity-notifications";
import {
  getActivityNotificationRangeStart,
  isUnreadActivityNotificationEvent,
} from "@/lib/school-admin/activity-notifications";

describe("getParentActivityNotificationCategory", () => {
  it("maps message actions to messages", () => {
    assert.equal(
      getParentActivityNotificationCategory(ACTIVITY_ACTIONS.MESSAGES_RECEIVED),
      "messages",
    );
  });

  it("maps bulletin synthetic action to announcements", () => {
    assert.equal(
      getParentActivityNotificationCategory("bulletin.post_published"),
      "announcements",
    );
  });

  it("maps calendar synthetic action to events", () => {
    assert.equal(
      getParentActivityNotificationCategory("calendar.event_posted"),
      "events",
    );
  });

  it("maps tuition actions to payments", () => {
    assert.equal(
      getParentActivityNotificationCategory(ACTIVITY_ACTIONS.TUITION_AUTOPAY_FAILED),
      "payments",
    );
  });

  it("maps co-op synthetic actions to coop", () => {
    assert.equal(
      getParentActivityNotificationCategory("coop.curriculum.updated"),
      "coop",
    );
  });
});

describe("parent notification unread helpers", () => {
  it("treats items after lastReadAt as unread within the window", () => {
    const rangeStart = getActivityNotificationRangeStart(30, new Date("2026-09-10T12:00:00.000Z"));
    assert.equal(
      isUnreadActivityNotificationEvent(
        "2026-09-09T12:00:00.000Z",
        "2026-09-08T12:00:00.000Z",
        rangeStart,
      ),
      true,
    );
  });

  it("treats items before lastReadAt as read", () => {
    const rangeStart = getActivityNotificationRangeStart(30, new Date("2026-09-10T12:00:00.000Z"));
    assert.equal(
      isUnreadActivityNotificationEvent(
        "2026-09-08T12:00:00.000Z",
        "2026-09-09T12:00:00.000Z",
        rangeStart,
      ),
      false,
    );
  });
});

describe("formatRelativeTime re-export", () => {
  it("returns Just now for very recent timestamps", () => {
    const now = new Date().toISOString();
    assert.equal(formatRelativeTime(now), "Just now");
  });
});
