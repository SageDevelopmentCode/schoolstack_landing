import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildTuitionAchSettlementFailedHtml } from "./emails";

const basePayload = {
  name: "Jane Parent",
  schoolName: "Rooted Meadows",
  billingUrl: "https://example.com/billing",
  chargeLabel: "October tuition",
  amountCents: 720_000,
};

describe("buildTuitionAchSettlementFailedHtml", () => {
  it("tells families to pay again when checkout never recorded payment", () => {
    const html = buildTuitionAchSettlementFailedHtml({
      ...basePayload,
      settlementFailure: false,
    });

    assert.match(html, /No tuition was collected/i);
    assert.match(html, /pay again/i);
  });

  it("offers pay again when settlement fails after billing was reopened", () => {
    const html = buildTuitionAchSettlementFailedHtml({
      ...basePayload,
      settlementFailure: true,
      chargeReopened: true,
    });

    assert.doesNotMatch(html, /No tuition was collected/i);
    assert.match(html, /open again/i);
    assert.match(html, /pay with a card/i);
  });

  it("does not tell families to pay again when billing could not be reopened", () => {
    const html = buildTuitionAchSettlementFailedHtml({
      ...basePayload,
      settlementFailure: true,
      chargeReopened: false,
    });

    assert.doesNotMatch(html, /No tuition was collected/i);
    assert.doesNotMatch(html, /pay again/i);
    assert.match(html, /still show this charge as paid/i);
    assert.match(html, /contact your school/i);
  });
});
