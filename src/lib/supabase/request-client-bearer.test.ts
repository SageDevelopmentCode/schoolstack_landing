import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { SupabaseClient, User } from "@supabase/supabase-js";

import { getUserFromRequest } from "./get-user-from-request";

const ACCESS_TOKEN = "mobile-access-token";
const USER = { id: "user-1", email: "parent@test.com" } as User;

function createMockSupabase(options: {
  user?: User | null;
  getUserCalls?: string[];
}): SupabaseClient {
  const getUserCalls = options.getUserCalls ?? [];

  const supabase = {
    auth: {
      getUser: async (accessToken?: string) => {
        getUserCalls.push(accessToken ?? "");
        return {
          data: { user: options.user ?? null },
          error: null,
        };
      },
    },
  };

  (supabase as { __getUserCalls?: string[] }).__getUserCalls = getUserCalls;

  return supabase as unknown as SupabaseClient;
}

describe("getUserFromRequest", () => {
  it("passes Bearer tokens to supabase.auth.getUser(accessToken)", async () => {
    const getUserCalls: string[] = [];
    const supabase = createMockSupabase({ user: USER, getUserCalls });
    const request = new Request("https://example.com/api/parent-portal/home", {
      headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
    });

    const { data } = await getUserFromRequest(supabase, request);

    assert.equal(data.user?.id, USER.id);
    assert.deepEqual(getUserCalls, [ACCESS_TOKEN]);
  });

  it("passes a custom mobile access-token header to supabase.auth.getUser(accessToken)", async () => {
    const getUserCalls: string[] = [];
    const supabase = createMockSupabase({ user: USER, getUserCalls });
    const request = new Request("https://example.com/api/parent-portal/home", {
      headers: { "X-Schoolstack-Access-Token": ACCESS_TOKEN },
    });

    const { data } = await getUserFromRequest(supabase, request);

    assert.equal(data.user?.id, USER.id);
    assert.deepEqual(getUserCalls, [ACCESS_TOKEN]);
  });

  it("falls back to cookie session lookup when Authorization is missing", async () => {
    const getUserCalls: string[] = [];
    const supabase = createMockSupabase({ user: USER, getUserCalls });
    const request = new Request("https://example.com/api/parent-portal/home");

    const { data } = await getUserFromRequest(supabase, request);

    assert.equal(data.user?.id, USER.id);
    assert.deepEqual(getUserCalls, [""]);
  });

  it("returns no user when Bearer token is invalid", async () => {
    const supabase = createMockSupabase({ user: null });
    const request = new Request("https://example.com/api/mobile/activity-events", {
      method: "POST",
      headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
    });

    const {
      data: { user },
    } = await getUserFromRequest(supabase, request);

    assert.equal(user, null);
  });
});
