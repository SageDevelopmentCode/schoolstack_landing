import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { pickRecentLateFeeNotice } from "./late-fee-notice";
import type { TuitionCharge } from "./types";

function lateFeeCharge(
  overrides: Partial<TuitionCharge> & Pick<TuitionCharge, "id">,
): TuitionCharge {
  return {
    id: overrides.id,
    organizationId: "org-1",
    assignmentId: "assignment-1",
    familyId: "family-1",
    guardianId: overrides.guardianId ?? null,
    label: overrides.label ?? "Late fee — August 2026",
    baseAmountCents: overrides.baseAmountCents ?? 5000,
    amountCents: overrides.amountCents ?? 5000,
    paidCents: overrides.paidCents ?? 0,
    currency: "usd",
    dueDate: "2026-08-11",
    status: "sent",
    chargeType: "late_fee",
    installmentNumber: null,
    sentAt: overrides.sentAt ?? "2026-08-11T12:00:00.000Z",
    paidAt: overrides.paidAt ?? null,
    metadata: overrides.metadata ?? {},
    createdAt: "2026-08-11T12:00:00.000Z",
    updatedAt: "2026-08-11T12:00:00.000Z",
  };
}

describe("pickRecentLateFeeNotice", () => {
  const now = new Date("2026-08-15T12:00:00.000Z");

  it("returns null when there are no recent unpaid late fees", () => {
    const notice = pickRecentLateFeeNotice(
      [
        lateFeeCharge({
          id: "old",
          sentAt: "2026-06-01T12:00:00.000Z",
        }),
        {
          ...lateFeeCharge({ id: "tuition" }),
          chargeType: "tuition",
        },
      ],
      { now },
    );

    assert.equal(notice, null);
  });

  it("sums only recent unpaid late fees visible to the guardian", () => {
    const notice = pickRecentLateFeeNotice(
      [
        lateFeeCharge({
          id: "mine",
          guardianId: "guardian-a",
          amountCents: 2500,
          sentAt: "2026-08-12T12:00:00.000Z",
        }),
        lateFeeCharge({
          id: "theirs",
          guardianId: "guardian-b",
          amountCents: 2500,
          sentAt: "2026-08-12T12:00:00.000Z",
        }),
        lateFeeCharge({
          id: "paid",
          amountCents: 5000,
          paidCents: 5000,
          sentAt: "2026-08-12T12:00:00.000Z",
        }),
      ].filter((charge) => charge.guardianId === "guardian-a" || charge.id === "paid"),
      { now },
    );

    assert.notEqual(notice, null);
    assert.equal(notice?.totalCents, 2500);
    assert.deepEqual(notice?.labels, ["Late fee — August 2026"]);
  });
});
