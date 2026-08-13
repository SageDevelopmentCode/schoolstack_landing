import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { PRE_APPLICATION_CAMPUS_TOUR_ACTION_ID } from "@/lib/organization-settings/apply-auth-entry";
import { mergeApplyAuthEntry } from "@/lib/organization-settings/apply-auth-entry";

describe("mergeApplyAuthEntry", () => {
  it("defaults tour option to disabled", () => {
    const merged = mergeApplyAuthEntry(null);
    const tour = merged.options.find((option) => option.type === "schedule_campus_tour");
    assert.ok(tour);
    assert.equal(tour.enabled, false);
  });

  it("preserves enabled tour customization", () => {
    const merged = mergeApplyAuthEntry({
      options: [
        {
          id: "schedule_campus_tour",
          type: "schedule_campus_tour",
          enabled: true,
          label: "Book a tour",
          description: "Meet our team",
        },
      ],
    });
    const tour = merged.options.find((option) => option.type === "schedule_campus_tour");
    assert.ok(tour);
    assert.equal(tour.enabled, true);
    assert.equal(tour.label, "Book a tour");
    assert.equal(tour.description, "Meet our team");
  });
});

describe("PRE_APPLICATION_CAMPUS_TOUR_ACTION_ID", () => {
  it("is stable for family-level visits", () => {
    assert.equal(
      PRE_APPLICATION_CAMPUS_TOUR_ACTION_ID,
      "pre_application:schedule_campus_tour",
    );
  });
});
