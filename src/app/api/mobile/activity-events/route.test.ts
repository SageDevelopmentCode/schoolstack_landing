import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { SupabaseClient } from "@supabase/supabase-js";
import { authorizeMobileActivityEvent } from "./authorize-mobile-activity";

const ORG_ID = "org-1";
const USER_ID = "user-1";

type MockTableRows = Record<string, unknown[]>;

type Filter = {
  type: "eq" | "in";
  column: string;
  value: unknown;
  values?: unknown[];
};

function matchesFilters(row: Record<string, unknown>, filters: Filter[]): boolean {
  return filters.every((filter) => {
    if (filter.type === "eq") {
      return row[filter.column] === filter.value;
    }

    return filter.values?.includes(row[filter.column]) ?? false;
  });
}

function createMockSupabase(options: {
  user?: { id: string; email?: string } | null;
  tables?: MockTableRows;
}): SupabaseClient {
  const tables = options.tables ?? {};

  function createQueryBuilder(table: string, filters: Filter[] = []) {
    const rows = (tables[table] ?? []) as Record<string, unknown>[];

    const builder = {
      select() {
        return builder;
      },
      eq(column: string, value: unknown) {
        return createQueryBuilder(table, [
          ...filters,
          { type: "eq", column, value },
        ]);
      },
      in(column: string, values: unknown[]) {
        return createQueryBuilder(table, [
          ...filters,
          { type: "in", column, value: null, values },
        ]);
      },
      limit() {
        return builder;
      },
      maybeSingle: async () => {
        const match = rows.find((row) => matchesFilters(row, filters));
        return { data: match ?? null, error: null };
      },
      then(
        resolve: (value: { data: Record<string, unknown>[]; error: null }) => void,
      ) {
        const matches = rows.filter((row) => matchesFilters(row, filters));
        resolve({ data: matches, error: null });
        return Promise.resolve({ data: matches, error: null });
      },
    };

    return builder;
  }

  const supabase = {
    auth: {
      getUser: async () => ({
        data: {
          user: options.user
            ? {
                id: options.user.id,
                email: options.user.email ?? "user@test.com",
              }
            : null,
        },
        error: options.user ? null : { message: "unauthenticated" },
      }),
    },
    from(table: string) {
      return createQueryBuilder(table);
    },
  };

  return supabase as unknown as SupabaseClient;
}

describe("authorizeMobileActivityEvent", () => {
  it("rejects parent membership when surface is school_admin", async () => {
    const supabase = createMockSupabase({
      user: { id: USER_ID },
      tables: {
        profiles: [{ id: USER_ID, role: "user" }],
        organization_memberships: [
          {
            id: "membership-1",
            organization_id: ORG_ID,
            user_id: USER_ID,
            status: "active",
            role: "parent",
          },
        ],
      },
    });

    const result = await authorizeMobileActivityEvent(
      supabase,
      USER_ID,
      ORG_ID,
      "school_admin",
    );

    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.equal(result.status, 403);
      assert.equal(result.code, "forbidden");
    }
  });

  it("allows org admin on school_admin surface with school_admin actorType", async () => {
    const supabase = createMockSupabase({
      user: { id: USER_ID },
      tables: {
        profiles: [{ id: USER_ID, role: "user" }],
        organization_memberships: [
          {
            id: "membership-1",
            organization_id: ORG_ID,
            user_id: USER_ID,
            status: "active",
            role: "admin",
          },
        ],
      },
    });

    const result = await authorizeMobileActivityEvent(
      supabase,
      USER_ID,
      ORG_ID,
      "school_admin",
    );

    assert.deepEqual(result, { ok: true, actorType: "school_admin" });
  });

  it("allows platform admin without membership with platform_admin actorType", async () => {
    const supabase = createMockSupabase({
      user: { id: USER_ID },
      tables: {
        profiles: [{ id: USER_ID, role: "admin" }],
        organization_memberships: [],
      },
    });

    const result = await authorizeMobileActivityEvent(
      supabase,
      USER_ID,
      ORG_ID,
      "school_admin",
    );

    assert.deepEqual(result, { ok: true, actorType: "platform_admin" });
  });

  it("allows guardian parent_apply access on parent_portal surface", async () => {
    const supabase = createMockSupabase({
      user: { id: USER_ID },
      tables: {
        guardians: [
          {
            id: "guardian-1",
            organization_id: ORG_ID,
            user_id: USER_ID,
          },
        ],
        organization_memberships: [],
      },
    });

    const result = await authorizeMobileActivityEvent(
      supabase,
      USER_ID,
      ORG_ID,
      "parent_portal",
    );

    assert.deepEqual(result, { ok: true, actorType: "parent" });
  });

  it("allows teacher on teacher_portal surface", async () => {
    const supabase = createMockSupabase({
      user: { id: USER_ID },
      tables: {
        organization_memberships: [
          {
            id: "membership-1",
            organization_id: ORG_ID,
            user_id: USER_ID,
            status: "active",
            role: "teacher",
          },
        ],
      },
    });

    const result = await authorizeMobileActivityEvent(
      supabase,
      USER_ID,
      ORG_ID,
      "teacher_portal",
    );

    assert.deepEqual(result, { ok: true, actorType: "teacher" });
  });

  it("allows enrolled parent on parent_portal surface", async () => {
    const supabase = createMockSupabase({
      user: { id: USER_ID },
      tables: {
        guardians: [
          {
            id: "guardian-1",
            organization_id: ORG_ID,
            user_id: USER_ID,
          },
        ],
        organization_memberships: [
          {
            id: "membership-1",
            organization_id: ORG_ID,
            user_id: USER_ID,
            status: "active",
            role: "parent",
          },
        ],
      },
    });

    const result = await authorizeMobileActivityEvent(
      supabase,
      USER_ID,
      ORG_ID,
      "parent_portal",
    );

    assert.deepEqual(result, { ok: true, actorType: "parent" });
  });
});
