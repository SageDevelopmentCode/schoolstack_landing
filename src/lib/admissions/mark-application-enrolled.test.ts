import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  EnrollmentMaterializationError,
  markApplicationAsEnrolled,
} from "./enrollment-checklist-materialization";

type ApplicationRow = {
  id: string;
  organization_id: string;
  program_id: string | null;
  student_id: string | null;
  status: string;
  family_id: string | null;
};

type EnrollmentRow = {
  id: string;
  student_id: string;
  program_id: string;
  status: string;
};

function createMockSupabase(options: {
  application?: ApplicationRow | null;
  existingEnrollment?: EnrollmentRow | null;
  checklist?: {
    id: string;
    enrollment_id: string;
    template_id: string;
    status: string;
    metadata: Record<string, unknown>;
  } | null;
  insertEnrollmentError?: { code?: string; message: string };
}) {
  const {
    application = null,
    existingEnrollment = null,
    checklist = null,
    insertEnrollmentError,
  } = options;

  const updates: Array<{ table: string; values: Record<string, unknown> }> = [];
  let insertedEnrollment: EnrollmentRow | null = null;

  function createFilterBuilder(table: string, filters: Record<string, unknown> = {}) {
    const nextFilters = { ...filters };

    const filterBuilder = {
      select(_columns?: string) {
        return filterBuilder;
      },
      eq(column: string, value: unknown) {
        nextFilters[column] = value;
        return filterBuilder;
      },
      maybeSingle: async () => {
        if (table === "applications" && nextFilters.id === application?.id) {
          return { data: application, error: null };
        }

        if (
          table === "enrollment_checklists" &&
          nextFilters.application_id &&
          checklist
        ) {
          return { data: checklist, error: null };
        }

        if (
          table === "enrollments" &&
          nextFilters.student_id === existingEnrollment?.student_id &&
          nextFilters.program_id === existingEnrollment?.program_id
        ) {
          return { data: existingEnrollment, error: null };
        }

        if (
          table === "applications" &&
          nextFilters.id === application?.id &&
          nextFilters.status === "accepted" &&
          application?.status === "accepted"
        ) {
          return { data: { id: application.id }, error: null };
        }

        return { data: null, error: null };
      },
      single: async () => {
        const result = await filterBuilder.maybeSingle();
        return result;
      },
      update(values: Record<string, unknown>) {
        updates.push({ table, values, filters: { ...nextFilters } });
        return filterBuilder;
      },
      insert(values: Record<string, unknown>) {
        if (table === "enrollments") {
          if (insertEnrollmentError) {
            return {
              select: () => ({
                single: async () => ({
                  data: null,
                  error: insertEnrollmentError,
                }),
              }),
            };
          }

          insertedEnrollment = {
            id: "enrollment-new",
            student_id: String(values.student_id),
            program_id: String(values.program_id),
            status: String(values.status),
          };

          return {
            select: () => ({
              single: async () => ({
                data: { id: insertedEnrollment!.id },
                error: null,
              }),
            }),
          };
        }

        return {
          select: () => ({
            single: async () => ({ data: null, error: null }),
          }),
        };
      },
    };

    return filterBuilder;
  }

  const supabase = {
    from(table: string) {
      return createFilterBuilder(table);
    },
  } as unknown as SupabaseClient;

  return {
    supabase,
    updates,
    getInsertedEnrollment: () => insertedEnrollment,
  };
}

const baseApplication: ApplicationRow = {
  id: "app-1",
  organization_id: "org-1",
  program_id: "program-1",
  student_id: "student-1",
  status: "accepted",
  family_id: "family-1",
};

