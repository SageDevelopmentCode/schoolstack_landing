import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { SupabaseClient } from "@supabase/supabase-js";
import { logNotificationFailure } from "@/lib/admissions/notification-logging";
import { ACTIVITY_ACTIONS } from "@/lib/activity-log";
import { reportOperationalError } from "./operational-errors";

function createActivityEventsMockSupabase(): {
  supabase: SupabaseClient;
  inserts: Array<Record<string, unknown>>;
} {
  const inserts: Array<Record<string, unknown>> = [];

  const supabase = {
    auth: {
      getUser: async () => ({
        data: { user: { id: "user-1", email: "admin@test.com" } },
        error: null,
      }),
    },
    from(table: string) {
      return {
        insert(row: Record<string, unknown>) {
          if (table === "activity_events") {
            inserts.push(row);
          }
          return {
            select() {
              return {
                single: async () => ({ data: { id: "event-1" }, error: null }),
              };
            },
          };
        },
      };
    },
  } as unknown as SupabaseClient;

  return { supabase, inserts };
}

describe("reportOperationalError", () => {
  it("writes API errors to activity_events", async () => {
    const { supabase, inserts } = createActivityEventsMockSupabase();

    await reportOperationalError({
      supabase,
      surface: "api",
      operation: "/api/test",
      error: "Something broke",
      code: "internal_error",
      notify: false,
      actor: { type: "system" },
      cause: new Error("Something broke"),
      api: {
        route: "/api/test",
        method: "GET",
        status: 500,
        stack: "Error: Something broke",
      },
    });

    assert.equal(inserts.length, 1);
    assert.equal(inserts[0]?.action, ACTIVITY_ACTIONS.API_ERROR);
    assert.equal(inserts[0]?.severity, "error");
    assert.equal(inserts[0]?.surface, "api");
    assert.match(String(inserts[0]?.summary), /GET \/api\/test returned 500/);
  });

  it("writes admin operation failures to activity_events", async () => {
    const { supabase, inserts } = createActivityEventsMockSupabase();

    await reportOperationalError({
      supabase,
      surface: "school_admin",
      organizationId: "org-1",
      operation: "sync_payments",
      error: "Stripe unreachable",
      notify: false,
      actor: { type: "school_admin", userId: "user-1" },
    });

    assert.equal(inserts.length, 1);
    assert.equal(inserts[0]?.action, ACTIVITY_ACTIONS.ADMIN_OPERATION_FAILED);
    assert.equal(inserts[0]?.organization_id, "org-1");
  });

  it("can skip activity log insert for meta-failures", async () => {
    const { supabase, inserts } = createActivityEventsMockSupabase();

    await reportOperationalError({
      supabase,
      surface: "system",
      skipActivityLog: true,
      operation: "activity_log_insert",
      error: "Insert failed",
      notify: false,
      actor: { type: "system" },
    });

    assert.equal(inserts.length, 0);
  });

  it("supports custom severity", async () => {
    const { supabase, inserts } = createActivityEventsMockSupabase();

    await reportOperationalError({
      supabase,
      surface: "system",
      action: ACTIVITY_ACTIONS.NOTIFICATION_FAILED,
      operation: "email_send",
      error: "SMTP timeout",
      notify: false,
      severity: "warning",
      actor: { type: "system" },
    });

    assert.equal(inserts[0]?.severity, "warning");
    assert.equal(inserts[0]?.action, ACTIVITY_ACTIONS.NOTIFICATION_FAILED);
  });
});

describe("logNotificationFailure", () => {
  it("records notification.failed via reportOperationalError", async () => {
    const { supabase, inserts } = createActivityEventsMockSupabase();

    await logNotificationFailure(supabase, {
      organizationId: "org-1",
      operation: "parent_portal_feedback_discord",
      error: new Error("Webhook timeout"),
      entityType: "feedback",
      entityId: "fb-1",
    });

    assert.equal(inserts.length, 1);
    assert.equal(inserts[0]?.action, ACTIVITY_ACTIONS.NOTIFICATION_FAILED);
    assert.equal(inserts[0]?.severity, "warning");
    assert.equal(inserts[0]?.entity_id, "fb-1");
  });
});
