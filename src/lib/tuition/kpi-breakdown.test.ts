import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildTuitionKpiBreakdown,
  filterChargeLineForKind,
  getTuitionYearStartUtc,
  remainingChargeBalanceCents,
  type RawKpiChargeRow,
} from "./kpi-breakdown";

const yearStart = getTuitionYearStartUtc(new Date("2026-08-13T12:00:00.000Z"));

function makeCharge(overrides: Partial<RawKpiChargeRow> = {}): RawKpiChargeRow {
  return {
    id: "charge-1",
    family_id: "family-1",
    assignment_id: "assignment-1",
    label: "Installment 1",
    amount_cents: 100_000,
    paid_cents: 0,
    status: "scheduled",
    due_date: "2026-09-01",
    paid_at: null,
    ...overrides,
  };
}

describe("remainingChargeBalanceCents", () => {
  it("returns remaining balance after partial payment", () => {
    assert.equal(
      remainingChargeBalanceCents(makeCharge({ amount_cents: 10_000, paid_cents: 2_500 })),
      7_500,
    );
  });
});

describe("filterChargeLineForKind", () => {
  it("includes paid charges in the current year for collected YTD", () => {
    const result = filterChargeLineForKind(
      makeCharge({
        status: "paid",
        amount_cents: 50_000,
        paid_at: "2026-03-15T00:00:00.000Z",
      }),
      "collected_ytd",
      yearStart,
    );
    assert.deepEqual(result, {
      amountCents: 50_000,
      date: "2026-03-15T00:00:00.000Z",
    });
  });

  it("excludes paid charges from prior years for collected YTD", () => {
    assert.equal(
      filterChargeLineForKind(
        makeCharge({
          status: "paid",
          paid_at: "2025-12-31T23:59:59.000Z",
        }),
        "collected_ytd",
        yearStart,
      ),
      null,
    );
  });

  it("includes open charge balances for outstanding", () => {
    const result = filterChargeLineForKind(
      makeCharge({
        status: "sent",
        amount_cents: 12_000,
        paid_cents: 2_000,
      }),
      "outstanding",
      yearStart,
    );
    assert.deepEqual(result, {
      amountCents: 10_000,
      date: "2026-09-01",
    });
  });

  it("includes overdue balances for at risk", () => {
    const result = filterChargeLineForKind(
      makeCharge({
        status: "overdue",
        amount_cents: 8_000,
        paid_cents: 1_000,
      }),
      "at_risk",
      yearStart,
    );
    assert.deepEqual(result, {
      amountCents: 7_000,
      date: "2026-09-01",
    });
  });
});

describe("buildTuitionKpiBreakdown", () => {
  it("groups lines by family and sorts families by total desc", () => {
    const breakdown = buildTuitionKpiBreakdown({
      kind: "outstanding",
      yearStart,
      charges: [
        makeCharge({
          id: "c1",
          family_id: "family-a",
          assignment_id: "assignment-a",
          status: "sent",
          amount_cents: 5_000,
        }),
        makeCharge({
          id: "c2",
          family_id: "family-b",
          assignment_id: "assignment-b",
          status: "overdue",
          amount_cents: 12_000,
        }),
        makeCharge({
          id: "c3",
          family_id: "family-a",
          assignment_id: "assignment-a",
          status: "scheduled",
          amount_cents: 3_000,
        }),
      ],
      familyNamesById: new Map([
        ["family-a", "Alpha Family"],
        ["family-b", "Beta Family"],
      ]),
      studentNameByAssignmentId: new Map([
        ["assignment-a", "Alex Alpha"],
        ["assignment-b", "Blake Beta"],
      ]),
      childrenByFamilyId: new Map([
        ["family-a", ["Alex Alpha"]],
        ["family-b", ["Blake Beta"]],
      ]),
    });

    assert.equal(breakdown.totalCents, 20_000);
    assert.equal(breakdown.familyCount, 2);
    assert.equal(breakdown.families[0]?.familyName, "Beta Family");
    assert.equal(breakdown.families[0]?.totalCents, 12_000);
    assert.equal(breakdown.families[1]?.familyName, "Alpha Family");
    assert.equal(breakdown.families[1]?.lines.length, 2);
  });
});
