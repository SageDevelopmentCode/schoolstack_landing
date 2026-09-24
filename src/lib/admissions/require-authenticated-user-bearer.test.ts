import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { SupabaseClient, User } from "@supabase/supabase-js";

import { requireAuthenticatedUser } from "./application-auth";

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

describe("requireAuthenticatedUser bearer auth", () => {
  it("validates mobile Bearer tokens when request is provided", async () => {
    const getUserCalls: string[] = [];
    const supabase = createMockSupabase({ user: USER, getUserCalls });
    const request = new Request("https://example.com/api/tuition/autopay", {
      headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
    });

    const user = await requireAuthenticatedUser(supabase, request);

    assert.equal(user.id, USER.id);
    assert.deepEqual(getUserCalls, [ACCESS_TOKEN]);
  });

  it("falls back to cookie session lookup when request is omitted", async () => {
    const getUserCalls: string[] = [];
    const supabase = createMockSupabase({ user: USER, getUserCalls });

    const user = await requireAuthenticatedUser(supabase);

    assert.equal(user.id, USER.id);
    assert.deepEqual(getUserCalls, [""]);
  });
});
