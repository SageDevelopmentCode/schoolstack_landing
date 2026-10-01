import assert from "node:assert/strict";
import { describe, it, beforeEach, afterEach } from "node:test";
import {
  TRANSACTIONAL_OUTBOUND_EMAIL_CHANNELS,
  appendUnsubscribeFooter,
  buildUnsubscribeUrl,
  isTransactionalOutboundEmail,
  normalizeOutboundEmail,
  signUnsubscribeToken,
  verifyUnsubscribeToken,
} from "@/lib/outbound-email-unsubscribe";

describe("outbound-email-unsubscribe", () => {
  const previousSecret = process.env.EMAIL_UNSUBSCRIBE_SECRET;

  beforeEach(() => {
    process.env.EMAIL_UNSUBSCRIBE_SECRET = "test-unsubscribe-secret";
  });

  afterEach(() => {
    if (previousSecret === undefined) {
      delete process.env.EMAIL_UNSUBSCRIBE_SECRET;
    } else {
      process.env.EMAIL_UNSUBSCRIBE_SECRET = previousSecret;
    }
  });

  it("normalizeOutboundEmail lowercases and strips display names", () => {
    assert.equal(
      normalizeOutboundEmail('"Parent" <Parent@Example.com>'),
      "parent@example.com",
    );
  });

  it("sign and verify unsubscribe token", () => {
    const email = "parent@example.com";
    const token = signUnsubscribeToken(email);
    assert.equal(verifyUnsubscribeToken(email, token), true);
    assert.equal(verifyUnsubscribeToken(email, "bad-token"), false);
  });

  it("buildUnsubscribeUrl includes email and token query params", () => {
    const url = buildUnsubscribeUrl("parent@example.com");
    assert.match(url, /\/email\/unsubscribe\?/);
    assert.match(url, /email=parent%40example\.com/);
    assert.match(url, /token=/);
  });

  it("appendUnsubscribeFooter inserts link before body close", () => {
    const html = "<html><body><p>Hi</p></body></html>";
    const out = appendUnsubscribeFooter(html, "parent@example.com");
    assert.match(out, /Unsubscribe from non-essential emails/);
    assert.ok(out.indexOf("Unsubscribe") < out.indexOf("</body>"));
  });

  it("isTransactionalOutboundEmail respects allowlist and sendClass", () => {
    assert.equal(
      isTransactionalOutboundEmail({
        discord: { channel: "tuition_payment_receipt", audience: "parent" },
      }),
      true,
    );
    assert.equal(
      isTransactionalOutboundEmail({
        discord: { channel: "bulletin_published", audience: "parent" },
      }),
      false,
    );
    assert.equal(
      isTransactionalOutboundEmail({ sendClass: "marketing" }),
      false,
    );
    assert.equal(
      isTransactionalOutboundEmail({ sendClass: "transactional" }),
      true,
    );
  });

  it("transactional channel set includes payment receipts and excludes bulletin", () => {
    assert.equal(
      TRANSACTIONAL_OUTBOUND_EMAIL_CHANNELS.has("admissions_payment_receipt"),
      true,
    );
    assert.equal(
      TRANSACTIONAL_OUTBOUND_EMAIL_CHANNELS.has("bulletin_published"),
      false,
    );
    assert.equal(
      TRANSACTIONAL_OUTBOUND_EMAIL_CHANNELS.has("tuition_due_reminder"),
      false,
    );
    assert.equal(
      TRANSACTIONAL_OUTBOUND_EMAIL_CHANNELS.has("committee_message_posted"),
      false,
    );
    assert.equal(
      TRANSACTIONAL_OUTBOUND_EMAIL_CHANNELS.has("committee_workspace_update"),
      false,
    );
  });

  it("committee fan-out channels are not transactional via isTransactionalOutboundEmail", () => {
    assert.equal(
      isTransactionalOutboundEmail({
        discord: { channel: "committee_message_posted", audience: "staff" },
      }),
      false,
    );
    assert.equal(
      isTransactionalOutboundEmail({
        discord: { channel: "committee_workspace_update", audience: "staff" },
      }),
      false,
    );
  });
});
