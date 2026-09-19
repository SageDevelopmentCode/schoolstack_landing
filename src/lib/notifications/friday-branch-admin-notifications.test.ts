import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildFridayBranchEnrollmentAdminNotificationHtml } from "@/lib/emails";

describe("buildFridayBranchEnrollmentAdminNotificationHtml", () => {
  it("includes sign-up details and admin CTA", () => {
    const html = buildFridayBranchEnrollmentAdminNotificationHtml({
      schoolName: "Rooted Meadows Waldorf School",
      className: "Nature Journaling",
      slotTime: "9:00 AM",
      blockLabel: "Fall Block",
      blockDateRange: "Sep 5 – Nov 21",
      studentName: "Autumn Evensen",
      familyName: "Evensen Family",
      guardianName: "Holly Evensen",
      guardianEmail: "holly@example.com",
      statusLabel: "Signed up",
      submittedAtLabel: "September 17, 2026 at 3:15 PM",
      fridayBranchAdminUrl:
        "https://trymudkitchen.com/school/rooted-meadows/admin/my_school/friday_branch?class=class-1",
    });

    assert.match(html, /Program Sign-up/);
    assert.match(html, /Holly Evensen/);
    assert.match(html, /Autumn Evensen/);
    assert.match(html, /Nature Journaling/);
    assert.match(html, /9:00 AM/);
    assert.match(html, /Fall Block/);
    assert.match(html, /Signed up/);
    assert.match(html, /View Friday Branch/);
  });

  it("renders waitlisted status", () => {
    const html = buildFridayBranchEnrollmentAdminNotificationHtml({
      schoolName: "Rooted Meadows Waldorf School",
      className: "Woodworking",
      slotTime: "10:30 AM",
      blockLabel: "Fall Block",
      studentName: "River Calvert",
      familyName: "Calvert Family",
      guardianName: "Hayley Calvert",
      guardianEmail: "hayley@example.com",
      statusLabel: "Waitlisted",
      submittedAtLabel: "September 17, 2026 at 4:00 PM",
      fridayBranchAdminUrl:
        "https://trymudkitchen.com/school/rooted-meadows/admin/my_school/friday_branch?class=class-2",
    });

    assert.match(html, /Waitlisted/);
    assert.match(html, /River Calvert/);
  });
});
