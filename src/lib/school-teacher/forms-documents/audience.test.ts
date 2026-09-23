import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  countFormAudienceFamiliesByIds,
  resolveFormAudienceFamiliesByIds,
} from "./audience";

function createAdmin(familyIds: string[]) {
  return {
    from: (table: string) => {
      if (table !== "enrollments") {
        throw new Error(`Unexpected table: ${table}`);
      }

      return {
        select: () => ({
          eq: () => ({
            eq: () => ({
              in: async () => ({
                data: familyIds.map((familyId, index) => ({
                  student_id: `student-${index + 1}`,
                  students: {
                    id: `student-${index + 1}`,
                    first_name: "Student",
                    last_name: String(index + 1),
                    family_id: familyId,
                  },
                })),
                error: null,
              }),
            }),
          }),
        }),
      };
    },
  } as unknown as SupabaseClient;
}

describe("resolveFormAudienceFamiliesByIds", () => {
  it("returns one family with enrolled students", async () => {
    const families = await resolveFormAudienceFamiliesByIds(
      createAdmin(["family-1"]),
      "org-1",
      ["family-1"],
    );

    assert.equal(families.length, 1);
    assert.equal(families[0]?.familyId, "family-1");
    assert.deepEqual(families[0]?.studentIds, ["student-1"]);
  });

  it("counts distinct families", async () => {
    const count = await countFormAudienceFamiliesByIds(
      createAdmin(["family-1", "family-2"]),
      "org-1",
      ["family-1", "family-2"],
    );

    assert.equal(count, 2);
  });
});
