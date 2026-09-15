import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { SupabaseClient, User } from "@supabase/supabase-js";

import { requireSchoolAdminUser, SchoolAdminAuthError } from "./access";

const ORG_ID = "org-1";
const USER_ID = "user-1";
const ACCESS_TOKEN = "mobile-access-token";

function createMockSupabase(options: {
  user?: User | null;
  getUserError?: { message: string } | null;
  getUserCalls?: string[];
}): SupabaseClient {
  const getUserCalls = options.getUserCalls ?? [];

  const supabase = {
    auth: {
      getUser: async (accessToken?: string) => {
        getUserCalls.push(accessToken ?? "");
        return {
          data: { user: options.user ?? null },
          error: options.getUserError ?? null,
        };
      },
    },
    from(table: string) {
      return {
        select() {
          return this;
        },
        eq() {
          return this;
        },
        in() {
          return this;
        },
        maybeSingle: async () => {
          if (table === "profiles") {
            return { data: { role: "user" }, error: null };
          }

          if (table === "organization_memberships") {
            return { data: { id: "membership-1" }, error: null };
          }

          throw new Error(`Unexpected table: ${table}`);
        },
      };
    },
  };

  (supabase as { __getUserCalls?: string[] }).__getUserCalls = getUserCalls;

  return supabase as unknown as SupabaseClient;
}

describe("requireSchoolAdminUser bearer auth", () => {
  it("validates mobile Bearer tokens via supabase.auth.getUser(accessToken)", async () => {
    const getUserCalls: string[] = [];
    const user = { id: USER_ID, email: "admin@test.com" } as User;
    const supabase = createMockSupabase({
      user,
      getUserCalls,
    });

    const request = new Request("https://example.com/api/school-admin/support-requests", {
      headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
    });

    const result = await requireSchoolAdminUser(supabase, ORG_ID, request);

    assert.equal(result.id, USER_ID);
    assert.deepEqual(getUserCalls, [ACCESS_TOKEN]);
  });

  it("throws unauthenticated when Bearer token resolves to no user", async () => {
    const supabase = createMockSupabase({
      user: null,
      getUserError: { message: "invalid jwt" },
    });

    const request = new Request("https://example.com/api/school-admin/support-requests", {
      headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
    });

    await assert.rejects(
      () => requireSchoolAdminUser(supabase, ORG_ID, request),
      (error: unknown) => {
        assert.ok(error instanceof SchoolAdminAuthError);
        assert.equal(error.code, "unauthenticated");
        assert.equal(error.status, 401);
        return true;
      },
    );
  });
});
