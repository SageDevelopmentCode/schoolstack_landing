import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { PaymentRecord } from "@/lib/stripe/application-payments";
import {
  mapParentTuitionPaymentRows,
  resolveLastPaymentDaySummary,
  resolveMostRecentTuitionPayment,
  type ParentTuitionPaymentRecord,
} from "./payments";

describe("mapParentTuitionPaymentRows", () => {
  it("includes studentFirstName and enrollmentId when charge id is mapped", () => {
    const rows = mapParentTuitionPaymentRows(
      [
        {
          id: "payment-1",
          organization_id: "org-1",
          family_id: "family-1",
          tuition_charge_id: "charge-1",
          payment_type: "tuition",
          label: "Aug Tuition",
          amount_cents: 60000,
          currency: "USD",
          status: "succeeded",
          paid_at: "2026-08-06T05:46:48.5+00",
          created_at: "2026-08-06T05:46:32.089437+00",
        },
      ],
      "family-1",
      new Map([
        [
          "charge-1",
          { firstName: "Claire", enrollmentId: "enrollment-claire" },
        ],
      ]),
    );

    assert.equal(rows.length, 1);
    assert.equal(rows[0]?.studentFirstName, "Claire");
    assert.equal(rows[0]?.enrollmentId, "enrollment-claire");
    assert.equal(rows[0]?.amountCents, 60000);
  });

  it("returns null student fields when charge is unmapped", () => {
    const rows = mapParentTuitionPaymentRows(
      [
        {
          id: "payment-1",
          organization_id: "org-1",
          family_id: "family-1",
          tuition_charge_id: "charge-1",
          payment_type: "tuition",
          label: "Aug Tuition",
          amount_cents: 60000,
          currency: "USD",
          status: "succeeded",
          paid_at: "2026-08-06T05:46:48.5+00",
          created_at: "2026-08-06T05:46:32.089437+00",
        },
      ],
      "family-1",
    );

    assert.equal(rows[0]?.studentFirstName, null);
    assert.equal(rows[0]?.enrollmentId, null);
  });
});

function paymentRecord(
  overrides: Partial<ParentTuitionPaymentRecord> = {},
): ParentTuitionPaymentRecord {
  const base: PaymentRecord = {
    id: "payment-1",
    organizationId: "org-1",
    applicationId: null,
    familyId: "family-1",
    tuitionChargeId: "charge-1",
    paymentType: "tuition",
    enrollmentChecklistItemId: null,
    label: "Aug Tuition",
    payerUserId: null,
    stripeCheckoutSessionId: null,
    stripePaymentIntentId: null,
    amountCents: 60000,
    amountAppliedCents: null,
    chargedAmountCents: null,
    processingFeeCents: null,
    paymentMethodType: null,
    currency: "USD",
    status: "succeeded",
    stripeProviderStatus: null,
    paidAt: "2026-08-01T12:00:00.000Z",
    createdAt: "2026-08-01T12:00:00.000Z",
  };

  return {
    ...base,
    studentFirstName: null,
    enrollmentId: null,
    ...overrides,
  };
}

describe("resolveMostRecentTuitionPayment", () => {
  it("returns the latest succeeded payment by paidAt", () => {
    const result = resolveMostRecentTuitionPayment([
      paymentRecord({
        id: "payment-older",
        paidAt: "2026-07-01T12:00:00.000Z",
        amountCents: 360000,
      }),
      paymentRecord({
        id: "payment-newer",
        paidAt: "2026-08-06T05:46:48.000Z",
        amountCents: 432000,
      }),
    ]);

    assert.equal(result?.id, "payment-newer");
    assert.equal(result?.amountCents, 432000);
  });

  it("ignores pending and failed payments", () => {
    const result = resolveMostRecentTuitionPayment([
      paymentRecord({ id: "payment-pending", status: "pending", paidAt: null }),
      paymentRecord({
        id: "payment-failed",
        status: "failed",
        paidAt: "2026-09-01T12:00:00.000Z",
      }),
      paymentRecord({
        id: "payment-succeeded",
        paidAt: "2026-08-01T12:00:00.000Z",
      }),
    ]);

    assert.equal(result?.id, "payment-succeeded");
  });

  it("returns null when there are no succeeded payments", () => {
    assert.equal(
      resolveMostRecentTuitionPayment([
        paymentRecord({ status: "pending", paidAt: null }),
      ]),
      null,
    );
  });
});

describe("resolveLastPaymentDaySummary", () => {
  it("returns the single latest payment when only one exists on that day", () => {
    const result = resolveLastPaymentDaySummary([
      paymentRecord({
        id: "payment-older",
        paidAt: "2026-07-01T12:00:00.000Z",
        amountCents: 360000,
      }),
      paymentRecord({
        id: "payment-newer",
        paidAt: "2026-08-06T05:46:48.000Z",
        amountCents: 72000,
        studentFirstName: "Caleb",
      }),
    ]);

    assert.deepEqual(result, {
      paidAt: "2026-08-06T05:46:48.000Z",
      amountCents: 72000,
      studentFirstNames: ["Caleb"],
    });
  });

  it("sums payments on the same UTC day for different students", () => {
    const result = resolveLastPaymentDaySummary([
      paymentRecord({
        id: "payment-julia",
        paidAt: "2026-08-06T10:00:00.000Z",
        amountCents: 360000,
        studentFirstName: "Julia",
      }),
      paymentRecord({
        id: "payment-caleb",
        paidAt: "2026-08-06T15:00:00.000Z",
        amountCents: 72000,
        studentFirstName: "Caleb",
      }),
      paymentRecord({
        id: "payment-older",
        paidAt: "2026-07-01T12:00:00.000Z",
        amountCents: 10000,
        studentFirstName: "Julia",
      }),
    ]);

    assert.equal(result?.amountCents, 432000);
    assert.deepEqual(result?.studentFirstNames, ["Julia", "Caleb"]);
    assert.equal(result?.paidAt, "2026-08-06T15:00:00.000Z");
  });

  it("sums multiple payments on the same day for one student", () => {
    const result = resolveLastPaymentDaySummary([
      paymentRecord({
        id: "payment-1",
        paidAt: "2026-08-06T10:00:00.000Z",
        amountCents: 36000,
        studentFirstName: "Caleb",
      }),
      paymentRecord({
        id: "payment-2",
        paidAt: "2026-08-06T12:00:00.000Z",
        amountCents: 36000,
        studentFirstName: "Caleb",
      }),
    ]);

    assert.equal(result?.amountCents, 72000);
    assert.deepEqual(result?.studentFirstNames, ["Caleb"]);
  });

  it("ignores pending and failed payments", () => {
    const result = resolveLastPaymentDaySummary([
      paymentRecord({ id: "payment-pending", status: "pending", paidAt: null }),
      paymentRecord({
        id: "payment-failed",
        status: "failed",
        paidAt: "2026-08-06T12:00:00.000Z",
        amountCents: 99999,
      }),
      paymentRecord({
        id: "payment-succeeded",
        paidAt: "2026-08-06T12:00:00.000Z",
        amountCents: 72000,
        studentFirstName: "Caleb",
      }),
    ]);

    assert.equal(result?.amountCents, 72000);
    assert.deepEqual(result?.studentFirstNames, ["Caleb"]);
  });

  it("returns null when there are no succeeded payments", () => {
    assert.equal(
      resolveLastPaymentDaySummary([
        paymentRecord({ status: "pending", paidAt: null }),
      ]),
      null,
    );
  });
});
