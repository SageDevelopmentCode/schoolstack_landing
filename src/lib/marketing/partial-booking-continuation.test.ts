import assert from "node:assert/strict";
import { describe, it, beforeEach, afterEach } from "node:test";
import {
  signPartialBookingContinuation,
  verifyPartialBookingContinuation,
} from "@/lib/marketing/partial-booking-continuation";

const LEAD_ID = "550e8400-e29b-41d4-a716-446655440000";

describe("partial-booking-continuation", () => {
  const previousSecret = process.env.MARKETING_LEAD_CONTINUATION_SECRET;

  beforeEach(() => {
    process.env.MARKETING_LEAD_CONTINUATION_SECRET = "test-partial-booking-secret";
  });

  afterEach(() => {
    if (previousSecret === undefined) {
      delete process.env.MARKETING_LEAD_CONTINUATION_SECRET;
    } else {
      process.env.MARKETING_LEAD_CONTINUATION_SECRET = previousSecret;
    }
  });

  it("sign and verify continuation token", () => {
    const email = "Parent@Example.com";
    const token = signPartialBookingContinuation(LEAD_ID, email);
    assert.equal(verifyPartialBookingContinuation(LEAD_ID, email, token), true);
    assert.equal(verifyPartialBookingContinuation(LEAD_ID, "other@example.com", token), false);
    assert.equal(verifyPartialBookingContinuation(LEAD_ID, email, "bad-token"), false);
  });

  it("email matching is case-insensitive", () => {
    const token = signPartialBookingContinuation(LEAD_ID, "parent@example.com");
    assert.equal(verifyPartialBookingContinuation(LEAD_ID, "PARENT@EXAMPLE.COM", token), true);
  });
});