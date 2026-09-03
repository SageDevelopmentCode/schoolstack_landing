import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseParentPortalHomeMetaRow } from "./parent-portal-home-meta";

describe("parseParentPortalHomeMetaRow", () => {
  it("parses home meta counts", () => {
    assert.deepEqual(
      parseParentPortalHomeMetaRow({
        children_count: "2",
        enrolled_children_count: 1,
      }),
      {
        childrenCount: 2,
        enrolledChildrenCount: 1,
      },
    );
  });
});
