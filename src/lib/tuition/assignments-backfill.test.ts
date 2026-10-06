import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { SupabaseClient } from "@supabase/supabase-js";
import { backfillTuitionAssignmentsForProgram } from "./assignments";

const ORG_ID = "org-1";
const PROGRAM_ID = "program-1";
const ENROLLMENT_ID = "enrollment-1";
const STUDENT_ID = "student-1";
const FAMILY_ID = "family-1";

function mockBackfillSupabase(activePlanCount: number): SupabaseClient {
  const supabase = {
    from: (table: string) => {
      if (table === "enrollments") {
        return {
          select: () => ({
            eq: (_col: string, val: string) => {
              if (val === ORG_ID) {
                return {
                  eq: () => ({
                    in: async () => ({
                      data: [
                        {
                          id: ENROLLMENT_ID,
                          student_id: STUDENT_ID,
                        },
                      ],
                      error: null,
                    }),
                  }),
                };
              }
              return { eq: () => ({ in: async () => ({ data: [], error: null }) }) };
            },
          }),
        };
      }

      if (table === "tuition_rate_plans") {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                eq: () => ({
                  order: () => ({
                    order: async () => ({
                      data: Array.from({ length: activePlanCount }, (_, i) => ({
                        id: `plan-${i + 1}`,
                        organization_id: ORG_ID,
                        program_id: PROGRAM_ID,
                        name: `Plan ${i + 1}`,
                        billing_basis: "annual",
                        amount_cents: 720000,
                        currency: "USD",
                        effective_start: "2026-08-01",
                        effective_end: "2027-06-01",
                        status: "active",
                        metadata: {},
                        created_at: "2026-01-01T00:00:00Z",
                        updated_at: "2026-01-01T00:00:00Z",
                      })),
                      error: null,
                    }),
                  }),
                }),
              }),
            }),
          }),
        };
      }

      if (table === "tuition_enrollment_assignments") {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                in: async () => ({ data: [], error: null }),
              }),
            }),
          }),
        };
      }

      if (table === "students") {
        return {
          select: () => ({
            in: async () => ({
              data: [{ id: STUDENT_ID, family_id: FAMILY_ID }],
              error: null,
            }),
          }),
        };
      }

      throw new Error(`Unexpected table in mock: ${table}`);
    },
  };

  return supabase as unknown as SupabaseClient;
}

describe("backfillTuitionAssignmentsForProgram", () => {
  it("skips unassigned enrollments when multiple catalogs exist and no ratePlanId", async () => {
    const supabase = mockBackfillSupabase(2);

    const result = await backfillTuitionAssignmentsForProgram(supabase, {
      organizationId: ORG_ID,
      programId: PROGRAM_ID,
    });

    assert.equal(result.total, 1);
    assert.equal(result.skippedAmbiguousCount, 1);
    assert.equal(result.assignedCount, 0);
  });

  it("does not skip for ambiguity when ratePlanId targets a specific catalog", async () => {
    const supabase = mockBackfillSupabase(2);

    const result = await backfillTuitionAssignmentsForProgram(supabase, {
      organizationId: ORG_ID,
      programId: PROGRAM_ID,
      ratePlanId: "plan-2",
    });

    assert.equal(result.total, 1);
    assert.equal(result.skippedAmbiguousCount, 0);
    assert.equal(result.assignedCount, 0);
    assert.equal(result.failedCount, 1);
  });
});
