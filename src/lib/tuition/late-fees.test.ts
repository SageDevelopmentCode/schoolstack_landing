import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildLateFeeDraftsForSource,
  buildLateFeeKey,
  buildLateFeeTriggerDate,
  listBillingPeriodsForLateFee,
  parseExistingLateFeeKeys,
} from "./late-fees";

describe("listBillingPeriodsForLateFee", () => {
  it("returns only the due month when recurring is disabled", () => {
    const periods = listBillingPeriodsForLateFee(
      "2026-08-01",
      new Date("2026-10-15T12:00:00Z"),
      false,
    );

    assert.deepEqual(periods, [{ year: 2026, month: 8 }]);
  });

  it("returns each month from due month through today when recurring", () => {
    const periods = listBillingPeriodsForLateFee(
      "2026-08-01",
      new Date("2026-10-15T12:00:00Z"),
      true,
    );

    assert.deepEqual(periods, [
      { year: 2026, month: 8 },
      { year: 2026, month: 9 },
      { year: 2026, month: 10 },
    ]);
  });
});

describe("buildLateFeeTriggerDate", () => {
  it("pads month and day", () => {
    assert.equal(buildLateFeeTriggerDate(2026, 8, 10), "2026-08-10");
    assert.equal(buildLateFeeTriggerDate(2026, 12, 5), "2026-12-05");
  });
});

describe("buildLateFeeKey", () => {
  it("includes guardian id when present", () => {
    assert.equal(
      buildLateFeeKey("charge-1", 2026, 8, "guardian-a"),
      "charge-1:2026:8:guardian-a",
    );
  });

  it("uses family suffix when guardian is null", () => {
    assert.equal(buildLateFeeKey("charge-1", 2026, 8, null), "charge-1:2026:8:family");
  });
});

describe("parseExistingLateFeeKeys", () => {
  it("extracts source charge period keys with guardian id", () => {
    const keys = parseExistingLateFeeKeys([
      {
        metadata: {
          sourceChargeId: "charge-1",
          periodYear: 2026,
          periodMonth: 8,
          guardianId: "guardian-a",
        },
      },
      { metadata: {} },
    ]);

    assert.deepEqual(
      keys,
      new Set([buildLateFeeKey("charge-1", 2026, 8, "guardian-a")]),
    );
  });

  it("includes legacy keys when guardian id is missing", () => {
    const keys = parseExistingLateFeeKeys([
      {
        metadata: {
          sourceChargeId: "charge-1",
          periodYear: 2026,
          periodMonth: 8,
        },
      },
    ]);

    assert.equal(keys.has("charge-1:2026:8"), true);
    assert.equal(keys.has(buildLateFeeKey("charge-1", 2026, 8, null)), true);
  });
});

describe("buildLateFeeDraftsForSource", () => {
  const splits = [
    {
      id: "split-1",
      organizationId: "org-1",
      familyId: "family-1",
      guardianId: "guardian-a",
      shareBps: 5000,
      createdAt: "",
      updatedAt: "",
    },
    {
      id: "split-2",
      organizationId: "org-1",
      familyId: "family-1",
      guardianId: "guardian-b",
      shareBps: 5000,
      createdAt: "",
      updatedAt: "",
    },
  ];

  it("creates one draft for a guardian-specific source charge", () => {
    const drafts = buildLateFeeDraftsForSource({
      sourceChargeId: "charge-1",
      sourceGuardianId: "guardian-a",
      periodYear: 2026,
      periodMonth: 8,
      lateFeeAmountCents: 5000,
      billingSplits: splits,
      guardianNames: new Map(),
    });

    assert.equal(drafts.length, 1);
    assert.equal(drafts[0]?.guardianId, "guardian-a");
    assert.equal(drafts[0]?.amountCents, 5000);
  });

  it("splits across guardians when source charge is family-level", () => {
    const drafts = buildLateFeeDraftsForSource({
      sourceChargeId: "charge-1",
      sourceGuardianId: null,
      periodYear: 2026,
      periodMonth: 8,
      lateFeeAmountCents: 5000,
      billingSplits: splits,
      guardianNames: new Map([
        ["guardian-a", "Sarah Nguyen"],
        ["guardian-b", "David Nguyen"],
      ]),
    });

    assert.equal(drafts.length, 2);
    assert.equal(drafts[0]?.amountCents, 2500);
    assert.equal(drafts[1]?.amountCents, 2500);
    assert.equal(drafts[0]?.label, "Late fee — August 2026 (Sarah)");
    assert.equal(drafts[0]?.metadata.guardianId, "guardian-a");
    assert.equal(drafts[1]?.metadata.guardianId, "guardian-b");
  });

  it("creates a single family-level draft when no splits exist", () => {
    const drafts = buildLateFeeDraftsForSource({
      sourceChargeId: "charge-1",
      sourceGuardianId: null,
      periodYear: 2026,
      periodMonth: 8,
      lateFeeAmountCents: 5000,
      billingSplits: [],
      guardianNames: new Map(),
    });

    assert.equal(drafts.length, 1);
    assert.equal(drafts[0]?.guardianId, null);
    assert.equal(drafts[0]?.amountCents, 5000);
  });
});
