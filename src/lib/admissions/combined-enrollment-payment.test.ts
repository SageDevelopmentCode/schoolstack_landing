import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  allocateCombinedPaymentAmounts,
  allocateGrossAcrossLineItems,
  buildCombinedEnrollmentPaymentQuote,
  type CombinedEnrollmentPaymentCandidate,
} from "@/lib/admissions/combined-enrollment-payment";
import { quoteProcessingFee } from "@/lib/stripe/processing-fee";

const sampleCandidates: CombinedEnrollmentPaymentCandidate[] = [
  {
    instanceId: "item-1",
    applicationId: "app-1",
    studentName: "Ava",
    feeLabel: "Registration fee",
    amountCents: 50_000,
  },
  {
    instanceId: "item-2",
    applicationId: "app-2",
    studentName: "Noah",
    feeLabel: "Registration fee",
    amountCents: 50_000,
  },
];

describe("allocateGrossAcrossLineItems", () => {
  it("allocates gross cents across line items that sum to the total", () => {
    const grossAmounts = allocateGrossAcrossLineItems([50_000, 50_000], 103_091);
    assert.deepEqual(grossAmounts, [51_546, 51_545]);
    assert.equal(
      grossAmounts.reduce((sum, amount) => sum + amount, 0),
      103_091,
    );
  });
});

describe("allocateCombinedPaymentAmounts", () => {
  it("allocates net, gross, and processing fee across payment rows", () => {
    const combinedQuote = quoteProcessingFee(100_000, "card");
    const allocations = allocateCombinedPaymentAmounts(
      [50_000, 50_000],
      combinedQuote,
    );

    assert.equal(allocations.length, 2);
    assert.equal(
      allocations.reduce((sum, row) => sum + row.netAmountCents, 0),
      100_000,
    );
    assert.equal(
      allocations.reduce((sum, row) => sum + row.chargedAmountCents, 0),
      combinedQuote.grossAmountCents,
    );
    assert.equal(
      allocations.reduce((sum, row) => sum + row.processingFeeCents, 0),
      combinedQuote.processingFeeCents,
    );
  });
});

describe("buildCombinedEnrollmentPaymentQuote", () => {
  it("reports savings versus separate checkouts", () => {
    const quote = buildCombinedEnrollmentPaymentQuote(sampleCandidates, "card");
    const separateGrossCents = sampleCandidates.reduce(
      (sum, candidate) =>
        sum + quoteProcessingFee(candidate.amountCents, "card").grossAmountCents,
      0,
    );

    assert.equal(quote.combinedQuote.netAmountCents, 100_000);
    assert.equal(quote.separateGrossCents, separateGrossCents);
    assert.equal(
      quote.savingsCents,
      separateGrossCents - quote.combinedQuote.grossAmountCents,
    );
    assert.ok(quote.savingsCents > 0);
  });

  it("requires at least two payment items", () => {
    assert.throws(
      () =>
        buildCombinedEnrollmentPaymentQuote(
          [sampleCandidates[0]!],
          "card",
        ),
      /at least two payment items/i,
    );
  });
});
