import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isSchoolProfileSectionLoading } from "@/components/school-admin/school-profile/school-profile-sections";
import {
  getDefaultFeatureChildren,
  mergePortalFeatureNav,
} from "@/lib/organization-settings/feature-nav";
import {
  getDefaultOrganizationSchoolProfile,
  getDefaultPrimaryCampus,
  isSchoolProfileBundleDirty,
  parseOrganizationSchoolProfile,
  parseSchoolProfileEmails,
  parseSchoolProfilePhones,
  parseSchoolProfilePatch,
} from "./school-profile";

describe("school profile parsers", () => {
  it("parses org profile and normalizes empty strings", () => {
    const parsed = parseOrganizationSchoolProfile({
      website_url: "  https://school.example  ",
      about: "",
      emergency_line: "555-0100",
      social_links: { instagram: " https://instagram.com/school " },
    });
    assert.equal(parsed.website_url, "https://school.example");
    assert.equal(parsed.about, null);
    assert.equal(parsed.emergency_line, "555-0100");
    assert.equal(parsed.social_links.instagram, "https://instagram.com/school");
  });

  it("normalizes phones and picks a single primary", () => {
    const phones = parseSchoolProfilePhones([
      { label: "Office", number: "555-1000", is_primary: false },
      { label: "Admissions", number: "555-2000", is_primary: true },
    ]);
    assert.equal(phones.length, 2);
    assert.equal(phones.find((p) => p.is_primary)?.number, "555-2000");
  });

  it("drops blank phone rows and lowercases emails", () => {
    const phones = parseSchoolProfilePhones([
      { label: "Empty", number: "  ", is_primary: true },
      { label: "Main", number: "555-3000", is_primary: false },
    ]);
    assert.deepEqual(phones, [
      { label: "Main", number: "555-3000", is_primary: true },
    ]);

    const emails = parseSchoolProfileEmails([
      { label: "Info", email: " Hello@School.org ", is_primary: true },
    ]);
    assert.equal(emails[0]?.email, "hello@school.org");
  });

  it("parses patch payload for save", () => {
    const patch = parseSchoolProfilePatch("org-1", {
      organizationId: "org-1",
      profile: { website_url: "https://x.test" },
      primaryCampus: {
        name: "Main campus",
        address_line1: "123 Oak St",
        phones: [{ label: "Office", number: "555-0000", is_primary: true }],
        emails: [],
      },
    });
    assert.ok(patch);
    assert.equal(patch?.profile.website_url, "https://x.test");
    assert.equal(patch?.primaryCampus.address_line1, "123 Oak St");
    assert.equal(patch?.primaryCampus.is_primary, true);
  });
});

describe("school profile bundle dirty state", () => {
  it("returns false when saved and current bundles match", () => {
    const orgId = "org-1";
    const bundle = {
      profile: getDefaultOrganizationSchoolProfile(),
      primaryCampus: getDefaultPrimaryCampus(orgId),
    };
    assert.equal(isSchoolProfileBundleDirty(bundle, bundle), false);
  });

  it("returns true when campus phone label changes", () => {
    const orgId = "org-1";
    const saved = {
      profile: getDefaultOrganizationSchoolProfile(),
      primaryCampus: {
        ...getDefaultPrimaryCampus(orgId),
        phones: [{ label: "Office", number: "555-0100", is_primary: true }],
      },
    };
    const current = {
      ...saved,
      primaryCampus: {
        ...saved.primaryCampus,
        phones: [{ label: "Main office", number: "555-0100", is_primary: true }],
      },
    };
    assert.equal(isSchoolProfileBundleDirty(current, saved), true);
  });
});

describe("school profile section loading", () => {
  it("marks a section loading when pending or in flight", () => {
    assert.equal(
      isSchoolProfileSectionLoading("campus", "campus", null),
      true,
    );
    assert.equal(
      isSchoolProfileSectionLoading("campus", null, "campus"),
      true,
    );
    assert.equal(
      isSchoolProfileSectionLoading("campus", "about", null),
      false,
    );
  });
});

describe("school profile nav defaults", () => {
  it("includes school_profile as first My School sub-tab", () => {
    const children = getDefaultFeatureChildren("my_school");
    assert.equal(children[0]?.key, "school_profile");
    assert.equal(children[0]?.label, "School profile");
  });

  it("merges school_profile into stored nav that predates the tab", () => {
    const merged = mergePortalFeatureNav("admin", {
      groups: ["Main"],
      items: {
        my_school: {
          group: "Main",
          icon: "school",
          children: [{ key: "students", label: "My Students", icon: "users" }],
        },
      },
      order: ["my_school"],
    });
    const keys =
      merged.items.my_school?.children?.map((child) => child.key) ?? [];
    assert.ok(keys.includes("school_profile"));
    assert.equal(keys[0], "students");
    assert.equal(keys[1], "school_profile");
  });
});
