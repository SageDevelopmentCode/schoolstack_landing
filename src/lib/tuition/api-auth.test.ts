import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { SupabaseClient } from "@supabase/supabase-js";
import { AuthError } from "@/lib/admissions/application-auth";
import { requireTuitionOrgAdmin } from "./api-auth";

function createMockSupabase(
  handlers: Record<string, () => Promise<{ data: unknown; error: null }>>,
): SupabaseClient {
  return {
    from(table: string) {
      return {
        select() {
          return {
            eq(_column: string, _value: unknown) {
              const chain = {
                eq(_column2: string, _value2: unknown) {
                  const inner = {
                    eq(_column3: string, _value3: unknown) {
                      return {
                        maybeSingle: () => handlers[table]?.() ?? Promise.resolve({ data: null, error: null }),
                        in() {
                          return {
                            maybeSingle: () => handlers[table]?.() ?? Promise.resolve({ data: null, error: null }),
                          };
                        },
                      };
                    },
                    maybeSingle: () => handlers[table]?.() ?? Promise.resolve({ data: null, error: null }),
                    in() {
                      return {
                        maybeSingle: () => handlers[table]?.() ?? Promise.resolve({ data: null, error: null }),
                      };
                    },
                  };
                  return inner;
                },
                maybeSingle: () => handlers[table]?.() ?? Promise.resolve({ data: null, error: null }),
              };
              return chain;
            },
          };
        },
      };
    },
  } as unknown as SupabaseClient;
}

describe("requireTuitionOrgAdmin", () => {
  it("allows platform admins without organization membership", async () => {
    const admin = createMockSupabase({
      profiles: async () => ({ data: { role: "admin" }, error: null }),
    });

    await assert.doesNotReject(() =>
      requireTuitionOrgAdmin(admin, "org-1", "platform-user"),
    );
  });

  it("allows org admins with active membership", async () => {
    const admin = createMockSupabase({
      profiles: async () => ({ data: { role: "member" }, error: null }),
      organization_memberships: async () => ({ data: { id: "membership-1" }, error: null }),
    });

    await assert.doesNotReject(() =>
      requireTuitionOrgAdmin(admin, "org-1", "org-admin-user"),
    );
  });

  it("rejects users without platform or org admin access", async () => {
    const admin = createMockSupabase({
      profiles: async () => ({ data: { role: "member" }, error: null }),
      organization_memberships: async () => ({ data: null, error: null }),
    });

    await assert.rejects(
      () => requireTuitionOrgAdmin(admin, "org-1", "regular-user"),
      (error: unknown) => {
        assert.ok(error instanceof AuthError);
        assert.equal(error.status, 403);
        assert.equal(error.code, "forbidden");
        return true;
      },
    );
  });
});
