import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  ProgramCoopSignupConflictError,
  ProgramCoopStorageConflictError,
} from "./program-coop-storage-errors";
import { newCoopSupplyListItem } from "./program-coop-supply-list-mock";
import {
  appendProgramCoopSupplyAssignedFamily,
  removeProgramCoopSupplyAssignedFamily,
  saveProgramCoopSupplyItemAdmin,
} from "./program-coop-supply-list-storage";

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

describe("removeProgramCoopSupplyAssignedFamily", () => {
  it("maps empty RPC results to a not-signed-up error", async () => {
    const supabase = {
      rpc: async () => ({ data: [], error: null }),
    };

    await assert.rejects(
      () =>
        removeProgramCoopSupplyAssignedFamily(
          supabase as never,
          { organizationId: "org-1", programId: "program-1" },
          "item-1",
          "family-1",
        ),
      (error: unknown) =>
        error instanceof Error && error.message === "You are not signed up for this item.",
    );
  });

  it("returns the RPC row when unclaim succeeds", async () => {
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
            assigned_family_ids: ["family-2"],
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

    const item = await removeProgramCoopSupplyAssignedFamily(
      supabase as never,
      { organizationId: "org-1", programId: "program-1" },
      "item-1",
      "family-1",
    );

    assert.deepEqual(item.assignedFamilyIds, ["family-2"]);
  });
});

describe("saveProgramCoopSupplyItemAdmin", () => {
  it("rejects saves without a baseline updatedAt", async () => {
    const draft = { ...newCoopSupplyListItem(), id: "item-1", name: "Paper towels" };
    const savedBaseline = { ...draft, assignedFamilyIds: [] };

    await assert.rejects(
      () =>
        saveProgramCoopSupplyItemAdmin(
          { from: () => ({}) } as never,
          { organizationId: "org-1", programId: "program-1" },
          { draft, savedBaseline },
        ),
      (error: unknown) => error instanceof ProgramCoopStorageConflictError,
    );
  });
});
