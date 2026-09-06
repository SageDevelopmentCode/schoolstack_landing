import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { DEFAULT_FEATURES } from "./catalog";
import {
  buildParentNavItems,
  splitParentNavForHeader,
} from "./parent-nav";

describe("splitParentNavForHeader", () => {
  it("routes classroom_signups to More instead of primary nav", () => {
    const items = buildParentNavItems("rooted-meadows-demo", {
      ...DEFAULT_FEATURES.parent,
      portal: true,
      billing: true,
      messages: true,
      calendar: true,
      children: true,
      classroom_signups: true,
      committees: true,
      attendance: true,
    });

    const { primary, more } = splitParentNavForHeader(items);

    assert.equal(
      primary.some((item) => item.key === "classroom_signups"),
      false,
    );
    assert.equal(
      more.some((item) => item.key === "classroom_signups"),
      true,
    );
  });
});
