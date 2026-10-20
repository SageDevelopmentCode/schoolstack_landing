import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { validateMobileAppDownloadLeadBody } from "@/lib/mobile-app-download/mobile-app-download-validation";
import { MAX_PUBLIC_FORM_NAME_LENGTH } from "@/lib/public-forms/field-limits";

describe("validateMobileAppDownloadLeadBody", () => {
  it("accepts a valid payload", () => {
    const result = validateMobileAppDownloadLeadBody({
      name: "Jordan Parent",
      email: "jordan@example.com",
      sourcePagePath: "/download",
    });

    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.value.name, "Jordan Parent");
      assert.equal(result.value.email, "jordan@example.com");
      assert.equal(result.value.sourcePagePath, "/download");
    }
  });

  it("rejects missing required fields", () => {
    const result = validateMobileAppDownloadLeadBody({
      name: "Jordan Parent",
    });

    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.equal(result.error, "Missing required fields.");
    }
  });

  it("rejects invalid email addresses", () => {
    const result = validateMobileAppDownloadLeadBody({
      name: "Jordan Parent",
      email: "not-an-email",
    });

    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.equal(result.error, "Invalid email address.");
    }
  });

  it("rejects names that exceed max length", () => {
    const result = validateMobileAppDownloadLeadBody({
      name: "x".repeat(MAX_PUBLIC_FORM_NAME_LENGTH + 1),
      email: "jordan@example.com",
    });

    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.match(result.error, /Name/);
    }
  });
});
