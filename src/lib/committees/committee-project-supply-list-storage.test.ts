import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { replaceCommitteeProjectSupplyColorLegend } from "./committee-project-supply-list-storage";

const ctx = {
  organizationId: "org-1",
  committeeId: "committee-1",
  projectId: "project-1",
};

describe("replaceCommitteeProjectSupplyColorLegend", () => {
  it("propagates RPC errors", async () => {
    const supabase = {
      rpc: async () => ({
        data: null,
        error: { message: "organization_mismatch", code: "P0001" },
      }),
    };

    await assert.rejects(
      () =>
        replaceCommitteeProjectSupplyColorLegend(
          supabase as never,
          ctx,
          [{ id: "red", hex: "#f00", label: "Red" }],
        ),
      (error: unknown) =>
        error instanceof Object &&
        "message" in error &&
        (error as { message: string }).message === "organization_mismatch",
    );
  });

  it("maps RPC rows to legend entries", async () => {
    const supabase = {
      rpc: async (
        _name: string,
        args: { p_legend: { id: string; hex: string; label: string }[] },
      ) => {
        assert.deepEqual(args.p_legend, [
          { id: "blue", hex: "#00f", label: "Blue" },
        ]);
        return {
          data: [
            {
              id: "row-1",
              project_id: ctx.projectId,
              organization_id: ctx.organizationId,
              color_id: "blue",
              hex: "#00f",
              label: "Blue",
              sort_order: 0,
              created_at: "",
              updated_at: "",
            },
          ],
          error: null,
        };
      },
    };

    const legend = await replaceCommitteeProjectSupplyColorLegend(
      supabase as never,
      ctx,
      [{ id: "blue", hex: "#00f", label: "Blue" }],
    );

    assert.deepEqual(legend, [{ id: "blue", hex: "#00f", label: "Blue" }]);
  });

  it("returns an empty array when the legend is cleared", async () => {
    const supabase = {
      rpc: async (
        _name: string,
        args: { p_legend: unknown[] },
      ) => {
        assert.deepEqual(args.p_legend, []);
        return { data: [], error: null };
      },
    };

    const legend = await replaceCommitteeProjectSupplyColorLegend(
      supabase as never,
      ctx,
      [],
    );

    assert.deepEqual(legend, []);
  });
});
