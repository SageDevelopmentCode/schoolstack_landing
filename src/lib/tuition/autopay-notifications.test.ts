import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { notifyAutopayFailed } from "./autopay-notifications";

describe("notifyAutopayFailed", () => {
  it("logs activity without loading recipients when skipEmail is set", async () => {
    const tablesTouched: string[] = [];
    const activityRows: Array<Record<string, unknown>> = [];
    const supabase = {
      from(table: string) {
        tablesTouched.push(table);
        if (table === "activity_events") {
          return {
            insert: (row: Record<string, unknown>) => {
              activityRows.push(row);
              return {
                select: () => ({
                  single: async () => ({ data: { id: "event-1" }, error: null }),
                }),
                then: (resolve: (value: { error: null }) => void) =>
                  resolve({ error: null }),
              };
            },
          };
        }
        throw new Error(`Unexpected table: ${table}`);
      },
    };

    await notifyAutopayFailed(supabase as never, {
      organizationId: "org-1",
      familyId: "family-1",
      chargeId: "charge-1",
      chargeLabel: "Oct Tuition",
      amountCents: 60000,
      guardianId: null,
      guardianUserId: "user-1",
      errorMessage: "Payment could not be processed.",
      orgSlug: "rooted-meadows",
      skipEmail: true,
    });

    assert.ok(tablesTouched.includes("activity_events"));
    assert.ok(!tablesTouched.includes("families"));
    assert.ok(!tablesTouched.includes("guardians"));
    assert.equal(activityRows.length, 1);
  });
});
