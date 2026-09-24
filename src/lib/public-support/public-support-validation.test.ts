import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { validatePublicSupportRequestBody } from "@/lib/public-support/public-support-validation";

describe("validatePublicSupportRequestBody", () => {
  it("accepts a valid payload", () => {
    const result = validatePublicSupportRequestBody({
      name: "Alex Founder",
      email: "alex@example.com",
      topic: "general",
      message: "Need help getting started.",
      sourcePagePath: "/support",
    });

    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.value.name, "Alex Founder");
      assert.equal(result.value.email, "alex@example.com");
      assert.equal(result.value.topic, "general");
      assert.equal(result.value.message, "Need help getting started.");
      assert.equal(result.value.sourcePagePath, "/support");
    }
  });

  it("accepts account-deletion topic", () => {
    const result = validatePublicSupportRequestBody({
      name: "Alex Founder",
      email: "alex@example.com",
      topic: "account-deletion",
      message: "Please delete my MudKitchen account.",
      sourcePagePath: "/account-deletion",
    });

    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.value.topic, "account-deletion");
      assert.equal(result.value.sourcePagePath, "/account-deletion");
    }
  });

  it("rejects missing required fields", () => {
    const result = validatePublicSupportRequestBody({
      name: "Alex Founder",
      email: "alex@example.com",
      topic: "general",
    });

    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.equal(result.error, "Missing required fields.");
    }
  });

  it("rejects invalid email addresses", () => {
    const result = validatePublicSupportRequestBody({
      name: "Alex Founder",
      email: "not-an-email",
      topic: "general",
      message: "Hello",
    });

    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.equal(result.error, "Invalid email address.");
    }
  });

  it("rejects invalid topics", () => {
    const result = validatePublicSupportRequestBody({
      name: "Alex Founder",
      email: "alex@example.com",
      topic: "application-forms",
      message: "Hello",
    });

    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.equal(result.error, "Invalid topic.");
    }
  });

  it("rejects messages that are too long", () => {
    const result = validatePublicSupportRequestBody({
      name: "Alex Founder",
      email: "alex@example.com",
      topic: "general",
      message: "x".repeat(5001),
    });

    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.equal(result.error, "Message is too long.");
    }
  });

  it("rejects names that are too long", () => {
    const result = validatePublicSupportRequestBody({
      name: "x".repeat(121),
      email: "alex@example.com",
      topic: "general",
      message: "Hello",
    });

    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.equal(result.error, "Name is too long.");
    }
  });

  it("rejects emails that are too long", () => {
    const result = validatePublicSupportRequestBody({
      name: "Alex Founder",
      email: `${"a".repeat(250)}@example.com`,
      topic: "general",
      message: "Hello",
    });

    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.equal(result.error, "Email is too long.");
    }
  });

  it("rejects source page paths that are too long", () => {
    const result = validatePublicSupportRequestBody({
      name: "Alex Founder",
      email: "alex@example.com",
      topic: "general",
      message: "Hello",
      sourcePagePath: `/${"x".repeat(500)}`,
    });

    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.equal(result.error, "Source page path is too long.");
    }
  });
});
