import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { DEFAULT_BRANDING, DEFAULT_FEATURES } from "@/lib/organization-settings/catalog";
import type { OrganizationWithSettings } from "@/lib/organization-settings/fetch";
import { mapPortalOptionToTeacherPreview } from "@/lib/staff/staff-preview-portal-options";

const minimalOrg: OrganizationWithSettings = {
  id: "org-1",
  slug: "demo",
  name: "Demo School",
  branding: DEFAULT_BRANDING,
  features: DEFAULT_FEATURES,
};

describe("mapPortalOptionToTeacherPreview", () => {
  it("rewrites teacher portal href to staff preview base", () => {
    const result = mapPortalOptionToTeacherPreview(
      {
        id: "teacher",
        label: "Staff portal",
        href: "/school/demo/teacher",
      },
      "demo",
      "staff-1",
      null,
      minimalOrg,
    );

    assert.ok(result);
    assert.match(result.href, /^\/admin\/preview\/demo\/teacher\/staff-1/);
  });

  it("omits family portals when familyId is missing", () => {
    assert.equal(
      mapPortalOptionToTeacherPreview(
        {
          id: "family_parent",
          label: "Parent portal",
          href: "/school/demo/parent",
        },
        "demo",
        "staff-1",
        null,
        minimalOrg,
      ),
      null,
    );
  });

  it("rewrites parent portal when familyId is present", () => {
    const result = mapPortalOptionToTeacherPreview(
      {
        id: "family_parent",
        label: "Parent portal",
        href: "/school/demo/parent",
      },
      "demo",
      "staff-1",
      "family-abc",
      minimalOrg,
    );

    assert.ok(result);
    assert.match(
      result.href,
      /^\/admin\/preview\/demo\/family\/family-abc\/parent/,
    );
  });
});
