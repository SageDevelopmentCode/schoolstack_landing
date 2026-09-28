import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { formatCampusTourBookingSourceLabel } from "./discord";
import { formatPublicTourChildrenSummary } from "@/lib/admissions/application-notifications";

describe("formatCampusTourBookingSourceLabel", () => {
  it("maps booking sources to display labels", () => {
    assert.equal(formatCampusTourBookingSourceLabel("public"), "Public");
    assert.equal(
      formatCampusTourBookingSourceLabel("pre_application"),
      "Pre-application",
    );
    assert.equal(formatCampusTourBookingSourceLabel("post_submit"), "Post-submit");
  });
});

describe("formatPublicTourChildrenSummary", () => {
  it("joins child names from registrant answers", () => {
    const summary = formatPublicTourChildrenSummary({
      children: [{ name: "Ava Lee" }, { name: "Noah Lee" }],
    });
    assert.equal(summary, "Ava Lee, Noah Lee");
  });

  it("returns undefined when children are missing", () => {
    assert.equal(formatPublicTourChildrenSummary({}), undefined);
  });
});
