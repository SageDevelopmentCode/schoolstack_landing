import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  ChargeStatusConflictError,
  updateChargeStatusIf,
} from "./charges";
import { settleTuitionPayment } from "./payment-settlement";
import type { TuitionCharge } from "./types";

function tuitionCharge(overrides: Partial<TuitionCharge> & Pick<TuitionCharge, "id">): TuitionCharge {
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

describe("updateChargeStatusIf", () => {
  it("updates only when the expected status is still present", async () => {
    const charge = tuitionCharge({ id: "charge-1", status: "overdue" });
    const row = rowFromCharge(charge);

    const supabase = {
      from(table: string) {
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
                if (table !== "tuition_charges" || updateFilters.id !== charge.id) {
                  return { data: null, error: null };
                }
                const allowed = updateFilters.status__in as string[] | undefined;
                if (!allowed?.includes(String(row.status))) {
                  return { data: null, error: null };
                }
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
            if (table === "tuition_charges" && filters.id === charge.id) {
              return { data: row, error: null };
            }
            return { data: null, error: null };
          },
        };
        return builder;
      },
    };

    const updated = await updateChargeStatusIf(supabase as never, charge.id, {
      fromStatuses: ["overdue"],
      toStatus: "waived",
    });

    assert.equal(updated.status, "waived");
  });

  it("throws when the status changed before update", async () => {
    const charge = tuitionCharge({ id: "charge-1", status: "paid", paidAt: "2026-08-02" });
    const row = rowFromCharge(charge);

    const supabase = {
      from() {
        const filters: Record<string, unknown> = {};
        const builder = {
          update() {
            const updateBuilder = {
              eq(column: string, value: unknown) {
                filters[column] = value;
                return updateBuilder;
              },
              in() {
                return updateBuilder;
              },
              select() {
                return updateBuilder;
              },
              async maybeSingle() {
                return { data: null, error: null };
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
            if (filters.id === charge.id) {
              return { data: row, error: null };
            }
            return { data: null, error: null };
          },
        };
        return builder;
      },
    };

    await assert.rejects(
      () =>
        updateChargeStatusIf(supabase as never, charge.id, {
          fromStatuses: ["overdue"],
          toStatus: "waived",
        }),
      (error: unknown) => error instanceof ChargeStatusConflictError,
    );
  });
});

describe("settleTuitionPayment status guards", () => {
  it("rejects settlement when paid_cents changed before update", async () => {
    const charge = tuitionCharge({ id: "charge-1", status: "overdue", paidCents: 0 });
    const row = rowFromCharge(charge);
    let fetchCount = 0;

    const supabase = {
      from(table: string) {
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
                if (table !== "tuition_charges" || updateFilters.id !== charge.id) {
                  return { data: null, error: null };
                }
                row.paid_cents = 5000;
                const statusIn = updateFilters.status__in as string[] | undefined;
                if (!statusIn?.includes(String(row.status))) {
                  return { data: null, error: null };
                }
                if (updateFilters.paid_cents !== row.paid_cents) {
                  return { data: null, error: null };
                }
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
            if (table === "tuition_charges" && filters.id === charge.id) {
              fetchCount += 1;
              if (fetchCount === 1) {
                return { data: { ...row, paid_cents: 0 }, error: null };
              }
              return { data: { ...row, paid_cents: 5000 }, error: null };
            }
            return { data: null, error: null };
          },
        };
        return builder;
      },
    };

    await assert.rejects(
      () =>
        settleTuitionPayment(supabase as never, {
          chargeId: charge.id,
          amountCents: 10000,
        }),
      (error: unknown) => {
        return (
          error instanceof ChargeStatusConflictError &&
          error.message === "Charge balance changed before settlement."
        );
      },
    );
  });

  it("rejects settlement when the charge was waived", async () => {
    const charge = tuitionCharge({ id: "charge-1", status: "waived" });
    const row = rowFromCharge(charge);

    const supabase = {
      from() {
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
            if (filters.id === charge.id) {
              return { data: row, error: null };
            }
            return { data: null, error: null };
          },
        };
        return builder;
      },
    };

    await assert.rejects(
      () =>
        settleTuitionPayment(supabase as never, {
          chargeId: charge.id,
          amountCents: 30000,
        }),
      (error: unknown) => error instanceof ChargeStatusConflictError,
    );
  });
});
