import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { computeFamilyAutopayStatus } from "@/lib/tuition/autopay-status";

describe("computeFamilyAutopayStatus", () => {
  it("returns off when no billing account exists", () => {
    const result = computeFamilyAutopayStatus({
      billingAccountRow: null,
      guardians: [],
      paymentMethods: [],
      hasBillingSplit: false,
    });

    assert.equal(result.autopayStatus, "off");
    assert.equal(result.hasPaymentMethod, false);
  });

  it("returns on for combined billing when family autopay is enabled", () => {
    const result = computeFamilyAutopayStatus({
      billingAccountRow: {
        id: "acct-1",
        organization_id: "org-1",
        family_id: "family-1",
        autopay_enabled: true,
        default_payment_method_id: "pm_123",
        metadata: {},
      },
      guardians: [],
      paymentMethods: [
        { billing_account_id: "acct-1", guardian_id: null },
      ],
      hasBillingSplit: false,
    });

    assert.equal(result.autopayStatus, "on");
    assert.equal(result.hasPaymentMethod, true);
    assert.equal(result.guardianAutopay.length, 0);
  });

  it("returns partial when only some guardians have autopay enabled", () => {
    const result = computeFamilyAutopayStatus({
      billingAccountRow: {
        id: "acct-1",
        organization_id: "org-1",
        family_id: "family-1",
        autopay_enabled: false,
        default_payment_method_id: null,
        metadata: {
          autopayByGuardian: {
            g1: true,
            g2: false,
          },
        },
      },
      guardians: [
        {
          id: "g1",
          firstName: "Alex",
          lastName: "One",
          email: null,
          userId: "u1",
          relationship: null,
          isLinked: true,
        },
        {
          id: "g2",
          firstName: "Blair",
          lastName: "Two",
          email: null,
          userId: "u2",
          relationship: null,
          isLinked: true,
        },
      ],
      paymentMethods: [
        { billing_account_id: "acct-1", guardian_id: "g1" },
      ],
      hasBillingSplit: true,
    });

    assert.equal(result.autopayStatus, "partial");
    assert.equal(result.guardianAutopay.length, 2);
    assert.equal(result.guardianAutopay[0]?.autopayEnabled, true);
    assert.equal(result.guardianAutopay[1]?.hasPaymentMethod, false);
  });
});
