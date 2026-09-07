import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getAdminFeatureAnnouncements } from "./admin-feature-announcements";
import type { AdminFeatures } from "@/lib/organization-settings/types";

const ALL_FEATURES_ENABLED: AdminFeatures = {
  dashboard: true,
  admissions: true,
  my_school: true,
  committees: true,
  schedule: true,
  messages: true,
  bulletin: true,
  finances: true,
  marketing: true,
  notifications: true,
};

describe("admin-feature-announcements", () => {
  it("returns all in-window announcements by default", () => {
    const announcements = getAdminFeatureAnnouncements(
      "rooted-meadows-school",
      ALL_FEATURES_ENABLED,
      {
        sinceDays: 14,
        now: new Date(2026, 8, 7),
      },
    );

    assert.equal(announcements.length, 7);
    assert.equal(announcements[0]?.publishedAt, "2026-09-04");
    assert.equal(announcements[0]?.id, "school-bulletin");
  });

  it("returns recent announcements sorted by publishedAt descending", () => {
    const announcements = getAdminFeatureAnnouncements(
      "rooted-meadows-school",
      ALL_FEATURES_ENABLED,
      {
        limit: 5,
        sinceDays: 14,
        now: new Date(2026, 8, 7),
      },
    );

    assert.equal(announcements.length, 5);
    assert.equal(announcements[0]?.id, "school-bulletin");
    assert.equal(announcements[1]?.id, "classroom-management");
    assert.equal(announcements[2]?.id, "program-parent-portals");
  });

  it("filters announcements outside the sinceDays window", () => {
    const announcements = getAdminFeatureAnnouncements(
      "rooted-meadows-school",
      ALL_FEATURES_ENABLED,
      {
        limit: 10,
        sinceDays: 7,
        now: new Date(2026, 8, 7),
      },
    );

    assert.deepEqual(
      announcements.map((announcement) => announcement.id),
      [
        "school-bulletin",
        "classroom-management",
        "program-parent-portals",
        "tuition-workspace",
        "schedule-hub",
      ],
    );
  });

  it("gates announcements by enabled admin features", () => {
    const announcements = getAdminFeatureAnnouncements(
      "rooted-meadows-school",
      {
        ...ALL_FEATURES_ENABLED,
        bulletin: false,
        messages: false,
      },
      {
        limit: 10,
        sinceDays: 14,
        now: new Date(2026, 8, 7),
      },
    );

    assert.equal(
      announcements.some((announcement) => announcement.id === "school-bulletin"),
      false,
    );
    assert.equal(
      announcements.some((announcement) => announcement.id === "messages-inbox"),
      false,
    );
    assert.equal(
      announcements.some((announcement) => announcement.id === "classroom-management"),
      true,
    );
  });

  it("resolves slug-specific admin hrefs", () => {
    const [announcement] = getAdminFeatureAnnouncements(
      "demo-school",
      ALL_FEATURES_ENABLED,
      {
        limit: 1,
        sinceDays: 14,
        now: new Date(2026, 8, 7),
      },
    );

    assert.equal(
      announcement?.href,
      "/school/demo-school/admin/bulletin",
    );
  });
});
