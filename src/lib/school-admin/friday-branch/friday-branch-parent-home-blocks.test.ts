import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { orderFridayBranchParentHomeBlockCandidates } from "./friday-branch-storage";

type CandidateRow = {
  id: string;
  status: string;
  sort_order: number;
};

function row(id: string, status: string, sortOrder: number): CandidateRow {
  return {
    id,
    status,
    sort_order: sortOrder,
  };
}

describe("orderFridayBranchParentHomeBlockCandidates", () => {
  it("orders current first, then upcoming blocks in sort order", () => {
    const rows = [
      row("current", "current", 0),
      row("upcoming-a", "upcoming", 1),
      row("upcoming-b", "upcoming", 2),
    ];

    const ordered = orderFridayBranchParentHomeBlockCandidates(rows as never);
    assert.deepEqual(
      ordered.map((entry) => entry.id),
      ["current", "upcoming-a", "upcoming-b"],
    );
  });

  it("returns upcoming blocks only when there is no current block", () => {
    const rows = [row("upcoming-a", "upcoming", 1), row("upcoming-b", "upcoming", 2)];

    const ordered = orderFridayBranchParentHomeBlockCandidates(rows as never);
    assert.deepEqual(
      ordered.map((entry) => entry.id),
      ["upcoming-a", "upcoming-b"],
    );
  });

  it("falls back to the first row when no current or upcoming status matches", () => {
    const rows = [row("only", "draft", 0)];

    const ordered = orderFridayBranchParentHomeBlockCandidates(rows as never);
    assert.deepEqual(
      ordered.map((entry) => entry.id),
      ["only"],
    );
  });
});
