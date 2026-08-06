import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildCombinedTuitionPaymentQuote,
  validateCombinedTuitionChargeIds,
} from "./combined-tuition-payment";
import type { TuitionCharge } from "./types";

function charge(overrides: Partial<TuitionCharge> = {}): TuitionCharge {
  return {
    id: "charge-1",
    organizationId: "org-1",
    assignmentId: "assignment-1",
    familyId: "family-1",
    guardianId: null,
    label: "Aug Tuition",
    baseAmountCents: 360000,
    amountCents: 360000,
    paidCents: 0,
    currency: "USD",
    dueDate: "2026-08-01",
    status: "sent",
    chargeType: "tuition",
    installmentNumber: 1,
    metadata: {},
    sentAt: null,
    paidAt: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("validateCombinedTuitionChargeIds", () => {
  it("requires at least two charges", () => {
    const result = validateCombinedTuitionChargeIds({
      chargeIds: ["charge-1"],
      charges: [charge()],
      allOpenChargesOnDueDate: [charge()],
    });

    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.equal(result.code, "invalid_charges");
    }
  });

  it("accepts all open charges on the due date", () => {
    const charges = [
      charge({ id: "charge-1", assignmentId: "assignment-1" }),
      charge({
        id: "charge-2",
        assignmentId: "assignment-2",
        baseAmountCents: 72000,
        amountCents: 72000,
      }),
    ];

    const result = validateCombinedTuitionChargeIds({
      chargeIds: ["charge-1", "charge-2"],
      charges,
      allOpenChargesOnDueDate: charges,
    });

    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.candidates.length, 2);
      assert.equal(result.candidates[0]?.amountCents, 360000);
      assert.equal(result.candidates[1]?.amountCents, 72000);
    }
  });

  it("rejects partial charge sets on the same due date", () => {
    const charges = [
      charge({ id: "charge-1" }),
      charge({ id: "charge-2", baseAmountCents: 72000, amountCents: 72000 }),
    ];

    const result = validateCombinedTuitionChargeIds({
      chargeIds: ["charge-1"],
      charges: [charges[0]!],
      allOpenChargesOnDueDate: charges,
    });

    assert.equal(result.ok, false);
  });
});

describe("buildCombinedTuitionPaymentQuote", () => {
  it("allocates one processing fee across line items", () => {
    const candidates = [
      {
        charge: charge({ id: "charge-1" }),
        studentName: "Julia",
        amountCents: 360000,
      },
      {
        charge: charge({
          id: "charge-2",
          baseAmountCents: 72000,
          amountCents: 72000,
        }),
        studentName: "Caleb",
        amountCents: 72000,
      },
    ];

    const quote = buildCombinedTuitionPaymentQuote(candidates, "card");

    assert.equal(quote.combinedQuote.netAmountCents, 432000);
    assert.equal(
      quote.allocations.reduce((sum, allocation) => sum + allocation.netAmountCents, 0),
      432000,
    );
    assert.equal(
      quote.allocations.reduce(
        (sum, allocation) => sum + allocation.chargedAmountCents,
        0,
      ),
      quote.combinedQuote.grossAmountCents,
    );
  });
});
