import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { chargeRemainingCents } from "./billing-splits";
import {
  billingPeriodFromDueDate,
  previewInstallmentRedistribution,
  previewTuitionPaymentRedistribution,
  redistributeOpenInstallments,
  settleTuitionPayment,
} from "./payment-settlement";

describe("chargeRemainingCents", () => {
  it("returns unpaid balance", () => {
    assert.equal(
      chargeRemainingCents({ amountCents: 36000, paidCents: 10000 }),
      26000,
    );
  });

  it("never returns negative", () => {
    assert.equal(
      chargeRemainingCents({ amountCents: 36000, paidCents: 40000 }),
      0,
    );
  });
});

describe("previewInstallmentRedistribution", () => {
  it("projects reduced future installments after surplus", () => {
    const preview = previewInstallmentRedistribution({
      openCharges: [
        { amountCents: 36000, paidCents: 0 },
        { amountCents: 36000, paidCents: 0 },
      ],
      surplusCents: 4000,
    });

    assert.equal(preview.futureInstallmentCount, 2);
    assert.equal(preview.newTotalRemainingCents, 68000);
    assert.equal(
      preview.projectedAmountsCents.reduce((sum, value) => sum + value, 0),
      68000,
    );
    assert.equal(preview.fullyPaid, false);
    assert.equal(preview.creditBalanceCents, 0);
  });

  it("marks year fully paid when surplus covers all remaining", () => {
    const preview = previewInstallmentRedistribution({
      openCharges: [
        { amountCents: 36000, paidCents: 0 },
        { amountCents: 36000, paidCents: 0 },
      ],
      surplusCents: 72000,
    });

    assert.equal(preview.fullyPaid, true);
    assert.equal(preview.newTotalRemainingCents, 0);
    assert.equal(preview.creditBalanceCents, 0);
  });

  it("returns credit balance when surplus exceeds remaining", () => {
    const preview = previewInstallmentRedistribution({
      openCharges: [{ amountCents: 36000, paidCents: 0 }],
      surplusCents: 50000,
    });

    assert.equal(preview.fullyPaid, true);
    assert.equal(preview.creditBalanceCents, 14000);
  });
});

describe("previewTuitionPaymentRedistribution", () => {
  it("projects reduced installments after an extra payment on the first charge", () => {
    const preview = previewTuitionPaymentRedistribution({
      currentChargeRemainingCents: 72000,
      paymentAmountCents: 360000,
      futureOpenCharges: Array.from({ length: 9 }, () => ({
        amountCents: 72000,
        paidCents: 0,
      })),
    });

    assert.equal(preview.surplusCents, 288000);
    assert.equal(preview.futureInstallmentCount, 9);
    assert.equal(preview.newTotalRemainingCents, 360000);
    assert.equal(preview.fullyPaid, false);
    assert.equal(preview.creditBalanceCents, 0);
    assert.deepEqual(preview.projectedAmountsCents, Array(9).fill(40000));
  });
});

describe("redistributeOpenInstallments", () => {
  it("reduces future installment amounts after surplus payment", async () => {
    const updates: Array<{ id: string; amount_cents: number }> = [];
    const openCharges = [
      {
        id: "charge-2",
        amount_cents: 36000,
        paid_cents: 0,
        due_date: "2026-09-01",
        guardian_id: "guardian-1",
        status: "scheduled",
      },
      {
        id: "charge-3",
        amount_cents: 36000,
        paid_cents: 0,
        due_date: "2026-10-01",
        guardian_id: "guardian-1",
        status: "scheduled",
      },
    ];

    const supabase = {
      from(table: string) {
        assert.equal(table, "tuition_charges");
        const builder = {
          select() {
            return builder;
          },
          eq() {
            return builder;
          },
          in() {
            return builder;
          },
          is() {
            return builder;
          },
          order() {
            return Promise.resolve({ data: openCharges, error: null });
          },
          update(patch: { amount_cents: number }) {
            return {
              eq(_column: string, id: string) {
                updates.push({ id, amount_cents: patch.amount_cents });
                return Promise.resolve({ error: null });
              },
            };
          },
        };
        return builder;
      },
    };

    const redistributed = await redistributeOpenInstallments(
      supabase as never,
      {
        assignmentId: "assignment-1",
        guardianId: "guardian-1",
        surplusCents: 4000,
        organizationId: "org-1",
        familyId: "family-1",
      },
    );

    assert.equal(redistributed, true);
    assert.equal(updates.length, 2);
    const totalRemaining = updates.reduce((sum, row) => sum + row.amount_cents, 0);
    assert.equal(totalRemaining, 68000);
  });
});

