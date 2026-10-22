import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { loadMobileParentPortalContextsForFamily } from "@/lib/parent-portal/resolve-coop-program-context";

describe("loadMobileParentPortalContextsForFamily", () => {
  it("is exported for family-scoped mobile portal context loading", () => {
    assert.equal(typeof loadMobileParentPortalContextsForFamily, "function");
  });
});
