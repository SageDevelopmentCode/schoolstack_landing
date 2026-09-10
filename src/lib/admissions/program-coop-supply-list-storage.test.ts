import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ProgramCoopSignupConflictError } from "./program-coop-storage-errors";
import { appendProgramCoopSupplyAssignedFamily } from "./program-coop-supply-list-storage";

describe("appendProgramCoopSupplyAssignedFamily", () => {
  it("maps empty RPC results to a signup conflict", async () => {
    const supabase = {
      rpc: async () => ({ data: [], error: null }),
      from() {
        return {
          select() {
            return this;
          },
          eq() {
            return this;
          },
          async maybeSingle() {
            return {
              data: {
                id: "item-1",
                program_id: "program-1",
                organization_id: "org-1",
                name: "Paper towels",
                item_type: "consumable",
                usage_timing: "year_round",
                months: [],
                color_id: null,
                assigned_family_ids: ["a", "b", "c", "d", "e"],
                where_to_buy: "",
                quantity: 1,
                quantity_label: "",
                estimated_price: { mode: "unset" },
                sort_order: 0,
                created_at: "",
                updated_at: "",
              },
              error: null,
            };
          },
        };
      },
    };

    await assert.rejects(
      () =>
        appendProgramCoopSupplyAssignedFamily(
          supabase as never,
          { organizationId: "org-1", programId: "program-1" },
          "item-1",
          "family-new",
        ),
      (error: unknown) => error instanceof ProgramCoopSignupConflictError,
    );
  });

  it("returns the RPC row when sign-up succeeds", async () => {
    const supabase = {
      rpc: async () => ({
        data: [
          {
            id: "item-1",
            program_id: "program-1",
            organization_id: "org-1",
            name: "Paper towels",
            item_type: "consumable",
            usage_timing: "year_round",
            months: [],
            color_id: null,
            assigned_family_ids: ["family-new"],
            where_to_buy: "",
            quantity: 1,
            quantity_label: "",
            estimated_price: { mode: "unset" },
            sort_order: 0,
            created_at: "",
            updated_at: "",
          },
        ],
        error: null,
      }),
    };

    const item = await appendProgramCoopSupplyAssignedFamily(
      supabase as never,
      { organizationId: "org-1", programId: "program-1" },
      "item-1",
      "family-new",
    );

    assert.deepEqual(item.assignedFamilyIds, ["family-new"]);
  });
});
