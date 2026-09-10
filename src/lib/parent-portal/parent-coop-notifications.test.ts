import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  COOP_SUPPLY_ITEM_ADDED_ACTION,
  COOP_SUPPLY_ITEM_ASSIGNED_ACTION,
} from "@/lib/parent-portal/parent-coop-notifications";
import { getParentActivityNotificationCategory } from "@/lib/parent-portal/parent-activity-notifications";

describe("co-op notification categories", () => {
  it("maps co-op actions to the coop category", () => {
    assert.equal(
      getParentActivityNotificationCategory(COOP_SUPPLY_ITEM_ADDED_ACTION),
      "coop",
    );
    assert.equal(
      getParentActivityNotificationCategory(COOP_SUPPLY_ITEM_ASSIGNED_ACTION),
      "coop",
    );
  });
});

describe("co-op supply assignment heuristics", () => {
  it("treats quick single-family assignment as likely self-claim", () => {
    const createdAt = "2026-09-10T12:00:00.000Z";
    const updatedAt = "2026-09-10T12:00:05.000Z";
    const likelySelfClaim =
      new Date(updatedAt).getTime() - new Date(createdAt).getTime() <= 120_000;

    assert.equal(likelySelfClaim, true);
  });

  it("treats later assignment updates as admin-driven", () => {
    const createdAt = "2026-09-10T12:00:00.000Z";
    const updatedAt = "2026-09-10T12:05:00.000Z";
    const likelySelfClaim =
      new Date(updatedAt).getTime() - new Date(createdAt).getTime() <= 120_000;

    assert.equal(likelySelfClaim, false);
  });
});
