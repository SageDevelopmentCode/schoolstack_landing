import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseParentBillingPageMetaRow } from "./parent-billing-page-meta";

describe("parseParentBillingPageMetaRow", () => {
  it("parses billing meta aggregates", () => {
    const parsed = parseParentBillingPageMetaRow({
      balance_due_cents: "12000",
      total_remaining_cents: 45000,
      next_due_date: "2026-09-15",
      next_due_amount_cents: 12000,
      open_charge_count: 3,
      payment_count: 2,
      has_billing_split: true,
    });

    assert.deepEqual(parsed, {
      balanceDueCents: 12000,
      totalRemainingCents: 45000,
      nextDueDate: "2026-09-15",
      nextDueAmountCents: 12000,
      openChargeCount: 3,
      paymentCount: 2,
      hasBillingSplit: true,
    });
  });
});
