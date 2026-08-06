import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  detectPortalFromPathname,
  shouldShowPortalSwitcher,
  type SchoolPortalOption,
} from "./portal-switcher-types";

describe("detectPortalFromPathname", () => {
  it("detects admin portal paths", () => {
    assert.equal(
      detectPortalFromPathname("/school/rooted-meadows/admin/admissions", "rooted-meadows"),
      "admin",
    );
  });

  it("detects parent portal paths", () => {
    assert.equal(
      detectPortalFromPathname("/school/rooted-meadows/parent/billing", "rooted-meadows"),
      "family_parent",
    );
  });

  it("treats apply paths as family apply portal", () => {
    assert.equal(
      detectPortalFromPathname("/school/rooted-meadows/apply", "rooted-meadows"),
      "family_apply",
    );
    assert.equal(
      detectPortalFromPathname(
        "/school/rooted-meadows/apply/app-id/enrollment",
        "rooted-meadows",
      ),
      "family_apply",
    );
  });

  it("detects preview admin paths", () => {
    assert.equal(
      detectPortalFromPathname(
        "/admin/preview/rooted-meadows/admin/admissions",
        "rooted-meadows",
      ),
      "admin",
    );
  });

  it("detects preview family apply paths", () => {
    assert.equal(
      detectPortalFromPathname(
        "/admin/preview/rooted-meadows/family/abc123",
        "rooted-meadows",
      ),
      "family_apply",
    );
  });

  it("detects preview parent paths", () => {
    assert.equal(
      detectPortalFromPathname(
        "/admin/preview/rooted-meadows/family/abc123/parent/billing",
        "rooted-meadows",
      ),
      "family_parent",
    );
  });
});

describe("shouldShowPortalSwitcher", () => {
  it("shows when user has admin and family access", () => {
    const options: SchoolPortalOption[] = [
      { id: "admin", label: "School admin", href: "/school/rooted-meadows/admin" },
      { id: "family_apply", label: "My applications", href: "/school/rooted-meadows/apply" },
    ];

    assert.equal(shouldShowPortalSwitcher(options), true);
  });

  it("shows when user has teacher and family access", () => {
    const options: SchoolPortalOption[] = [
      { id: "teacher", label: "Staff portal", href: "/school/rooted-meadows/teacher" },
      { id: "family_apply", label: "My applications", href: "/school/rooted-meadows/apply" },
      { id: "family_parent", label: "Parent portal", href: "/school/rooted-meadows/parent" },
    ];

    assert.equal(shouldShowPortalSwitcher(options), true);
  });

  it("hides for family-only apply and parent portals", () => {
    assert.equal(
      shouldShowPortalSwitcher([
        { id: "family_apply", label: "My applications", href: "/school/rooted-meadows/apply" },
        { id: "family_parent", label: "Parent portal", href: "/school/rooted-meadows/parent" },
      ]),
      false,
    );
  });

  it("hides when only one portal is available", () => {
    assert.equal(
      shouldShowPortalSwitcher([
        { id: "admin", label: "School admin", href: "/school/rooted-meadows/admin" },
      ]),
      false,
    );
  });
});
