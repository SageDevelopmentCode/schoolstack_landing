import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { SupabaseClient } from "@supabase/supabase-js";
import { resolveAuthorizedFamilyIdForStudent } from "./resolve-parent-signup-family";

function createStudentsMockSupabase(familyId: string | null): SupabaseClient {
  const chain = {
    select: () => chain,
    eq: () => chain,
    in: () => chain,
    maybeSingle: async () => ({
      data: familyId ? { family_id: familyId } : null,
      error: null,
    }),
  };
  return {
    from: (table: string) => {
      assert.equal(table, "students");
      return chain;
    },
  } as unknown as SupabaseClient;
}

describe("resolveAuthorizedFamilyIdForStudent", () => {
  it("returns null when authorized families list is empty", async () => {
    const admin = createStudentsMockSupabase("family-1");
    const result = await resolveAuthorizedFamilyIdForStudent(
      admin,
      "org-1",
      [],
      "student-1",
    );
    assert.equal(result, null);
  });

  it("returns family id when student is in an authorized family", async () => {
    const admin = createStudentsMockSupabase("family-b");
    const result = await resolveAuthorizedFamilyIdForStudent(
      admin,
      "org-1",
      ["family-a", "family-b"],
      "student-1",
    );
    assert.equal(result, "family-b");
  });

  it("returns null when student is not found", async () => {
    const admin = createStudentsMockSupabase(null);
    const result = await resolveAuthorizedFamilyIdForStudent(
      admin,
      "org-1",
      ["family-a"],
      "student-unknown",
    );
    assert.equal(result, null);
  });
});
