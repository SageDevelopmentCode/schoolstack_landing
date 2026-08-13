import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { RawKpiChargeRow } from "./kpi-breakdown";
import {
  chargeMatchesOutstandingPeriod,
  computeOutstandingCentsFromCharges,
  deriveSchoolYearBounds,
  isIsoDateInRange,
  resolveOutstandingDateRange,
} from "./outstanding-period";

const referenceDate = new Date("2026-08-13T12:00:00.000Z");

function makeCharge(overrides: Partial<RawKpiChargeRow> = {}): RawKpiChargeRow {
  return {
    id: "charge-1",
    family_id: "family-1",
    assignment_id: "assignment-1",
    label: "Aug Tuition",
    amount_cents: 60000,
    paid_cents: 0,
    status: "scheduled",
    due_date: "2026-08-31",
    paid_at: null,
    ...overrides,
  };
}

describe("resolveOutstandingDateRange", () => {
  it("returns the current calendar month", () => {
    assert.deepEqual(resolveOutstandingDateRange("current_month", referenceDate), {
      startDate: "2026-08-01",
      endDate: "2026-08-31",
    });
  });

  it("returns the next calendar month", () => {
    assert.deepEqual(resolveOutstandingDateRange("next_month", referenceDate), {
      startDate: "2026-09-01",
      endDate: "2026-09-30",
    });
  });

  it("returns three inclusive calendar months for next_3_months", () => {
    assert.deepEqual(resolveOutstandingDateRange("next_3_months", referenceDate), {
      startDate: "2026-08-01",
      endDate: "2026-10-31",
    });
  });

  it("returns today through school year end", () => {
    assert.deepEqual(
      resolveOutstandingDateRange("school_year_remainder", referenceDate, {
        effectiveStart: "2026-08-01",
        effectiveEnd: "2027-05-31",
      }),
      {
        startDate: "2026-08-13",
        endDate: "2027-05-31",
      },
    );
  });
});

describe("chargeMatchesOutstandingPeriod", () => {
  it("includes overdue charges for current month", () => {
    const range = resolveOutstandingDateRange("current_month", referenceDate);
    assert.equal(
      chargeMatchesOutstandingPeriod(
        makeCharge({ status: "overdue", due_date: "2026-07-01" }),
        "current_month",
        range,
      ),
      true,
    );
  });

  it("excludes overdue charges for next month", () => {
    const range = resolveOutstandingDateRange("next_month", referenceDate);
    assert.equal(
      chargeMatchesOutstandingPeriod(
        makeCharge({ status: "overdue", due_date: "2026-07-01" }),
        "next_month",
        range,
      ),
      false,
    );
  });

  it("includes scheduled charges due in the selected range", () => {
    const range = resolveOutstandingDateRange("next_month", referenceDate);
    assert.equal(
      chargeMatchesOutstandingPeriod(
        makeCharge({ status: "scheduled", due_date: "2026-09-15" }),
        "next_month",
        range,
      ),
      true,
    );
    assert.equal(
      chargeMatchesOutstandingPeriod(
        makeCharge({ status: "scheduled", due_date: "2026-10-15" }),
        "next_month",
        range,
      ),
      false,
    );
  });
});

describe("computeOutstandingCentsFromCharges", () => {
  it("sums only charges in the selected period", () => {
    const total = computeOutstandingCentsFromCharges(
      [
        makeCharge({ id: "c1", due_date: "2026-08-31", amount_cents: 60000 }),
        makeCharge({ id: "c2", due_date: "2026-09-30", amount_cents: 60000 }),
        makeCharge({ id: "c3", due_date: "2026-10-31", amount_cents: 60000 }),
      ],
      "current_month",
      { effectiveStart: null, effectiveEnd: null },
      referenceDate,
    );
    assert.equal(total, 60000);
  });
});

describe("deriveSchoolYearBounds", () => {
  it("uses earliest start and latest end across non-draft plans", () => {
    assert.deepEqual(
      deriveSchoolYearBounds([
        {
          status: "active",
          effectiveStart: "2026-08-01",
          effectiveEnd: "2027-05-31",
        },
        {
          status: "active",
          effectiveStart: "2027-08-01",
          effectiveEnd: "2028-05-31",
        },
        {
          status: "draft",
          effectiveStart: "2099-01-01",
          effectiveEnd: "2099-12-31",
        },
      ]),
      {
        effectiveStart: "2026-08-01",
        effectiveEnd: "2028-05-31",
      },
    );
  });
});

describe("isIsoDateInRange", () => {
  it("compares inclusive ISO date strings", () => {
    assert.equal(
      isIsoDateInRange("2026-08-15", { startDate: "2026-08-01", endDate: "2026-08-31" }),
      true,
    );
    assert.equal(
      isIsoDateInRange("2026-09-01", { startDate: "2026-08-01", endDate: "2026-08-31" }),
      false,
    );
  });
});
