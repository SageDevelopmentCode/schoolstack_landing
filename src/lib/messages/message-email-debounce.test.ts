import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  isWithinMinutes,
  shouldSendMessageEmail,
} from "./message-email-debounce";

const NOW = new Date("2026-08-09T12:00:00.000Z");

function minutesAgo(minutes: number): string {
  return new Date(NOW.getTime() - minutes * 60 * 1000).toISOString();
}

describe("isWithinMinutes", () => {
  it("returns false for null", () => {
    assert.equal(isWithinMinutes(null, 15, NOW), false);
  });

  it("returns true when timestamp is inside the window", () => {
    assert.equal(isWithinMinutes(minutesAgo(5), 15, NOW), true);
  });

  it("returns false when timestamp is outside the window", () => {
    assert.equal(isWithinMinutes(minutesAgo(20), 15, NOW), false);
  });
});

describe("shouldSendMessageEmail", () => {
  it("allows email when there is no read or email history", () => {
    assert.deepEqual(
      shouldSendMessageEmail({
        now: NOW,
        lastReadAt: null,
        lastEmailNotifiedAt: null,
      }),
      { send: true },
    );
  });

  it("skips when the thread was read within 15 minutes", () => {
    assert.deepEqual(
      shouldSendMessageEmail({
        now: NOW,
        lastReadAt: minutesAgo(5),
        lastEmailNotifiedAt: null,
      }),
      { send: false, reason: "recently_active" },
    );
  });

  it("allows when the thread was read more than 15 minutes ago", () => {
    assert.deepEqual(
      shouldSendMessageEmail({
        now: NOW,
        lastReadAt: minutesAgo(20),
        lastEmailNotifiedAt: null,
      }),
      { send: true },
    );
  });

  it("skips when an email was sent within 30 minutes", () => {
    assert.deepEqual(
      shouldSendMessageEmail({
        now: NOW,
        lastReadAt: minutesAgo(20),
        lastEmailNotifiedAt: minutesAgo(10),
      }),
      { send: false, reason: "email_cooldown" },
    );
  });

  it("allows when the last email was sent more than 30 minutes ago", () => {
    assert.deepEqual(
      shouldSendMessageEmail({
        now: NOW,
        lastReadAt: minutesAgo(20),
        lastEmailNotifiedAt: minutesAgo(35),
      }),
      { send: true },
    );
  });

  it("prefers the recently-active gate over email cooldown", () => {
    assert.deepEqual(
      shouldSendMessageEmail({
        now: NOW,
        lastReadAt: minutesAgo(5),
        lastEmailNotifiedAt: minutesAgo(35),
      }),
      { send: false, reason: "recently_active" },
    );
  });
});
