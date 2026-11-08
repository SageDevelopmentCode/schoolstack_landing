import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  PLATFORM_ADMIN_LOGIN_HREF,
  resolveAuthenticatedLogin,
} from "@/lib/auth/login-destination";

const USER_ID = "user-1111-1111-1111-111111111111";

type TableResult = { data: unknown; error: null };

function createSupabase(tables: Record<string, TableResult>): SupabaseClient {
  function from(table: string) {
    const result = tables[table] ?? { data: [], error: null };
    const builder = {
      select() {
        return builder;
      },
      eq() {
        return builder;
      },
      in() {
        return builder;
      },
      order() {
        return builder;
      },
      maybeSingle: async () => ({
        data: Array.isArray(result.data) ? (result.data[0] ?? null) : result.data,
        error: null,
      }),
      then(
        resolve: (value: unknown) => unknown,
        reject?: (reason?: unknown) => unknown,
      ) {
        return Promise.resolve(result).then(resolve, reject);
      },
    };
    return builder;
  }

  return { from } as unknown as SupabaseClient;
}

function membershipRow(slug: string) {
  return {
    organizations: { slug, status: "live", name: slug.toUpperCase() },
  };
}

describe("resolveAuthenticatedLogin without a slug", () => {
  it("sends platform admins to the platform admin home", async () => {
    const supabase = createSupabase({
      profiles: { data: { role: "admin" }, error: null },
    });

    const result = await resolveAuthenticatedLogin(supabase, USER_ID);

    assert.deepEqual(result, { ok: true, href: PLATFORM_ADMIN_LOGIN_HREF });
  });

  it("reports no access when the user has no live schools", async () => {
    const supabase = createSupabase({
      profiles: { data: { role: "parent" }, error: null },
    });

    const result = await resolveAuthenticatedLogin(supabase, USER_ID);

    assert.deepEqual(result, { ok: true, noAccess: true });
  });

  it("includes an onboarding school the user administers", async () => {
    const supabase = createSupabase({
      profiles: { data: { role: "parent" }, error: null },
      organization_memberships: {
        data: [
          membershipRow("live-school"),
          {
            organizations: {
              slug: "new-school",
              status: "onboarding",
              name: "New School",
            },
          },
          {
            organizations: {
              slug: "paused-school",
              status: "paused",
              name: "Paused School",
            },
          },
        ],
        error: null,
      },
    });

    const result = await resolveAuthenticatedLogin(supabase, USER_ID);

    assert.deepEqual(result, {
      ok: true,
      needsSchoolSelection: true,
      accessibleSlugs: ["live-school", "new-school"],
    });
  });

  it("asks for a school choice when the user belongs to several schools", async () => {
    const supabase = createSupabase({
      profiles: { data: { role: "parent" }, error: null },
      organization_memberships: {
        data: [membershipRow("beta-school"), membershipRow("alpha-school")],
        error: null,
      },
    });

    const result = await resolveAuthenticatedLogin(supabase, USER_ID);

    assert.deepEqual(result, {
      ok: true,
      needsSchoolSelection: true,
      accessibleSlugs: ["alpha-school", "beta-school"],
    });
  });
});
