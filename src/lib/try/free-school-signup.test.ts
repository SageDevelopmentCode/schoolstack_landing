import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  authUserIdFromAdminList,
  normalizeSignupDetails,
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

describe("authUserIdFromAdminList", () => {
  it("returns the id only when the email matches exactly", () => {
    const body = {
      users: [
        { id: "partial", email: "ada@example.com.other" },
        { id: "exact", email: "Ada@Example.com" },
      ],
    };

    assert.equal(authUserIdFromAdminList(body, "ada@example.com"), "exact");
    assert.equal(authUserIdFromAdminList(body, "missing@example.com"), null);
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

describe("normalizeSignupDetails", () => {
  it("trims the first name and keeps known role and student count ids", () => {
    assert.deepEqual(
      normalizeSignupDetails({ firstName: "  Ada   Mae ", role: "running", studentCount: "11-25" }),
      { ok: true, details: { firstName: "Ada Mae", role: "running", studentCount: "11-25" } },
    );
  });

  it("caps the first name at 80 characters", () => {
    const result = normalizeSignupDetails({ firstName: "a".repeat(120) });
    assert.equal(result.ok && result.details.firstName.length, 80);
  });

  it("nulls unknown or missing role and student count ids", () => {
    assert.deepEqual(
      normalizeSignupDetails({ firstName: "Ada", role: "private", studentCount: 12 }),
      { ok: true, details: { firstName: "Ada", role: null, studentCount: null } },
    );
    assert.deepEqual(normalizeSignupDetails({ firstName: "Ada" }), {
      ok: true,
      details: { firstName: "Ada", role: null, studentCount: null },
    });
  });

  it("requires a first name", () => {
    assert.deepEqual(normalizeSignupDetails({ firstName: "   " }), {
      ok: false,
      error: "missing_first_name",
    });
    assert.deepEqual(normalizeSignupDetails({ firstName: 42 }), {
      ok: false,
      error: "missing_first_name",
    });
  });
});
