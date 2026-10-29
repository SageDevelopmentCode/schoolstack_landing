import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { DEFAULT_FEATURES } from "./catalog";
import { adminNavItemMatchesPath, buildAdminNavGroups } from "./admin-nav";

const SLUG = "rooted-meadows";

function findNavItem(featureKey: string) {
  const groups = buildAdminNavGroups(DEFAULT_FEATURES.admin, undefined);
  for (const group of groups) {
    const item = group.items.find((entry) => entry.key === featureKey);
    if (item) return item;
  }
  return undefined;
}

describe("adminNavItemMatchesPath", () => {
  it("matches Communication but not My School on cross-feature newsletters URL", () => {
    const pathname = `/school/${SLUG}/admin/my_school/newsletters`;
    const mySchool = findNavItem("my_school");
    const communication = findNavItem("communication");
    assert.ok(mySchool);
    assert.ok(communication);

    assert.equal(
      adminNavItemMatchesPath(SLUG, pathname, communication),
      true,
    );
    assert.equal(adminNavItemMatchesPath(SLUG, pathname, mySchool), false);
  });

  it("matches My School on a native my_school subtab", () => {
    const pathname = `/school/${SLUG}/admin/my_school/students`;
    const mySchool = findNavItem("my_school");
    assert.ok(mySchool);
    assert.equal(adminNavItemMatchesPath(SLUG, pathname, mySchool), true);
  });

  it("matches My School on the feature root only", () => {
    const pathname = `/school/${SLUG}/admin/my_school`;
    const mySchool = findNavItem("my_school");
    assert.ok(mySchool);
    assert.equal(adminNavItemMatchesPath(SLUG, pathname, mySchool), true);
  });
});
