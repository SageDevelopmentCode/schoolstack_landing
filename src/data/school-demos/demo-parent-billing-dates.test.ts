import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildDemoParentBillingDates,
  buildDemoParentBillingInitialData,
  buildDemoParentBillingPageMeta,
} from "@/data/school-demos/demo-parent-portal-fixtures";
import { daysUntilDue, formatDueCountdown } from "@/lib/tuition/due-date-display";

describe("demo parent billing dates", () => {
  it("counts from the given day", () => {
    const dates = buildDemoParentBillingDates(new Date("2026-11-27T23:30:00.000Z"));
    assert.equal(dates.tuitionDueDate, "2026-12-15");
    assert.equal(dates.feeDueDate, "2027-01-01");
    assert.equal(dates.sentAt, "2026-11-17T12:00:00.000Z");
  });

  it("never shows the demo's next payment as overdue", () => {
    const data = buildDemoParentBillingInitialData();
    const next = data.familySummary.nextCharge;
    assert.ok(next);
    assert.ok(daysUntilDue(next.dueDate) > 0);
    assert.notEqual(formatDueCountdown(next.dueDate).urgency, "overdue");
    for (const charge of data.charges) assert.ok(daysUntilDue(charge.dueDate) > 0, charge.id);
    assert.equal(buildDemoParentBillingPageMeta().nextDueDate, next.dueDate);
  });
});
