import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildTuitionBillingDeepLink } from "./send-invoice";

describe("buildTuitionBillingDeepLink", () => {
  it("builds a parent billing deep link for a charge", () => {
    const url = buildTuitionBillingDeepLink(
      "rooted-meadows-demo",
      "charge-123",
      "https://schoolstack.test",
    );

    assert.equal(
      url,
      "https://schoolstack.test/school/rooted-meadows-demo/parent/billing?charge=charge-123",
    );
  });
});
