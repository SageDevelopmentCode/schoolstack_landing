import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import {
  enforcePublicFormSubmission,
  isPublicFormProtectionConfigured,
  shouldBypassPublicFormProtection,
} from "@/lib/public-forms/enforce-public-form-submission";

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

  it("bypasses protection in non-production when env is unset", async () => {
    delete process.env.TURNSTILE_SECRET_KEY;
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;

    assert.equal(shouldBypassPublicFormProtection(), true);
    assert.equal(isPublicFormProtectionConfigured(), false);

    const result = await enforcePublicFormSubmission({
      request: new Request("https://example.com"),
      form: "public_support",
      email: "alex@example.com",
      turnstileToken: null,
    });

    assert.deepEqual(result, { ok: true });
  });

  it("requires a turnstile token when protection is configured", async () => {
    process.env.NODE_ENV = "production";
    process.env.TURNSTILE_SECRET_KEY = "secret";
    process.env.UPSTASH_REDIS_REST_URL = "https://example.upstash.io";
    process.env.UPSTASH_REDIS_REST_TOKEN = "token";

    const result = await enforcePublicFormSubmission({
      request: new Request("https://example.com"),
      form: "public_support",
      email: "alex@example.com",
      turnstileToken: null,
    });

    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.equal(result.status, 400);
      assert.match(result.error, /security check/i);
    }
  });

  it("returns 503 in production when protection is misconfigured", async () => {
    process.env.NODE_ENV = "production";
    delete process.env.TURNSTILE_SECRET_KEY;
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;

    const result = await enforcePublicFormSubmission({
      request: new Request("https://example.com"),
      form: "public_support",
      email: "alex@example.com",
      turnstileToken: "token",
    });

    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.equal(result.status, 503);
      assert.equal(result.code, "protection_misconfigured");
    }
  });
});
