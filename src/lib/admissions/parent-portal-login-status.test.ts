import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  classifyParentPortalLoginStatus,
  enrichGuardiansWithLoginStatus,
  summarizeParentPortalLoginStatus,
  type ParentPortalLoginStatus,
} from "./parent-portal-login-status";

describe("classifyParentPortalLoginStatus", () => {
  it("marks guardians without linked accounts as no account", () => {
    const result = classifyParentPortalLoginStatus({
      userId: null,
      lastSignInAt: null,
    });

    assert.equal(result.accountLinked, false);
    assert.equal(result.hasEverSignedIn, false);
    assert.equal(result.lastSignInAt, null);
  });

  it("marks linked accounts without sign-in as never signed in", () => {
    const result = classifyParentPortalLoginStatus({
      userId: "user-1",
      lastSignInAt: null,
    });

    assert.equal(result.accountLinked, true);
    assert.equal(result.hasEverSignedIn, false);
    assert.equal(result.lastSignInAt, null);
  });

  it("marks linked accounts with sign-in timestamps as signed in", () => {
    const result = classifyParentPortalLoginStatus({
      userId: "user-1",
      lastSignInAt: "2026-07-22T12:00:00.000Z",
    });

    assert.equal(result.accountLinked, true);
    assert.equal(result.hasEverSignedIn, true);
    assert.equal(result.lastSignInAt, "2026-07-22T12:00:00.000Z");
  });

  it("treats blank sign-in timestamps as never signed in", () => {
    const result = classifyParentPortalLoginStatus({
      userId: "user-1",
      lastSignInAt: "   ",
    });

    assert.equal(result.accountLinked, true);
    assert.equal(result.hasEverSignedIn, false);
    assert.equal(result.lastSignInAt, null);
  });
});

describe("summarizeParentPortalLoginStatus", () => {
  it("counts linked, signed-in, never signed-in, and no-account guardians", () => {
    const statuses: ParentPortalLoginStatus[] = [
      {
        guardianId: "g-1",
        userId: "u-1",
        firstName: "A",
        lastName: "One",
        email: "a@example.com",
        familyId: "f-1",
        accountLinked: true,
        hasEverSignedIn: true,
        lastSignInAt: "2026-07-22T12:00:00.000Z",
      },
      {
        guardianId: "g-2",
        userId: "u-2",
        firstName: "B",
        lastName: "Two",
        email: "b@example.com",
        familyId: "f-2",
        accountLinked: true,
        hasEverSignedIn: false,
        lastSignInAt: null,
      },
      {
        guardianId: "g-3",
        userId: null,
        firstName: "C",
        lastName: "Three",
        email: "c@example.com",
        familyId: "f-3",
        accountLinked: false,
        hasEverSignedIn: false,
        lastSignInAt: null,
      },
    ];

    assert.deepEqual(summarizeParentPortalLoginStatus(statuses), {
      total: 3,
      linked: 2,
      signedIn: 1,
      neverSignedIn: 1,
      noAccount: 1,
    });
  });
});

describe("enrichGuardiansWithLoginStatus", () => {
  it("adds login fields from auth snapshots", () => {
    const guardians = [
      {
        id: "g-1",
        firstName: "Alex",
        lastName: "Parent",
        email: "alex@example.com",
        userId: "u-1",
        relationship: "parent",
        isLinked: true,
      },
      {
        id: "g-2",
        firstName: "Blair",
        lastName: "Parent",
        email: "blair@example.com",
        userId: null,
        relationship: "parent",
        isLinked: false,
      },
    ];

    const enriched = enrichGuardiansWithLoginStatus(
      guardians,
      new Map([["u-1", { lastSignInAt: "2026-07-22T12:00:00.000Z" }]]),
    );

    assert.equal(enriched[0]?.hasEverSignedIn, true);
    assert.equal(enriched[0]?.lastSignInAt, "2026-07-22T12:00:00.000Z");
    assert.equal(enriched[1]?.hasEverSignedIn, false);
    assert.equal(enriched[1]?.lastSignInAt, null);
  });
});
