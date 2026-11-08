import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { DEFAULT_FEATURES } from "@/lib/organization-settings/catalog";
import { buildAdminDocumentationGuides } from "./admin-documentation";

describe("buildAdminDocumentationGuides", () => {
  it("keeps the setup guide for a custom plan", () => {
    const guides = buildAdminDocumentationGuides(
      "school",
      DEFAULT_FEATURES,
      "custom",
    );
    assert.ok(guides.some((guide) => guide.id === "complete-setup-checklist"));
    assert.ok(guides.some((guide) => guide.id === "create-programs"));
  });

  it("drops unscoped and admissions guides for a free plan", () => {
    const guides = buildAdminDocumentationGuides(
      "school",
      DEFAULT_FEATURES,
      "free",
    );
    assert.equal(
      guides.some((guide) => guide.id === "complete-setup-checklist"),
      false,
    );
    assert.equal(guides.some((guide) => guide.id === "create-programs"), false);
  });
});
