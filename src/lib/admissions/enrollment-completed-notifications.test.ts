import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildEnrollmentCompletedConfirmationHtml } from "@/lib/emails";

const basePayload = {
  name: "Rachael Sparhawk",
  schoolName: "Rooted Meadows",
  studentName: "Olivia Sparhawk",
  programName: "Grade 1",
};

describe("buildEnrollmentCompletedConfirmationHtml", () => {
  it("uses parent portal CTA when parent portal is enabled", () => {
    const html = buildEnrollmentCompletedConfirmationHtml({
      ...basePayload,
      parentPortalEnabled: true,
      parentPortalUrl:
        "https://example.com/school/rooted-meadows/parent/portal",
    });

    assert.match(html, /Enrollment Confirmed/);
    assert.match(html, /Welcome, Rachael/);
    assert.match(html, /Olivia Sparhawk/);
    assert.match(html, /Rooted Meadows/);
    assert.match(html, /Grade 1/);
    assert.match(html, /Open parent portal/);
    assert.match(
      html,
      /https:\/\/example\.com\/school\/rooted-meadows\/parent\/portal/,
    );
    assert.match(html, /notification settings/);
    assert.doesNotMatch(html, /View apply dashboard/);
  });

  it("falls back to apply dashboard CTA when parent portal is disabled", () => {
    const html = buildEnrollmentCompletedConfirmationHtml({
      ...basePayload,
      programName: undefined,
      parentPortalEnabled: false,
      parentPortalUrl: "https://example.com/school/rooted-meadows/apply",
    });

    assert.match(html, /View apply dashboard/);
    assert.match(html, /apply dashboard/);
    assert.match(html, /https:\/\/example\.com\/school\/rooted-meadows\/apply/);
    assert.doesNotMatch(html, /Open parent portal/);
    assert.doesNotMatch(html, />Program</);
  });
});
