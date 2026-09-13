import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildInstallmentSchedule,
  normalizeBillingStartForSchedule,
} from "./billing-start";
import { remapPaidChargesForBillingStart } from "./charge-generator";

const paymentPlan = { installmentCount: 12, billingDayOfMonth: 1 };
const guardianId = "guardian-1";
const guardianNames = new Map([[guardianId, "Alex Parent"]]);

describe("remapPaidChargesForBillingStart", () => {
  it("assigns sequential due dates when same payer paid before and on billing start", () => {
    const billingStart = normalizeBillingStartForSchedule("2026-09-01", 1);
    const schedule = buildInstallmentSchedule(paymentPlan, billingStart);

    const updates = remapPaidChargesForBillingStart({
      billingStart,
      schedule,
      guardianNames,
      charges: [
        {
          id: "paid-aug",
          dueDate: "2026-08-01",
          installmentNumber: 1,
          guardianId,
          status: "paid",
        },
        {
          id: "paid-sep",
          dueDate: "2026-09-01",
          installmentNumber: 2,
          guardianId,
          status: "paid",
        },
      ],
    });

    assert.equal(updates.length, 2);

    const augustRemap = updates.find((update) => update.id === "paid-aug");
    const septemberRemap = updates.find((update) => update.id === "paid-sep");

    assert.equal(augustRemap?.dueDate, "2026-09-01");
    assert.equal(augustRemap?.installmentNumber, 1);
    assert.equal(septemberRemap?.dueDate, "2026-10-01");
    assert.equal(septemberRemap?.installmentNumber, 2);
  });

  it("does not assign two paid charges to the same due date for one guardian", () => {
    const billingStart = normalizeBillingStartForSchedule("2026-09-01", 1);
    const schedule = buildInstallmentSchedule(paymentPlan, billingStart);

    const updates = remapPaidChargesForBillingStart({
      billingStart,
      schedule,
      guardianNames,
      charges: [
        {
          id: "paid-aug",
          dueDate: "2026-08-01",
          installmentNumber: 1,
          guardianId,
          status: "paid",
        },
        {
          id: "paid-sep",
          dueDate: "2026-09-01",
          installmentNumber: 2,
          guardianId,
          status: "paid",
        },
      ],
    });

    const dueDates = updates.map((update) => update.dueDate);
    assert.equal(new Set(dueDates).size, 2);
    assert.deepEqual(dueDates.sort(), ["2026-09-01", "2026-10-01"]);
  });
});
