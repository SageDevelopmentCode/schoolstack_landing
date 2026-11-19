import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { CRM_STATUSES } from "@/lib/admin-crm/crm-status";
import { isFollowUpDue, nextStatusAfterTouch } from "@/lib/admin-crm/demo-outreach-types";

describe("nextStatusAfterTouch", () => {
  it("moves outbound touches through contacted then followed up", () => {
    assert.equal(nextStatusAfterTouch("not_contacted", "outbound"), "contacted");
    assert.equal(nextStatusAfterTouch("contacted", "outbound"), "followed_up");
    assert.equal(nextStatusAfterTouch("followed_up", "outbound"), "followed_up");
  });

  it("marks an inbound touch as replied only before the replied stage", () => {
    assert.equal(nextStatusAfterTouch("not_contacted", "inbound"), "replied");
    assert.equal(nextStatusAfterTouch("followed_up", "inbound"), "replied");
    assert.equal(nextStatusAfterTouch("demo_scheduled", "inbound"), "demo_scheduled");
  });

  it("never moves a later or side status", () => {
    for (const status of ["replied", "nurturing", "demo_scheduled", "proposal_sent", "not_interested", "won"] as const) {
      assert.equal(nextStatusAfterTouch(status, "outbound"), status);
      assert.equal(nextStatusAfterTouch(status, "inbound"), status);
    }
  });

  it("covers every status", () => {
    for (const status of CRM_STATUSES) {
      assert.ok(CRM_STATUSES.includes(nextStatusAfterTouch(status, "outbound")));
    }
  });
});

describe("isFollowUpDue", () => {
  const now = new Date(2026, 10, 19, 9, 0);

  it("is due today, overdue, and not due tomorrow or when unset", () => {
    assert.equal(isFollowUpDue(new Date(2026, 10, 19, 17, 0).toISOString(), now), true);
    assert.equal(isFollowUpDue(new Date(2026, 10, 12).toISOString(), now), true);
    assert.equal(isFollowUpDue(new Date(2026, 10, 20, 8, 0).toISOString(), now), false);
    assert.equal(isFollowUpDue(null, now), false);
  });
});
