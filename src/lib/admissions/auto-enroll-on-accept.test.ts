import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { SupabaseClient } from "@supabase/supabase-js";
import { autoEnrollApplicationIfNoChecklist } from "./enrollment-checklist-materialization";

type ApplicationRow = {
  id: string;
  organization_id: string;
  program_id: string | null;
  student_id: string | null;
  status: string;
  family_id: string | null;
};

function createAutoEnrollMockSupabase(options: {
  application: ApplicationRow | null;
  publishedTemplateId?: string | null;
  checklist?: {
    id: string;
    enrollment_id: string;
    template_id: string;
    status: string;
    metadata: Record<string, unknown>;
  } | null;
  trackEnrollments?: boolean;
}) {
  const {
    application,
    publishedTemplateId = null,
    checklist = null,
    trackEnrollments = false,
  } = options;

  let insertedEnrollmentId: string | null = null;

  const supabase = {
    from(table: string) {
      const filters: Record<string, unknown> = {};
      const inFilters: Record<string, unknown[]> = {};
      const builder = {
        select() {
          return builder;
        },
        eq(column: string, value: unknown) {
          filters[column] = value;
          return builder;
        },
        in(column: string, values: unknown[]) {
          inFilters[column] = values;
          return builder;
        },
        maybeSingle: async () => {
          if (table === "applications" && filters.id === application?.id) {
            return { data: application, error: null };
          }

          if (
            table === "enrollment_checklist_templates" &&
            publishedTemplateId &&
            filters.organization_id === application?.organization_id &&
            filters.program_id === application?.program_id &&
            filters.status === "published"
          ) {
            return { data: { id: publishedTemplateId }, error: null };
          }

          if (table === "enrollment_checklist_templates") {
            return { data: null, error: null };
          }

          if (
            table === "enrollment_checklists" &&
            filters.application_id === application?.id &&
            checklist
          ) {
            return { data: checklist, error: null };
          }

          if (table === "enrollment_checklists") {
            return { data: null, error: null };
          }

          if (table === "enrollments") {
            return { data: null, error: null };
          }

          if (
            application &&
            table === "applications" &&
            filters.id === application.id &&
            inFilters.status?.includes("accepted")
          ) {
            return { data: { id: application.id }, error: null };
          }

          return { data: null, error: null };
        },
        single: async () => builder.maybeSingle(),
        update() {
          return builder;
        },
        insert(values: Record<string, unknown>) {
          if (trackEnrollments && table === "enrollments") {
            insertedEnrollmentId = "enrollment-new";
            return {
              select: () => ({
                single: async () => ({
                  data: { id: insertedEnrollmentId },
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
      return builder;
    },
  } as unknown as SupabaseClient;

  return { supabase, getInsertedEnrollmentId: () => insertedEnrollmentId };
}

const baseApplication: ApplicationRow = {
  id: "app-1",
  organization_id: "org-1",
  program_id: "program-1",
  student_id: "student-1",
  status: "accepted",
  family_id: "family-1",
};

describe("autoEnrollApplicationIfNoChecklist", () => {
  it("returns null when application status is not accepted", async () => {
    const { supabase } = createAutoEnrollMockSupabase({
      application: { ...baseApplication, status: "submitted" },
    });

    const result = await autoEnrollApplicationIfNoChecklist(supabase, {
      applicationId: "app-1",
      actorUserId: "admin-1",
    });

    assert.equal(result, null);
  });

  it("returns null when student_id is missing", async () => {
    const { supabase } = createAutoEnrollMockSupabase({
      application: { ...baseApplication, student_id: null },
    });

    const result = await autoEnrollApplicationIfNoChecklist(supabase, {
      applicationId: "app-1",
      actorUserId: "admin-1",
    });

    assert.equal(result, null);
  });

  it("returns null when an enrollment checklist instance already exists", async () => {
    const { supabase } = createAutoEnrollMockSupabase({
      application: baseApplication,
      checklist: {
        id: "checklist-1",
        enrollment_id: "enrollment-1",
        template_id: "template-1",
        status: "in_progress",
        metadata: {},
      },
    });

    const result = await autoEnrollApplicationIfNoChecklist(supabase, {
      applicationId: "app-1",
      actorUserId: "admin-1",
    });

    assert.equal(result, null);
  });

  it("enrolls when no published checklist is configured", async () => {
    const { supabase, getInsertedEnrollmentId } = createAutoEnrollMockSupabase({
      application: baseApplication,
      trackEnrollments: true,
    });

    const result = await autoEnrollApplicationIfNoChecklist(supabase, {
      applicationId: "app-1",
      actorUserId: "admin-1",
    });

    assert.ok(result);
    assert.equal(result.applicationId, "app-1");
    assert.equal(result.enrollmentId, "enrollment-new");
    assert.equal(getInsertedEnrollmentId(), "enrollment-new");
  });
});
