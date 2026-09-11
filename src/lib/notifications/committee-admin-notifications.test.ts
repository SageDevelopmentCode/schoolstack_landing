import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildCommitteeJoinRequestAdminNotificationHtml } from "@/lib/emails";

describe("buildCommitteeJoinRequestAdminNotificationHtml", () => {
  it("includes request details and admin CTA", () => {
    const html = buildCommitteeJoinRequestAdminNotificationHtml({
      schoolName: "Rooted Meadows Waldorf School",
      committeeName: "Farm Connection & Development Committee",
      guardianName: "Holly Evensen",
      guardianEmail: "holly@example.com",
      preferredDutyRoleTitle: "Community Outreach Lead",
      grade: "3rd",
      note: "Farm to table nutritionist",
      submittedAtLabel: "September 10, 2026 at 3:15 PM",
      committeesAdminUrl:
        "https://trymudkitchen.com/school/rooted-meadows/admin/committees",
    });

    assert.match(html, /Committee Join Request/);
    assert.match(html, /Holly Evensen/);
    assert.match(html, /Farm Connection/);
    assert.match(html, /Community Outreach Lead/);
    assert.match(html, /Review request/);
  });

  it("omits optional fields when not provided", () => {
    const html = buildCommitteeJoinRequestAdminNotificationHtml({
      schoolName: "Rooted Meadows Waldorf School",
      committeeName: "Festival Committee",
      guardianName: "Hayley Calvert",
      guardianEmail: "hayley@example.com",
      submittedAtLabel: "September 10, 2026 at 3:15 PM",
      committeesAdminUrl:
        "https://trymudkitchen.com/school/rooted-meadows/admin/committees",
    });

    assert.match(html, /Hayley Calvert/);
    assert.match(html, /Festival Committee/);
    assert.doesNotMatch(html, /Preferred role/);
    assert.doesNotMatch(html, /Grade/);
    assert.doesNotMatch(html, /Note/);
  });
});
