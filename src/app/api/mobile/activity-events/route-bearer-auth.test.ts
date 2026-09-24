import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { SupabaseClient, User } from "@supabase/supabase-js";

import { getUserFromRequest } from "@/lib/supabase/get-user-from-request";

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
          error: options.user ? null : { message: "unauthenticated" },
        };
      },
    },
  };

  (supabase as { __getUserCalls?: string[] }).__getUserCalls = getUserCalls;

  return supabase as unknown as SupabaseClient;
}

describe("mobile activity-events bearer auth", () => {
  it("resolves mobile Bearer tokens via getUserFromRequest before logging activity", async () => {
    const getUserCalls: string[] = [];
    const supabase = createMockSupabase({ user: USER, getUserCalls });
    const request = new Request("https://example.com/api/mobile/activity-events", {
      method: "POST",
      headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
    });

    const {
      data: { user },
      error,
    } = await getUserFromRequest(supabase, request);

    assert.equal(user?.id, USER.id);
    assert.equal(error, null);
    assert.deepEqual(getUserCalls, [ACCESS_TOKEN]);
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