describe("markApplicationAsEnrolled", () => {
  it("creates an enrollment and updates related records on the happy path", async () => {
    const { supabase, updates, getInsertedEnrollment } = createMockSupabase({
      application: baseApplication,
    });

    const result = await markApplicationAsEnrolled(supabase, {
      applicationId: "app-1",
      actorUserId: "admin-1",
      note: "Imported from legacy system",
    });

    assert.equal(result.applicationId, "app-1");
    assert.equal(result.enrollmentId, "enrollment-new");
    assert.equal(getInsertedEnrollment()?.status, "enrolled");
    assert.ok(
      updates.some(
        (entry) =>
          entry.table === "students" &&
          entry.values.status === "active",
      ),
    );
    assert.ok(
      updates.some(
        (entry) =>
          entry.table === "applications" &&
          entry.values.status === "enrolled",
      ),
    );
  });

  it("rejects applications that are not accepted", async () => {
    const { supabase } = createMockSupabase({
      application: { ...baseApplication, status: "submitted" },
    });

    await assert.rejects(
      () =>
        markApplicationAsEnrolled(supabase, {
          applicationId: "app-1",
          actorUserId: "admin-1",
        }),
      (error: unknown) => {
        assert.ok(error instanceof EnrollmentMaterializationError);
        assert.equal(error.code, "invalid_status");
        return true;
      },
    );
  });

  it("recovers when enrollment is enrolled but application is still accepted", async () => {
    const { supabase, updates, getInsertedEnrollment } = createMockSupabase({
      application: baseApplication,
      existingEnrollment: {
        id: "enrollment-existing",
        student_id: "student-1",
        program_id: "program-1",
        status: "enrolled",
      },
    });

    const result = await markApplicationAsEnrolled(supabase, {
      applicationId: "app-1",
      actorUserId: "admin-1",
    });

    assert.equal(result.applicationId, "app-1");
    assert.equal(result.enrollmentId, "enrollment-existing");
    assert.equal(getInsertedEnrollment(), null);
    assert.ok(
      !updates.some(
        (entry) =>
          entry.table === "enrollments" &&
          entry.values.status === "enrolled",
      ),
    );
    assert.ok(
      updates.some(
        (entry) =>
          entry.table === "students" &&
          entry.values.status === "active",
      ),
    );
    assert.ok(
      updates.some(
        (entry) =>
          entry.table === "applications" &&
          entry.values.status === "enrolled",
      ),
    );
  });

  it("rejects applications that are already enrolled", async () => {
    const { supabase } = createMockSupabase({
      application: { ...baseApplication, status: "enrolled" },
    });

    await assert.rejects(
      () =>
        markApplicationAsEnrolled(supabase, {
          applicationId: "app-1",
          actorUserId: "admin-1",
        }),
      (error: unknown) => {
        assert.ok(error instanceof EnrollmentMaterializationError);
        assert.equal(error.code, "already_enrolled");
        return true;
      },
    );
  });

  it("rejects applications missing student or program information", async () => {
    const { supabase } = createMockSupabase({
      application: { ...baseApplication, student_id: null },
    });

    await assert.rejects(
      () =>
        markApplicationAsEnrolled(supabase, {
          applicationId: "app-1",
          actorUserId: "admin-1",
        }),
      (error: unknown) => {
        assert.ok(error instanceof EnrollmentMaterializationError);
        assert.equal(error.code, "incomplete_application");
        return true;
      },
    );
  });

  it("rejects applications with an existing checklist", async () => {
    const { supabase } = createMockSupabase({
      application: baseApplication,
      checklist: {
        id: "checklist-1",
        enrollment_id: "enrollment-1",
        template_id: "template-1",
        status: "in_progress",
        metadata: {},
      },
    });

    await assert.rejects(
      () =>
        markApplicationAsEnrolled(supabase, {
          applicationId: "app-1",
          actorUserId: "admin-1",
        }),
      (error: unknown) => {
        assert.ok(error instanceof EnrollmentMaterializationError);
        assert.equal(error.code, "already_started");
        return true;
      },
    );
  });

  it("rejects duplicate enrollments for the same student and program", async () => {
    const { supabase } = createMockSupabase({
      application: baseApplication,
      insertEnrollmentError: {
        code: "23505",
        message: "duplicate key value violates unique constraint",
      },
    });

    await assert.rejects(
      () =>
        markApplicationAsEnrolled(supabase, {
          applicationId: "app-1",
          actorUserId: "admin-1",
        }),
      (error: unknown) => {
        assert.ok(error instanceof EnrollmentMaterializationError);
        assert.equal(error.code, "duplicate_enrollment");
        return true;
      },
    );
  });
});
