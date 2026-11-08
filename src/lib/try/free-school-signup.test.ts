import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  signupImpersonationMessage,
  slugFromSchoolName,
  suffixedSlug,
} from "./free-school-signup";

describe("slugFromSchoolName", () => {
  it("builds a lowercase hyphenated slug", () => {
    assert.equal(slugFromSchoolName("Oak & Pine School"), "oak-pine-school");
  });

  it("falls back when the name has no letters", () => {
    assert.equal(slugFromSchoolName("!!!"), "school");
  });
});

describe("suffixedSlug", () => {
  it("leaves the first attempt unsuffixed", () => {
    assert.equal(suffixedSlug("oak-pine", 0), "oak-pine");
  });

  it("adds a numeric suffix that still fits the slug limit", () => {
    assert.equal(suffixedSlug("oak-pine", 1), "oak-pine-2");
  });
});

describe("signupImpersonationMessage", () => {
  it("blocks a fake Rooted Meadows", () => {
    assert.ok(signupImpersonationMessage("Rooted Meadows", []));
    assert.ok(signupImpersonationMessage("Rooted Meadows West", []));
  });

  it("blocks a name that matches an existing school", () => {
    assert.ok(
      signupImpersonationMessage("Oak Pine", [
        { name: "Oak Pine", slug: "oak-pine" },
      ]),
    );
  });

  it("allows an unrelated name", () => {
    assert.equal(
      signupImpersonationMessage("Cedar Lane", [
        { name: "Oak Pine", slug: "oak-pine" },
      ]),
      null,
    );
  });
});
