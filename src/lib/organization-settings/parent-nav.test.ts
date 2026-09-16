import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { DEFAULT_FEATURES } from "./catalog";
import {
  buildParentNavItems,
  splitParentNavForHeader,
} from "./parent-nav";
import { resolveMainParentOrganizationFeatures } from "./resolve-program-parent-features";

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
      forms_documents: true,
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
    assert.equal(
      more.some((item) => item.key === "forms_documents"),
      true,
    );
    assert.equal(
      primary.some((item) => item.key === "forms_documents"),
      false,
    );
    assert.equal(primary.some((item) => item.key === "children"), true);
  });

  it("omits curriculum from main portal nav when org flag is enabled", () => {
    const orgWithCurriculum = resolveMainParentOrganizationFeatures({
      ...DEFAULT_FEATURES,
      parent: {
        ...DEFAULT_FEATURES.parent,
        portal: true,
        billing: true,
        messages: true,
        calendar: true,
        children: true,
        committees: true,
        curriculum: true,
      },
    });

    const items = buildParentNavItems(
      "rooted-meadows-demo",
      orgWithCurriculum.parent,
    );

    assert.equal(items.some((item) => item.key === "curriculum"), false);
    assert.equal(items.some((item) => item.key === "supply_list"), false);
    assert.equal(items.some((item) => item.key === "teaching_schedule"), false);
  });

  it("routes committees to More and teaching_schedule to primary in co-op mode", () => {
    const items = buildParentNavItems("rooted-meadows-demo", {
      ...DEFAULT_FEATURES.parent,
      portal: true,
      billing: true,
      messages: true,
      calendar: true,
      children: true,
      committees: true,
      curriculum: true,
      supply_list: true,
      teaching_schedule: true,
      attendance: true,
    });

    const { primary, more } = splitParentNavForHeader(items, { coopMode: true });

    assert.equal(primary.some((item) => item.key === "teaching_schedule"), true);
    assert.equal(primary.some((item) => item.key === "committees"), false);
    assert.equal(more.some((item) => item.key === "committees"), true);
    assert.equal(primary.some((item) => item.key === "children"), false);
    assert.equal(more.some((item) => item.key === "children"), true);
  });
});
