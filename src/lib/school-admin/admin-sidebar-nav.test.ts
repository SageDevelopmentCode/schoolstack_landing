import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildAdminNavGroups } from "@/lib/organization-settings/admin-nav";
import { DEFAULT_FEATURES } from "@/lib/organization-settings/catalog";
import {
  adminNavChildBadge,
  adminNavItemBadge,
  adminNavItemHref,
  adminNavTotalBadge,
  flattenAdminNavForSearch,
  isAdminChildPathActive,
  isAdminNavItemLocked,
  searchAdminNav,
} from "./admin-sidebar-nav";

const slug = "rooted";
const groups = buildAdminNavGroups(DEFAULT_FEATURES.admin);
const items = groups.flatMap((group) => group.items);
const mySchool = items.find((item) => item.key === "my_school")!;
const communication = items.find((item) => item.key === "communication")!;
const staffHours = mySchool.children!.find((child) => child.key === "staff_hours")!;
const admissions = items.find((item) => item.key === "admissions")!;
const counts = { messagesUnread: 3, staffHoursPending: 6, applicationsToReview: 4, committeeJoinRequests: 2 };

describe("admin sidebar badges", () => {
  it("puts the pending count on Staff hours only", () => {
    assert.deepEqual(adminNavChildBadge("my_school", staffHours, counts), {
      count: 6,
      label: "6 hour requests waiting",
    });
    const staff = mySchool.children!.find((child) => child.key === "staff")!;
    assert.equal(adminNavChildBadge("my_school", staff, counts), null);
  });

  it("hides the badge when nothing is waiting", () => {
    assert.equal(
      adminNavChildBadge("my_school", staffHours, { ...counts, staffHoursPending: 0 }),
      null,
    );
  });

  it("badges submissions and committee join requests", () => {
    const submissions = admissions.children!.find((child) => child.key === "submissions")!;
    const programs = admissions.children!.find((child) => child.key === "programs")!;
    const committees = communication.children!.find((child) => child.key === "committees")!;
    assert.deepEqual(adminNavChildBadge("admissions", submissions, counts), {
      count: 4,
      label: "4 applications to review",
    });
    assert.equal(adminNavChildBadge("admissions", programs, counts), null);
    assert.deepEqual(adminNavChildBadge("communication", committees, counts), {
      count: 2,
      label: "2 join requests waiting",
    });
    assert.equal(
      adminNavChildBadge("communication", committees, { ...counts, committeeJoinRequests: 1 })?.label,
      "1 join request waiting",
    );
  });

  it("badges a root-level Committees item", () => {
    const rootCommittees = { key: "committees", name: "Committees", icon: mySchool.icon };
    assert.equal(adminNavItemBadge(rootCommittees, counts)?.count, 2);
  });

  it("totals every badge for the phone menu button", () => {
    assert.deepEqual(adminNavTotalBadge(groups, counts), {
      count: 15,
      label: "15 things waiting for you",
    });
    assert.equal(
      adminNavTotalBadge(groups, { messagesUnread: 0, staffHoursPending: 0, applicationsToReview: 0, committeeJoinRequests: 0 }),
      null,
    );
  });

  it("rolls child counts up to the group", () => {
    assert.equal(adminNavItemBadge(mySchool, counts)?.count, 6);
    assert.equal(adminNavItemBadge(admissions, counts)?.count, 4);
    assert.equal(adminNavItemBadge(communication, counts)?.count, 5);
    assert.equal(adminNavItemBadge(mySchool, { ...counts, staffHoursPending: 0 }), null);
  });

  it("drops badges on locked free-plan rows", () => {
    assert.equal(adminNavChildBadge("my_school", staffHours, counts, true), null);
    assert.equal(adminNavItemBadge(mySchool, counts, true), null);
  });
});

describe("admin sidebar links and locks", () => {
  it("detects the active child from the pathname", () => {
    const href = `/school/${slug}/admin/my_school/staff_hours`;
    assert.equal(isAdminChildPathActive(slug, href, "my_school", staffHours), true);
    assert.equal(isAdminChildPathActive(slug, `${href}/x`, "my_school", staffHours), true);
    assert.equal(
      isAdminChildPathActive(slug, `/school/${slug}/admin/my_school/staff`, "my_school", staffHours),
      false,
    );
  });

  it("links a group to its first child, or first open child on the free plan", () => {
    assert.equal(adminNavItemHref(slug, mySchool, false), `/school/${slug}/admin/my_school/school_profile`);
    assert.equal(adminNavItemHref(slug, communication, true), `/school/${slug}/admin/my_school/newsletters`);
  });

  it("locks groups with no open child on the free plan", () => {
    assert.equal(isAdminNavItemLocked(mySchool, true), true);
    assert.equal(isAdminNavItemLocked(communication, true), false);
    assert.equal(isAdminNavItemLocked(mySchool, false), false);
  });
});

describe("find a page", () => {
  const entries = flattenAdminNavForSearch(slug, groups, { counts });

  it("indexes every leaf with its trail and badge", () => {
    const entry = entries.find((row) => row.key === "my_school:staff_hours")!;
    assert.equal(entry.trail, "My School");
    assert.equal(entry.href, `/school/${slug}/admin/my_school/staff_hours`);
    assert.equal(entry.badge?.count, 6);
    assert.equal(entries.find((row) => row.key === "dashboard")?.trail, "Workspace");
    assert.equal(entries.some((row) => row.key === "home"), false);
  });

  it("adds Home and locks paid pages on the free plan", () => {
    const free = flattenAdminNavForSearch(slug, groups, { counts, lockedMode: true, includeHome: true });
    assert.equal(free[0].key, "home");
    assert.equal(free.find((row) => row.key === "my_school:staff_hours")?.locked, true);
    assert.equal(free.find((row) => row.key === "communication:newsletters")?.locked, false);
  });

  it("ranks label matches first and matches the trail", () => {
    assert.equal(searchAdminNav(entries, "staff")[0].label, "Staff");
    assert.deepEqual(
      searchAdminNav(entries, "hours").map((row) => row.label),
      ["Staff hours"],
    );
    assert.ok(searchAdminNav(entries, "my school").length >= 9);
    assert.equal(searchAdminNav(entries, "forms & doc")[0]?.label, "Forms & documents");
    assert.deepEqual(searchAdminNav(entries, "zzz"), []);
    assert.deepEqual(searchAdminNav(entries, "   "), []);
  });
});
