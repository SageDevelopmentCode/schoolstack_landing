import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildSchoolVisitEmailDetailRows,
  formatCampusMailingAddress,
} from "./school-visit-email-details";
import {
  getDefaultOrganizationSchoolProfile,
  getDefaultPrimaryCampus,
} from "./school-profile";

describe("school visit email details", () => {
  it("returns no rows for empty default bundle", () => {
    const orgId = "org-1";
    const rows = buildSchoolVisitEmailDetailRows({
      profile: getDefaultOrganizationSchoolProfile(),
      primaryCampus: getDefaultPrimaryCampus(orgId),
    });
    assert.deepEqual(rows, []);
  });

  it("formats a partial US address without country line", () => {
    const orgId = "org-1";
    const formatted = formatCampusMailingAddress({
      profile: getDefaultOrganizationSchoolProfile(),
      primaryCampus: {
        ...getDefaultPrimaryCampus(orgId),
        address_line1: "123 Oak St",
        city: "Austin",
        state_region: "TX",
        postal_code: "78701",
      },
    });
    assert.equal(formatted, "123 Oak St, Austin, TX 78701");
  });

  it("includes campus name, contact fields, and notes when set", () => {
    const orgId = "org-1";
    const rows = buildSchoolVisitEmailDetailRows({
      profile: {
        ...getDefaultOrganizationSchoolProfile(),
        website_url: "https://school.example",
        emergency_line: "555-9999",
      },
      primaryCampus: {
        ...getDefaultPrimaryCampus(orgId),
        name: "Hilltop Campus",
        address_line1: "1 School Rd",
        phones: [{ label: "Admissions", number: "555-1000", is_primary: true }],
        emails: [{ label: "Office", email: "hello@school.example", is_primary: true }],
        directions_notes: "Enter at the main gate.",
      },
    });

    assert.deepEqual(
      rows.map((r) => r.label),
      [
        "Campus",
        "Location",
        "Phone",
        "Email",
        "Website",
        "Directions",
        "Emergency line",
      ],
    );
    assert.equal(rows.find((r) => r.label === "Phone")?.value, "Admissions: 555-1000");
    const location = rows.find((r) => r.label === "Location");
    assert.equal(location?.value, "1 School Rd");
    assert.ok(location?.valueHtml?.includes("google.com/maps"));
    assert.ok(location?.valueHtml?.includes("maps.apple.com"));
  });
});
