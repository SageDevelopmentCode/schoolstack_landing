import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { mapParentTuitionPaymentRows } from "./payments";

describe("mapParentTuitionPaymentRows", () => {
  it("includes studentFirstName when charge id is mapped", () => {
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
      new Map([["charge-1", "Claire"]]),
    );

    assert.equal(rows.length, 1);
    assert.equal(rows[0]?.studentFirstName, "Claire");
    assert.equal(rows[0]?.amountCents, 60000);
  });

  it("returns null studentFirstName when charge is unmapped", () => {
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
  });
});