describe("billingPeriodFromDueDate", () => {
  it("derives year and month from due date", () => {
    assert.deepEqual(billingPeriodFromDueDate("2026-08-01"), {
      year: 2026,
      month: 8,
    });
  });
});

describe("settleTuitionPayment", () => {
  it("voids open late fees for the same billing period when tuition is fully paid", async () => {
    const voidedLateFeeIds: string[] = [];
    const charges = [
      {
        id: "tuition-aug",
        organization_id: "org-1",
        assignment_id: "assign-1",
        family_id: "family-1",
        guardian_id: null,
        label: "Aug Tuition",
        base_amount_cents: 60000,
        amount_cents: 60000,
        paid_cents: 0,
        due_date: "2026-08-01",
        status: "sent",
        charge_type: "tuition",
        installment_number: 1,
        paid_at: null,
        sent_at: null,
        metadata: {},
        created_at: "",
        updated_at: "",
      },
      {
        id: "late-fee-aug",
        organization_id: "org-1",
        assignment_id: "assign-1",
        family_id: "family-1",
        guardian_id: null,
        label: "Late fee — August 2026",
        base_amount_cents: 5000,
        amount_cents: 5000,
        paid_cents: 0,
        due_date: "2026-08-15",
        status: "sent",
        charge_type: "late_fee",
        installment_number: null,
        paid_at: null,
        sent_at: null,
        metadata: {
          periodYear: 2026,
          periodMonth: 8,
        },
        created_at: "",
        updated_at: "",
      },
      {
        id: "late-fee-sep",
        organization_id: "org-1",
        assignment_id: "assign-1",
        family_id: "family-1",
        guardian_id: null,
        label: "Late fee — September 2026",
        base_amount_cents: 5000,
        amount_cents: 5000,
        paid_cents: 0,
        due_date: "2026-09-10",
        status: "sent",
        charge_type: "late_fee",
        installment_number: null,
        paid_at: null,
        sent_at: null,
        metadata: {
          periodYear: 2026,
          periodMonth: 9,
        },
        created_at: "",
        updated_at: "",
      },
    ];

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
          in(column: string, values: unknown[]) {
            filters[`${column}__in`] = values;
            return builder;
          },
          update(patch: Record<string, unknown>) {
            return {
              eq(column: string, value: unknown) {
                if (table === "tuition_charges" && column === "id") {
                  const charge = charges.find((row) => row.id === value);
                  if (charge) Object.assign(charge, patch);
                }
                return {
                  select() {
                    return {
                      async single() {
                        const charge = charges.find((row) => row.id === value);
                        return { data: charge, error: null };
                      },
                    };
                  },
                };
              },
              in(column: string, ids: unknown[]) {
                if (table === "tuition_charges" && column === "id") {
                  for (const id of ids) {
                    const charge = charges.find((row) => row.id === id);
                    if (charge) {
                      Object.assign(charge, patch);
                      voidedLateFeeIds.push(String(id));
                    }
                  }
                }
                return Promise.resolve({ error: null });
              },
            };
          },
          maybeSingle: async () => {
            if (table === "tuition_charges" && filters.id) {
              return {
                data: charges.find((row) => row.id === filters.id) ?? null,
                error: null,
              };
            }
            return { data: null, error: null };
          },
          then(resolve: (value: { data: typeof charges; error: null }) => void) {
            if (table === "tuition_charges") {
              let rows = charges;
              if (filters.assignment_id) {
                rows = rows.filter((row) => row.assignment_id === filters.assignment_id);
              }
              if (filters.charge_type) {
                rows = rows.filter((row) => row.charge_type === filters.charge_type);
              }
              if (Array.isArray(filters.status__in)) {
                rows = rows.filter((row) => filters.status__in.includes(row.status));
              }
              resolve({ data: rows, error: null });
              return;
            }
            resolve({ data: [], error: null });
          },
        };
        return builder;
      },
    };

    const result = await settleTuitionPayment(supabase as never, {
      chargeId: "tuition-aug",
      amountCents: 60000,
    });

    assert.equal(result.charge.status, "paid");
    assert.deepEqual(voidedLateFeeIds, ["late-fee-aug"]);
    assert.equal(
      charges.find((row) => row.id === "late-fee-sep")?.status,
      "sent",
    );
  });
});
