import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildFridayBranchClassRosterEmailPreview,
  buildFridayBranchClassRosterEmailSubject,
} from "@/lib/friday-branch/friday-branch-roster-email";
import type { FridayBranchClassRosterForEmail } from "@/lib/school-admin/friday-branch/friday-branch-types";
import { buildFridayBranchClassRosterEmailHtml } from "@/lib/emails";

const sampleRoster: FridayBranchClassRosterForEmail = {
  schoolName: "Rooted Meadows Waldorf School",
  className: "Nature Journaling",
  slotTime: "9:00 AM",
  location: "The Meadow",
  ageGroup: "K–3",
  teacher: "Ms. Rivera",
  blockLabel: "Fall Block",
  blockDateRange: "Sep 5 – Nov 21",
  rows: [
    {
      studentName: "Autumn Evensen",
      familyName: "Evensen Family",
      grade: "3rd",
      status: "confirmed",
      familyEmail: "holly@example.com",
      familyPhone: "(555) 555-0101",
    },
  ],
};

describe("buildFridayBranchClassRosterEmailHtml", () => {
  it("includes class details and roster rows", () => {
    const html = buildFridayBranchClassRosterEmailHtml({
      schoolName: "Rooted Meadows Waldorf School",
      className: "Nature Journaling",
      slotTime: "9:00 AM",
      location: "The Meadow",
      ageGroup: "K–3",
      teacher: "Ms. Rivera",
      blockLabel: "Fall Block",
      blockDateRange: "Sep 5 – Nov 21",
      sentAtLabel: "September 18, 2026 at 3:15 PM",
      rows: [
        {
          studentName: "Autumn Evensen",
          familyName: "Evensen Family",
          grade: "3rd",
          statusLabel: "Signed up",
          familyEmail: "holly@example.com",
          familyPhone: "(555) 555-0101",
        },
        {
          studentName: "River Calvert",
          familyName: "Calvert Family",
          grade: "2nd",
          statusLabel: "Waitlisted",
          familyEmail: "hayley@example.com",
          familyPhone: "—",
        },
      ],
    });

    assert.match(html, /Class Roster/);
    assert.match(html, /Nature Journaling/);
    assert.match(html, /The Meadow/);
    assert.match(html, /Autumn Evensen/);
    assert.match(html, /holly@example.com/);
    assert.match(html, /Waitlisted/);
    assert.match(html, /River Calvert/);
  });
});

describe("buildFridayBranchClassRosterEmailPreview", () => {
  it("returns subject and html with roster rows", () => {
    const preview = buildFridayBranchClassRosterEmailPreview(
      sampleRoster,
      new Date("2026-09-18T20:15:00.000Z"),
    );

    assert.equal(
      buildFridayBranchClassRosterEmailSubject("Nature Journaling", "9:00 AM"),
      "Friday Branch roster — Nature Journaling (9:00 AM)",
    );
    assert.equal(
      preview.subject,
      "Friday Branch roster — Nature Journaling (9:00 AM)",
    );
    assert.match(preview.html, /Class Roster/);
    assert.match(preview.html, /Autumn Evensen/);
    assert.match(preview.html, /holly@example.com/);
    assert.match(preview.html, /content="light"/);
    assert.match(preview.html, /background-color:\s*#ffffff/i);
  });

  it("returns empty roster copy when no students are signed up", () => {
    const preview = buildFridayBranchClassRosterEmailPreview({
      ...sampleRoster,
      rows: [],
    });

    assert.match(preview.html, /No students are signed up for this class yet/);
  });
});
