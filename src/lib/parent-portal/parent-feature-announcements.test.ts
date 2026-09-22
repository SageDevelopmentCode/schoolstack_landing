import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { ParentFeatureAnnouncementRecord } from "@/lib/admin/parent-feature-announcements-storage";
import type { OrganizationFeatures } from "@/lib/organization-settings/types";
import {
  filterParentAnnouncements,
  getParentFeatureAnnouncements,
  mergeAnnouncementRows,
  resolveParentFeatureAnnouncementHref,
} from "./parent-feature-announcements";

const SEP_10 = new Date(2026, 8, 10);

const ALL_PARENT_FEATURES_ENABLED: OrganizationFeatures = {
  admin: {
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
  },
  teacher: {
    dashboard: true,
    my_students: true,
    classroom_signups: true,
    my_hours: true,
    messages: true,
    calendar: true,
    attendance: true,
    feed: true,
    payroll: true,
    forms_documents: true,
    committees: true,
  },
  parent: {
    portal: true,
    billing: true,
    messages: true,
    calendar: true,
    attendance: true,
    feed: true,
    children: true,
    committees: true,
    classroom_signups: true,
    forms_documents: true,
    curriculum: true,
    supply_list: true,
    teaching_schedule: true,
    friday_branch: true,
  },
};

function makeRecord(
  overrides: Partial<ParentFeatureAnnouncementRecord> &
    Pick<ParentFeatureAnnouncementRecord, "announcementId" | "title">,
): ParentFeatureAnnouncementRecord {
  return {
    id: overrides.id ?? overrides.announcementId,
    organizationId: overrides.organizationId ?? null,
    announcementId: overrides.announcementId,
    title: overrides.title,
    description: overrides.description ?? "Description",
    ctaLabel: overrides.ctaLabel ?? "View",
    featureKey: overrides.featureKey ?? "portal",
    hrefPath: overrides.hrefPath ?? "portal",
    portalScope: overrides.portalScope ?? "any",
    publishedAt: overrides.publishedAt ?? "2026-09-10",
    published: overrides.published ?? true,
    sortOrder: overrides.sortOrder ?? 0,
    createdAt: overrides.createdAt ?? "2026-09-10T00:00:00.000Z",
    updatedAt: overrides.updatedAt ?? "2026-09-10T00:00:00.000Z",
  };
}

function baseContext(overrides?: {
  coopModeEnabled?: boolean;
  bulletinEnabled?: boolean;
  programSlug?: string;
  parentNavBasePath?: string;
  previewBasePath?: string;
  features?: OrganizationFeatures;
}) {
  return {
    slug: "rooted-meadows-school",
    features: overrides?.features ?? ALL_PARENT_FEATURES_ENABLED,
    coopModeEnabled: overrides?.coopModeEnabled ?? false,
    bulletinEnabled: overrides?.bulletinEnabled ?? true,
    programSlug: overrides?.programSlug,
    parentNavBasePath: overrides?.parentNavBasePath,
    previewBasePath: overrides?.previewBasePath,
  };
}

describe("parent-feature-announcements", () => {
  it("returns static fallback announcements in the 14-day window", () => {
    const announcements = getParentFeatureAnnouncements(
      baseContext({ coopModeEnabled: true }),
      { sinceDays: 14, now: SEP_10 },
    );

    assert.equal(announcements.length, 12);
    assert.equal(announcements[0]?.id, "activity-notifications");
  });

  it("filters coop-only cards on the main school portal", () => {
    const announcements = getParentFeatureAnnouncements(baseContext(), {
      sinceDays: 14,
      now: SEP_10,
    });

    const ids = announcements.map((announcement) => announcement.id);
    assert.equal(ids.includes("coop-supply-list"), false);
    assert.equal(ids.includes("how-to-guides"), true);
    assert.equal(ids.includes("school-bulletin-home"), true);
  });

  it("shows coop-only cards on the co-op program portal", () => {
    const announcements = getParentFeatureAnnouncements(
      baseContext({ coopModeEnabled: true }),
      { sinceDays: 14, now: SEP_10 },
    );

    const ids = announcements.map((announcement) => announcement.id);
    assert.equal(ids.includes("coop-supply-list"), true);
    assert.equal(ids.includes("program-parent-portal"), true);
  });

  it("hides cards when the parent feature is disabled", () => {
    const features: OrganizationFeatures = {
      ...ALL_PARENT_FEATURES_ENABLED,
      parent: {
        ...ALL_PARENT_FEATURES_ENABLED.parent,
        supply_list: false,
      },
    };

    const announcements = filterParentAnnouncements(
      [
        makeRecord({
          announcementId: "coop-supply-list",
          title: "Supply list",
          featureKey: "supply_list",
          portalScope: "coop",
        }),
      ],
      baseContext({ coopModeEnabled: true, features }),
      { sinceDays: 14, now: SEP_10 },
    );

    assert.equal(announcements.length, 0);
  });

  it("gates bulletin cards via bulletinEnabled", () => {
    const announcements = filterParentAnnouncements(
      [
        makeRecord({
          announcementId: "school-bulletin-home",
          title: "Bulletin",
          featureKey: "bulletin",
        }),
      ],
      baseContext({ bulletinEnabled: false }),
      { sinceDays: 14, now: SEP_10 },
    );

    assert.equal(announcements.length, 0);
  });

  it("org override replaces the global card", () => {
    const globals = [
      makeRecord({
        announcementId: "how-to-guides",
        title: "Global title",
      }),
    ];
    const overrides = [
      makeRecord({
        id: "override-row",
        organizationId: "org-1",
        announcementId: "how-to-guides",
        title: "School title",
      }),
    ];

    const merged = mergeAnnouncementRows(globals, overrides);
    assert.equal(merged.length, 1);
    assert.equal(merged[0]?.title, "School title");
  });

  it("resolves school parent hrefs", () => {
    const href = resolveParentFeatureAnnouncementHref(
      baseContext(),
      "documentation",
    );

    assert.equal(
      href,
      "/school/rooted-meadows-school/parent/documentation",
    );
  });

  it("resolves program parent hrefs", () => {
    const href = resolveParentFeatureAnnouncementHref(
      baseContext({ coopModeEnabled: true, programSlug: "co-op" }),
      "curriculum",
    );

    assert.equal(
      href,
      "/school/rooted-meadows-school/parent/p/co-op/curriculum",
    );
  });

  it("resolves preview parent hrefs", () => {
    const href = resolveParentFeatureAnnouncementHref(
      baseContext({
        previewBasePath: "/admin/preview/rooted-meadows-school/family/fam-1",
      }),
      "documentation",
    );

    assert.equal(
      href,
      "/admin/preview/rooted-meadows-school/family/fam-1/parent/documentation",
    );
  });
});
