import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  AUTOPAY_LINES_GLOBAL_CAP,
  buildFamilyLabel,
  formatAutopayLineItems,
  mergeAutopayLines,
  type AutopayLineItem,
} from "./autopay-cron-report";

function sampleLine(
  overrides: Partial<AutopayLineItem> = {},
): AutopayLineItem {
  return {
    organizationSlug: "rooted-meadows",
    familyId: "family-1",
    familyLabel: "Cecilia family",
    chargeId: "charge-1",
    chargeLabel: "August tuition",
    amountCents: 72000,
    outcome: "charged",
    ...overrides,
  };
}

describe("buildFamilyLabel", () => {
  it("uses the first guardian last name when available", () => {
    assert.equal(
      buildFamilyLabel("family-1", [{ last_name: "Cecilia" }]),
      "Cecilia family",
    );
  });

  it("falls back to a short family id", () => {
    assert.equal(buildFamilyLabel("abcdef12-3456", []), "Family abcdef12");
  });
});

describe("formatAutopayLineItems", () => {
  it("formats charged lines with school, family, amount, and label", () => {
    const formatted = formatAutopayLineItems(
      [sampleLine()],
      "charged",
    );

    assert.match(formatted ?? "", /rooted-meadows/);
    assert.match(formatted ?? "", /Cecilia family/);
    assert.match(formatted ?? "", /\$720/);
    assert.match(formatted ?? "", /August tuition/);
  });

  it("includes skip reasons and errors for failed and skipped outcomes", () => {
    const failed = formatAutopayLineItems(
      [
        sampleLine({
          outcome: "failed",
          errorMessage: "Card declined",
        }),
      ],
      "failed",
    );
    const skipped = formatAutopayLineItems(
      [
        sampleLine({
          outcome: "skipped",
          skipReason: "no_payment_method",
        }),
      ],
      "skipped",
    );
    const stale = formatAutopayLineItems(
      [
        sampleLine({
          outcome: "skipped",
          skipReason: "stale_payment_method",
        }),
      ],
      "skipped",
    );

    assert.match(failed ?? "", /Card declined/);
    assert.match(skipped ?? "", /no card/);
    assert.match(stale ?? "", /stale card/);
  });

  it("truncates long lists with a remaining count", () => {
    const lines = Array.from({ length: 5 }, (_, index) =>
      sampleLine({
        chargeId: `charge-${index}`,
        chargeLabel: `Charge ${index}`,
      }),
    );

    const formatted = formatAutopayLineItems(lines, "charged", 2);
    assert.match(formatted ?? "", /Charge 0/);
    assert.match(formatted ?? "", /Charge 1/);
    assert.match(formatted ?? "", /and 3 more/);
  });

  it("returns null when no lines match the outcome", () => {
    assert.equal(formatAutopayLineItems([sampleLine()], "failed"), null);
  });
});

describe("mergeAutopayLines", () => {
  it("concatenates lines until the global cap is reached", () => {
    const existing = [sampleLine({ chargeId: "existing" })];
    const incoming = Array.from({ length: AUTOPAY_LINES_GLOBAL_CAP }, (_, index) =>
      sampleLine({ chargeId: `incoming-${index}` }),
    );

    const merged = mergeAutopayLines(existing, incoming, 3);
    assert.equal(merged.lines.length, 3);
    assert.equal(merged.truncated, true);
  });
});
