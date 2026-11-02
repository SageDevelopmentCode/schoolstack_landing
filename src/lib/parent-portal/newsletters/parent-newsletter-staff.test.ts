import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { NewsletterEdition } from "@/lib/school-admin/newsletter/newsletter-types";
import type { StaffMemberRecord } from "@/lib/staff/staff-members";
import {
  sanitizeNewsletterEditionForParent,
  staffMembersForPublishedUpdates,
} from "./parent-newsletter-staff";

function staff(id: string, firstName: string, lastName: string): StaffMemberRecord {
  return {
    id,
    organizationId: "org-1",
    userId: "user-secret",
    firstName,
    lastName,
    email: "secret@school.example",
    roleTitle: "Lead Guide",
    employmentStatus: "active",
    portalRole: "teacher",
    membershipStatus: "active",
    isLinked: true,
    profilePhotoUrl: null,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  };
}

function edition(teacherUpdates: Record<string, string>): NewsletterEdition {
  return {
    id: "ed-1",
    title: "Week note",
    week: "2026-02-02",
    status: "published",
    layout: "storybook",
    storyBlocks: [],
    sections: { events: false, reminders: false, photos: false, teacherUpdates: true },
    teacherUpdates,
    events: [],
    reminders: [],
    photos: [],
  };
}

describe("staffMembersForPublishedUpdates", () => {
  it("returns empty when roster is empty", () => {
    const result = staffMembersForPublishedUpdates(
      edition({ "staff-a": "Hello families" }),
      [],
    );
    assert.deepEqual(result, []);
  });

  it("excludes staff with no update entry", () => {
    const roster = [staff("staff-a", "Ada", "Lovelace"), staff("staff-b", "Grace", "Hopper")];
    const result = staffMembersForPublishedUpdates(edition({ "staff-a": "Update text" }), roster);
    assert.deepEqual(result, [{ id: "staff-a", firstName: "Ada", lastName: "Lovelace" }]);
  });

  it("excludes whitespace-only updates", () => {
    const roster = [staff("staff-a", "Ada", "Lovelace")];
    const result = staffMembersForPublishedUpdates(edition({ "staff-a": "   \n  " }), roster);
    assert.deepEqual(result, []);
  });

  it("returns multiple staff with published text and omits sensitive fields", () => {
    const roster = [
      staff("staff-a", "Ada", "Lovelace"),
      staff("staff-b", "Grace", "Hopper"),
    ];
    const result = staffMembersForPublishedUpdates(
      edition({ "staff-a": "A note", "staff-b": "Another note" }),
      roster,
    );
    assert.equal(result.length, 2);
    for (const row of result) {
      assert.ok("id" in row && "firstName" in row && "lastName" in row);
      assert.equal("email" in row, false);
    }
  });
});

describe("sanitizeNewsletterEditionForParent", () => {
  it("keeps only non-empty teacherUpdates", () => {
    const input = edition({
      "staff-a": "Published",
      "staff-b": "",
      "staff-c": "  ",
      "staff-d": "Also published",
    });
    const sanitized = sanitizeNewsletterEditionForParent(input);
    assert.deepEqual(sanitized.teacherUpdates, {
      "staff-a": "Published",
      "staff-d": "Also published",
    });
    assert.notEqual(sanitized, input);
  });
});
