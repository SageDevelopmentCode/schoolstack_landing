import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { matchesTraits, parseTraitsParam, schoolTraits } from "@/components/admin/research/research-ui";

const withEverything = { school: { demo_slug: "athena" }, plan: { snapshot: {}, letter: {} } };
const demoOnly = { school: { demo_slug: "ascend" }, plan: { snapshot: {} } };
const nothing = { school: { demo_slug: null }, plan: null };
const doNotEmail = { school: { demo_slug: "lab" }, plan: { snapshot: {}, letter: {}, doNotEmail: { reason: "paused" } } };

describe("schoolTraits", () => {
  it("reads demo, snapshot and letter from the school and its plan", () => {
    assert.deepEqual([...schoolTraits(withEverything)].sort(), ["demo", "letter", "snapshot"]);
    assert.deepEqual([...schoolTraits(demoOnly)].sort(), ["demo", "snapshot"]);
    assert.deepEqual([...schoolTraits(nothing)], []);
  });

  it("doesn't count a do-not-email plan's snapshot or letter", () => {
    assert.deepEqual([...schoolTraits(doNotEmail)], ["demo"]);
  });
});

describe("matchesTraits", () => {
  it("matches everything when no trait is chosen", () => {
    assert.ok(matchesTraits(nothing, []));
  });

  it("needs every chosen trait (AND)", () => {
    assert.ok(matchesTraits(withEverything, ["demo", "letter"]));
    assert.ok(!matchesTraits(demoOnly, ["demo", "letter"]));
    assert.ok(matchesTraits(demoOnly, ["demo"]));
    assert.ok(!matchesTraits(nothing, ["demo"]));
  });
});

describe("parseTraitsParam", () => {
  it("keeps known traits once, in order", () => {
    assert.deepEqual(parseTraitsParam("letter,demo,letter,bogus"), ["letter", "demo"]);
    assert.deepEqual(parseTraitsParam(null), []);
  });
});
