import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ACTIVITY_ACTIONS } from "@/lib/activity-log";
import { hasAchVerificationOpsBeenNotified } from "@/lib/stripe/ach-verification-ops-idempotency";

describe("hasAchVerificationOpsBeenNotified", () => {
  it("returns true when matching activity exists", async () => {
    const admin = {
      from: (table: string) => {
        assert.equal(table, "activity_events");
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                eq: () => ({
                  limit: () => ({
                    maybeSingle: async () => ({ data: { id: "evt-1" }, error: null }),
                  }),
                }),
              }),
            }),
          }),
        };
      },
    };

    const result = await hasAchVerificationOpsBeenNotified(
      admin as never,
      "org-1",
      "pay-1",
    );
    assert.equal(result, true);
  });

  it("returns false when no activity row", async () => {
    const admin = {
      from: () => ({
        select: () => ({
          eq: () => ({
            eq: () => ({
              eq: () => ({
                limit: () => ({
                  maybeSingle: async () => ({ data: null, error: null }),
                }),
              }),
            }),
          }),
        }),
      }),
    };

    const result = await hasAchVerificationOpsBeenNotified(
      admin as never,
      "org-1",
      "pay-1",
    );
    assert.equal(result, false);
  });
});

describe("ACTIVITY_ACTIONS.PAYMENT_ACH_VERIFICATION_REQUIRED", () => {
  it("is registered", () => {
    assert.equal(
      ACTIVITY_ACTIONS.PAYMENT_ACH_VERIFICATION_REQUIRED,
      "payment.ach_verification_required",
    );
  });
});
