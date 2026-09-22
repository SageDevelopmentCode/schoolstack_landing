import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { SupabaseClient } from "@supabase/supabase-js";
import { familyHasAnyAuthorizedPickupContacts } from "./family-has-pickup-contacts";

function createMockSupabase(rows: Array<{ student_id: string }> | null, error: Error | null = null) {
  const query = {
    eq: () => query,
    in: () => query,
    limit: async () => {
      if (error) throw error;
      return { data: rows, error: null };
    },
  };

  const supabase = {
    from: () => ({
      select: () => query,
    }),
  } as unknown as SupabaseClient;

  return supabase;
}

describe("familyHasAnyAuthorizedPickupContacts", () => {
  it("returns false when there are no student ids", async () => {
    const supabase = createMockSupabase([]);
    const result = await familyHasAnyAuthorizedPickupContacts(
      supabase,
      "org-1",
      "family-1",
      [],
    );
    assert.equal(result, false);
  });

  it("returns false when no active contacts exist", async () => {
    const supabase = createMockSupabase([]);
    const result = await familyHasAnyAuthorizedPickupContacts(
      supabase,
      "org-1",
      "family-1",
      ["student-1", "student-2"],
    );
    assert.equal(result, false);
  });

  it("returns true when any student has an active contact", async () => {
    const supabase = createMockSupabase([{ student_id: "student-2" }]);
    const result = await familyHasAnyAuthorizedPickupContacts(
      supabase,
      "org-1",
      "family-1",
      ["student-1", "student-2"],
    );
    assert.equal(result, true);
  });
});
