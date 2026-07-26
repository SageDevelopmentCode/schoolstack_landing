import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  daysUntilDue,
  formatBillingDueDate,
  formatDueCountdown,
} from "@/lib/tuition/due-date-display";

describe("formatBillingDueDate", () => {
  it("formats ISO dates in a readable way", () => {
    assert.equal(formatBillingDueDate("2026-08-01"), "Aug 1, 2026");
  });
});

describe("daysUntilDue", () => {
  it("returns positive days for future due dates", () => {
    assert.equal(daysUntilDue("2026-08-01", "2026-07-01"), 31);
  });

  it("returns zero for due today", () => {
    assert.equal(daysUntilDue("2026-08-01", "2026-08-01"), 0);
  });

  it("returns negative days for overdue dates", () => {
    assert.equal(daysUntilDue("2026-08-01", "2026-08-04"), -3);
  });
});

describe("formatDueCountdown", () => {
  it("labels overdue and due-today states", () => {
    assert.deepEqual(formatDueCountdown("2026-08-01", "2026-08-04"), {
      label: "3 days overdue",
      urgency: "overdue",
    });
    assert.deepEqual(formatDueCountdown("2026-08-01", "2026-08-01"), {
      label: "Due today",
      urgency: "overdue",
    });
  });

  it("uses urgent urgency within seven days", () => {
    assert.deepEqual(formatDueCountdown("2026-08-08", "2026-08-01"), {
      label: "7 days remaining",
      urgency: "urgent",
    });
    assert.deepEqual(formatDueCountdown("2026-08-02", "2026-08-01"), {
      label: "1 day remaining",
      urgency: "urgent",
    });
  });

  it("uses soon and normal urgency for later dates", () => {
    assert.deepEqual(formatDueCountdown("2026-08-20", "2026-08-01"), {
      label: "19 days remaining",
      urgency: "soon",
    });
    assert.deepEqual(formatDueCountdown("2026-09-15", "2026-08-01"), {
      label: "45 days remaining",
      urgency: "normal",
    });
  });
});
