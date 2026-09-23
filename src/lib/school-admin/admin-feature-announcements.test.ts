import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { AdminFeatureAnnouncementRecord } from "@/lib/admin/admin-feature-announcements-storage";
import {
  filterAnnouncements,
  getAdminFeatureAnnouncements,
  isWithinSinceDays,
  mergeAnnouncementRows,
  resolveAdminFeatureAnnouncementHref,
} from "./admin-feature-announcements";
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

const SEP_10 = new Date(2026, 8, 10);
const SEP_7 = new Date(2026, 8, 7);

function makeRecord(
  overrides: Partial<AdminFeatureAnnouncementRecord> &
    Pick<AdminFeatureAnnouncementRecord, "announcementId" | "title">,
): AdminFeatureAnnouncementRecord {
  return {
    id: overrides.id ?? overrides.announcementId,
    organizationId: overrides.organizationId ?? null,
    announcementId: overrides.announcementId,
    title: overrides.title,
    description: overrides.description ?? "Description",
    ctaLabel: overrides.ctaLabel ?? "View",
    featureKey: overrides.featureKey ?? "admissions",
    hrefPath: overrides.hrefPath ?? "admissions/programs",
    publishedAt: overrides.publishedAt ?? "2026-09-10",
    published: overrides.published ?? true,
    sortOrder: overrides.sortOrder ?? 0,
    createdAt: overrides.createdAt ?? "2026-09-10T00:00:00.000Z",
    updatedAt: overrides.updatedAt ?? "2026-09-10T00:00:00.000Z",
  };
}

describe("admin-feature-announcements", () => {
  it("returns all in-window announcements by default", () => {
    const announcements = getAdminFeatureAnnouncements(
      "rooted-meadows-school",
      ALL_FEATURES_ENABLED,
      {
        sinceDays: 14,
        now: SEP_10,
      },
    );

    assert.equal(announcements.length, 17);
    assert.equal(announcements[0]?.publishedAt, "2026-09-22");
    assert.equal(announcements[0]?.id, "friday-branch-scheduling");
  });

  it("returns recent announcements sorted by publishedAt descending", () => {
    const announcements = getAdminFeatureAnnouncements(
      "rooted-meadows-school",
      ALL_FEATURES_ENABLED,
      {
        limit: 5,
        sinceDays: 14,
        now: SEP_10,
      },
    );

    assert.equal(announcements.length, 5);
    assert.equal(announcements[0]?.id, "friday-branch-scheduling");
    assert.equal(announcements[1]?.id, "committee-workspace");
    assert.equal(announcements[2]?.id, "mobile-attendance");
    assert.equal(announcements[3]?.id, "incomplete-admissions-reminders");
    assert.equal(announcements[4]?.id, "parent-message-broadcasts");
  });

  it("filters announcements outside the sinceDays window", () => {
    const announcements = getAdminFeatureAnnouncements(
      "rooted-meadows-school",
      ALL_FEATURES_ENABLED,
      {
        limit: 20,
        sinceDays: 7,
        now: SEP_10,
      },
    );

    const ids = announcements.map((announcement) => announcement.id);

    assert.equal(ids.length, 16);
    assert.equal(ids.includes("admissions-submissions"), false);
    assert.equal(ids[0], "friday-branch-scheduling");
    assert.equal(ids.at(-1), "tuition-workspace");
  });

  it("drops older announcements when sinceDays window is narrow on Sep 7", () => {
    const announcements = getAdminFeatureAnnouncements(
      "rooted-meadows-school",
      ALL_FEATURES_ENABLED,
      {
        limit: 20,
        sinceDays: 7,
        now: SEP_7,
      },
    );

    const ids = announcements.map((announcement) => announcement.id);

    assert.equal(ids.length, 16);
    assert.equal(ids.includes("admissions-submissions"), false);
    assert.equal(ids.includes("program-parent-portals"), true);
    assert.equal(ids.includes("coop-curriculum-guides"), true);
  });

  it("gates announcements by enabled admin features", () => {
    const announcements = getAdminFeatureAnnouncements(
      "rooted-meadows-school",
      {
        ...ALL_FEATURES_ENABLED,
        bulletin: false,
        committees: false,
        admissions: false,
      },
      {
        limit: 20,
        sinceDays: 14,
        now: SEP_10,
      },
    );

    assert.equal(
      announcements.some((announcement) => announcement.id === "school-bulletin"),
      false,
    );
    assert.equal(
      announcements.some((announcement) => announcement.id === "committee-descriptions"),
      false,
    );
    assert.equal(
      announcements.some((announcement) => announcement.id === "coop-supply-list"),
      false,
    );
    assert.equal(
      announcements.some((announcement) => announcement.id === "waive-tuition-charges"),
      true,
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
        now: SEP_10,
      },
    );

    assert.equal(
      announcement?.href,
      "/school/demo-school/admin/my_school/friday_branch",
    );
  });

  it("resolves admin href paths with and without subtabs", () => {
    assert.equal(
      resolveAdminFeatureAnnouncementHref("demo-school", "bulletin"),
      "/school/demo-school/admin/bulletin",
    );
    assert.equal(
      resolveAdminFeatureAnnouncementHref(
        "demo-school",
        "my_school/tuition",
      ),
      "/school/demo-school/admin/my_school/tuition",
    );
  });

  it("merges org overrides on top of globals by announcement id", () => {
    const globals = [
      makeRecord({
        announcementId: "school-bulletin",
        title: "Global bulletin",
        organizationId: null,
      }),
      makeRecord({
        announcementId: "coop-supply-list",
        title: "Global supply list",
        organizationId: null,
      }),
    ];
    const overrides = [
      makeRecord({
        id: "override-1",
        organizationId: "org-1",
        announcementId: "school-bulletin",
        title: "Rooted Meadows bulletin",
      }),
      makeRecord({
        id: "override-2",
        organizationId: "org-1",
        announcementId: "custom-card",
        title: "School-only card",
      }),
    ];

    const merged = mergeAnnouncementRows(globals, overrides);
    const bulletin = merged.find((row) => row.announcementId === "school-bulletin");
    const custom = merged.find((row) => row.announcementId === "custom-card");

    assert.equal(merged.length, 3);
    assert.equal(bulletin?.title, "Rooted Meadows bulletin");
    assert.equal(custom?.title, "School-only card");
  });

  it("filters unpublished merged rows out of dashboard output", () => {
    const announcements = filterAnnouncements(
      [
        makeRecord({
          announcementId: "school-bulletin",
          title: "Hidden bulletin",
          published: false,
        }),
      ],
      "demo-school",
      ALL_FEATURES_ENABLED,
      { sinceDays: 14, now: SEP_10 },
    );

    assert.equal(announcements.length, 0);
  });

  it("uses isWithinSinceDays for date windows", () => {
    assert.equal(isWithinSinceDays("2026-09-04", 7, SEP_10), true);
    assert.equal(isWithinSinceDays("2026-08-20", 7, SEP_10), false);
  });
});
