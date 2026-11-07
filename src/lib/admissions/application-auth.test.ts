import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { orderFamilyIdsByFirstGuardian } from "./application-auth";

describe("orderFamilyIdsByFirstGuardian", () => {
  it("orders families by their oldest guardian row, whatever order rows arrive in", () => {
    const rows = [
      { family_id: "fam-b", created_at: "2026-02-01T00:00:00+00:00" },
      { family_id: "fam-a", created_at: "2026-03-01T00:00:00+00:00" },
      { family_id: "fam-c", created_at: "2026-01-01T00:00:00+00:00" },
    ];
    const expected = ["fam-c", "fam-b", "fam-a"];
    assert.deepEqual(orderFamilyIdsByFirstGuardian(rows), expected);
    assert.deepEqual(orderFamilyIdsByFirstGuardian([...rows].reverse()), expected);
  });

  it("collapses a family with several guardians to its oldest row", () => {
    const rows = [
      { family_id: "fam-a", created_at: "2026-05-01T00:00:00+00:00" },
      { family_id: "fam-b", created_at: "2026-02-01T00:00:00+00:00" },
      { family_id: "fam-a", created_at: "2026-01-01T00:00:00+00:00" },
    ];
    assert.deepEqual(orderFamilyIdsByFirstGuardian(rows), ["fam-a", "fam-b"]);
  });

  it("breaks timestamp ties by family id", () => {
    const at = "2026-01-01T00:00:00+00:00";
    const rows = [
      { family_id: "fam-b", created_at: at },
      { family_id: "fam-a", created_at: at },
    ];
    assert.deepEqual(orderFamilyIdsByFirstGuardian(rows), ["fam-a", "fam-b"]);
  });

  it("returns an empty list when there are no guardian rows", () => {
    assert.deepEqual(orderFamilyIdsByFirstGuardian([]), []);
  });
});
