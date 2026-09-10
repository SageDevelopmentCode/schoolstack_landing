import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  ChargeWaiveError,
  filterLateFeesLinkedToSourceCharge,
  validateChargeCanBeWaived,
} from "./charge-waive-validation";
import type { TuitionCharge } from "./types";

function charge(
  overrides: Partial<TuitionCharge> & Pick<TuitionCharge, "id">,
): TuitionCharge {
  const { id, ...rest } = overrides;
  return {
    organizationId: "org-1",
    assignmentId: "assignment-1",
    familyId: "family-1",
    guardianId: null,
    label: "Aug Tuition",
    baseAmountCents: 30000,
    amountCents: 30000,
    paidCents: 0,
    currency: "usd",
    dueDate: "2026-08-01",
    status: "overdue",
    chargeType: "tuition",
    installmentNumber: 1,
    metadata: {},
    sentAt: null,
    paidAt: null,
    createdAt: "2026-08-01T00:00:00.000Z",
    updatedAt: "2026-08-01T00:00:00.000Z",
    ...rest,
    id,
  };
}

describe("validateChargeCanBeWaived", () => {
  it("allows open late fees", () => {
    validateChargeCanBeWaived(
      charge({
        id: "late-1",
        chargeType: "late_fee",
        status: "sent",
        amountCents: 5000,
        label: "Late fee — August 2026",
      }),
    );
  });

  it("allows overdue tuition charges", () => {
    validateChargeCanBeWaived(
      charge({ id: "tuition-1", chargeType: "tuition", status: "overdue" }),
    );
  });

  it("rejects non-overdue tuition", () => {
    assert.throws(
      () =>
        validateChargeCanBeWaived(
          charge({ id: "tuition-1", chargeType: "tuition", status: "scheduled" }),
        ),
      (error: unknown) =>
        error instanceof ChargeWaiveError && error.code === "not_overdue",
    );
  });

  it("rejects paid charges", () => {
    assert.throws(
      () =>
        validateChargeCanBeWaived(
          charge({ id: "tuition-1", status: "paid", paidAt: "2026-08-02" }),
        ),
      (error: unknown) =>
        error instanceof ChargeWaiveError && error.code === "invalid_status",
    );
  });

  it("rejects partially paid charges", () => {
    assert.throws(
      () =>
        validateChargeCanBeWaived(
          charge({ id: "tuition-1", paidCents: 1000, status: "overdue" }),
        ),
      (error: unknown) =>
        error instanceof ChargeWaiveError && error.code === "partially_paid",
    );
  });

  it("rejects unsupported charge types", () => {
    assert.throws(
      () =>
        validateChargeCanBeWaived(
          charge({ id: "fee-1", chargeType: "fee", status: "overdue" }),
        ),
      (error: unknown) =>
        error instanceof ChargeWaiveError && error.code === "unsupported_type",
    );
  });
});

describe("filterLateFeesLinkedToSourceCharge", () => {
  it("returns late fee ids linked to the source tuition charge", () => {
    const ids = filterLateFeesLinkedToSourceCharge(
      [
        {
          id: "late-1",
          metadata: {
            sourceChargeId: "tuition-1",
            assignmentId: "assignment-1",
            periodYear: 2026,
            periodMonth: 8,
          },
        },
        {
          id: "late-2",
          metadata: {
            sourceChargeId: "tuition-2",
            assignmentId: "assignment-1",
            periodYear: 2026,
            periodMonth: 8,
          },
        },
      ],
      "tuition-1",
    );

    assert.deepEqual(ids, ["late-1"]);
  });
});
