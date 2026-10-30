import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  fetchActivityEvents,
  normalizeActivityActorEmail,
} from "@/lib/activity-log";

type QueryCall = { method: string; args: unknown[] };

describe("normalizeActivityActorEmail", () => {
  it("trims and lowercases", () => {
    assert.equal(normalizeActivityActorEmail("  Parent@Test.COM  "), "parent@test.com");
  });

  it("returns null for empty input", () => {
    assert.equal(normalizeActivityActorEmail("   "), null);
  });
});

describe("fetchActivityEvents actor filters", () => {
  it("uses or() when both actor email and user id are set", async () => {
    const calls: QueryCall[] = [];
    const query: Record<string, (...a: unknown[]) => unknown> = {};
    const methods = ["select", "order", "limit", "eq", "gte", "or"] as const;
    for (const method of methods) {
      query[method] = (...args: unknown[]) => {
        calls.push({ method, args });
        return query;
      };
    }
    query.select = () => query;

    const supabase = {
      from() {
        return {
          ...query,
          then(resolve: (v: { data: []; error: null }) => void) {
            resolve({ data: [], error: null });
            return Promise.resolve({ data: [], error: null });
          },
        };
      },
    } as unknown as SupabaseClient;

    await fetchActivityEvents(supabase, {
      actorEmail: "a@b.com",
      actorUserId: "user-uuid",
      datePreset: "all",
    });

    assert.ok(
      calls.some(
        (c) =>
          c.method === "or" &&
          c.args[0] ===
            "actor_email.eq.a@b.com,actor_user_id.eq.user-uuid",
      ),
    );
  });
});
