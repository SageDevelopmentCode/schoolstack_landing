import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  formatParentChargeDueLine,
  formatParentChargeStatusBadge,
} from "./charge-status-display";
import type { TuitionCharge } from "./types";

function charge(overrides: Partial<TuitionCharge> & Pick<TuitionCharge, "id">): TuitionCharge {
  return {
    id: overrides.id,
    organizationId: "org-1",
    assignmentId: "assignment-1",
    familyId: "family-1",
    guardianId: null,
    label: overrides.label ?? "Aug Tuition",
    baseAmountCents: 36000,
    amountCents: 36000,
    paidCents: overrides.paidCents ?? 0,
    currency: "usd",
    dueDate: overrides.dueDate ?? "2026-09-01",
    status: overrides.status ?? "scheduled",
    chargeType: overrides.chargeType ?? "tuition",
    installmentNumber: 1,
    metadata: {},
    sentAt: null,
    paidAt: overrides.paidAt ?? null,
    createdAt: "2026-08-01T00:00:00.000Z",
    updatedAt: "2026-08-01T00:00:00.000Z",
  };
}

describe("formatParentChargeStatusBadge", () => {
  it("returns PAID with success tone", () => {
    const badge = formatParentChargeStatusBadge(
      charge({ id: "c-1", status: "paid" }),
    );
    assert.equal(badge.label, "PAID");
    assert.equal(badge.tone, "success");
  });

  it("returns LATE FEE for late fee charges", () => {
    const badge = formatParentChargeStatusBadge(
      charge({ id: "c-1", chargeType: "late_fee", status: "sent" }),
    );
    assert.equal(badge.label, "LATE FEE");
    assert.equal(badge.tone, "warning");
  });
});

describe("formatParentChargeDueLine", () => {
  it("formats unpaid charges with readable date and countdown", () => {
    const line = formatParentChargeDueLine(
      charge({ id: "c-1", dueDate: "2026-09-01", status: "scheduled" }),
      "2026-08-01",
    );
    assert.match(line, /^Due Sep 1, 2026 \(/);
    assert.match(line, /days remaining\)$/);
  });

  it("formats paid charges with paid date", () => {
    const line = formatParentChargeDueLine(
      charge({
        id: "c-1",
        status: "paid",
        paidAt: "2026-08-01T15:09:25.236Z",
      }),
    );
    assert.equal(line, "Paid Aug 1, 2026");
  });
});
