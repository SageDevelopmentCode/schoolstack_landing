import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { setStripeClientForTests } from "@/lib/stripe/client";
import { waiveCharge } from "./charge-waive";
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

function emptyPendingPaymentsBuilder() {
  const builder = {
    select() {
      return builder;
    },
    eq() {
      return builder;
    },
    order() {
      return Promise.resolve({ data: [], error: null });
    },
  };
  return builder;
}

function rowFromCharge(charge: TuitionCharge) {
  return {
    id: charge.id,
    organization_id: charge.organizationId,
    assignment_id: charge.assignmentId,
    family_id: charge.familyId,
    guardian_id: charge.guardianId,
    label: charge.label,
    base_amount_cents: charge.baseAmountCents,
    amount_cents: charge.amountCents,
    paid_cents: charge.paidCents,
    currency: charge.currency,
    due_date: charge.dueDate,
    status: charge.status,
    charge_type: charge.chargeType,
    installment_number: charge.installmentNumber,
    metadata: charge.metadata,
    sent_at: charge.sentAt,
    paid_at: charge.paidAt,
    created_at: charge.createdAt,
    updated_at: charge.updatedAt,
  };
}

describe("waiveCharge", () => {
  afterEach(() => {
    setStripeClientForTests(null);
  });

  it("waives tuition charges through the atomic RPC", async () => {
    const tuition = charge({ id: "tuition-1", chargeType: "tuition", status: "overdue" });
    const waivedRow = rowFromCharge({ ...tuition, status: "waived" });

    const supabase = {
      from(table: string) {
        if (table === "application_payments") {
          return emptyPendingPaymentsBuilder();
        }

        const filters: Record<string, unknown> = {};
        const builder = {
          select() {
            return builder;
          },
          eq(column: string, value: unknown) {
            filters[column] = value;
            return builder;
          },
          async maybeSingle() {
            if (table === "tuition_charges" && filters.id === tuition.id) {
              return { data: rowFromCharge(tuition), error: null };
            }
            return { data: null, error: null };
          },
        };
        return builder;
      },
      async rpc(name: string) {
        assert.equal(name, "waive_tuition_charge_atomic");
        return {
          data: {
            charge: waivedRow,
            cascaded_late_fee_ids: ["late-1"],
          },
          error: null,
        };
      },
    };

    setStripeClientForTests({
      checkout: {
        sessions: {
          retrieve: async () => ({ status: "expired" }),
        },
      },
    } as never);

    const result = await waiveCharge(supabase as never, tuition.id, { skip: true });

    assert.equal(result.charge.status, "waived");
    assert.deepEqual(result.cascadedLateFeeIds, ["late-1"]);
  });

  it("returns 409 when the tuition waive RPC reports a conflict", async () => {
    const tuition = charge({ id: "tuition-1", chargeType: "tuition", status: "overdue" });

    const supabase = {
      from(table: string) {
        const filters: Record<string, unknown> = {};
        const builder = {
          select() {
            return builder;
          },
          eq(column: string, value: unknown) {
            filters[column] = value;
            return builder;
          },
          async maybeSingle() {
            if (table === "tuition_charges" && filters.id === tuition.id) {
              return { data: rowFromCharge(tuition), error: null };
            }
            return { data: null, error: null };
          },
        };
        return builder;
      },
      async rpc() {
        return {
          data: null,
          error: { code: "P0001", message: "charge_waive_conflict" },
        };
      },
    };

    await assert.rejects(
      () => waiveCharge(supabase as never, tuition.id, { skip: true }),
      (error: unknown) =>
        error instanceof ChargeWaiveError &&
        error.status === 409 &&
        error.code === "status_conflict",
    );
  });

  it("waives late fees with paid_cents optimistic locking", async () => {
    const lateFee = charge({
      id: "late-1",
      chargeType: "late_fee",
      status: "sent",
      amountCents: 5000,
      label: "Late fee — August 2026",
    });
    const row = rowFromCharge(lateFee);

    const supabase = {
      from(table: string) {
        if (table === "application_payments") {
          return emptyPendingPaymentsBuilder();
        }

        const filters: Record<string, unknown> = {};
        const builder = {
          update(patch: Record<string, unknown>) {
            const updateFilters: Record<string, unknown> = {};
            const updateBuilder = {
              eq(column: string, value: unknown) {
                updateFilters[column] = value;
                return updateBuilder;
              },
              in(column: string, values: unknown[]) {
                updateFilters[`${column}__in`] = values;
                return updateBuilder;
              },
              select() {
                return updateBuilder;
              },
              async maybeSingle() {
                if (table !== "tuition_charges" || updateFilters.id !== lateFee.id) {
                  return { data: null, error: null };
                }
                assert.equal(updateFilters.paid_cents, 0);
                Object.assign(row, patch);
                return { data: row, error: null };
              },
            };
            return updateBuilder;
          },
          select() {
            return builder;
          },
          eq(column: string, value: unknown) {
            filters[column] = value;
            return builder;
          },
          async maybeSingle() {
            if (table === "tuition_charges" && filters.id === lateFee.id) {
              return { data: rowFromCharge(lateFee), error: null };
            }
            return { data: null, error: null };
          },
        };
        return builder;
      },
    };

    setStripeClientForTests({
      checkout: {
        sessions: {
          retrieve: async () => ({ status: "expired" }),
        },
      },
    } as never);

    const result = await waiveCharge(supabase as never, lateFee.id, { skip: true });

    assert.equal(result.charge.status, "waived");
    assert.deepEqual(result.cascadedLateFeeIds, []);
  });
});
