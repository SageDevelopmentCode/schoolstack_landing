import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  loadAdminNavCounts,
  type AdminNavCountKey,
} from "./admin-nav-counts";

const COUNT_TABLES: Record<AdminNavCountKey, string> = {
  staffHoursPending: "staff_hours_adjustment_requests",
  applicationsToReview: "applications",
  committeeJoinRequests: "committee_join_requests",
};

function createNavCountsSupabase(failKey: AdminNavCountKey): {
  supabase: SupabaseClient;
  activityInserts: Array<Record<string, unknown>>;
} {
  const failTable = COUNT_TABLES[failKey];
  const activityInserts: Array<Record<string, unknown>> = [];

  const supabase = {
    auth: {
      getUser: async () => ({
        data: { user: { id: "user-1", email: "admin@test.com" } },
        error: null,
      }),
    },
    from(table: string) {
      if (table === "organizations") {
        return {
          select() {
            return {
              eq() {
                return {
                  maybeSingle: async () => ({
                    data: { name: "Test School", slug: "test-school" },
                    error: null,
                  }),
                };
              },
            };
          },
        };
      }

      if (table === "activity_events") {
        return {
          insert(row: Record<string, unknown>) {
            activityInserts.push(row);
            return {
              select() {
                return {
                  single: async () => ({ data: { id: "event-1" }, error: null }),
                };
              },
            };
          },
        };
      }

      return {
        select() {
          return {
            eq() {
              return {
                eq() {
                  return Promise.resolve(
                    table === failTable
                      ? { count: null, error: { message: "relation unavailable" } }
                      : { count: 4, error: null },
                  );
                },
              };
            },
          };
        },
      };
    },
  } as unknown as SupabaseClient;

  return { supabase, activityInserts };
}

async function flushOperationalReports(): Promise<void> {
  await new Promise<void>((resolve) => {
    setImmediate(resolve);
  });
  await new Promise<void>((resolve) => {
    setTimeout(resolve, 0);
  });
}

describe("loadAdminNavCounts", () => {
  it("reports each failed count and returns null for that badge", async () => {
    const { supabase, activityInserts } = createNavCountsSupabase(
      "applicationsToReview",
    );
    const organizationId = "org-nav-counts";

    const counts = await loadAdminNavCounts(
      supabase,
      organizationId,
      {
        staffHoursPending: true,
        applicationsToReview: true,
        committeeJoinRequests: true,
      },
      { organizationName: "Rooted Meadows", organizationSlug: "rooted-meadows" },
    );

    await flushOperationalReports();

    assert.equal(counts.staffHoursPending, 4);
    assert.equal(counts.applicationsToReview, null);
    assert.equal(counts.committeeJoinRequests, 4);

    assert.equal(activityInserts.length, 1);
    const metadata = activityInserts[0]?.metadata as Record<string, unknown>;
    assert.equal(metadata?.operation, "school_admin.sidebar_nav_counts.applicationsToReview");
    assert.equal(metadata?.countKey, "applicationsToReview");
    assert.equal(activityInserts[0]?.severity, "warning");
    assert.equal(activityInserts[0]?.organization_id, organizationId);
    assert.match(String(metadata?.error), /applicationsToReview/);
    assert.match(String(metadata?.error), /Rooted Meadows/);
  });
});