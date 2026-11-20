import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { PARTIAL_BOOKING_DEDUPE_MS } from "@/lib/marketing/partial-booking-dedupe";
import {
  isUsablePartialBookingDraft,
  parsePartialBookingDraft,
  type PartialBookingDraft,
} from "@/lib/marketing/partial-booking-draft";

const NOW = Date.parse("2026-06-01T12:00:00.000Z");

function draft(overrides: Partial<PartialBookingDraft> = {}): PartialBookingDraft {
  return {
    leadId: "550e8400-e29b-41d4-a716-446655440000",
    token: "tok",
    email: "parent@example.com",
    savedAt: new Date(NOW - 60_000).toISOString(),
    ...overrides,
  };
}

describe("partial-booking-draft", () => {
  it("matching email within window is usable", () => {
    assert.equal(isUsablePartialBookingDraft(draft(), "parent@example.com", NOW), true);
    assert.equal(isUsablePartialBookingDraft(draft(), "  PARENT@Example.COM  ", NOW), true);
  });

  it("email mismatch is not usable", () => {
    assert.equal(isUsablePartialBookingDraft(draft(), "other@example.com", NOW), false);
  });

  it("expired savedAt is not usable", () => {
    const expired = draft({
      savedAt: new Date(NOW - PARTIAL_BOOKING_DEDUPE_MS - 1).toISOString(),
    });
    assert.equal(isUsablePartialBookingDraft(expired, "parent@example.com", NOW), false);
  });

  it("legacy draft missing email or savedAt is not usable", () => {
    assert.equal(
      isUsablePartialBookingDraft(
        { leadId: "id", token: "tok", email: "", savedAt: "" },
        "parent@example.com",
        NOW,
      ),
      false,
    );
    const parsed = parsePartialBookingDraft({ leadId: "id", token: "tok" });
    assert.ok(parsed);
    assert.equal(isUsablePartialBookingDraft(parsed as PartialBookingDraft, "a@b.com", NOW), false);
  });

  it("parsePartialBookingDraft rejects invalid shapes", () => {
    assert.equal(parsePartialBookingDraft(null), null);
    assert.equal(parsePartialBookingDraft({ token: "tok" }), null);
  });
});