import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { mapTeacherParentFormRow } from "./db-mapper";
import type { TeacherParentFormRow } from "./db-mapper";

function baseRow(overrides: Partial<TeacherParentFormRow> = {}): TeacherParentFormRow {
  return {
    id: "form-1",
    organization_id: "org-1",
    created_by_staff_member_id: "staff-1",
    title: "Agreement",
    description: "",
    form_type: "upload",
    status: "active",
    audience_type: "families",
    classroom_ids: [],
    family_ids: ["family-1"],
    due_date: null,
    require_signature: true,
    config: { familyNames: ["Thompson Family"] },
    total_families: 1,
    signed_families: 0,
    published_at: "2026-09-16T00:00:00.000Z",
    archived_at: null,
    created_at: "2026-09-16T00:00:00.000Z",
    updated_at: "2026-09-16T00:00:00.000Z",
    ...overrides,
  };
}

describe("mapTeacherParentFormRow formCategory", () => {
  it("maps tuition category", () => {
    const mapped = mapTeacherParentFormRow(baseRow({ form_category: "tuition" }));
    assert.equal(mapped.formCategory, "tuition");
  });

  it("defaults missing category to general", () => {
    const mapped = mapTeacherParentFormRow(baseRow());
    assert.equal(mapped.formCategory, "general");
  });
});
