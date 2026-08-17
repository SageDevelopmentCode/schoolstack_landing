import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  MAX_FAMILY_NOTIFICATION_EMAILS,
  getDisplayNotificationEmails,
  normalizeNotificationEmails,
  resolveFamilyNotificationEmails,
} from "./family-notification-email-constants";

describe("normalizeNotificationEmails", () => {
  it("trims, lowercases, and dedupes emails", () => {
    const result = normalizeNotificationEmails([
      " Parent@Test.com ",
      "parent@test.com",
      "Second@Example.com",
    ]);

    assert.equal(result.error, null);
    assert.deepEqual(result.emails, ["parent@test.com", "second@example.com"]);
  });

  it("rejects more than three emails", () => {
    const result = normalizeNotificationEmails([
      "one@test.com",
      "two@test.com",
      "three@test.com",
      "four@test.com",
    ]);

    assert.match(result.error ?? "", /at most 3/);
    assert.equal(result.emails.length, 4);
  });

  it("rejects invalid email addresses", () => {
    const result = normalizeNotificationEmails(["not-an-email"]);

    assert.match(result.error ?? "", /not a valid email/);
  });

  it("allows an empty list", () => {
    const result = normalizeNotificationEmails([]);

    assert.equal(result.error, null);
    assert.deepEqual(result.emails, []);
  });

  it("enforces the configured max constant", () => {
    assert.equal(MAX_FAMILY_NOTIFICATION_EMAILS, 3);
  });
});

describe("getDisplayNotificationEmails", () => {
  it("returns configured emails when present", () => {
    assert.deepEqual(
      getDisplayNotificationEmails(["Custom@Example.com"], "login@test.com"),
      ["Custom@Example.com"],
    );
  });

  it("returns login email when configured list is empty", () => {
    assert.deepEqual(getDisplayNotificationEmails([], "Login@Test.com"), [
      "login@test.com",
    ]);
  });

  it("returns empty list when configured and login are missing", () => {
    assert.deepEqual(getDisplayNotificationEmails([], null), []);
  });
});

describe("resolveFamilyNotificationEmails", () => {
  it("prefers configured notification emails", () => {
    const resolved = resolveFamilyNotificationEmails(
      {
        notification_emails: ["Personal@Example.com"],
        primary_email: "primary@test.com",
      },
      [{ email: "guardian@test.com" }],
      ["login@test.com"],
    );

    assert.deepEqual(resolved.emails, ["personal@example.com"]);
    assert.deepEqual(resolved.sources, ["configured"]);
  });

  it("defaults to login emails when configured list is empty", () => {
    const resolved = resolveFamilyNotificationEmails(
      {
        notification_emails: [],
        primary_email: "primary@test.com",
      },
      [{ email: "guardian@test.com" }, { email: "spouse@test.com" }],
      ["login@test.com"],
    );

    assert.deepEqual(resolved.emails, ["login@test.com"]);
    assert.deepEqual(resolved.sources, ["auth_email"]);
  });

  it("returns empty when configured and login emails are missing", () => {
    const resolved = resolveFamilyNotificationEmails(
      {
        notification_emails: [],
        primary_email: "Primary@Test.com",
      },
      [{ email: "guardian@test.com" }],
      [],
    );

    assert.deepEqual(resolved.emails, []);
    assert.deepEqual(resolved.sources, []);
  });
});
