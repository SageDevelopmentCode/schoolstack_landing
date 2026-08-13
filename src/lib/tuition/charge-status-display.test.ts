import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  formatParentChargeAmountLabel,
  formatParentChargeDueLine,
  formatParentChargeStatusBadge,
} from "./charge-status-display";
import type { TuitionCharge } from "./types";

function charge(overrides: Partial<TuitionCharge> & Pick<TuitionCharge, "id">): TuitionCharge {
  const { id, ...rest } = overrides;
  return {
    organizationId: "org-1",
    assignmentId: "assignment-1",
    familyId: "family-1",
    guardianId: null,
    label: "Aug Tuition",
    baseAmountCents: 36000,
    amountCents: 36000,
    paidCents: 0,
    currency: "usd",
    dueDate: "2026-09-01",
    status: "scheduled",
    chargeType: "tuition",
    installmentNumber: 1,
    metadata: {},
    sentAt: null,
    paidAt: null,
    createdAt: "2026-08-01T00:00:00.000Z",
    updatedAt: "2026-08-01T00:00:00.000Z",
    ...rest,
    id,
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

  it("returns SCHEDULED with info tone", () => {
    const badge = formatParentChargeStatusBadge(
      charge({ id: "c-1", status: "scheduled" }),
    );
    assert.equal(badge.label, "SCHEDULED");
    assert.equal(badge.tone, "info");
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

describe("formatParentChargeAmountLabel", () => {
  it("shows paid amount for settled charges", () => {
    const display = formatParentChargeAmountLabel(
      charge({
        id: "c-1",
        status: "paid",
        paidCents: 60000,
        amountCents: 60000,
      }),
    );
    assert.equal(display.text, "Paid $600");
    assert.equal(display.isPaid, true);
  });

  it("shows remaining balance for open charges", () => {
    const display = formatParentChargeAmountLabel(
      charge({
        id: "c-1",
        status: "scheduled",
        amountCents: 60000,
        paidCents: 0,
      }),
    );
    assert.equal(display.text, "$600");
    assert.equal(display.isPaid, false);
  });
});
