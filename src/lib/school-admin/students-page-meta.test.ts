import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseAdminStudentsPageMetaRow } from "./students-page-meta";

describe("parseAdminStudentsPageMetaRow", () => {
  it("maps RPC payload into roster metrics", () => {
    const meta = parseAdminStudentsPageMetaRow({
      total_count: "42",
      unassigned_count: 3,
      new_enrollment_count: "5",
      program_count: 2,
      program_options: [{ name: "Primary" }, { name: "Toddler" }],
    });

    assert.ok(meta);
    assert.equal(meta.totalCount, 42);
    assert.equal(meta.unassignedCount, 3);
    assert.equal(meta.newEnrollmentCount, 5);
    assert.equal(meta.programCount, 2);
    assert.deepEqual(meta.programOptions, [
      ["Primary", "Primary"],
      ["Toddler", "Toddler"],
    ]);
  });

  it("returns null when row is missing", () => {
    assert.equal(parseAdminStudentsPageMetaRow(null), null);
  });

  it("defaults missing counts to zero", () => {
    const meta = parseAdminStudentsPageMetaRow({
      program_options: [],
    });

    assert.ok(meta);
    assert.equal(meta.totalCount, 0);
    assert.equal(meta.unassignedCount, 0);
    assert.equal(meta.newEnrollmentCount, 0);
    assert.equal(meta.programCount, 0);
    assert.deepEqual(meta.programOptions, []);
  });
});
