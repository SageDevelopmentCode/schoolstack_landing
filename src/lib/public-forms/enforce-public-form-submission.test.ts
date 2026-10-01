import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import {
  enforcePublicFormSubmission,
  shouldBypassPublicFormProtection,
  shouldNotifyPublicFormProtectionFailure,
} from "@/lib/public-forms/enforce-public-form-submission";
import { isPublicFormHoneypotTripped } from "@/lib/public-forms/honeypot";

function setNodeEnv(value: string) {
  Object.defineProperty(process.env, "NODE_ENV", {
    value,
    configurable: true,
    enumerable: true,
    writable: true,
  });
}

describe("enforcePublicFormSubmission", () => {
  const envSnapshot = { ...process.env };

  afterEach(() => {
    for (const key of Object.keys(process.env)) {
      if (!(key in envSnapshot)) {
        delete process.env[key];
      }
    }
    for (const [key, value] of Object.entries(envSnapshot)) {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  });

  it("bypasses rate limits in non-production", async () => {
    setNodeEnv("development");

    assert.equal(shouldBypassPublicFormProtection(), true);

    const result = await enforcePublicFormSubmission({
      request: new Request("https://example.com"),
      form: "demo_request",
      email: "alex@example.com",
      companyWebsite: "",
    });

    assert.equal(result.ok, true);
  });

  it("rejects honeypot submissions", async () => {
    setNodeEnv("production");

    const result = await enforcePublicFormSubmission({
      request: new Request("https://example.com"),
      form: "demo_request",
      email: "alex@example.com",
      companyWebsite: "https://spam.example",
    });

    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.equal(result.status, 400);
      assert.equal(result.code, "honeypot");
    }
  });
});

describe("isPublicFormHoneypotTripped", () => {
  it("treats whitespace-only as empty", () => {
    assert.equal(isPublicFormHoneypotTripped(""), false);
    assert.equal(isPublicFormHoneypotTripped("   "), false);
    assert.equal(isPublicFormHoneypotTripped("spam"), true);
  });
});

describe("shouldNotifyPublicFormProtectionFailure", () => {
  it("does not notify for expected 429 rate limits", () => {
    assert.equal(
      shouldNotifyPublicFormProtectionFailure({
        ok: false,
        status: 429,
        error: "Too many",
        code: "rate_limited",
      }),
      false,
    );
  });

  it("notifies for infrastructure 500 failures", () => {
    assert.equal(
      shouldNotifyPublicFormProtectionFailure({
        ok: false,
        status: 500,
        error: "Unable to process your submission right now. Please try again later.",
        code: "rate_limit_unavailable",
      }),
      true,
    );
  });
});
