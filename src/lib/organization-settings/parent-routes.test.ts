import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  childPickupDeepLinkHref,
  isParentBillingPath,
  isParentMessagesPath,
} from "./parent-routes";

describe("isParentMessagesPath", () => {
  it("matches main parent portal messages", () => {
    assert.equal(
      isParentMessagesPath("/school/rooted-meadows-demo/parent/messages"),
      true,
    );
  });

  it("matches program-scoped parent portal messages", () => {
    assert.equal(
      isParentMessagesPath(
        "/school/rooted-meadows-demo/parent/p/kindergarten-co-op/messages",
      ),
      true,
    );
  });

  it("matches admin preview program-scoped messages", () => {
    assert.equal(
      isParentMessagesPath(
        "/admin/preview/rooted-meadows-demo/family/abc/parent/p/kindergarten-co-op/messages",
      ),
      true,
    );
  });

  it("does not match unrelated parent routes", () => {
    assert.equal(
      isParentMessagesPath("/school/rooted-meadows-demo/parent/portal"),
      false,
    );
  });
});

describe("childPickupDeepLinkHref", () => {
  it("builds children page deep link with pickup section", () => {
    assert.equal(
      childPickupDeepLinkHref("rooted-meadows-demo", "app-123"),
      "/school/rooted-meadows-demo/parent/children?applicationId=app-123&section=pickup",
    );
  });

  it("supports admin preview base paths", () => {
    assert.equal(
      childPickupDeepLinkHref(
        "rooted-meadows-demo",
        "app-123",
        "/admin/preview/rooted-meadows-demo/family/fam-1",
      ),
      "/admin/preview/rooted-meadows-demo/family/fam-1/parent/children?applicationId=app-123&section=pickup",
    );
  });
});

describe("isParentBillingPath", () => {
  it("matches main parent portal billing", () => {
    assert.equal(
      isParentBillingPath("/school/rooted-meadows-demo/parent/billing"),
      true,
    );
  });

  it("matches program-scoped parent portal billing", () => {
    assert.equal(
      isParentBillingPath(
        "/school/rooted-meadows-demo/parent/p/kindergarten-co-op/billing",
      ),
      true,
    );
  });
});
