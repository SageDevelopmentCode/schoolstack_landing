import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { chargeRemainingCents } from "./billing-splits";
import { redistributeOpenInstallments } from "./payment-settlement";

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
