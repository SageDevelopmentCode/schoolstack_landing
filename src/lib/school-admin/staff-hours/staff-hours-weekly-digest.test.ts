import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildStaffHoursWeeklyAdminDigestSubject,
  buildStaffHoursWeeklyAdminDigestHtml,
} from "@/lib/emails";
import {
  completedStaffWorkEntries,
  isSundayMorningWindow,
  sendStaffHoursWeeklyDigestForOrganization,
  weekRangeForStaffHoursWeeklyDigest,
} from "@/lib/school-admin/staff-hours/staff-hours-weekly-digest";
import type { StaffWorkTimeEntryRow } from "@/lib/school-teacher/my-hours/my-hours-db-types";
import { DEFAULT_FEATURES } from "@/lib/organization-settings/catalog";
import { getDefaultNotificationSettings } from "@/lib/notifications/org-notification-settings";

describe("isSundayMorningWindow", () => {
  it("is true Sunday 7am Denver", () => {
    const now = new Date("2026-03-08T14:00:00.000Z");
    assert.equal(isSundayMorningWindow("America/Denver", now), true);
  });

  it("is false on Monday morning", () => {
    const now = new Date("2026-03-09T14:00:00.000Z");
    assert.equal(isSundayMorningWindow("America/Denver", now), false);
  });
});

describe("weekRangeForStaffHoursWeeklyDigest", () => {
  it("covers Mon–Sat before the digest Sunday in org timezone", () => {
    const now = new Date("2026-03-08T14:00:00.000Z");
    const range = weekRangeForStaffHoursWeeklyDigest("America/Denver", now);
    assert.equal(range.from, "2026-03-02");
    assert.equal(range.to, "2026-03-07");
    assert.equal(range.weekEndKey, "2026-03-07");
    assert.match(range.weekLabel, /Mar 2, 2026/);
  });
});

describe("completedStaffWorkEntries", () => {
  it("drops open sessions", () => {
    const rows = [
      { id: "1", clock_out_at: "2026-03-03T17:00:00.000Z" },
      { id: "2", clock_out_at: null },
    ] as StaffWorkTimeEntryRow[];
    assert.deepEqual(
      completedStaffWorkEntries(rows).map((row) => row.id),
      ["1"],
    );
  });
});

describe("staff hours weekly digest email copy", () => {
  it("builds subject and html with staff and session sections", () => {
    const subject = buildStaffHoursWeeklyAdminDigestSubject({
      schoolName: "Rooted Meadows",
    });
    assert.equal(subject, "Staff hours last week — Rooted Meadows");

    const html = buildStaffHoursWeeklyAdminDigestHtml({
      schoolName: "Rooted Meadows",
      weekLabel: "Mar 2, 2026 – Mar 7, 2026",
      staffHoursAdminUrl: "https://trymudkitchen.com/school/rooted-meadows/admin/my_school/staff_hours",
      staffRows: [
        {
          staffName: "Alex Teacher",
          totalLabel: "8h 30m",
        },
      ],
      staffSessionGroups: [
        {
          staffName: "Alex Teacher",
          sessions: [
            {
              dateLabel: "Tuesday, March 3",
              timeLabel: "8:00 AM – 12:30 PM",
              durationLabel: "4h 30m",
            },
          ],
        },
      ],
    });
    assert.match(html, /Alex Teacher/);
    assert.match(html, /Tuesday, March 3/);
    assert.match(html, /8h 30m/);
    assert.doesNotMatch(html, /\d+ session/i);
    assert.match(html, /Completed sessions/);
    assert.match(html, /email-digest-section/);
    assert.match(html, /Open Staff hours/);
  });
});

describe("sendStaffHoursWeeklyDigestForOrganization", () => {
  it("skips outside the Sunday morning window", async () => {
    const notifications = {
      ...getDefaultNotificationSettings(),
      staff_hours_reminders: {},
    };
    const admin = {
      from(table: string) {
        const chain = {
          select() {
            return chain;
          },
          eq() {
            return chain;
          },
          gte() {
            return chain;
          },
          lte() {
            return chain;
          },
          order() {
            return chain;
          },
          is() {
            return chain;
          },
          maybeSingle: async () => {
            if (table === "organization_settings") {
              return {
                data: { features: DEFAULT_FEATURES, notifications },
                error: null,
              };
            }
            if (table === "organizations") {
              return { data: { name: "Test", slug: "test", timezone: "America/Denver" }, error: null };
            }
            return { data: null, error: null };
          },
        };
        return chain;
      },
    };

    const result = await sendStaffHoursWeeklyDigestForOrganization(
      admin as never,
      "org-1",
      {
        now: new Date("2026-03-09T14:00:00.000Z"),
        sendDigestEmail: async () => ({ ok: true }),
      },
    );

    assert.deepEqual(result, { weeklyDigestsSent: 0, failures: 0 });
  });
});
