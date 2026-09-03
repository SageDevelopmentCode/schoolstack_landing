import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  fetchCollectedThisMonthCents,
  fetchDashboardApplicationMetrics,
  fetchDashboardAggregateMetrics,
} from "./dashboard-metrics";

function createSupabaseStub(handlers: {
  rpc?: (name: string, args: Record<string, unknown>) => unknown;
  from?: (table: string) => unknown;
}) {
  return {
    rpc: async (name: string, args: Record<string, unknown>) => {
      if (!handlers.rpc) {
        return { data: null, error: { message: "rpc unavailable" } };
      }
      return { data: handlers.rpc(name, args), error: null };
    },
    from: (table: string) => handlers.from?.(table),
  };
}

describe("dashboard-metrics", () => {
  it("parses admin_dashboard_metrics RPC payload", async () => {
    const supabase = createSupabaseStub({
      rpc: () => ({
        active_applications: 4,
        enrolled_count: 2,
        submitted_count: 1,
        collected_this_month_cents: 12500,
        messages_unread: 3,
      }),
    });

    const metrics = await fetchDashboardAggregateMetrics(
      supabase as never,
      "org-1",
      "user-1",
    );

    assert.deepEqual(metrics, {
      activeApplications: 4,
      enrolledCount: 2,
      submittedCount: 1,
      collectedThisMonthCents: 12500,
      messagesUnread: 3,
    });
  });

  it("falls back to status-only application counts", async () => {
    const applicationsQuery = {
      select: () => applicationsQuery,
      eq: async () => ({
        data: [
          { status: "submitted" },
          { status: "enrolled" },
          { status: "draft" },
          { status: "declined" },
        ],
        error: null,
      }),
    };

    const latestSubmittedQuery = {
      select: () => latestSubmittedQuery,
      eq: () => latestSubmittedQuery,
      order: () => latestSubmittedQuery,
      limit: () => latestSubmittedQuery,
      maybeSingle: async () => ({
        data: {
          id: "app-1",
          submitted_at: "2026-09-01T12:00:00.000Z",
          guardians: { first_name: "Jamie", last_name: "Lee" },
        },
        error: null,
      }),
    };

    let applicationCallCount = 0;
    const supabase = createSupabaseStub({
      rpc: () => null,
      from: (table: string) => {
        if (table === "applications") {
          applicationCallCount += 1;
          return applicationCallCount === 1
            ? applicationsQuery
            : latestSubmittedQuery;
        }
        return latestSubmittedQuery;
      },
    });

    const metrics = await fetchDashboardApplicationMetrics(
      supabase as never,
      "org-1",
    );

    assert.equal(metrics.activeApplications, 2);
    assert.equal(metrics.enrolledCount, 1);
    assert.equal(metrics.submittedCount, 1);
    assert.equal(metrics.latestSubmitted?.id, "app-1");
    assert.equal(metrics.latestSubmitted?.guardianName, "Jamie Lee");
  });

  it("sums collected payments for the current month in fallback mode", async () => {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const paymentsQuery = {
      select: () => paymentsQuery,
      eq: () => paymentsQuery,
      gte: async () => ({
        data: [{ amount_cents: 5000 }, { amount_cents: 2500 }],
        error: null,
      }),
    };

    const supabase = createSupabaseStub({
      from: (table: string) => {
        assert.equal(table, "application_payments");
        return paymentsQuery;
      },
    });

    const total = await fetchCollectedThisMonthCents(supabase as never, "org-1");
    assert.equal(total, 7500);
  });
});
