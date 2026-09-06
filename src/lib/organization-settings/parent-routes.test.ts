import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
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
