import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  payerScopeKey,
  validateAchResendBatch,
} from "./resend-ach-batch-validation";

function row(
  input: {
    id: string;
    familyId?: string | null;
    applicationId?: string | null;
    url: string;
  },
) {
  return {
    payment: {
      id: input.id,
      familyId: input.familyId ?? null,
      applicationId: input.applicationId ?? null,
    },
    verificationAction: { hostedVerificationUrl: input.url },
  };
}

describe("resend-ach-batch-validation", () => {
  it("payerScopeKey prefers family then application then payment id", () => {
    assert.equal(
      payerScopeKey({
        id: "p1",
        familyId: "f1",
        applicationId: "a1",
      }),
      "family:f1",
    );
    assert.equal(
      payerScopeKey({ id: "p1", familyId: null, applicationId: "a1" }),
      "application:a1",
    );
    assert.equal(
      payerScopeKey({ id: "p1", familyId: null, applicationId: null }),
      "payment:p1",
    );
  });

  it("allows multi-payment batch with one verification URL", () => {
    const result = validateAchResendBatch(
      [
        row({ id: "p1", familyId: "f1", url: "https://stripe.test/verify-a" }),
        row({ id: "p2", familyId: "f1", url: "https://stripe.test/verify-a" }),
      ],
      { requireSingleVerificationUrl: true },
    );
    assert.equal(result.ok, true);
  });

  it("rejects multi-URL batch when sending", () => {
    const result = validateAchResendBatch(
      [
        row({ id: "p1", familyId: "f1", url: "https://stripe.test/verify-a" }),
        row({ id: "p2", familyId: "f1", url: "https://stripe.test/verify-b" }),
      ],
      { requireSingleVerificationUrl: true },
    );
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.match(result.reason, /different Stripe verification URLs/);
    }
  });

  it("allows multi-URL batch for manual draft when URLs not required", () => {
    const result = validateAchResendBatch(
      [
        row({ id: "p1", familyId: "f1", url: "https://stripe.test/verify-a" }),
        row({ id: "p2", familyId: "f1", url: "https://stripe.test/verify-b" }),
      ],
      { requireSingleVerificationUrl: false },
    );
    assert.equal(result.ok, true);
  });

  it("rejects mixed payer scopes", () => {
    const result = validateAchResendBatch(
      [
        row({ id: "p1", familyId: "f1", url: "https://stripe.test/verify-a" }),
        row({ id: "p2", familyId: "f2", url: "https://stripe.test/verify-a" }),
      ],
      { requireSingleVerificationUrl: false },
    );
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.match(result.reason, /different payer scopes/);
    }
  });
});
