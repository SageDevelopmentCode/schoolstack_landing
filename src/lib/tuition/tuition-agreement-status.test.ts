import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  aggregateTuitionAgreementStatus,
  buildTuitionAgreementStatusByFamilyId,
} from "./tuition-agreement-status";

describe("aggregateTuitionAgreementStatus", () => {
  it("returns none when there are no agreements", () => {
    assert.equal(aggregateTuitionAgreementStatus([]), "none");
  });

  it("returns signed when all agreements are signed", () => {
    assert.equal(aggregateTuitionAgreementStatus(["signed", "signed"]), "signed");
  });

  it("prefers pending over signed", () => {
    assert.equal(
      aggregateTuitionAgreementStatus(["signed", "pending"]),
      "pending",
    );
  });

  it("prefers overdue over pending and signed", () => {
    assert.equal(
      aggregateTuitionAgreementStatus(["signed", "pending", "overdue"]),
      "overdue",
    );
  });
});

describe("buildTuitionAgreementStatusByFamilyId", () => {
  it("groups and aggregates statuses per family", () => {
    const map = buildTuitionAgreementStatusByFamilyId([
      { familyId: "family-1", status: "signed", dueDate: null },
      { familyId: "family-2", status: "pending", dueDate: null },
      { familyId: "family-2", status: "signed", dueDate: null },
    ]);

    assert.equal(map.get("family-1"), "signed");
    assert.equal(map.get("family-2"), "pending");
  });
});
