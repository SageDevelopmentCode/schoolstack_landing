import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildFridayBranchClassRosterEmailHtml } from "@/lib/emails";

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
