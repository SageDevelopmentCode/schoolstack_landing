import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  assertTeacherFamilyAccess,
  loadAdminFormFamilyOptions,
  loadTeacherFormFamilyOptions,
} from "./load-form-family-options";

const enrollmentRow = {
  student_id: "student-1",
  students: {
    id: "student-1",
    first_name: "Olivia",
    last_name: "Sparhawk",
    family_id: "family-1",
    families: {
      id: "family-1",
      name: "Sparhawk Family",
    },
  },
};

function createFilterBuilder(table: string, tableData: Record<string, unknown[]>) {
  const builder = {
    select(_columns?: string) {
      return builder;
    },
    eq(_column: string, _value: unknown) {
      return builder;
    },
    in(_column: string, _value: unknown) {
      return builder;
    },
    maybeSingle: async () => ({ data: null, error: null }),
    single: async () => ({ data: null, error: null }),
    then(
      resolve: (value: unknown) => unknown,
      reject?: (reason?: unknown) => unknown,
    ) {
      const data = tableData[table] ?? [];
      return Promise.resolve(resolve({ data, error: null })).then(resolve, reject);
    },
  };

  return builder;
}

function createMockSupabase(tableData: Record<string, unknown[]>) {
  return {
    from(table: string) {
      return createFilterBuilder(table, tableData);
    },
  } as unknown as SupabaseClient;
}

describe("load-form-family-options", () => {
  it("returns no families for teachers with zero classrooms even when enrollments exist", async () => {
    const admin = createMockSupabase({
      classroom_staff_assignments: [],
      student_teacher_assignments: [],
      enrollments: [enrollmentRow],
    });

    const families = await loadTeacherFormFamilyOptions(
      admin,
      "org-1",
      "staff-1",
    );

    assert.deepEqual(families, []);
  });

  it("rejects family access for teachers with zero classrooms", async () => {
    const admin = createMockSupabase({
      classroom_staff_assignments: [],
      student_teacher_assignments: [],
      enrollments: [enrollmentRow],
    });

    await assert.rejects(
      () =>
        assertTeacherFamilyAccess(admin, "org-1", "staff-1", ["family-1"]),
      /You can only assign forms to families in your classrooms/,
    );
  });

  it("still returns enrolled families for admin lookups without classroom scoping", async () => {
    const admin = createMockSupabase({
      enrollments: [enrollmentRow],
    });

    const families = await loadAdminFormFamilyOptions(admin, "org-1");

    assert.deepEqual(families, [
      {
        id: "family-1",
        name: "Sparhawk Family",
        studentNames: ["Olivia Sparhawk"],
      },
    ]);
  });
});
