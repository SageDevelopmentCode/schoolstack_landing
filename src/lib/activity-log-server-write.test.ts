import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  ACTIVITY_ACTIONS,
  logActivityEvent,
  resolveActivityWriteClient,
  setActivityWriteClientForTests,
} from "@/lib/activity-log";

function createActivityEventsMockSupabase(
  label: string,
  options?: { insertError?: { message: string; code?: string } },
): {
  supabase: SupabaseClient;
  inserts: Array<Record<string, unknown>>;
  label: string;
} {
  const inserts: Array<Record<string, unknown>> = [];

  const supabase = {
    auth: {
      getUser: async () => ({
        data: { user: { id: "user-1", email: "parent@test.com" } },
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
                single: async () => ({
                  data: options?.insertError ? null : { id: `${label}-event-1` },
                  error: options?.insertError ?? null,
                }),
              };
            },
          };
        },
      };
    },
  } as unknown as SupabaseClient;

  return { supabase, inserts, label };
}

describe("resolveActivityWriteClient", () => {
  const originalWindow = globalThis.window;

  afterEach(() => {
    setActivityWriteClientForTests(null);
    if (originalWindow === undefined) {
      Reflect.deleteProperty(globalThis, "window");
    } else {
      globalThis.window = originalWindow;
    }
  });

  it("returns the session client in browser environments", async () => {
    globalThis.window = originalWindow ?? ({} as Window & typeof globalThis);

    const sessionClient = { marker: "session" } as unknown as SupabaseClient;
    const writeClient = await resolveActivityWriteClient(sessionClient);

    assert.equal(writeClient, sessionClient);
  });

  it("returns the session client in test environments", async () => {
    const sessionClient = { marker: "session" } as unknown as SupabaseClient;
    const writeClient = await resolveActivityWriteClient(sessionClient);

    assert.equal(writeClient, sessionClient);
  });

  it("uses the test override when configured", async () => {
    const sessionClient = { marker: "session" } as unknown as SupabaseClient;
    const overrideClient = { marker: "override" } as unknown as SupabaseClient;

    setActivityWriteClientForTests(overrideClient);
    const writeClient = await resolveActivityWriteClient(sessionClient);

    assert.equal(writeClient, overrideClient);
  });
});

describe("logActivityEvent server writes", () => {
  afterEach(() => {
    setActivityWriteClientForTests(null);
  });

  it("inserts via the admin client on the server even when the session client would fail RLS", async () => {
    const session = createActivityEventsMockSupabase("session", {
      insertError: {
        message: 'new row violates row-level security policy for table "activity_events"',
        code: "42501",
      },
    });
    const admin = createActivityEventsMockSupabase("admin");

    setActivityWriteClientForTests(admin.supabase);

    const eventId = await logActivityEvent(session.supabase, {
      organizationId: "org-1",
      actorType: "parent",
      actorUserId: "user-1",
      surface: "parent_portal",
      action: ACTIVITY_ACTIONS.COMMITTEE_JOIN_REQUESTED,
      summary: "Parent requested to join a committee",
    });

    assert.equal(eventId, "admin-event-1");
    assert.equal(session.inserts.length, 0);
    assert.equal(admin.inserts.length, 1);
    assert.equal(admin.inserts[0]?.action, ACTIVITY_ACTIONS.COMMITTEE_JOIN_REQUESTED);
    assert.equal(admin.inserts[0]?.organization_id, "org-1");
  });

  it("reports meta-failures without writing another activity event", async () => {
    const failingWriteClient = createActivityEventsMockSupabase("write", {
      insertError: {
        message: 'new row violates row-level security policy for table "activity_events"',
        code: "42501",
      },
    });

    setActivityWriteClientForTests(failingWriteClient.supabase);

    const eventId = await logActivityEvent(failingWriteClient.supabase, {
      organizationId: "org-1",
      actorType: "parent",
      actorUserId: "user-1",
      surface: "parent_portal",
      action: ACTIVITY_ACTIONS.COMMITTEE_JOIN_REQUESTED,
      summary: "Parent requested to join a committee",
    });

    assert.equal(eventId, null);
    assert.equal(failingWriteClient.inserts.length, 1);
  });
});

describe("logActivityEvent browser failure reporting", () => {
  const originalWindow = globalThis.window;
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    setActivityWriteClientForTests(null);
    globalThis.fetch = originalFetch;
    if (originalWindow === undefined) {
      Reflect.deleteProperty(globalThis, "window");
    } else {
      globalThis.window = originalWindow;
    }
  });

  it("does not throw when insert fails and service role env is unavailable", async () => {
    globalThis.window = originalWindow ?? ({} as Window & typeof globalThis);
    Reflect.deleteProperty(process.env, "SUPABASE_SERVICE_ROLE_KEY");

    const fetchCalls: Array<{ url: string; body: string }> = [];
    globalThis.fetch = async (input, init) => {
      const url =
        typeof input === "string"
          ? input
          : input instanceof URL
            ? input.href
            : input.url;
      fetchCalls.push({
        url,
        body: typeof init?.body === "string" ? init.body : "",
      });
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    };

    const session = createActivityEventsMockSupabase("session", {
      insertError: {
        message: 'new row violates row-level security policy for table "activity_events"',
        code: "42501",
      },
    });

    const eventId = await logActivityEvent(session.supabase, {
      organizationId: "org-1",
      actorType: "school_admin",
      actorUserId: "user-1",
      surface: "school_admin",
      action: ACTIVITY_ACTIONS.FORM_SAVED,
      summary: "Saved application form",
    });

    assert.equal(eventId, null);
    assert.equal(session.inserts.length, 1);
    assert.equal(fetchCalls.length, 1);
    assert.equal(fetchCalls[0]?.url, "/api/school-admin/operational-errors");
    const payload = JSON.parse(fetchCalls[0]?.body ?? "{}") as {
      operation?: string;
      error?: string;
    };
    assert.equal(payload.operation, "activity_log_insert");
    assert.match(
      payload.error ?? "",
      /row-level security policy for table "activity_events"/,
    );
  });
});
