import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildPortalCalendarNotificationHref } from "./calendar-notification-links";

describe("buildPortalCalendarNotificationHref", () => {
  it("returns calendar base path without an event id", () => {
    assert.equal(
      buildPortalCalendarNotificationHref("/school/demo/parent"),
      "/school/demo/parent/calendar",
    );
  });

  it("includes eventId and optional date query params", () => {
    assert.equal(
      buildPortalCalendarNotificationHref("/school/demo/parent", {
        eventId: "evt-123",
        eventDate: "2026-11-15",
      }),
      "/school/demo/parent/calendar?eventId=evt-123&date=2026-11-15",
    );
  });
});
