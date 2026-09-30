import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  chargeMatchesAutopayTarget,
  getAutopayTargets,
} from "./autopay-targets";
import type { TuitionBillingAccount } from "./types";

function account(
  overrides: Partial<TuitionBillingAccount> & {
    autopayEnabled: boolean;
    metadata: TuitionBillingAccount["metadata"];
  },
): TuitionBillingAccount {
  return {
    id: "billing-1",
    organizationId: "org-1",
    familyId: "family-1",
    defaultPaymentMethodId: null,
    billingEmail: null,
    status: "active",
    createdAt: "",
    updatedAt: "",
    ...overrides,
  };
}

describe("getAutopayTargets", () => {
  it("uses legacy null target when only autopay_enabled is set", () => {
    const targets = getAutopayTargets(
      account({ autopayEnabled: true, metadata: {} }),
    );
    assert.equal(targets.size, 1);
    assert.equal(targets.has(null), true);
  });

  it("uses guardian keys from metadata", () => {
    const targets = getAutopayTargets(
      account({
        autopayEnabled: false,
        metadata: { autopayByGuardian: { "g-1": true } },
      }),
    );
    assert.equal(targets.has("g-1"), true);
    assert.equal(targets.has(null), false);
  });
});

describe("chargeMatchesAutopayTarget", () => {
  it("matches family-level charges for any target when there is no billing split", () => {
    const targets = getAutopayTargets(
      account({
        autopayEnabled: false,
        metadata: { autopayByGuardian: { "g-1": true } },
      }),
    );
    assert.equal(
      chargeMatchesAutopayTarget(
        { guardian_id: null },
        targets,
        false,
      ),
      true,
    );
  });

  it("requires guardian_id match when billing is split", () => {
    const targets = getAutopayTargets(
      account({
        autopayEnabled: false,
        metadata: { autopayByGuardian: { "g-1": true } },
      }),
    );
    assert.equal(
      chargeMatchesAutopayTarget(
        { guardian_id: null },
        targets,
        true,
      ),
      false,
    );
    assert.equal(
      chargeMatchesAutopayTarget(
        { guardian_id: "g-1" },
        targets,
        true,
      ),
      true,
    );
  });
});
