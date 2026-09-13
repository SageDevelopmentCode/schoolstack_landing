import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildInstallmentSchedule,
  canUseExtendedPaymentSchedule,
  filterPaymentPlansForBillingStart,
  isPaymentPlanAllowedForBillingStart,
  maxInstallmentsForBillingStart,
  normalizeBillingStartForSchedule,
  remainingBillableMonths,
  resolveAssignmentBillingStart,
} from "./billing-start";

describe("resolveAssignmentBillingStart", () => {
  const ratePlanStart = "2026-08-17";
  const billingDay = 1;

  it("uses rate plan start month when enroll-complete is before school year", () => {
    const result = resolveAssignmentBillingStart({
      ratePlanStart,
      enrollmentDate: new Date("2026-07-27T00:00:00Z"),
      billingDayOfMonth: billingDay,
    });
    assert.equal(result, "2026-08-01");
  });

  it("skips to next month when enrolled after billing day in start month", () => {
    const result = resolveAssignmentBillingStart({
      ratePlanStart,
      enrollmentDate: new Date("2026-08-28T00:00:00Z"),
      billingDayOfMonth: billingDay,
    });
    assert.equal(result, "2026-09-01");
  });

  it("starts in enrollment month when joining after school-year start month", () => {
    const result = resolveAssignmentBillingStart({
      ratePlanStart,
      enrollmentDate: new Date("2026-09-02T12:00:00Z"),
      billingDayOfMonth: billingDay,
    });
    assert.equal(result, "2026-09-01");
  });

  it("starts in October when enrolling in October", () => {
    const result = resolveAssignmentBillingStart({
      ratePlanStart,
      enrollmentDate: new Date("2026-10-15T00:00:00Z"),
      billingDayOfMonth: billingDay,
    });
    assert.equal(result, "2026-10-01");
  });
});

describe("normalizeBillingStartForSchedule", () => {
  it("maps legacy rate-plan calendar dates to billing day in the same month", () => {
    assert.equal(
      normalizeBillingStartForSchedule("2026-08-17", 1),
      "2026-08-01",
    );
  });

  it("keeps billing-day anchors unchanged", () => {
    assert.equal(
      normalizeBillingStartForSchedule("2026-09-01", 1),
      "2026-09-01",
    );
  });
});

describe("buildInstallmentSchedule with normalized billing start", () => {
  it("starts in August when legacy effective_start is normalized", () => {
    const billingStart = normalizeBillingStartForSchedule("2026-08-17", 1);
    const schedule = buildInstallmentSchedule(
      { installmentCount: 12, billingDayOfMonth: 1 },
      billingStart,
    );
    assert.equal(schedule[0]?.dueDate, "2026-08-01");
    assert.equal(schedule[0]?.installmentNumber, 1);
  });
});

describe("remainingBillableMonths", () => {
  it("counts Sep through May as 9 months", () => {
    assert.equal(
      remainingBillableMonths("2026-09-01", "2027-05-31"),
      9,
    );
  });

  it("counts Oct through May as 8 months", () => {
    assert.equal(
      remainingBillableMonths("2026-10-01", "2027-05-31"),
      8,
    );
  });
});

describe("payment plan filtering for late enrollment", () => {
  const ratePlanStart = "2026-08-17";
  const ratePlanEnd = "2027-05-31";
  const plans = [
    { id: "1", installmentCount: 1 },
    { id: "10", installmentCount: 10 },
    { id: "12", installmentCount: 12 },
  ];

  it("allows full plans for September billing start", () => {
    assert.equal(
      maxInstallmentsForBillingStart(ratePlanStart, ratePlanEnd, "2026-09-01"),
      null,
    );
    assert.deepEqual(
      filterPaymentPlansForBillingStart(plans, null).map((p) => p.installmentCount),
      [1, 10, 12],
    );
  });

  it("caps plans for October billing start", () => {
    const max = maxInstallmentsForBillingStart(
      ratePlanStart,
      ratePlanEnd,
      "2026-10-01",
    );
    assert.equal(max, 8);
    const filtered = filterPaymentPlansForBillingStart(plans, max);
    assert.deepEqual(
      filtered.map((p) => p.installmentCount),
      [1],
    );
  });

  it("validates individual plan selection", () => {
    assert.equal(
      isPaymentPlanAllowedForBillingStart(
        12,
        ratePlanStart,
        ratePlanEnd,
        "2026-09-01",
      ),
      true,
    );
    assert.equal(
      isPaymentPlanAllowedForBillingStart(
        12,
        ratePlanStart,
        ratePlanEnd,
        "2026-10-01",
      ),
      false,
    );
    assert.equal(
      isPaymentPlanAllowedForBillingStart(
        1,
        ratePlanStart,
        ratePlanEnd,
        "2026-10-01",
      ),
      true,
    );
  });
});

describe("canUseExtendedPaymentSchedule", () => {
  const ratePlanStart = "2026-08-17";

  it("allows August and September starts", () => {
    assert.equal(canUseExtendedPaymentSchedule(ratePlanStart, "2026-08-01"), true);
    assert.equal(canUseExtendedPaymentSchedule(ratePlanStart, "2026-09-01"), true);
    assert.equal(canUseExtendedPaymentSchedule(ratePlanStart, "2026-10-01"), false);
  });
});
